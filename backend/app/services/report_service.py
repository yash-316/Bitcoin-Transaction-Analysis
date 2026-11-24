import io
import pandas as pd
from datetime import datetime

class ReportService:
    @staticmethod
    def generate_full_report(df: pd.DataFrame, ml_results: dict, dataset_stats: dict, ai_insights: dict) -> dict:
        kmeans = ml_results.get("kmeans", {})
        dbscan = ml_results.get("dbscan", {})
        iso = ml_results.get("isolation_forest", {})

        report = {
            "metadata": {
                "report_title": "CoinTrace Bitcoin Transaction Pattern & Anomaly Report",
                "generated_at": datetime.now().isoformat(),
                "platform_version": "1.0.0",
                "disclaimer": "This report is generated using unsupervised machine learning clustering and anomaly detection algorithms. Statistical outliers and pattern clusters indicate anomalous behavioral structures for investigation and do not constitute legal proof of illicit activity."
            },
            "dataset_overview": dataset_stats,
            "preprocessing": {
                "scaling_method": "RobustScaler (interquartile range quantile scaling)",
                "dimensionality_reduction": "Principal Component Analysis (PCA 2D)",
                "features_analyzed": [
                    "amount_btc", "transaction_frequency", "input_count",
                    "output_count", "unique_counterparties", "fee_btc",
                    "wallet_activity_score", "in_degree", "out_degree"
                ],
                "pca_variance_explained": ml_results.get("pca_stats", {})
            },
            "clustering_results": {
                "kmeans": {
                    "clusters_detected": kmeans.get("n_clusters", 4),
                    "silhouette_score": kmeans.get("silhouette_score", 0.0),
                    "inertia": kmeans.get("inertia", 0.0),
                    "profiles": kmeans.get("profiles", [])
                },
                "dbscan": {
                    "clusters_detected": dbscan.get("n_clusters", 0),
                    "noise_points": dbscan.get("noise_points", 0),
                    "noise_percentage": dbscan.get("noise_percentage", 0.0),
                    "eps": dbscan.get("eps", 1.2),
                    "min_samples": dbscan.get("min_samples", 5)
                }
            },
            "anomaly_detection": {
                "algorithm": "Isolation Forest",
                "contamination_rate": iso.get("contamination", 0.05),
                "anomalies_flagged": iso.get("total_anomalies", 0),
                "anomaly_percentage": iso.get("anomaly_percentage", 0.0),
                "top_anomalous_transactions": df[df["is_anomaly"] == True].sort_values(
                    by="anomaly_score", ascending=False
                ).head(10)[["transaction_id", "amount_btc", "anomaly_score", "anomaly_explanation"]].to_dict(orient="records")
            },
            "ai_insights": ai_insights
        }
        return report

    @staticmethod
    def export_csv(df: pd.DataFrame) -> str:
        output = io.StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
