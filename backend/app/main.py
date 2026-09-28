"""
Baghewala WellTwin AI - Main FastAPI Application
Smart India Hackathon 2026 - Problem Statement: SIH26120
Oil India Limited - Heavy Oil Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP) Digital Twin
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import (
    wells,
    dashboard,
    digital_twin,
    css,
    srp,
    prediction,
    what_if,
    optimization,
    maintenance,
    alerts,
    scenarios,
    analytics,
    decisions,
    root_cause,
    data_quality,
    replay,
    reports,
    simulation,
    auth
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Enabled Well-to-Surface Digital Twin for Heavy Oil Optimization (Baghewala Field, Oil India Limited)",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Feature Routers
app.include_router(wells.router)
app.include_router(dashboard.router)
app.include_router(digital_twin.router)
app.include_router(css.router)
app.include_router(srp.router)
app.include_router(prediction.router)
app.include_router(what_if.router)
app.include_router(optimization.router)
app.include_router(maintenance.router)
app.include_router(alerts.router)
app.include_router(scenarios.router)
app.include_router(analytics.router)
app.include_router(decisions.router)
app.include_router(root_cause.router)
app.include_router(data_quality.router)
app.include_router(replay.router)
app.include_router(reports.router)
app.include_router(simulation.router)
app.include_router(auth.router)

@app.on_event("startup")
def startup_event():
    print(f"================================================================")
    print(f" {settings.PROJECT_NAME} - Backend Online")
    print(f" Problem Statement: {settings.PROBLEM_STATEMENT_ID} | {settings.ORGANIZATION}")
    print(f" Database: {settings.DB_PATH}")
    print(f" ML Models: {settings.ML_MODEL_DIR}")
    print(f"================================================================")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "problem_statement_id": settings.PROBLEM_STATEMENT_ID,
        "organization": settings.ORGANIZATION,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "human_in_the_loop_safety": "ENFORCED (Prototype Decision Support Only)",
        "synthetic_data_disclaimer": "Calibrated against published Baghewala heavy crude physical literature. All field telemetry is simulated.",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    db_exists = os.path.exists(settings.DB_PATH)
    models_exist = os.path.exists(os.path.join(settings.ML_MODEL_DIR, "production_model.joblib"))
    return {
        "status": "HEALTHY" if (db_exists and models_exist) else "DEGRADED",
        "database_connected": db_exists,
        "ai_models_loaded": models_exist,
        "simulated_environment": True
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": request.url.path
        }
    )
