<div align="center">

# 🏗️ SIH26103 — Infrastructure Project Risk Prediction Platform

**Track, score, and flag risk across India's central-sector infrastructure projects — before the delay or cost overrun becomes official.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SIH](https://img.shields.io/badge/Smart%20India%20Hackathon-26103-orange)](#)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#-license)

</div>

---

## 📖 Overview

Central-sector infrastructure projects in India are tracked through periodic government reporting (sanctioned cost, revised cost, physical progress, commissioning dates). **SIH26103** turns that reporting into an early-warning system: it ingests project-level data, scores each project on two independent axes — **schedule risk** and **budget risk** — and surfaces the ones heading for trouble, sector by sector, before the next official revision makes it obvious.

Built by **Team Parallax** for Smart India Hackathon 2026 · Theme: *Smart Automation* · Category: *Software*.

## ✨ Features

- **~1,775 real projects** imported from government project-report data, normalized into a single schema (ministry, state, district, sector, cost, dates, progress).
- **Explainable risk engine** — every score is a transparent, rule-based calculation (see [How risk is scored](#-how-risk-is-scored)), not a black box. Judges and stakeholders can ask "why is this project red?" and get a one-sentence answer.
- **Dashboard** with portfolio-wide totals, status breakdown, and the current top critical projects.
- **Project explorer** listing every project with its live risk band.
- **Risk analysis view** — distribution across LOW/MEDIUM/HIGH/CRITICAL and a sector-by-sector breakdown.
- **REST API** (FastAPI, OpenAPI docs included) sitting behind a Next.js BFF proxy, so the frontend never talks to the database directly.

## 🧱 Architecture

```
┌─────────────┐      /api/v1/*      ┌──────────────┐        SQL        ┌──────────────┐
│   Next.js    │ ──────────────────▶ │   FastAPI     │ ─────────────────▶ │  PostgreSQL   │
│  (frontend)  │ ◀────────────────── │   (backend)   │ ◀───────────────── │ (Docker/Neon) │
└─────────────┘   BFF proxy route    └──────┬───────┘                    └──────────────┘
                                             │
                                             ▼
                                  ┌───────────────────────┐
                                  │  Risk Engine (rules)   │
                                  │  delay_score            │
                                  │  budget_score            │
                                  └───────────────────────┘
```

The frontend never calls FastAPI directly — every request goes through `frontend/src/app/api/[...path]/route.ts`, which forwards it to `FASTAPI_BASE_URL`. This keeps the backend URL out of client-side code and makes swapping deployments painless.

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 15 — local via Docker, or a hosted [Neon](https://neon.tech) instance |
| ML (in progress) | XGBoost + SHAP training pipeline, scikit-learn, Jupyter (see [Roadmap](#-roadmap--known-limitations)) |

## 📁 Project Structure

```
sih26103_scaffold/
├── frontend/
│   ├── src/app/
│   │   ├── dashboard/        # Portfolio overview
│   │   ├── projects/         # Full project list
│   │   ├── risk/             # Risk distribution & by-sector view
│   │   └── api/[...path]/    # BFF proxy to FastAPI
│   └── src/lib/               # api.ts, types.ts
│
├── backend/
│   ├── app/
│   │   ├── api/routes.py            # All /api/v1 endpoints
│   │   ├── services/risk_engine.py  # Explainable rule-based scorer
│   │   ├── services/ml.py           # Trained-model loader (see Roadmap)
│   │   ├── models.py                # SQLAlchemy models
│   │   ├── schemas.py               # Pydantic schemas
│   │   └── database.py
│   ├── import_projects.py     # CSV → Postgres importer
│   ├── reset_db.py            # Drop + recreate schema
│   ├── check_db.py            # Inspect live table columns
│   ├── diagnose_db.py         # One-shot env/DB connectivity diagnostic
│   └── requirements.txt
│
├── ml/
│   ├── data/Projects_Report.csv
│   ├── notebooks/risk_prediction.ipynb
│   └── training/pipeline.py   # Feature engineering + training (scaffolded)
│
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Either **Docker Desktop** (for a local Postgres) **or** a free [Neon](https://neon.tech) project (hosted Postgres — no local DB to manage)

### 1. Database

**Option A — Local, via Docker:**

```bash
docker-compose up -d
```

**Option B — Hosted, via Neon:** create a project at [neon.tech](https://neon.tech) and copy its connection string. Use the **pooled** connection string (host contains `-pooler`) — it handles Neon's auto-suspend/cold-start reconnects far more gracefully than the direct endpoint.

Either way, put the resulting URL in `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
# If using Neon, keep sslmode=require and channel_binding=require in the URL
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
py reset_db.py          # drop + recreate schema from models.py
py import_projects.py   # loads ~1,775 projects from ml/data/Projects_Report.csv
uvicorn app.main:app --reload --port 8000
```

- API: `http://127.0.0.1:8000`
- Interactive docs: `http://127.0.0.1:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

Set `FASTAPI_BASE_URL` in `frontend/.env.local` if the backend isn't on `localhost:8000`.

## 🔑 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | Postgres connection string (Docker or Neon) |
| `CORS_ORIGINS` | `backend/.env` | Comma-separated allowed origins (defaults to `*`) |
| `COST_MODEL_PATH` / `DELAY_MODEL_PATH` | `backend/.env` | Optional overrides for trained model paths (see Roadmap) |
| `FASTAPI_BASE_URL` | `frontend/.env.local` | Where the Next.js proxy forwards API calls |

## 📡 API Reference

All routes are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/projects` | Paginated project list (`skip`, `limit`), each with its latest risk score |
| `GET` | `/projects/{id}` | Single project detail |
| `POST` | `/predict-risk?project_id={id}` | (Re)computes and persists the risk score for a project |
| `GET` | `/dashboard/summary` | Portfolio totals, status breakdown, top critical projects |
| `GET` | `/risk/distribution` | Project count per risk band |
| `GET` | `/risk/by-sector` | Risk band breakdown per sector |

## 🧮 How Risk Is Scored

Two independent 0–100 scores, banded `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`, computed in [`risk_engine.py`](backend/app/services/risk_engine.py):

- **Delay score** — combines (a) months the commissioning date has already slipped from its original estimate (ground truth, not a guess), and (b) how far physical progress lags a straight-line read of elapsed time against the sanction-to-commissioning window — this catches trouble *before* an official revision is filed, plus a flat penalty if the project is already past its (possibly revised) commissioning date and still incomplete.
- **Budget score** — combines cost escalation (revised vs. original sanctioned cost) and spend variance (cumulative expenditure running ahead of physical progress).

Every number is derived from a documented rule, deliberately — a first prototype needs to survive "why is this flagged?" in front of a judge or a ministry official.

## 🗺️ Roadmap / Known Limitations

- **ML pipeline is scaffolded, not trained.** `ml/training/pipeline.py` and the notebook define the intended XGBoost + SHAP approach, but no feature engineering or model artifacts exist yet — `backend/app/services/ml.py` is a loader for `.pkl` files that don't exist yet. The live `/predict-risk` endpoint uses the rule-based engine above, not this pipeline.
- **Single project schema.** Historical vs. current source-format differences (e.g. across reporting-system migrations) aren't reconciled — the importer assumes one consistent CSV shape.
- Contributions/PRs welcome on either front.

## 👥 Team

**Team Parallax** — Problem Statement SIH26103 · Theme: Smart Automation · Category: Software

## 📄 License

Developed as part of the Smart India Hackathon (SIH).