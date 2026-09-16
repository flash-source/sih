from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.services.risk_engine import compute_risk

router = APIRouter()


def _to_project_out(project: models.Project, risk: models.RiskScore | None) -> schemas.ProjectOut:
    out = schemas.ProjectOut.model_validate(project)
    if risk:
        out.blended_risk_score = risk.blended_risk_score
        out.risk_band = risk.risk_band
    return out


@router.get("/projects", response_model=list[schemas.ProjectOut])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rows = (
        db.query(models.Project, models.RiskScore)
        .outerjoin(models.RiskScore, models.RiskScore.project_id == models.Project.id)
        .order_by(models.Project.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_to_project_out(project, risk) for project, risk in rows]


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    risk = db.query(models.RiskScore).filter(models.RiskScore.project_id == project_id).first()
    return _to_project_out(project, risk)


@router.post("/predict-risk", response_model=schemas.RiskScoreOut)
def predict_project_risk(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = compute_risk(
        original_cost=project.original_cost,
        revised_cost=project.revised_cost,
        cumulative_expenditure=project.cumulative_expenditure,
        physical_progress_pct=project.progress_percent,
        original_commissioning_date=project.original_commissioning_date,
        revised_commissioning_date=project.revised_commissioning_date,
        sanction_date=project.sanction_date,
    )

    risk_row = db.query(models.RiskScore).filter(models.RiskScore.project_id == project_id).first()
    if risk_row:
        risk_row.cost_overrun_prob = result.budget_score / 100
        risk_row.delay_prob = result.delay_score / 100
        risk_row.blended_risk_score = result.blended_score
        risk_row.risk_band = result.risk_band
    else:
        risk_row = models.RiskScore(
            project_id=project_id,
            cost_overrun_prob=result.budget_score / 100,
            delay_prob=result.delay_score / 100,
            blended_risk_score=result.blended_score,
            risk_band=result.risk_band,
        )
        db.add(risk_row)
    db.commit()
    db.refresh(risk_row)
    return risk_row


@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total_projects = db.query(func.count(models.Project.id)).scalar() or 0
    total_cost = db.query(func.coalesce(func.sum(models.Project.total_cost), 0)).scalar() or 0
    avg_risk = db.query(func.coalesce(func.avg(models.RiskScore.blended_risk_score), 0)).scalar() or 0

    status_rows = (
        db.query(models.Project.status, func.count(models.Project.id))
        .group_by(models.Project.status)
        .all()
    )
    projects_by_status = {status: count for status, count in status_rows}

    critical_rows = (
        db.query(models.Project, models.RiskScore)
        .join(models.RiskScore, models.RiskScore.project_id == models.Project.id)
        .filter(models.RiskScore.risk_band == "CRITICAL")
        .order_by(models.RiskScore.blended_risk_score.desc())
        .limit(10)
        .all()
    )
    critical_projects = [_to_project_out(project, risk) for project, risk in critical_rows]

    return schemas.DashboardSummary(
        total_projects=total_projects,
        total_cost=float(total_cost),
        avg_risk_score=float(avg_risk),
        projects_by_status=projects_by_status,
        critical_projects=critical_projects,
    )


@router.get("/risk/distribution")
def risk_distribution(db: Session = Depends(get_db)):
    rows = (
        db.query(models.RiskScore.risk_band, func.count(models.RiskScore.id))
        .group_by(models.RiskScore.risk_band)
        .all()
    )
    return {band: count for band, count in rows}


@router.get("/risk/by-sector")
def risk_by_sector(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Project.sector, models.RiskScore.risk_band, func.count(models.Project.id))
        .join(models.RiskScore, models.RiskScore.project_id == models.Project.id)
        .group_by(models.Project.sector, models.RiskScore.risk_band)
        .all()
    )
    by_sector: dict[str, dict[str, int]] = {}
    for sector, band, count in rows:
        by_sector.setdefault(sector or "Unknown", {})[band] = count
    return by_sector