from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database import engine, Base
from app.services.ml import load_models
import os

app = FastAPI(title="SIH 26103 Backend")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    load_models()
