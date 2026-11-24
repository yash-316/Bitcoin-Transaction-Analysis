import pandas as pd
import numpy as np

class NetworkGraphService:
    @staticmethod
    def build_network_graph(df: pd.DataFrame, max_nodes=80) -> dict:
        # Calculate wallet transaction count & volume
        senders = df[["sender_address", "amount_btc", "cluster_kmeans", "is_anomaly"]].copy()
        receivers = df[["receiver_address", "amount_btc", "cluster_kmeans", "is_anomaly"]].copy()

        senders.rename(columns={"sender_address": "address"}, inplace=True)
        receivers.rename(columns={"receiver_address": "address"}, inplace=True)

        combined = pd.concat([senders, receivers], ignore_index=True)
        wallet_stats = combined.groupby("address").agg(
            tx_count=("amount_btc", "count"),
            total_btc=("amount_btc", "sum"),
            cluster=("cluster_kmeans", "first"),
            has_anomaly=("is_anomaly", "any")
        ).reset_index()

        # Sort by activity to pick top nodes
        top_wallets = wallet_stats.sort_values(by=["tx_count", "total_btc"], ascending=False).head(max_nodes)
        top_wallet_set = set(top_wallets["address"])

        # Filter edges between top wallets (or where at least one endpoint is in top wallets)
        edge_df = df[df["sender_address"].isin(top_wallet_set) & df["receiver_address"].isin(top_wallet_set)].copy()
        if len(edge_df) < 25:
            # Expand to where either is in top_wallet_set
            edge_df = df[df["sender_address"].isin(top_wallet_set) | df["receiver_address"].isin(top_wallet_set)].head(120).copy()
            # Include these extra wallets in nodes
            all_involved = set(edge_df["sender_address"]).union(set(edge_df["receiver_address"]))
            top_wallets = wallet_stats[wallet_stats["address"].isin(all_involved)].head(max_nodes)
            top_wallet_set = set(top_wallets["address"])
            edge_df = edge_df[edge_df["sender_address"].isin(top_wallet_set) & edge_df["receiver_address"].isin(top_wallet_set)]

        # Generate cluster color palette
        cluster_colors = {
            0: "#3b82f6", # blue
            1: "#06b6d4", # cyan
            2: "#8b5cf6", # purple
            3: "#ec4899", # pink
            4: "#f59e0b", # amber
            5: "#10b981", # emerald
            -1: "#f43f5e" # rose for noise/anomaly
        }

        # Calculate circular/clustered layout positions
        nodes = []
        n_count = len(top_wallets)
        for i, (_, row) in enumerate(top_wallets.iterrows()):
            addr = row["address"]
            cluster = int(row["cluster"]) if not pd.isna(row["cluster"]) else 0
            is_ano = bool(row["has_anomaly"])

            # Compute clustered layout coordinate
            cluster_angle = (cluster * (2 * np.pi / 5)) + (i * 0.35)
            radius = 240 + (i % 4) * 65
            x = 500 + radius * np.cos(cluster_angle)
            y = 400 + radius * np.sin(cluster_angle)

            # Node size based on degree/volume
            size = min(60, max(24, int(18 + np.log1p(row["total_btc"]) * 8)))

            color = "#f43f5e" if is_ano else cluster_colors.get(cluster, "#06b6d4")

            nodes.append({
                "id": addr,
                "label": f"{addr[:6]}...{addr[-4:]}",
                "full_address": addr,
                "tx_count": int(row["tx_count"]),
                "total_btc": round(float(row["total_btc"]), 4),
                "cluster": cluster,
                "is_anomaly": is_ano,
                "color": color,
                "size": size,
                "x": round(float(x), 1),
                "y": round(float(y), 1)
            })

        edges = []
        for i, (_, row) in enumerate(edge_df.head(150).iterrows()):
            edges.append({
                "id": f"e-{row['transaction_id'][:10]}-{i}",
                "source": row["sender_address"],
                "target": row["receiver_address"],
                "amount_btc": round(float(row["amount_btc"]), 4),
                "transaction_id": row["transaction_id"],
                "timestamp": row["timestamp"],
                "is_anomaly": bool(row.get("is_anomaly", False)),
                "cluster": int(row.get("cluster_kmeans", 0))
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "node_count": len(nodes),
            "edge_count": len(edges)
        }
