# backend/import_monthly_progress.py
import pandas as pd
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import MonthlyProgress

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'data', 'monthly_progress_data.csv')

def import_monthly_data():
    print(f"📂 Reading Time-Series CSV from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print("❌ CSV not found!")
        return

    df = pd.read_csv(CSV_PATH)
    
    # Clean up any NaN values
    df = df.fillna({
        'project_name': 'Unknown Project',
        'state': 'Unknown',
        'sector': '',
        'original_cost': 0.0,
        'revised_cost': 0.0,
        'cumulative_expenditure': 0.0,
        'physical_progress': 0.0
    })

    db: Session = SessionLocal()
    
    try:
        print("🗑️ Clearing old monthly progress data...")
        db.query(MonthlyProgress).delete()
        
        print("🚀 Processing 5,839 time-series records...")
        records_to_add = []
        
        for index, row in df.iterrows():
            record = MonthlyProgress(
                project_name=str(row.get('project_name', '')).strip(),
                state=str(row.get('state', '')).strip(),
                sector=str(row.get('sector', '')).strip(),
                report_month=str(row.get('report_month', '')).strip(),
                original_cost=float(row.get('original_cost', 0.0)),
                revised_cost=float(row.get('revised_cost', 0.0)),
                cumulative_expenditure=float(row.get('cumulative_expenditure', 0.0)),
                physical_progress=float(row.get('physical_progress', 0.0))
            )
            records_to_add.append(record)
            
            # Batch commit every 1000 rows to keep memory low
            if len(records_to_add) >= 1000:
                db.add_all(records_to_add)
                db.commit()
                records_to_add = []
                
        # Add remaining
        if records_to_add:
            db.add_all(records_to_add)
            db.commit()

        print(f"✅ Success! Imported {len(df)} monthly progress records into Neon.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error importing data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_monthly_data()