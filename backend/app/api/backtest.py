"""Serves the ML backtest report produced by ml/notebooks/backtest.ipynb.

The notebook trains on the previous Flash Report cycle, predicts the current one,
compares against actuals, and writes ml/models/backtest_metrics.json. This endpoint
just reads that file -- no model runs inside the API process.
"""

import json
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["model"])


def _metrics_path() -> Path:
    env = os.getenv("BACKTEST_METRICS_PATH")
    if env:
        return Path(env)
    # repo-root default: backend/app/api/backtest.py -> up 4 = repo root
    return Path(__file__).resolve().parents[4] / "ml" / "models" / "backtest_metrics.json"


@router.get("/model/backtest")
def get_backtest_report():
    path = _metrics_path()
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"No backtest report at {path}. "
                "Run ml/notebooks/backtest.ipynb with two monthly snapshots first."
            ),
        )
    return json.loads(path.read_text(encoding="utf-8"))
