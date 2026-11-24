import os
import io
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np

from backend.app.config import DEFAULT_DATASET_PATH, DEFAULT_KMEANS_K, DEFAULT_DBSCAN_EPS, DEFAULT_DBSCAN_MIN_SAMPLES, DEFAULT_ISOLATION_CONTAMINATION
from backend.app.ml.pipeline import CoinTraceMLPipeline, FEATURE_COLUMNS
from backend.app.ml.data_generator import generate_synthetic_transactions
from backend.app.services.ai_insight_service import AIInsightService
from backend.app.services.graph_service import NetworkGraphService
from backend.app.services.report_service import ReportService
from backend.app.database import save_transactions_to_db

router = APIRouter(prefix="/api")

# In-memory Application State
class AppState:
    def __init__(self):
        self.raw_df: pd.DataFrame = pd.DataFrame()
        self.enriched_df: pd.DataFrame = pd.DataFrame()
        self.ml_pipeline = CoinTraceMLPipeline(scaler_type="robust")
        self.ai_service = AIInsightService()
        self.current_ml_results = {}
        self.kmeans_k = DEFAULT_KMEANS_K
        self.dbscan_eps = DEFAULT_DBSCAN_EPS
        self.dbscan_min_samples = DEFAULT_DBSCAN_MIN_SAMPLES
        self.contamination = DEFAULT_ISOLATION_CONTAMINATION
        self.dataset_name = "Synthetic Demonstration Dataset (1,200 records)"

    def load_initial_data(self):
        if DEFAULT_DATASET_PATH.exists():
            try:
                self.raw_df = pd.read_csv(DEFAULT_DATASET_PATH)
            except Exception:
                self.raw_df = generate_synthetic_transactions(1200)
                self.raw_df.to_csv(DEFAULT_DATASET_PATH, index=False)
        else:
            self.raw_df = generate_synthetic_transactions(1200)
            self.raw_df.to_csv(DEFAULT_DATASET_PATH, index=False)

        self.run_pipeline()

    def run_pipeline(self):
        results = self.ml_pipeline.run_full_pipeline(
            self.raw_df,
            k=self.kmeans_k,
            eps=self.dbscan_eps,
            min_samples=self.dbscan_min_samples,
            contamination=self.contamination
        )
        self.enriched_df = results["enriched_df"]
        self.current_ml_results = results
        try:
            save_transactions_to_db(self.enriched_df)
        except Exception as e:
            print("DB save warning:", e)

    def get_stats(self):
        if self.enriched_df.empty:
            self.load_initial_data()
        unique_addresses = len(set(self.enriched_df["sender_address"]).union(set(self.enriched_df["receiver_address"])))
        total_vol = float(self.enriched_df["amount_btc"].sum())
        avg_vol = float(self.enriched_df["amount_btc"].mean())
        total_tx = len(self.enriched_df)
        suspicious_count = int(self.enriched_df["is_anomaly"].sum())
        anomaly_pct = round((suspicious_count / total_tx) * 100, 2)
        n_clusters = self.current_ml_results.get("kmeans", {}).get("n_clusters", self.kmeans_k)

        return {
            "total_transactions": total_tx,
            "unique_addresses": unique_addresses,
            "total_volume_btc": round(total_vol, 4),
            "avg_amount_btc": round(avg_vol, 4),
            "detected_clusters": n_clusters,
            "suspicious_patterns": suspicious_count,
            "anomaly_percentage": anomaly_pct,
            "dataset_name": self.dataset_name
        }

state = AppState()

# Request Models
class KMeansRequest(BaseModel):
    k: int = 4

class DBSCANRequest(BaseModel):
    eps: float = 1.2
    min_samples: int = 5

class AnomalyRequest(BaseModel):
    contamination: float = 0.05

class QuestionRequest(BaseModel):
    question: str

@router.get("/health")
def health_check():
    if state.enriched_df.empty:
        state.load_initial_data()
    return {
        "status": "healthy",
        "service": "CoinTrace API",
        "transactions_loaded": len(state.enriched_df),
        "ml_pipeline_ready": not state.enriched_df.empty
    }

