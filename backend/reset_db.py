from app.database import engine, Base
import app.models  # <--- CRITICAL: This registers the new columns with SQLAlchemy

print("Dropping all existing tables...")
Base.metadata.drop_all(bind=engine)

print("Recreating tables with updated schema...")
Base.metadata.create_all(bind=engine)

print("Database schema reset successfully!")