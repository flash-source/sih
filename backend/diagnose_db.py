# backend/diagnose_db.py
"""
One-shot diagnostic for "I edited models.py + ran reset_db.py, but the new
column still isn't in the table."

Drop this file into backend/ (next to reset_db.py) and run it exactly the
way you'd run reset_db.py, e.g.:

    py diagnose_db.py

It answers three questions that between them cover every known cause of
this symptom:
  1. Which models.py file did Python actually import, and does the CLASS
     (in memory, before touching the DB) have the new column?
  2. Which DATABASE_URL did it resolve to, and did an OS-level environment
     variable silently override your .env?
  3. What does the LIVE database say right now, in the same table Postgres
     is actually storing (not what some other tool cached)?
"""
import os

# Snapshot these BEFORE importing anything from app/ -- app.database calls
# load_dotenv() the moment it's imported, which would otherwise make this
# check always look clean even when an OS-level env var is the real problem.
_pre_existing_env_var = os.environ.get("DATABASE_URL")
_env_file_value = None
if os.path.exists(".env"):
    with open(".env") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line.startswith("DATABASE_URL="):
                _env_file_value = _line.split("=", 1)[1].strip().strip('"').strip("'")

print("=" * 60)
print("1. WHICH FILES ARE ACTUALLY BEING IMPORTED")
print("=" * 60)
import app
import app.database
import app.models

print(f"  app package:   {app.__file__}")
print(f"  app.database:  {app.database.__file__}")
print(f"  app.models:    {app.models.__file__}")
print(f"  Project columns as Python currently sees them (before touching the DB):")
for col in app.models.Project.__table__.columns:
    print(f"    - {col.name}")

print()
print("=" * 60)
print("2. WHERE DATABASE_URL ACTUALLY POINTS")
print("=" * 60)
print(f"  DATABASE_URL already set in the OS/shell BEFORE .env was loaded: {_pre_existing_env_var!r}")
print(f"  DATABASE_URL literally written in .env on disk:                 {_env_file_value!r}")
print(f"  DATABASE_URL app.database is actually using right now:          {app.database.SQLALCHEMY_DATABASE_URL!r}")
if _pre_existing_env_var and _pre_existing_env_var != _env_file_value:
    print("  ⚠  An OS/shell-level environment variable is overriding your .env file!")
    print("     python-dotenv never replaces a variable that's already set, so editing")
    print("     .env is doing nothing right now. Run `Remove-Item Env:DATABASE_URL` in")
    print("     this PowerShell session (or restart the terminal) and try again.")

print()
print("=" * 60)
print("3. WHAT THE LIVE DATABASE ACTUALLY HAS, RIGHT NOW")
print("=" * 60)
from sqlalchemy import text, inspect

with app.database.engine.connect() as conn:
    try:
        row = conn.execute(
            text("SELECT current_database(), inet_server_addr(), inet_server_port()")
        ).fetchone()
        print(f"  Connected to: database={row[0]!r}  host={row[1]}  port={row[2]}")
    except Exception as e:
        print(f"  (couldn't run the Postgres-specific identity check: {e})")

inspector = inspect(app.database.engine)
if "projects" in inspector.get_table_names():
    live_cols = [c["name"] for c in inspector.get_columns("projects")]
    print(f"  Columns the 'projects' table ACTUALLY has: {live_cols}")
    print(f"  'district' present in the live table: {'district' in live_cols}")
else:
    print("  No 'projects' table exists in this database at all.")

print()
print("=" * 60)
print("HOW TO READ THIS")
print("=" * 60)
print("""
- Section 1 missing 'district'?
    models.py wasn't actually saved where you think it was. The path
    printed right after "app.models:" is the ONE file that matters —
    open exactly that path and confirm 'district' is really in it.
    (Common cause: a second clone/copy of the project, or an editor tab
    that never got saved.)

- Section 1 HAS 'district', but section 3 does NOT?
    reset_db.py is dropping/creating tables in a DIFFERENT database than
    this script just inspected in section 3 -- or a different database
    than your running FastAPI server is connected to. Compare the
    database/host/port from section 3 against what you see running this
    same script again right after `py reset_db.py`. Also run `docker ps`
    and check Windows Services / Task Manager for a second, non-Docker
    Postgres listening on 5432 -- that single conflict is the most common
    cause of this exact symptom (drop/create "succeeds" against one
    Postgres, your app or check_db.py reads from the other).

- Section 3 already shows 'district': True?
    The schema is correct right now. Whatever showed you the old columns
    (pgAdmin, a cached check_db.py run in another terminal, or a
    long-running FastAPI process's connection pool) is what's stale --
    re-run check_db.py fresh and it should agree with this.
""")
