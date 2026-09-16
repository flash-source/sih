import pandas as pd
import os
from datetime import datetime
from typing import Any
from app.database import SessionLocal, engine, Base
import app.models  # <--- CRITICAL: This registers the new columns with SQLAlchemy
from app.models import Project, RiskScore
from app.services.risk_engine import compute_risk

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'data', 'Projects_Report.csv')

def parse_date(value, lo_year=2000, hi_year=2045):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    parsed = pd.to_datetime(value, format='%d-%m-%Y', errors='coerce')
    if pd.isna(parsed) or not (lo_year <= parsed.year <= hi_year):
        return None
    return parsed.to_pydatetime()

def parse_number(value) -> float:
    try:
        cleaned = str(value).replace(',', '').strip()
        return float(cleaned) if cleaned else 0.0
    except (ValueError, TypeError):
        return 0.0

def derive_status(original_commissioning, revised_commissioning, progress: float) -> str:
    if progress >= 100:
        return "COMPLETED"
    effective = revised_commissioning or original_commissioning
    if effective and effective < datetime.utcnow():
        return "DELAYED"
    if effective is None:
        return "PLANNING"
    return "IN_PROGRESS"

def clean_header(header: str) -> str:
    """The Govt CSV has \n in headers. This cleans them."""
    return header.replace('\n', ' ').strip().lower()

def import_data():
    print(f"Reading CSV from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print("CSV file not found! Make sure you placed Projects_Report.csv in ml/data/")
        return

    print("Loading and cleaning CSV...")
    df = pd.read_csv(CSV_PATH)
    df.columns = [clean_header(col) for col in df.columns]

    db: Any = SessionLocal()
    today = datetime.utcnow()

    try:
        print("Fetching existing data for fast O(1) lookup (prevents N+1 queries)...")
        existing_projects = {}
        for proj in db.query(Project).all():
            if proj.project_code:
                existing_projects[proj.project_code] = proj

        existing_risks = {}
        for risk in db.query(RiskScore).all():
            existing_risks[risk.project_id] = risk

        added = 0
        updated = 0
        new_projects_data = [] 
        updated_risk_count = 0

        print("🚀 Processing rows in memory...")
        for index, row in df.iterrows():
            name = str(row.get('project name', f"Project {index}"))
            ministry = str(row.get('line ministry', 'Unknown'))
            state = str(row.get('state', 'Unknown'))
            district = str(row.get('district', '') or '')
            sector = str(row.get('sector name', '') or '')
            project_code = str(row.get('project code', '') or '').strip()

            original_cost = parse_number(row.get('original cost\n(in cr.)', row.get('original cost (in cr.)', 0)))
            revised_cost = parse_number(row.get('revised cost\n(in cr.)', row.get('revised cost (in cr.)', 0)))
            expenditure = parse_number(row.get('expenditure\n(in cr.)', row.get('expenditure (in cr.)', 0)))
            progress = parse_number(row.get('physical progress\n(in %)', row.get('physical progress (in %)', 0)))

            original_commissioning = parse_date(row.get('original\ndate of commissioning', row.get('original date of commissioning')))
            revised_commissioning = parse_date(row.get('revised\ndate of commissioning', row.get('revised date of commissioning')))
            sanction_date = parse_date(row.get('sanction date'))

            effective_cost = revised_cost if revised_cost > 0 else original_cost
            status = derive_status(original_commissioning, revised_commissioning, progress)

            risk = compute_risk(
                original_cost=original_cost,
                revised_cost=revised_cost,
                cumulative_expenditure=expenditure,
                physical_progress_pct=progress,
                original_commissioning_date=original_commissioning,
                revised_commissioning_date=revised_commissioning,
                sanction_date=sanction_date,
                today=today,
            )

            if project_code and project_code in existing_projects:
                project = existing_projects[project_code]
                project.name = name
                project.ministry = ministry
                project.state = state
                project.district = district
                project.sector = sector
                project.original_cost = original_cost
                project.revised_cost = revised_cost
                project.total_cost = effective_cost
                project.cumulative_expenditure = expenditure
                project.progress_percent = progress
                project.original_commissioning_date = original_commissioning
                project.revised_commissioning_date = revised_commissioning
                project.sanction_date = sanction_date
                project.start_date = sanction_date
                project.end_date = revised_commissioning or original_commissioning
                project.status = status
 
                if project.id in existing_risks:
                    r = existing_risks[project.id]
                    r.cost_overrun_prob = risk.budget_score / 100
                    r.delay_prob = risk.delay_score / 100
                    r.blended_risk_score = risk.blended_score
                    r.risk_band = risk.risk_band
                    updated_risk_count += 1
                    
                updated += 1
            else:
                project = Project(
                    name=name,
                    ministry=ministry,
                    state=state,
                    district=district,
                    sector=sector,
                    project_code=project_code,
                    original_cost=original_cost,
                    revised_cost=revised_cost,
                    total_cost=effective_cost,
                    cumulative_expenditure=expenditure,
                    progress_percent=progress,
                    original_commissioning_date=original_commissioning,
                    revised_commissioning_date=revised_commissioning,
                    sanction_date=sanction_date,
                    start_date=sanction_date,
                    end_date=revised_commissioning or original_commissioning,
                    status=status,
                )
                new_projects_data.append((project, risk))
                added += 1

        if new_projects_data:
            projects_only = [item[0] for item in new_projects_data]
            print(f"Saving {len(projects_only)} new projects to Neon in a single batch...")
            db.add_all(projects_only)
            db.commit() # This automatically populates project.id for all new projects!

            print("Creating risk scores for new projects...")
            risks_to_add = []
            for project, risk in new_projects_data:
                risks_to_add.append(RiskScore(
                    project_id=project.id,
                    cost_overrun_prob=risk.budget_score / 100,
                    delay_prob=risk.delay_score / 100,
                    blended_risk_score=risk.blended_score,
                    risk_band=risk.risk_band,
                ))
            db.add_all(risks_to_add)
            
        if updated_risk_count > 0:
            print(f"Committing {updated_risk_count} updated risk scores...")
            
        db.commit()
        print(f"Success! Added: {added}, Updated: {updated}")

    except Exception as e:
        db.rollback()
        print(f"Error importing data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_data()