import sqlite3
import pandas as pd
from backend.app.config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Table for transaction records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        sender_address TEXT,
        receiver_address TEXT,
        amount_btc REAL,
        timestamp TEXT,
        transaction_frequency REAL,
        input_count INTEGER,
        output_count INTEGER,
        unique_counterparties INTEGER,
        fee_btc REAL,
        wallet_activity_score REAL,
        in_degree INTEGER,
        out_degree INTEGER,
        pattern_type TEXT,
        cluster_kmeans INTEGER,
        cluster_dbscan INTEGER,
        pca_x REAL,
        pca_y REAL,
        is_anomaly INTEGER,
        anomaly_score REAL,
        anomaly_explanation TEXT,
        is_synthetic INTEGER DEFAULT 1
    )
    """)

    # Table for analysis runs history
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        total_transactions INTEGER,
        kmeans_k INTEGER,
        kmeans_silhouette REAL,
        dbscan_eps REAL,
        dbscan_min_samples INTEGER,
        dbscan_noise INTEGER,
        isolation_contamination REAL,
        isolation_anomalies INTEGER
    )
    """)
    conn.commit()
    conn.close()

def save_transactions_to_db(df: pd.DataFrame):
    conn = get_db_connection()
    # Replace table data with current enriched dataframe
    df.to_sql("transactions", conn, if_exists="replace", index=False)
    conn.close()
