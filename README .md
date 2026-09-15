# SIH 26103 - Infrastructure Project Risk Prediction Platform

A unified platform to track, analyze, and predict risks for Government of India infrastructure projects. Merged from three source repositories (R1, R2, R3).

## 🏗️ Architecture

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** PostgreSQL 15 (via Docker)
- **ML:** Jupyter + XGBoost + SHAP (R2 pipeline) / RandomForest (R3 demo)

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have the following installed:

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose

### 2. Database Setup

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Reset the database to ensure the latest schema is applied:

```bash
py reset_db.py
```

Import the project data:

```bash
py import_projects.py
```

The importer reads approximately 1,775 projects from:

```text
ml/data/Projects_Report.csv
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

The frontend proxies API requests to the backend via the BFF pattern.

## 📁 Project Structure

```text
sih26103_scaffold/
│
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── models/
│   │   └── retrained/
│   ├── import_projects.py
│   ├── reset_db.py
│   ├── requirements.txt
│   └── .env
│
├── ml/
│   ├── data/
│   │   └── Projects_Report.csv
│   ├── notebooks/
│   └── ...
│
├── docker-compose.yml
└── README.md
```

## 🤖 Machine Learning

The platform combines machine-learning components from the source repositories:

### R2 Pipeline

- XGBoost
- SHAP explainability
- Jupyter notebooks
- Training and evaluation pipeline

### R3 Demo

- RandomForest
- Risk prediction
- Model-based analysis

The ML resources are located under the `ml/` directory.

## 🔌 Backend

The backend is built using:

- FastAPI
- SQLAlchemy
- PostgreSQL
- Python

Start the development server with:

```bash
uvicorn app.main:app --reload --port 8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## 🎨 Frontend

The frontend is built using:

- Next.js 14
- React
- App Router
- Tailwind CSS

Start the development server with:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## 🛠️ Development Commands

### Database

Start PostgreSQL:

```bash
docker-compose up -d
```

Stop PostgreSQL:

```bash
docker-compose down
```

Check running containers:

```bash
docker ps
```

### Backend

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Reset the database:

```bash
py reset_db.py
```

Import projects:

```bash
py import_projects.py
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

Install dependencies:

```bash
npm install
```

Start Next.js:

```bash
npm run dev
```

## 📌 Complete Startup Flow

### Terminal 1 — Database

From the project root:

```bash
docker-compose up -d
```

### Terminal 2 — Backend

```bash
cd backend
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Then:

```bash
pip install -r requirements.txt
py reset_db.py
py import_projects.py
uvicorn app.main:app --reload --port 8000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## 👥 Team

**Team Parallax**

- **Problem Statement:** SIH26103
- **Theme:** Smart Automation
- **Category:** Software

## 📄 License

This project was developed as part of the **Smart India Hackathon (SIH)**.
