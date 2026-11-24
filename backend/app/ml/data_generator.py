import random
import hashlib
import time
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_btc_address(prefix="bc1q"):
    rand_bytes = random.randbytes(20)
    h = hashlib.sha256(rand_bytes).hexdigest()[:28]
    if prefix == "bc1q":
        return f"bc1q{h}"
    elif prefix == "3":
        return f"3{h[:27]}"
    else:
        return f"1{h[:27]}"

def generate_tx_hash():
    rand_bytes = random.randbytes(32)
    return hashlib.sha256(rand_bytes).hexdigest()

def generate_synthetic_transactions(num_records=1200, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    # Reusable wallet pools to simulate network graph connectivity
    wallet_prefixes = ["bc1q", "3", "1"]
    exchanges = [generate_btc_address("bc1q") for _ in range(8)]
    whales = [generate_btc_address("3") for _ in range(12)]
    merchants = [generate_btc_address("1") for _ in range(25)]
    retail_users = [generate_btc_address("bc1q") for _ in range(180)]
    suspicious_wallets = [generate_btc_address("bc1q") for _ in range(15)]

    records = []
    base_time = datetime.now() - timedelta(days=45)

    for i in range(num_records):
        tx_id = generate_tx_hash()
        time_offset = timedelta(
            days=random.uniform(0, 45),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        timestamp = (base_time + time_offset).isoformat()

        # Decide transaction profile
        profile_choice = np.random.choice(
            ["retail", "exchange_sweep", "whale_otc", "fanout_dust", "peeling_anomaly"],
            p=[0.46, 0.24, 0.14, 0.10, 0.06]
        )

        if profile_choice == "retail":
            sender = random.choice(retail_users)
            receiver = random.choice(retail_users + merchants)
            amount_btc = round(float(np.random.exponential(scale=0.18) + 0.002), 6)
            amount_btc = min(amount_btc, 2.5)
            input_count = random.choice([1, 1, 2, 2, 3])
            output_count = random.choice([1, 2, 2])
            transaction_frequency = round(float(np.random.normal(loc=3.2, scale=1.5)), 2)
            transaction_frequency = max(0.5, transaction_frequency)
            unique_counterparties = random.randint(1, 4)
            fee_btc = round(amount_btc * 0.00015 + 0.00004, 6)
            wallet_activity_score = round(float(np.random.normal(loc=25.0, scale=8.0)), 2)
            in_degree = random.randint(1, 5)
            out_degree = random.randint(1, 5)
            pattern_type = "Retail P2P Transfer"

        elif profile_choice == "exchange_sweep":
            sender = random.choice(retail_users)
            receiver = random.choice(exchanges)
            amount_btc = round(float(np.random.uniform(1.5, 25.0)), 6)
            input_count = random.randint(8, 45)
            output_count = random.choice([1, 2])
            transaction_frequency = round(float(np.random.uniform(40.0, 180.0)), 2)
            unique_counterparties = random.randint(15, 65)
            fee_btc = round(0.0008 + input_count * 0.00003, 6)
            wallet_activity_score = round(float(np.random.uniform(75.0, 98.0)), 2)
            in_degree = random.randint(12, 60)
            out_degree = random.randint(2, 10)
            pattern_type = "Exchange Hot Wallet Consolidation"

        elif profile_choice == "whale_otc":
            sender = random.choice(whales)
            receiver = random.choice(whales + exchanges)
            amount_btc = round(float(np.random.uniform(45.0, 480.0)), 6)
            input_count = random.choice([1, 2, 3])
            output_count = random.choice([1, 2])
            transaction_frequency = round(float(np.random.uniform(0.1, 1.8)), 2)
            unique_counterparties = random.randint(1, 3)
            fee_btc = round(0.0005 + amount_btc * 0.00001, 6)
            wallet_activity_score = round(float(np.random.uniform(15.0, 40.0)), 2)
            in_degree = random.randint(1, 4)
            out_degree = random.randint(1, 4)
            pattern_type = "High-Volume Whale / OTC Movement"

        elif profile_choice == "fanout_dust":
            sender = random.choice(suspicious_wallets)
            receiver = random.choice(retail_users)
            amount_btc = round(float(np.random.uniform(0.0001, 0.003)), 6)
            input_count = random.choice([1, 2])
            output_count = random.randint(12, 60)
            transaction_frequency = round(float(np.random.uniform(15.0, 70.0)), 2)
            unique_counterparties = random.randint(15, 55)
            fee_btc = round(0.00045, 6)
            wallet_activity_score = round(float(np.random.uniform(50.0, 85.0)), 2)
            in_degree = random.randint(2, 8)
            out_degree = random.randint(15, 60)
            pattern_type = "Rapid Fan-Out / Micro-Distribution"

        else: # peeling_anomaly
            sender = random.choice(suspicious_wallets)
            receiver = random.choice(suspicious_wallets + retail_users)
            # Unusual bursty amount and highly skewed metrics
            amount_btc = round(float(np.random.choice([
                np.random.uniform(9.8, 18.5),
                np.random.uniform(0.00005, 0.0002)
            ])), 6)
            input_count = random.choice([1, 25, 42])
            output_count = random.choice([2, 38, 70])
            transaction_frequency = round(float(np.random.uniform(120.0, 310.0)), 2)
            unique_counterparties = random.randint(28, 95)
            fee_btc = round(0.0015, 6)
            wallet_activity_score = round(float(np.random.uniform(88.0, 99.9)), 2)
            in_degree = random.randint(25, 90)
            out_degree = random.randint(25, 90)
            pattern_type = "Suspicious Rapid Peeling / Layering Pattern"

        records.append({
            "transaction_id": tx_id,
            "sender_address": sender,
            "receiver_address": receiver,
            "amount_btc": amount_btc,
            "timestamp": timestamp,
            "transaction_frequency": transaction_frequency,
            "input_count": input_count,
            "output_count": output_count,
            "unique_counterparties": unique_counterparties,
            "fee_btc": fee_btc,
            "wallet_activity_score": wallet_activity_score,
            "in_degree": in_degree,
            "out_degree": out_degree,
            "pattern_type": pattern_type,
            "is_synthetic": True
        })

    df = pd.DataFrame(records)
    # Sort chronologically
    df["dt"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by="dt", ascending=False).drop(columns=["dt"]).reset_index(drop=True)
    return df

if __name__ == "__main__":
    df = generate_synthetic_transactions(1200)
    print(f"Generated {len(df)} transactions. Preview:")
    print(df.head(3))
