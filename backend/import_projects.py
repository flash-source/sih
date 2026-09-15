import pandas as pd
import os
from datetime import datetime
from typing import Any
from app.database import SessionLocal, engine, Base
import app.models  # <--- CRITICAL: This registers the new columns with SQLAlchemy
from app.models import Project, RiskScore

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'data', 'Projects_Report.csv')

def clean_header(header: str) -> str:
    """The Govt CSV has \n in headers. This cleans them."""
    return header.replace('\n', ' ').strip().lower()

def derive_status(start_date, end_date, progress):
    """Derives status based on dates and progress."""
    if pd.isna(start_date):
        return "PLANNING"
    if progress == 100:
        return "COMPLETED"

    if not pd.isna(end_date):
        if end_date < datetime.now():
            return "DELAYED"
            
    return "IN_PROGRESS"

def import_data():
    print(f"Reading CSV from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print("CSV file not found! Make sure you placed Projects_Report.csv in ml/data/")
        return

    df = pd.read_csv(CSV_PATH)
    df.columns = [clean_header(col) for col in df.columns]
    
    db: Any = SessionLocal()
    
    try:
        added = 0
        updated = 0
        
        for index, row in df.iterrows():
            # Extract basic fields (fallback to empty strings if missing)
            name = str(row.get('project name', row.get('name', f"Project {index}")))
            ministry = str(row.get('ministry', 'Unknown'))
            state = str(row.get('state', 'Unknown'))
            district = str(row.get('district', ''))
            sector = str(row.get('sector', ''))
            
            cost_str = row.get('revised cost', row.get('original cost', 0))
            try:
                total_cost = float(str(cost_str).replace(',', ''))
            except:
                total_cost = 0.0

            start_date = None
            end_date = None
            try:
                if not pd.isna(row.get('start date')):
                    start_date = pd.to_datetime(row.get('start date')).to_pydatetime()
            except: pass
            
            try:
                if not pd.isna(row.get('end date')):
                    end_date = pd.to_datetime(row.get('end date')).to_pydatetime()
            except: pass

            try:
                progress = float(row.get('progress', 0))
            except:
                progress = 0.0

            status = derive_status(start_date, end_date, progress)

            existing_project = db.query(Project).filter(
                Project.name == name, 
                Project.ministry == ministry
            ).first()

            if existing_project:
                existing_project.state = state
                existing_project.total_cost = total_cost
                existing_project.status = status
                existing_project.progress_percent = progress
                updated += 1
                project = existing_project
            else:
                project = Project(
                    name=name,
                    ministry=ministry,
                    state=state,
                    district=district,
                    sector=sector,
                    start_date=start_date,
                    end_date=end_date,
                    total_cost=total_cost,
                    status=status,
                    progress_percent=progress
                )
                db.add(project)
                added += 1

            existing_risk = db.query(RiskScore).filter(RiskScore.project_id == project.id).first()
            if not existing_risk:
                risk_score = RiskScore(
                    project_id=project.id, 
                    cost_overrun_prob=0.0,
                    delay_prob=0.0,
                    blended_risk_score=0.0,
                    risk_band="LOW"
                )
                db.add(risk_score)

            if (added + updated) % 100 == 0:
                db.flush()

        db.commit()
        print(f"Success! Added: {added}, Updated: {updated}")

    except Exception as e:
        db.rollback()
        print(f"Error importing data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_data()