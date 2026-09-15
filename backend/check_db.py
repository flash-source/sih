# backend/check_db.py
from app.database import engine
from sqlalchemy import inspect  # type: ignore[reportMissingImports]

inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('projects')]

print("Actual columns in the 'projects' table:")
for col in columns:
    print(f"  - {col}")

if 'district' in columns:
    print("\n'district' column EXISTS. The importer should work now.")
else:
    print("\n'district' column is MISSING. Python is still using an old models.py file.")