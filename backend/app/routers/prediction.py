"""
Baghewala WellTwin AI - AI Prediction & Explainability Router
Provides predictive inference for production, reservoir cooling, and rod failure risk.
Exposes actual validation metrics (MAE, RMSE, R2) and explainable feature attributions.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.database import query_one
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/api/prediction", tags=["AI Prediction"])

@router.post("", response_model=PredictionResponse)
@router.post("/run", response_model=PredictionResponse)
@router.post("/production", response_model=PredictionResponse)
def run_ai_prediction(req: PredictionRequest):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (req.well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {req.well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (req.well_id,)
    ) or {}

    res = ml_service.predict_well_performance(
        well_data=well,
        latest_sensor=latest_sensor,
        horizon_days=req.horizon_days,
        override_spm=req.spm,
        override_vfd=req.vfd_hz
    )

    return res

@router.get("/metrics")
def get_model_validation_metrics():
    """
    Returns actual validation metrics from trained models (no fake accuracy).
    """
    return {
        "production_model": ml_service.prod_metrics,
        "temperature_model": ml_service.temp_metrics,
        "equipment_risk_model": ml_service.risk_metrics,
        "validation_dataset": "Baghewala Heavy Crude Physical Simulation Dataset (Train/Test Split 75/25)"
    }
