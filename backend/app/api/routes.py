from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.ml import predict_risk

router = APIRouter()

@router.get("/projects", response_model=list[schemas.ProjectOut])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Project).offset(skip).limit(limit).all()

@router.post("/predict-risk", response_model=schemas.RiskScoreOut)
def predict_project_risk(project_id: int, db: Session = Depends(get_db)):
    # Placeholder: fetch features and predict
    result = predict_risk({})
    return schemas.RiskScoreOut(project_id=project_id, blended_risk_score=result['blended'], risk_band=result['band'])