@router.get("/dashboard/stats")
def get_dashboard_stats():
    if state.enriched_df.empty:
        state.load_initial_data()
    stats = state.get_stats()
    df = state.enriched_df
    if df.empty:
        return {"stats": stats, "charts": {}}

    # Volume & Transaction Count Over Time (group by date)
    temp_df = df.copy()
    temp_df["date"] = pd.to_datetime(temp_df["timestamp"]).dt.strftime("%Y-%m-%d")
    daily = temp_df.groupby("date").agg(
        volume_btc=("amount_btc", "sum"),
        tx_count=("transaction_id", "count"),
        anomalies=("is_anomaly", "sum")
    ).reset_index().sort_values("date")

    # Limit to latest 30 days for clean chart
    daily_records = daily.tail(30).to_dict(orient="records")
    for r in daily_records:
        r["volume_btc"] = round(float(r["volume_btc"]), 2)

    # Cluster Distribution
    kmeans_profiles = state.current_ml_results.get("kmeans", {}).get("profiles", [])

    # Value Distribution Bins
    bins = [0, 0.01, 0.1, 1.0, 10.0, 50.0, float('inf')]
    bin_labels = ["< 0.01", "0.01 - 0.1", "0.1 - 1.0", "1.0 - 10.0", "10 - 50", "> 50 BTC"]
    temp_df["value_bin"] = pd.cut(temp_df["amount_btc"], bins=bins, labels=bin_labels)
    value_dist = temp_df["value_bin"].value_counts().reindex(bin_labels, fill_value=0)
    value_dist_records = [{"bin": k, "count": int(v)} for k, v in value_dist.items()]

    # Anomaly Breakdown
    normal_count = int((~df["is_anomaly"]).sum())
    anomaly_count = int(df["is_anomaly"].sum())

    # Recent 10 Transactions
    recent_txs = df.head(10)[[
        "transaction_id", "sender_address", "receiver_address",
        "amount_btc", "timestamp", "cluster_kmeans", "cluster_name",
        "is_anomaly", "anomaly_score", "anomaly_explanation"
    ]].to_dict(orient="records")

    return {
        "stats": stats,
        "volume_over_time": daily_records,
        "cluster_distribution": kmeans_profiles,
        "value_distribution": value_dist_records,
        "anomaly_summary": {
            "normal": normal_count,
            "anomaly": anomaly_count,
            "total": len(df)
        },
        "recent_transactions": recent_txs
    }

