# backend/app/services/risk_engine.py
"""
Rule-based delay/cost risk scoring for PS 103.

This replaces the placeholder predict_risk() in services/ml.py, which
returned hardcoded numbers regardless of input. Nothing here is a trained
model — the ml/training pipeline and notebook are still empty scaffolding
(no feature engineering, no saved .pkl anywhere in the repo), so there is
no model to load. This is a transparent, explainable scorer instead: every
number it produces can be justified in one sentence, which matters more
for a first prototype's Q&A than a black box would.

Two independent scores, not one blended number:

  delay_score   — how far behind schedule the project is. Two components:
                  (a) slip_months: has the government's OWN commissioning
                      date estimate already moved later than the original?
                      This is ground truth, not a model guess.
                  (b) pace_penalty: even before any official revision,
                      is physical progress behind what a straight-line
                      read of elapsed-time-vs-sanction-to-commissioning
                      would predict? This catches trouble earlier than
                      waiting for an official revision to be filed.
                  Plus a flat bonus if the (possibly revised) commissioning
                  date has already passed with the project still incomplete.

  budget_score  — how far cost and spend have run ahead of the plan.
                  (a) cost_escalation: revised cost vs original cost.
                  (b) spend_variance: cumulative expenditure vs physical
                      progress — spending faster than the work justifies.

Both are 0-100, banded LOW/MEDIUM/HIGH/CRITICAL to match the existing
RiskScore.risk_band convention already used elsewhere in this codebase.
"""
from dataclasses import dataclass
from datetime import datetime


def _clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def _month_diff(later, earlier) -> float:
    if later is None or earlier is None:
        return 0.0
    return (later.year - earlier.year) * 12 + (later.month - earlier.month)


def _band(score: float) -> str:
    if score >= 75:
        return "CRITICAL"
    if score >= 55:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"


@dataclass
class RiskResult:
    delay_score: float
    budget_score: float
    blended_score: float
    risk_band: str
    slip_months: float
    is_overdue: bool
    cost_escalation_pct: float
    spend_variance_pct: float


def compute_risk(
    *,
    original_cost: float,
    revised_cost: float,
    cumulative_expenditure: float,
    physical_progress_pct: float,
    original_commissioning_date,
    revised_commissioning_date,
    sanction_date,
    today: datetime = None,
) -> RiskResult:
    """
    All date args accept `datetime`/`None`. Costs/progress accept
    `float`/`Decimal`/`None` (None is treated as 0). `revised_cost <= 0`
    is treated as "not revised" (matches how the source export encodes an
    unrevised cost as 0 rather than leaving it blank), not as a literal
    revision down to zero.
    """
    today = today or datetime.utcnow()
    original_cost = float(original_cost or 0)
    revised_cost = float(revised_cost or 0)
    cumulative_expenditure = float(cumulative_expenditure or 0)
    progress = float(physical_progress_pct or 0)

    effective_cost = revised_cost if revised_cost > 0 else original_cost
    effective_date = revised_commissioning_date or original_commissioning_date

    # --- delay score -----------------------------------------------
    slip_months = _clamp(
        _month_diff(effective_date, original_commissioning_date), 0, 60
    )

    pace_penalty = 0.0
    if sanction_date and effective_date:
        planned_months = _month_diff(effective_date, sanction_date)
        if 3 <= planned_months <= 240:  # discard implausible date pairs
            elapsed_months = max(0.0, _month_diff(today, sanction_date))
            expected_progress = min(100.0, elapsed_months / planned_months * 100)
            pace_penalty = max(0.0, expected_progress - progress)

    is_overdue = bool(effective_date and effective_date < today and progress < 100)

    delay_score = (
        _clamp(slip_months * 3, 0, 40)
        + _clamp(pace_penalty * 1.1, 0, 40)
        + (20 if is_overdue else 0)
    )
    delay_score = _clamp(delay_score)

    # --- budget score ------------------------------------------------
    cost_escalation_pct = (
        (effective_cost - original_cost) / original_cost * 100
        if original_cost > 0 else 0.0
    )
    spend_variance_pct = (
        (cumulative_expenditure / effective_cost * 100) - progress
        if effective_cost > 0 else 0.0
    )
    budget_score = (
        _clamp(max(0.0, cost_escalation_pct) * 2, 0, 60)
        + _clamp(max(0.0, spend_variance_pct) * 1.2, 0, 60)
    )
    budget_score = _clamp(budget_score)

    blended = max(delay_score, budget_score)

    return RiskResult(
        delay_score=round(delay_score, 1),
        budget_score=round(budget_score, 1),
        blended_score=round(blended, 1),
        risk_band=_band(blended),
        slip_months=slip_months,
        is_overdue=is_overdue,
        cost_escalation_pct=round(cost_escalation_pct, 1),
        spend_variance_pct=round(spend_variance_pct, 1),
    )