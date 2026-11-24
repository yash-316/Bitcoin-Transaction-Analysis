import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
DATABASE_PATH = BASE_DIR / "cointrace.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_DATASET_PATH = DATA_DIR / "sample_bitcoin_transactions.csv"

# Model Hyperparameter Defaults
DEFAULT_KMEANS_K = 4
DEFAULT_DBSCAN_EPS = 1.2
DEFAULT_DBSCAN_MIN_SAMPLES = 5
DEFAULT_ISOLATION_CONTAMINATION = 0.05
