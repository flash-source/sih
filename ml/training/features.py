"""Shared feature schema for SIH 26103 models.

Training and serving MUST use the same columns. Serving mirrors these formulas in
backend/app/services/features.py -- if you change one, change both.

Leakage rule: a feature may only use information visible in that month's report.
Labels for panel training are computed against the NEXT snapshot (true forecasting).
"""

import numpy as np
import pandas as pd

NUMERIC_FEATURES = [
    "planned_months",        # original commissioning window from sanction
    "elapsed_frac",          # progress through that window at snapshot date
    "progress_deficit",      # expected % minus reported physical progress
    "expenditure_ratio",     # spend so far / original sanctioned cost
    "escalation_so_far",     # revised / original cost already filed
    "months_slipped_so_far", # slip already on record
]
CATEGORICAL_FEATURES = ["sector"]
FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

LABEL_DELAY = "label_delay"   # 1 = slip exceeds 6 months (at next snapshot, for panels)
LABEL_COST = "label_cost"     # 1 = escalation exceeds 20% (at next snapshot, for panels)

DATE_COLS = ["sanction_date", "start_date", "original_commissioning_date", "revised_commissioning_date"]
NUMERIC_COLS = ["original_cost", "revised_cost", "cumulative_expenditure", "progress_percent", "total_cost"]


def month_diff(later, earlier):
    return (pd.to_datetime(later) - pd.to_datetime(earlier)).dt.days / 30.44


def build_features(df: pd.DataFrame, as_of=None) -> pd.DataFrame:
    """Returns a frame with FEATURE_COLUMNS + all derived intermediate columns."""
    d = df.copy()
    for c in DATE_COLS:
        if c in d.columns:
            d[c] = pd.to_datetime(d[c], errors="coerce", dayfirst=True)
    for c in NUMERIC_COLS:
        if c in d.columns:
            d[c] = pd.to_numeric(d[c], errors="coerce")

    sanction = d["sanction_date"] if "sanction_date" in d else d.get("start_date")
    orig_comm = d["original_commissioning_date"]
    rev_comm = d["revised_commissioning_date"].fillna(orig_comm)

    if as_of is None:
        as_of = pd.Timestamp.today().normalize()
    as_of = pd.Timestamp(as_of)

    d["planned_months"] = month_diff(orig_comm, sanction)
    elapsed = month_diff(as_of, sanction)
    d["elapsed_frac"] = (elapsed / d["planned_months"].replace(0, np.nan)).clip(0, 1.5)
    d["progress_deficit"] = d["elapsed_frac"] * 100 - d["progress_percent"].fillna(0)
    d["expenditure_ratio"] = d["cumulative_expenditure"] / d["original_cost"].replace(0, np.nan)
    d["escalation_so_far"] = d["revised_cost"] / d["original_cost"].replace(0, np.nan)
    d["months_slipped_so_far"] = month_diff(rev_comm, orig_comm).clip(lower=0)
    if "sector" not in d:
        d["sector"] = "Unknown"
    d["sector"] = d["sector"].fillna("Unknown").astype(str)
    return d


def attach_same_month_labels(d: pd.DataFrame) -> pd.DataFrame:
    """Fallback labels when no next snapshot exists (single-CSV mode).

    NOTE: same-month labels make the task easier than real forecasting.
    Panels built from converted monthly reports should carry their own
    label_delay / label_cost computed against the next month instead.
    """
    d = d.copy()
    d[LABEL_DELAY] = (d["months_slipped_so_far"] > 6).astype(int)
    d[LABEL_COST] = (d["escalation_so_far"] > 1.20).astype(int)
    return d
