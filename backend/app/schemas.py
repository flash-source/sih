# backend/app/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    ministry: str
    state: str
    district: Optional[str] = None
    sector: Optional[str] = None

class ProjectCreate(ProjectBase):
    start_date: datetime
    end_date: Optional[datetime] = None
    total_cost: float

class ProjectOut(ProjectBase):
    id: int
    status: str  # PLANNING, IN_PROGRESS, DELAYED, COMPLETED
    progress_percent: Optional[float] = None
    total_cost: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RiskScoreOut(BaseModel):
    project_id: int
    cost_overrun_prob: float
    delay_prob: float
    blended_risk_score: float
    risk_band: str  # LOW, MEDIUM, HIGH, CRITICAL
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardSummary(BaseModel):
    total_projects: int
    total_cost: float
    avg_risk_score: float
    projects_by_status: Dict[str, int]
    critical_projects: List[ProjectOut]