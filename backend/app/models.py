from sqlalchemy import Column, Integer, String, Float, DateTime, Numeric  # type: ignore[import-not-found]
from app.database import Base
import datetime

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    ministry = Column(String, index=True)
    state = Column(String, index=True)
    district = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    project_code = Column(String, nullable=True, index=True)

    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    original_commissioning_date = Column(DateTime, nullable=True)
    revised_commissioning_date = Column(DateTime, nullable=True)
    sanction_date = Column(DateTime, nullable=True)

    original_cost = Column(Numeric(18, 2), default=0.0)
    revised_cost = Column(Numeric(18, 2), default=0.0)
    cumulative_expenditure = Column(Numeric(18, 2), default=0.0)

    total_cost = Column(Numeric(18, 2), default=0.0) # NUMERIC(18,2) for Crores (Gotcha #1)
    progress_percent = Column(Float, default=0.0)
    
    status = Column(String, default="PLANNING") # PLANNING, IN_PROGRESS, DELAYED, COMPLETED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    cost_overrun_prob = Column(Float, default=0.0)
    delay_prob = Column(Float, default=0.0)
    blended_risk_score = Column(Float, default=0.0)
    risk_band = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)