@router.get("/transactions")
def get_transactions(
    search: Optional[str] = None,
    cluster: Optional[str] = None,
    is_anomaly: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100)
):
    if state.enriched_df.empty:
        state.load_initial_data()
    df = state.enriched_df
    if df.empty:
        return {"transactions": [], "total": 0, "page": page, "total_pages": 0}

    filtered = df.copy()

    # Search by tx_id or addresses
    if search and search.strip():
        s = search.strip().lower()
        filtered = filtered[
            filtered["transaction_id"].str.lower().str.contains(s) |
            filtered["sender_address"].str.lower().str.contains(s) |
            filtered["receiver_address"].str.lower().str.contains(s)
        ]

    # Filter by cluster
    if cluster is not None and cluster != "" and cluster != "all":
        try:
            c_int = int(cluster)
            filtered = filtered[filtered["cluster_kmeans"] == c_int]
        except ValueError:
            pass

    # Filter by anomaly status
    if is_anomaly == "true":
        filtered = filtered[filtered["is_anomaly"] == True]
    elif is_anomaly == "false":
        filtered = filtered[filtered["is_anomaly"] == False]

    # Filter by amount range
    if min_amount is not None:
        filtered = filtered[filtered["amount_btc"] >= min_amount]
    if max_amount is not None:
        filtered = filtered[filtered["amount_btc"] <= max_amount]

    # Sorting
    ascending = (sort_order.lower() == "asc")
    if sort_by in filtered.columns:
        filtered = filtered.sort_values(by=sort_by, ascending=ascending)
    else:
        filtered = filtered.sort_values(by="timestamp", ascending=False)

    total_records = len(filtered)
    total_pages = max(1, (total_records + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    page_data = filtered.iloc[offset:offset + page_size]

    records = page_data[[
        "transaction_id", "sender_address", "receiver_address",
        "amount_btc", "timestamp", "transaction_frequency",
        "input_count", "output_count", "unique_counterparties",
        "fee_btc", "wallet_activity_score", "cluster_kmeans",
        "cluster_name", "cluster_dbscan", "is_anomaly",
        "anomaly_score", "anomaly_explanation", "pca_x", "pca_y"
    ]].to_dict(orient="records")

    return {
        "transactions": records,
        "total": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/transactions/{tx_id}")
def get_transaction_detail(tx_id: str):
    df = state.enriched_df
    matched = df[df["transaction_id"] == tx_id]
    if matched.empty:
        raise HTTPException(status_code=404, detail="Transaction not found")
    record = matched.iloc[0].to_dict()
    # Cast numpy/pandas types
    for k, v in record.items():
        if isinstance(v, (np.integer, np.int64)):
            record[k] = int(v)
        elif isinstance(v, (np.floating, np.float64)):
            record[k] = float(v)
        elif isinstance(v, np.bool_):
            record[k] = bool(v)
    return record

@router.post("/cluster/kmeans")
def update_kmeans(req: KMeansRequest):
    if req.k < 2 or req.k > 10:
        raise HTTPException(status_code=400, detail="Number of clusters (k) must be between 2 and 10")
    state.kmeans_k = req.k
    state.run_pipeline()
    return {
        "kmeans": state.current_ml_results["kmeans"],
        "pca_points": state.enriched_df[["transaction_id", "pca_x", "pca_y", "cluster_kmeans", "amount_btc", "is_anomaly"]].to_dict(orient="records")
    }

@router.post("/cluster/dbscan")
def update_dbscan(req: DBSCANRequest):
    if req.eps <= 0 or req.min_samples < 2:
        raise HTTPException(status_code=400, detail="Invalid DBSCAN parameters: eps > 0 and min_samples >= 2 required")
    state.dbscan_eps = req.eps
    state.dbscan_min_samples = req.min_samples
    state.run_pipeline()
    return {
        "dbscan": state.current_ml_results["dbscan"],
        "pca_points": state.enriched_df[["transaction_id", "pca_x", "pca_y", "cluster_dbscan", "amount_btc", "is_anomaly"]].to_dict(orient="records")
    }

@router.post("/anomaly/detect")
def update_anomaly_detection(req: AnomalyRequest):
    if req.contamination <= 0.0 or req.contamination >= 0.5:
        raise HTTPException(status_code=400, detail="Contamination must be between 0.01 and 0.49")
    state.contamination = req.contamination
    state.run_pipeline()
    top_anomalies = state.enriched_df[state.enriched_df["is_anomaly"] == True].sort_values(
        by="anomaly_score", ascending=False
    ).head(15)[[
        "transaction_id", "sender_address", "receiver_address",
        "amount_btc", "anomaly_score", "anomaly_explanation",
        "transaction_frequency", "output_count"
    ]].to_dict(orient="records")

    return {
        "isolation_forest": state.current_ml_results["isolation_forest"],
        "top_anomalies": top_anomalies
    }

@router.get("/analysis/results")
def get_analysis_results():
    if state.enriched_df.empty:
        state.load_initial_data()
    df = state.enriched_df
    if df.empty:
        return {}

    # Downsample PCA points for smooth interactive rendering if dataset is very large
    sample_size = min(1200, len(df))
    sample_df = df.sample(n=sample_size, random_state=42) if len(df) > sample_size else df

    pca_points = sample_df[[
        "transaction_id", "sender_address", "receiver_address",
        "pca_x", "pca_y", "amount_btc", "cluster_kmeans",
        "cluster_name", "cluster_dbscan", "is_anomaly", "anomaly_score"
    ]].to_dict(orient="records")

    return {
        "pca_stats": state.current_ml_results.get("pca_stats", {}),
        "kmeans": state.current_ml_results.get("kmeans", {}),
        "dbscan": state.current_ml_results.get("dbscan", {}),
        "isolation_forest": state.current_ml_results.get("isolation_forest", {}),
        "pca_points": pca_points,
        "feature_columns": state.ml_pipeline.feature_columns,
        "comparison": {
            "kmeans_clusters": state.current_ml_results.get("kmeans", {}).get("n_clusters", 4),
            "kmeans_silhouette": state.current_ml_results.get("kmeans", {}).get("silhouette_score", 0.0),
            "kmeans_exec_ms": state.current_ml_results.get("kmeans", {}).get("execution_time_ms", 0.0),
            "dbscan_clusters": state.current_ml_results.get("dbscan", {}).get("n_clusters", 0),
            "dbscan_noise": state.current_ml_results.get("dbscan", {}).get("noise_points", 0),
            "dbscan_silhouette": state.current_ml_results.get("dbscan", {}).get("silhouette_score", 0.0),
            "dbscan_exec_ms": state.current_ml_results.get("dbscan", {}).get("execution_time_ms", 0.0),
            "isolation_anomalies": state.current_ml_results.get("isolation_forest", {}).get("total_anomalies", 0),
            "isolation_exec_ms": state.current_ml_results.get("isolation_forest", {}).get("execution_time_ms", 0.0)
        }
    }

@router.get("/network/graph")
def get_network_graph(max_nodes: int = Query(75, ge=20, le=150)):
    if state.enriched_df.empty:
        state.load_initial_data()
    return NetworkGraphService.build_network_graph(state.enriched_df, max_nodes=max_nodes)

@router.post("/ai/insights")
def get_ai_insights():
    if state.enriched_df.empty:
        state.load_initial_data()
    stats = state.get_stats()
    insights = state.ai_service.generate_rule_based_insights(state.current_ml_results, stats)
    return insights

@router.post("/ai/chat")
async def chat_ai(req: QuestionRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    stats = state.get_stats()
    response = await state.ai_service.answer_question(req.question, state.current_ml_results, stats)
    return response

@router.get("/dataset/preview")
def preview_dataset():
    df = state.raw_df
    if df.empty:
        return {"columns": [], "rows": [], "total_rows": 0}

    missing_vals = df.isnull().sum().to_dict()
    duplicates_count = int(df.duplicated(subset=["transaction_id"]).sum()) if "transaction_id" in df.columns else int(df.duplicated().sum())

    head_rows = df.head(10).to_dict(orient="records")
    return {
        "columns": list(df.columns),
        "total_rows": len(df),
        "missing_values": missing_vals,
        "duplicates_count": duplicates_count,
        "head_rows": head_rows,
        "dataset_name": state.dataset_name,
        "required_features": FEATURE_COLUMNS
    }

@router.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 25MB limit")

    try:
        new_df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    # Check for basic minimal required columns
    required_cols = ["amount_btc"]
    for req in required_cols:
        if req not in new_df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"CSV is missing required column '{req}'. Please ensure amount_btc is present."
            )

    # Auto-generate essential columns if not provided
    if "transaction_id" not in new_df.columns:
        new_df["transaction_id"] = [f"custom_tx_{i:06d}" for i in range(len(new_df))]
    if "sender_address" not in new_df.columns:
        new_df["sender_address"] = [f"bc1qcustomsender{i%50:03d}" for i in range(len(new_df))]
    if "receiver_address" not in new_df.columns:
        new_df["receiver_address"] = [f"bc1qcustomrecv{i%50:03d}" for i in range(len(new_df))]
    if "timestamp" not in new_df.columns:
        new_df["timestamp"] = pd.Timestamp.now().isoformat()

    # Drop exact duplicate transaction_ids
    new_df = new_df.drop_duplicates(subset=["transaction_id"]).reset_index(drop=True)

    state.raw_df = new_df
    state.dataset_name = f"Uploaded: {file.filename} ({len(new_df)} records)"
    state.run_pipeline()

    return {
        "status": "success",
        "message": f"Successfully loaded and clustered {len(new_df)} transactions from {file.filename}",
        "stats": state.get_stats()
    }

@router.post("/dataset/reset-default")
def reset_to_default_dataset():
    state.raw_df = generate_synthetic_transactions(1200)
    state.raw_df.to_csv(DEFAULT_DATASET_PATH, index=False)
    state.dataset_name = "Synthetic Demonstration Dataset (1,200 records)"
    state.kmeans_k = DEFAULT_KMEANS_K
    state.dbscan_eps = DEFAULT_DBSCAN_EPS
    state.dbscan_min_samples = DEFAULT_DBSCAN_MIN_SAMPLES
    state.contamination = DEFAULT_ISOLATION_CONTAMINATION
    state.run_pipeline()
    return {
        "status": "success",
        "message": "Reset to default realistic synthetic Bitcoin dataset",
        "stats": state.get_stats()
    }

@router.get("/dataset/download-sample")
def download_sample_dataset():
    sample_csv = ReportService.export_csv(state.raw_df)
    return Response(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cointrace_sample_bitcoin_data.csv"}
    )

@router.get("/reports/export")
def export_report(format: str = Query("json")):
    if format not in ["json", "csv"]:
        format = "json"
    stats = state.get_stats()
    insights = state.ai_service.generate_rule_based_insights(state.current_ml_results, stats)
    if format == "csv":
        csv_content = ReportService.export_csv(state.enriched_df)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=cointrace_clustered_transactions.csv"}
        )
    else:
        full_report = ReportService.generate_full_report(state.enriched_df, state.current_ml_results, stats, insights)
        return full_report
