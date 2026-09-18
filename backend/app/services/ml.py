"""Loads trained .pkl pipelines at startup and serves real predictions.

Model files are produced by ml/training/train_models.py:
    backend/models/delay_model.pkl   (label: slip > 6 months)
    backend/models/cost_model.pkl    (label: escalation > 20%)

Each pickle is a full sklearn Pipeline (impute + scale + one-hot + logistic
regression), fitted on the FEATURE_COLUMNS from app/services/features.py, so
serving only needs to assemble a one-row DataFrame with those columns.

If no models are found, predict_risk reports model_used="none" and callers
(the /predict-risk route) fall back to the transparent rule engine.
"""
import logging
import os
from pathlib import Path

import joblib
import pandas as pd

from app.services.features import FEATURE_COLUMNS

logger = logging.getLogger(__name__)

_BACKEND_DIR = Path(__file__).resolve().parents[2]          # .../backend
_REPO_ROOT = _BACKEND_DIR.parent
DEFAULT_MODEL_DIR = _BACKEND_DIR / "models"
ALT_MODEL_DIR = _REPO_ROOT / "ml" / "models"


def _resolve(name: str):
    env = os.getenv(f"{name.upper()}_MODEL_PATH")  # DELAY_MODEL_PATH / COST_MODEL_PATH
    candidates = [Path(env)] if env else []
    candidates += [DEFAULT_MODEL_DIR / f"{name}_model.pkl", ALT_MODEL_DIR / f"{name}_model.pkl"]
    for c in candidates:
        if c.exists():
            return c
    return None


delay_model = None
cost_model = None
active_model_type = "none"  # "retrained" when both pipelines loaded


def load_models():
    global delay_model, cost_model, active_model_type
    delay_path, cost_path = _resolve("delay"), _resolve("cost")
    if delay_path and cost_path:
        try:
            delay_model = joblib.load(delay_path)
            cost_model = joblib.load(cost_path)
            active_model_type = "retrained"
            logger.info("Loaded trained models: %s, %s", delay_path, cost_path)
            return
        except Exception as e:
            logger.error("Failed to load model pipelines: %s", e)
    delay_model = cost_model = None
    active_model_type = "none"
    logger.warning("No trained models found -- /predict-risk will use the rule engine.")


def _band(blended: float) -> str:
    if blended >= 75:
        return "CRITICAL"
    if blended >= 50:
        return "HIGH"
    if blended >= 25:
        return "MEDIUM"
    return "LOW"


def predict_risk(features_row: dict) -> dict:
    """Predict from a feature row built by features.build_feature_row().

    Returns model_used="none" when models are absent -- never fake numbers.
    """
    if not delay_model or not cost_model:
        return {"model_used": "none"}

    try:
        X = pd.DataFrame([{c: features_row.get(c, 0.0) for c in FEATURE_COLUMNS}])
        cost_p = float(cost_model.predict_proba(X)[:, 1][0])
        delay_p = float(delay_model.predict_proba(X)[:, 1][0])
        blended = (cost_p + delay_p) * 50
        return {
            "cost_p": round(cost_p, 4),
            "delay_p": round(delay_p, 4),
            "blended": round(blended, 1),
            "band": _band(blended),
            "model_used": active_model_type,
        }
    except Exception as e:
        logger.error("Prediction failed: %s", e)
        return {"model_used": "error"}