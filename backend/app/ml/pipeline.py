import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import time
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score

FEATURE_COLUMNS = [
    "amount_btc",
    "transaction_frequency",
    "input_count",
    "output_count",
    "unique_counterparties",
    "fee_btc",
    "wallet_activity_score",
    "in_degree",
    "out_degree"
]

class CoinTraceMLPipeline:
    def __init__(self, scaler_type="robust"):
        self.scaler_type = scaler_type
        self.scaler = RobustScaler() if scaler_type == "robust" else StandardScaler()
        self.feature_columns = FEATURE_COLUMNS
        self.pca = PCA(n_components=2, random_state=42)
        self.kmeans = None
        self.dbscan = None
        self.isolation_forest = None
        self.feature_means = {}
        self.feature_stds = {}

    def extract_features(self, df: pd.DataFrame) -> np.ndarray:
        # Verify columns exist, fill default if missing
        clean_df = df.copy()
        for col in self.feature_columns:
            if col not in clean_df.columns:
                clean_df[col] = 0.0
            clean_df[col] = pd.to_numeric(clean_df[col], errors='coerce').fillna(0.0)

        # Store mean & std for explainability
        for col in self.feature_columns:
            self.feature_means[col] = float(clean_df[col].mean())
            self.feature_stds[col] = float(clean_df[col].std()) if clean_df[col].std() > 0 else 1.0

        raw_features = clean_df[self.feature_columns].values
        scaled_features = self.scaler.fit_transform(raw_features)
        return scaled_features

    def fit_pca(self, scaled_features: np.ndarray):
        pca_coords = self.pca.fit_transform(scaled_features)
        exp_var = self.pca.explained_variance_ratio_.tolist()
        return pca_coords, {
            "pc1_variance": round(exp_var[0] * 100, 2),
            "pc2_variance": round(exp_var[1] * 100, 2),
            "total_variance": round(sum(exp_var) * 100, 2)
        }

    def run_kmeans(self, scaled_features: np.ndarray, n_clusters=4):
        start_time = time.time()
        n_clusters = max(2, min(n_clusters, len(scaled_features) - 1))
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = self.kmeans.fit_predict(scaled_features)
        exec_time = round((time.time() - start_time) * 1000, 2)

        # Silhouette score
        try:
            sil_score = round(float(silhouette_score(scaled_features, labels)), 4)
        except Exception:
            sil_score = 0.0

        # Cluster centroids inverted to original scale
        original_centers = self.scaler.inverse_transform(self.kmeans.cluster_centers_)
        cluster_profiles = []
        unique_labels, counts = np.unique(labels, return_counts=True)
        counts_dict = dict(zip(unique_labels, counts))

        for idx in range(n_clusters):
            center = original_centers[idx]
            size = int(counts_dict.get(idx, 0))
            pct = round((size / len(scaled_features)) * 100, 1)

            # Assign meaningful archetype name based on centroid values
            avg_amount = center[0]
            avg_freq = center[1]
            avg_inputs = center[2]
            avg_outputs = center[3]
            avg_counterparties = center[4]

            if avg_amount > 20.0:
                name = "Institutional Whale Transfer"
                description = "High BTC volume transfers with low frequency and few counterparties, typical of custody or OTC transactions."
                color = "#8b5cf6" # purple
            elif avg_inputs > 6 or avg_counterparties > 12:
                name = "Exchange Hot Wallet Sweep"
                description = "High-frequency aggregation of numerous input addresses into centralized wallets."
                color = "#06b6d4" # cyan
            elif avg_outputs > 8 or avg_freq > 25.0:
                name = "High-Velocity Dispersion"
                description = "Fan-out pattern distributing funds across multiple destination addresses rapidly."
                color = "#ec4899" # pink
            else:
                name = "Standard Retail P2P"
                description = "Typical everyday peer-to-peer transaction profile with small volume and standard change outputs."
                color = "#3b82f6" # blue

            cluster_profiles.append({
                "cluster_id": int(idx),
                "name": name,
                "description": description,
                "color": color,
                "size": size,
                "percentage": pct,
                "avg_amount_btc": round(float(avg_amount), 4),
                "avg_frequency": round(float(avg_freq), 2),
                "avg_inputs": round(float(avg_inputs), 1),
                "avg_outputs": round(float(avg_outputs), 1),
                "avg_counterparties": round(float(avg_counterparties), 1)
            })

        return {
            "labels": labels.tolist(),
            "n_clusters": int(n_clusters),
            "inertia": round(float(self.kmeans.inertia_), 2),
            "silhouette_score": sil_score,
            "execution_time_ms": exec_time,
            "profiles": cluster_profiles
        }

    def run_dbscan(self, scaled_features: np.ndarray, eps=1.2, min_samples=5):
        start_time = time.time()
        self.dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        labels = self.dbscan.fit_predict(scaled_features)
        exec_time = round((time.time() - start_time) * 1000, 2)

        unique_labels = set(labels)
        n_clusters = len(unique_labels - {-1})
        n_noise = int(np.sum(labels == -1))
        noise_pct = round((n_noise / len(scaled_features)) * 100, 2)

        # Silhouette score on non-noise points if >= 2 clusters
        non_noise_mask = labels != -1
        if n_clusters >= 2 and np.sum(non_noise_mask) > n_clusters:
            try:
                sil_score = round(float(silhouette_score(
                    scaled_features[non_noise_mask],
                    labels[non_noise_mask]
                )), 4)
            except Exception:
                sil_score = 0.0
        else:
            sil_score = 0.0

        cluster_counts = {}
        for l in unique_labels:
            cluster_counts[int(l)] = int(np.sum(labels == l))

        return {
            "labels": labels.tolist(),
            "n_clusters": int(n_clusters),
            "noise_points": n_noise,
            "noise_percentage": noise_pct,
            "silhouette_score": sil_score,
            "execution_time_ms": exec_time,
            "cluster_counts": cluster_counts,
            "eps": float(eps),
            "min_samples": int(min_samples)
        }

    def run_isolation_forest(self, scaled_features: np.ndarray, raw_df: pd.DataFrame, contamination=0.05):
        start_time = time.time()
        self.isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        preds = self.isolation_forest.fit_predict(scaled_features)
        # raw decision score: lower values mean more abnormal
        raw_scores = self.isolation_forest.decision_function(scaled_features)

        # Invert and normalize to [0, 1] range: 1.0 is most anomalous
        min_s, max_s = raw_scores.min(), raw_scores.max()
        if max_s > min_s:
            norm_scores = 1.0 - ((raw_scores - min_s) / (max_s - min_s))
        else:
            norm_scores = np.zeros_like(raw_scores)

        is_anomalies = (preds == -1).tolist()
        exec_time = round((time.time() - start_time) * 1000, 2)
        total_anomalies = int(sum(is_anomalies))
        anomaly_pct = round((total_anomalies / len(raw_df)) * 100, 2)

        # Generate rule-based explanations for each anomaly
        explanations = []
        for i in range(len(raw_df)):
            if not is_anomalies[i]:
                explanations.append("Normal transaction behavior consistent with historical baseline.")
                continue

            reasons = []
            for col in self.feature_columns:
                val = float(raw_df.iloc[i][col])
                mean = self.feature_means.get(col, 0.0)
                std = self.feature_stds.get(col, 1.0)
                z = (val - mean) / std

                if z > 2.5:
                    if col == "amount_btc":
                        reasons.append(f"Significant volume spike ({val:.4f} BTC, z={z:.1f})")
                    elif col == "transaction_frequency":
                        reasons.append(f"Unusually high velocity ({val:.1f} tx/hr, z={z:.1f})")
                    elif col == "output_count":
                        reasons.append(f"Extensive fan-out dispersion ({int(val)} outputs)")
                    elif col == "input_count":
                        reasons.append(f"High-degree address consolidation ({int(val)} inputs)")
                    elif col == "unique_counterparties":
                        reasons.append(f"Broad counterparty exposure ({int(val)} counterparties)")
                    elif col == "wallet_activity_score":
                        reasons.append(f"High wallet activity intensity ({val:.1f}/100)")
                elif z < -2.2 and col == "amount_btc" and val < 0.001:
                    reasons.append("Micro-dusting pattern detected")

            if not reasons:
                reasons.append("Multi-dimensional multivariate feature deviation from baseline distribution")

            explanations.append("; ".join(reasons))

        return {
            "is_anomaly": is_anomalies,
            "anomaly_scores": [round(float(s), 4) for s in norm_scores],
            "explanations": explanations,
            "total_anomalies": total_anomalies,
            "anomaly_percentage": anomaly_pct,
            "execution_time_ms": exec_time,
            "contamination": float(contamination)
        }

    def run_full_pipeline(self, df: pd.DataFrame, k=4, eps=1.2, min_samples=5, contamination=0.05):
        scaled = self.extract_features(df)
        pca_coords, pca_stats = self.fit_pca(scaled)
        kmeans_res = self.run_kmeans(scaled, n_clusters=k)
        dbscan_res = self.run_dbscan(scaled, eps=eps, min_samples=min_samples)
        iso_res = self.run_isolation_forest(scaled, df, contamination=contamination)

        # Merge results into enriched dataframe
        enriched_df = df.copy()
        enriched_df["pca_x"] = [round(float(x), 4) for x in pca_coords[:, 0]]
        enriched_df["pca_y"] = [round(float(y), 4) for y in pca_coords[:, 1]]
        enriched_df["cluster_kmeans"] = kmeans_res["labels"]
        enriched_df["cluster_dbscan"] = dbscan_res["labels"]
        enriched_df["is_anomaly"] = iso_res["is_anomaly"]
        enriched_df["anomaly_score"] = iso_res["anomaly_scores"]
        enriched_df["anomaly_explanation"] = iso_res["explanations"]

        # Map cluster name
        profile_map = {p["cluster_id"]: p["name"] for p in kmeans_res["profiles"]}
        enriched_df["cluster_name"] = enriched_df["cluster_kmeans"].map(profile_map).fillna("Unknown")

        return {
            "enriched_df": enriched_df,
            "pca_stats": pca_stats,
            "kmeans": kmeans_res,
            "dbscan": dbscan_res,
            "isolation_forest": iso_res,
            "feature_columns": self.feature_columns
        }
