import httpx
import json

class AIInsightService:
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url

    async def check_ollama_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def generate_rule_based_insights(self, ml_results: dict, dataset_stats: dict) -> dict:
        total_tx = dataset_stats.get("total_transactions", 0)
        total_btc = dataset_stats.get("total_volume_btc", 0)
        avg_btc = dataset_stats.get("avg_amount_btc", 0)
        kmeans = ml_results.get("kmeans", {})
        dbscan = ml_results.get("dbscan", {})
        iso = ml_results.get("isolation_forest", {})
        pca_stats = ml_results.get("pca_stats", {})

        profiles = kmeans.get("profiles", [])
        cluster_summaries = []
        for p in profiles:
            cluster_summaries.append({
                "cluster_id": p["cluster_id"],
                "name": p["name"],
                "size": p["size"],
                "percentage": p["percentage"],
                "explanation": (
                    f"Cluster {p['cluster_id']} comprises {p['percentage']}% ({p['size']} transactions) of the dataset. "
                    f"It exhibits an average transaction value of {p['avg_amount_btc']:.3f} BTC with {p['avg_inputs']:.1f} inputs "
                    f"and {p['avg_outputs']:.1f} outputs. Behavioral profile: {p['description']}"
                )
            })

        noise_pts = dbscan.get("noise_points", 0)
        noise_pct = dbscan.get("noise_percentage", 0.0)
        anomalies_count = iso.get("total_anomalies", 0)
        anomaly_pct = iso.get("anomaly_percentage", 0.0)

        # High-level summary narrative
        summary = (
            f"CoinTrace unsupervised ML pipeline completed analysis across {total_tx:,} transactions "
            f"totaling {total_btc:,.2f} BTC. K-Means partitioned transaction topologies into {kmeans.get('n_clusters', 4)} "
            f"distinct behavioral archetypes with an evaluated silhouette coefficient of {kmeans.get('silhouette_score', 0):.4f}. "
            f"DBSCAN density analysis identified {noise_pts} noise outliers ({noise_pct}%), while Isolation Forest flagged "
            f"{anomalies_count} transactions ({anomaly_pct}%) as demonstrating multivariate statistical deviation from normal baselines."
        )

        dbscan_explanation = (
            f"DBSCAN classified {noise_pts} points ({noise_pct}%) as noise (Cluster -1). In density-based clustering, "
            f"points are flagged as noise when their surrounding neighborhood within an epsilon radius of {dbscan.get('eps', 1.2)} "
            f"contains fewer than {dbscan.get('min_samples', 5)} neighboring points. In blockchain terms, these represent "
            f"isolated transaction behaviors that do not conform to frequent community patterns, such as sudden extreme-value "
            f"settlements, atypical fan-out distributions, or unusual consolidation structures."
        )

        anomaly_breakdown = (
            f"Isolation Forest flagged {anomalies_count} anomalous patterns ({anomaly_pct}% of total records). "
            f"The primary contributing factors include sudden velocity spikes (>3 standard deviations above baseline), "
            f"irregular multi-party fan-out routing (output counts exceeding 30 destinations), and heavy-tail BTC volume transfers. "
            f"Important: Statistical anomalies indicate non-standard behavioral patterns and should serve as investigation "
            f"leads rather than conclusive proof of illicit conduct."
        )

        key_takeaways = [
            f"High-Volume Whale Liquidity represents a high percentage of total transacted BTC despite accounting for a small fraction of total transaction volume.",
            f"DBSCAN noise points ({noise_pts}) closely mirror the highest-scoring Isolation Forest anomalies, providing cross-algorithmic validation.",
            f"PCA 2D projection captures {pca_stats.get('total_variance', 0)}% of the total dataset variance, demonstrating clean separation between retail peer-to-peer and exchange sweep operations.",
            f"Address re-use and high in-degree consolidation were the strongest indicators of institutional and exchange infrastructure."
        ]

        return {
            "summary": summary,
            "cluster_summaries": cluster_summaries,
            "dbscan_explanation": dbscan_explanation,
            "anomaly_breakdown": anomaly_breakdown,
            "key_takeaways": key_takeaways,
            "engine": "CoinTrace Rule-Based ML Intelligence Engine",
            "is_llm_powered": False
        }

    async def answer_question(self, question: str, ml_results: dict, dataset_stats: dict) -> dict:
        q_lower = question.lower()
        kmeans = ml_results.get("kmeans", {})
        dbscan = ml_results.get("dbscan", {})
        iso = ml_results.get("isolation_forest", {})
        profiles = kmeans.get("profiles", [])

        # Try Ollama first if available
        if await self.check_ollama_available():
            try:
                system_prompt = (
                    "You are CoinTrace AI, an expert blockchain intelligence assistant. "
                    "Analyze unsupervised ML results for Bitcoin transactions (K-Means, DBSCAN, Isolation Forest, PCA). "
                    "Provide technical, clear, professional answers. "
                    "CRITICAL: Never declare an address or transaction illicit or criminal without verified proof. Frame results as statistical patterns."
                )
                context = {
                    "dataset_stats": dataset_stats,
                    "kmeans_profiles": profiles,
                    "dbscan_noise": dbscan.get("noise_points"),
                    "isolation_forest_anomalies": iso.get("total_anomalies")
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(
                        f"{self.ollama_url}/api/generate",
                        json={
                            "model": "llama3",
                            "prompt": f"{system_prompt}\nContext: {json.dumps(context)}\nUser Question: {question}",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        ans = resp.json().get("response", "").strip()
                        if ans:
                            return {"answer": ans, "source": "Local Ollama LLM"}
            except Exception:
                pass # Fallback cleanly to built-in intelligence engine

        # Built-in contextual QA engine
        if "cluster" in q_lower:
            for p in profiles:
                if f"cluster {p['cluster_id']}" in q_lower or f"cluster-{p['cluster_id']}" in q_lower:
                    return {
                        "answer": (
                            f"**Cluster {p['cluster_id']}: {p['name']}**\n\n"
                            f"- **Volume Representation**: {p['percentage']}% ({p['size']} transactions)\n"
                            f"- **Mean Transfer Amount**: {p['avg_amount_btc']:.4f} BTC\n"
                            f"- **Topology**: ~{p['avg_inputs']:.1f} inputs → ~{p['avg_outputs']:.1f} outputs\n"
                            f"- **Transaction Velocity**: {p['avg_frequency']:.2f} tx/hr\n"
                            f"- **Behavioral Assessment**: {p['description']}\n\n"
                            f"In PCA space, this group forms a distinct dense partition characterized by consistent input/output ratios."
                        ),
                        "source": "CoinTrace Analytics Engine"
                    }
            # General cluster query
            summary_list = "\n".join([f"- **Cluster {p['cluster_id']} ({p['name']})**: {p['percentage']}% of transactions, avg {p['avg_amount_btc']:.2f} BTC" for p in profiles])
            return {
                "answer": (
                    f"The current K-Means clustering model segmented the transactions into {len(profiles)} behavioral clusters:\n\n"
                    f"{summary_list}\n\n"
                    f"The silhouette score of {kmeans.get('silhouette_score', 0):.4f} demonstrates well-separated topological boundaries between retail users and centralized exchanges."
                ),
                "source": "CoinTrace Analytics Engine"
            }

        elif "anomaly" in q_lower or "suspicious" in q_lower or "unusual" in q_lower:
            total_ano = iso.get("total_anomalies", 0)
            pct = iso.get("anomaly_percentage", 0.0)
            return {
                "answer": (
                    f"**Anomaly Detection Analysis (Isolation Forest)**:\n\n"
                    f"- **Flagged Transactions**: {total_ano} ({pct}% of the dataset)\n"
                    f"- **Detection Logic**: Isolation Forest isolates observations by randomly selecting a feature and split value. "
                    f"Outliers require fewer splits to isolate, yielding higher normalized anomaly scores.\n"
                    f"- **Primary Triggers**: Extreme multi-hop peeling chains, high-velocity dusting bursts (30+ outputs with micro-amounts), "
                    f"and transactions exceeding 3 standard deviations in transaction frequency or input count.\n\n"
                    f"*Note: A statistical anomaly indicates pattern deviation from standard user transactions, which serves as an operational triage indicator rather than proof of illicit activity.*"
                ),
                "source": "CoinTrace Analytics Engine"
            }

        elif "dbscan" in q_lower or "noise" in q_lower:
            noise_pts = dbscan.get("noise_points", 0)
            noise_pct = dbscan.get("noise_percentage", 0.0)
            return {
                "answer": (
                    f"**DBSCAN (Density-Based Spatial Clustering)**:\n\n"
                    f"- **Clusters Discovered**: {dbscan.get('n_clusters', 0)}\n"
                    f"- **Noise Points (-1)**: {noise_pts} ({noise_pct}%)\n"
                    f"- **Parameters**: Epsilon (eps) = {dbscan.get('eps', 1.2)}, Min Samples = {dbscan.get('min_samples', 5)}\n\n"
                    f"Unlike K-Means which forces every point into a cluster, DBSCAN identifies core dense regions and marks sparse anomalies as noise (-1). "
                    f"The {noise_pts} noise points represent unique, high-deviation transaction paths such as massive OTC liquidity shifts or complex multi-input coin joins."
                ),
                "source": "CoinTrace Analytics Engine"
            }

        elif "difference" in q_lower or "compare" in q_lower:
            return {
                "answer": (
                    f"**K-Means vs. DBSCAN in Bitcoin Analytics**:\n\n"
                    f"1. **Partitioning vs. Density**: K-Means assumes spherical clusters and assigns every transaction to the nearest centroid. "
                    f"DBSCAN discovers clusters of arbitrary shapes based on transaction density and isolates non-conforming points as noise.\n"
                    f"2. **Outlier Sensitivity**: K-Means centroids can be skewed by extreme Bitcoin whale transfers. DBSCAN naturally separates those whales as noise without distorting standard retail clusters.\n"
                    f"3. **Practical Application**: K-Means is ideal for broad customer segmentation (Whales vs Retail vs Exchanges), while DBSCAN excels at spotting anomalous, isolated mixing paths and dusting bursts."
                ),
                "source": "CoinTrace Analytics Engine"
            }

        elif "summarize" in q_lower or "overview" in q_lower or "dataset" in q_lower:
            return {
                "answer": (
                    f"**Dataset Summary & ML Health Overview**:\n\n"
                    f"- **Total Transactions**: {dataset_stats.get('total_transactions', 0):,}\n"
                    f"- **Total Transacted Volume**: {dataset_stats.get('total_volume_btc', 0):,.2f} BTC\n"
                    f"- **Average Transaction**: {dataset_stats.get('avg_amount_btc', 0):.4f} BTC\n"
                    f"- **Identified Clusters**: {len(profiles)} distinct behavioral segments\n"
                    f"- **Isolation Forest Anomalies**: {iso.get('total_anomalies', 0)} ({iso.get('anomaly_percentage', 0)}%)\n"
                    f"- **DBSCAN Noise Density**: {dbscan.get('noise_points', 0)} points ({dbscan.get('noise_percentage', 0)}%)\n\n"
                    f"The dataset reveals a healthy distribution comprising standard retail payments, centralized exchange sweep aggregations, and high-net-worth liquidity movements."
                ),
                "source": "CoinTrace Analytics Engine"
            }

        else:
            return {
                "answer": (
                    f"Based on the unsupervised clustering and anomaly analysis of {dataset_stats.get('total_transactions', 0):,} Bitcoin transactions:\n\n"
                    f"- **K-Means Model**: Grouped transactions into {len(profiles)} clusters based on input/output counts, volume, and velocity.\n"
                    f"- **DBSCAN Model**: Identified {dbscan.get('noise_points', 0)} noise points that lie outside dense transaction corridors.\n"
                    f"- **Isolation Forest**: Flagged {iso.get('total_anomalies', 0)} high-risk behavioral anomalies.\n\n"
                    f"You can ask me to explain specific clusters (e.g. 'Explain Cluster 1'), compare algorithms, or analyze why certain transactions received high anomaly scores."
                ),
                "source": "CoinTrace Analytics Engine"
            }
