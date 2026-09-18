"""Train the delay and cost-overrun models and export .pkl artifacts.

Outputs (picked up automatically by backend/app/services/ml.py at startup):
    backend/models/delay_model.pkl
    backend/models/cost_model.pkl
    ml/models/training_metrics.json

Data input, in order of preference:
  1. Panel CSV (long format, one row per project per snapshot month, with
     label_delay / label_cost computed against the NEXT snapshot) -> true
     forecasting. Built by the flash-report converter once the historical
     files are digitized:
         python train_models.py --panel ../data/panel.csv
  2. Single snapshot -> same-month labels (honest fallback, prints a warning):
         python train_models.py --snapshot ../data/Projects_Report.csv

Time discipline: with a panel, the LAST snapshot month is the test set and
everything earlier is the training set -- no shuffling across time.
"""

import argparse
import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

sys.path.insert(0, str(Path(__file__).resolve().parent))
from features import (CATEGORICAL_FEATURES, FEATURE_COLUMNS, LABEL_COST,
                      LABEL_DELAY, NUMERIC_FEATURES, attach_same_month_labels,
                      build_features)

BACKEND_MODEL_DIR = Path(__file__).resolve().parents[3] / "backend" / "models"
METRICS_OUT = Path(__file__).resolve().parents[2] / "models" / "training_metrics.json"


def make_model() -> Pipeline:
    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                          ("sc", StandardScaler())]), NUMERIC_FEATURES),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
    ])
    clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    return Pipeline([("pre", pre), ("clf", clf)])


def evaluate(model, X, y) -> dict:
    proba = model.predict_proba(X)[:, 1]
    pred = (proba >= 0.5).astype(int)
    return {
        "n": int(len(y)),
        "positive_rate": round(float(y.mean()), 4),
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "precision": round(float(precision_score(y, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y, pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y, pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y, proba)), 4),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--panel", help="long-format panel CSV with snapshot_month + labels")
    ap.add_argument("--snapshot", help="single-snapshot CSV (fallback mode)")
    ap.add_argument("--as-of", default=None, help="snapshot date, e.g. 2026-07-31")
    args = ap.parse_args()

    as_of = pd.Timestamp(args.as_of) if args.as_of else None

    if args.panel:
        raw = pd.read_csv(args.panel)
        df = build_features(raw, as_of=as_of)
        df = df.dropna(subset=["snapshot_month"])
        months = sorted(df["snapshot_month"].unique())
        test_month = months[-1]
        train = df[df["snapshot_month"] != test_month]
        test = df[df["snapshot_month"] == test_month]
        label_mode = "panel (next-snapshot labels)"
        print(f"panel mode: {len(months)} months {months[0]}..{months[-1]} | "
              f"train={len(train)} test={len(test)} (test month={test_month})")
    elif args.snapshot:
        raw = pd.read_csv(args.snapshot)
        df = attach_same_month_labels(build_features(raw, as_of=as_of))
        cutoff = df["original_commissioning_date"].median()
        train = df[df["original_commissioning_date"] <= cutoff]
        test = df[df["original_commissioning_date"] > cutoff]
        label_mode = ("SINGLE-SNAPSHOT fallback (same-month labels) -- "
                      "retrain on a panel for real forecasting")
        print(f"snapshot mode: train={len(train)} test={len(test)} "
              f"(split at commissioning median {cutoff.date()})")
        print("WARNING:", label_mode)
    else:
        ap.error("provide --panel or --snapshot")

    metrics = {"label_mode": label_mode, "models": {}}
    for name, label_col, out_name in [("delay", LABEL_DELAY, "delay_model.pkl"),
                                      ("cost", LABEL_COST, "cost_model.pkl")]:
        train_s = train.dropna(subset=[label_col])
        test_s = test.dropna(subset=[label_col])
        model = make_model()
        model.fit(train_s[FEATURE_COLUMNS], train_s[label_col])
        m = {"train": evaluate(model, train_s[FEATURE_COLUMNS], train_s[label_col]),
             "test": evaluate(model, test_s[FEATURE_COLUMNS], test_s[label_col])}
        metrics["models"][name] = m
        BACKEND_MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, BACKEND_MODEL_DIR / out_name)
        print(f"{name}: test acc={m['test']['accuracy']}  roc_auc={m['test']['roc_auc']}  -> {out_name}")

    METRICS_OUT.parent.mkdir(parents=True, exist_ok=True)
    METRICS_OUT.write_text(json.dumps(metrics, indent=2))
    print("metrics ->", METRICS_OUT)


if __name__ == "__main__":
    main()