"""Feature assembly for serving -- mirrors ml/training/features.py.

Keep the formulas identical to the training side; the .pkl pipelines were fitted
on those column names. Change one, change both.
"""
from datetime import datetime

NUMERIC_FEATURES = [
    "planned_months",
    "elapsed_frac",
    "progress_deficit",
    "expenditure_ratio",
    "escalation_so_far",
    "months_slipped_so_far",
]
FEATURE_COLUMNS = NUMERIC_FEATURES + ["sector"]


def _month_diff(later, earlier) -> float:
    if later is None or earlier is None:
        return 0.0
    return (later.year - earlier.year) * 12 + (later.month - earlier.month)


def build_feature_row(
    *,
    original_cost: float,
    revised_cost: float,
    cumulative_expenditure: float,
    progress_percent: float,
    original_commissioning_date,
    revised_commissioning_date,
    sanction_date,
    sector: str = "Unknown",
    as_of: datetime = None,
) -> dict:
    as_of = as_of or datetime.utcnow()
    original_cost = float(original_cost or 0)
    revised_cost = float(revised_cost or 0)
    effective_cost = revised_cost if revised_cost > 0 else original_cost
    effective_date = revised_commissioning_date or original_commissioning_date
    progress = float(progress_percent or 0)

    planned_months = _month_diff(original_commissioning_date, sanction_date)
    elapsed_months = max(0.0, _month_diff(as_of, sanction_date))
    elapsed_frac = min(1.5, elapsed_months / planned_months) if planned_months > 0 else 0.0

    return {
        "planned_months": planned_months if planned_months > 0 else 0.0,
        "elapsed_frac": elapsed_frac,
        "progress_deficit": elapsed_frac * 100 - progress,
        "expenditure_ratio": (float(cumulative_expenditure or 0) / original_cost) if original_cost > 0 else 0.0,
        "escalation_so_far": (effective_cost / original_cost) if original_cost > 0 else 1.0,
        "months_slipped_so_far": max(
            0.0, _month_diff(effective_date, original_commissioning_date)
        ),
        "sector": sector or "Unknown",
    }