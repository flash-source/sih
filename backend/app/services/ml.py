# backend/app/services/ml.py
import joblib
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Default paths (can be overridden by .env)
COST_MODEL_PATH = os.getenv("COST_MODEL_PATH", "models/cost_model.pkl")
DELAY_MODEL_PATH = os.getenv("DELAY_MODEL_PATH", "models/delay_model.pkl")

# Fallback paths for Day-1 Demo (R3's pre-trained models)
DEMO_COST_MODEL_PATH = "models/demo/cost_model.pkl"
DEMO_DELAY_MODEL_PATH = "models/demo/delay_model.pkl"

cost_model = None
delay_model = None
active_model_type = "none" # 'retrained' or 'demo'

def load_models():
    """Loads models at startup. Prioritizes retrained XGBoost, falls back to R3 demo RF."""
    global cost_model, delay_model, active_model_type
    
    # 1. Try loading the Retrained Models (R2 Pipeline)
    if os.path.exists(COST_MODEL_PATH) and os.path.exists(DELAY_MODEL_PATH):
        try:
            cost_model = joblib.load(COST_MODEL_PATH)
            delay_model = joblib.load(DELAY_MODEL_PATH)
            active_model_type = "retrained"
            logger.info(f"✅ Successfully loaded retrained models from {COST_MODEL_PATH}")
            return
        except Exception as e:
            logger.error(f"⚠️ Failed to load retrained models: {e}")

    # 2. Fallback to R3 Demo Models
    if os.path.exists(DEMO_COST_MODEL_PATH) and os.path.exists(DEMO_DELAY_MODEL_PATH):
        try:
            cost_model = joblib.load(DEMO_COST_MODEL_PATH)
            delay_model = joblib.load(DEMO_DELAY_MODEL_PATH)
            active_model_type = "demo"
            logger.warning(f"⚠️ Loaded fallback DEMO models (RandomForest). Retrain for production.")
            return
        except Exception as e:
            logger.error(f"⚠️ Failed to load demo models: {e}")

    logger.critical("❌ NO MODELS FOUND. Prediction endpoints will return dummy data.")

def predict_risk(features: dict):
    """
    Predicts risk using the loaded models. 
    If no models are loaded, returns a safe fallback.
    """
    if not cost_model or not delay_model:
        return {
            "cost_p": 0.5, 
            "delay_p": 0.5, 
            "blended": 50.0, 
            "band": "UNKNOWN",
            "model_used": "none"
        }

    # Note: In a real scenario, you must ensure 'features' matches the exact 
    # column names the model was trained on (from R2's features.py).
    # For the scaffold, we pass a dummy array or the dict values.
    
    try:
        # Placeholder: Replace with actual feature vector creation based on active_model_type
        # X = create_feature_vector(features, active_model_type)
        
        # Dummy prediction logic for scaffold
        cost_p = 0.65 if active_model_type == "retrained" else 0.45
        delay_p = 0.55 if active_model_type == "retrained" else 0.35
        
        # R3 Blended Score Logic: risk = (cost_p + delay_p) * 50
        blended = (cost_p + delay_p) * 50 
        
        # Banding
        if blended >= 75: band = "CRITICAL"
        elif blended >= 50: band = "HIGH"
        elif blended >= 25: band = "MEDIUM"
        else: band = "LOW"

        return {
            "cost_p": cost_p,
            "delay_p": delay_p,
            "blended": blended,
            "band": band,
            "model_used": active_model_type
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return {"cost_p": 0.0, "delay_p": 0.0, "blended": 0.0, "band": "ERROR", "model_used": "error"}