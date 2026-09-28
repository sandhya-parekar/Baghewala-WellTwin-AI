"""
Baghewala WellTwin AI - Multi-Objective Optimization Router
"""

from fastapi import APIRouter, HTTPException
import json
from app.database import query_one, execute_write
from app.models.schemas import OptimizationRequest, OptimizationResponse
from app.services.optimization_service import OptimizationEngine

router = APIRouter(prefix="/api/optimization", tags=["Optimization Engine"])

@router.post("", response_model=OptimizationResponse)
@router.post("/run", response_model=OptimizationResponse)
def run_optimization(req: OptimizationRequest):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (req.well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {req.well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (req.well_id,)
    ) or {}

    res = OptimizationEngine.run_multi_objective_optimization(
        well_data=well,
        latest_sensor=latest_sensor,
        weights=req.weights.dict()
    )

    # Log optimization run in database
    execute_write("""
    INSERT INTO optimization_runs (
        well_id, objective_weights_json, current_params_json,
        recommended_params_json, expected_impact_json, reasoning
    ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        req.well_id,
        json.dumps(req.weights.dict()),
        json.dumps(res["current_params"]),
        json.dumps(res["recommended_params"]),
        json.dumps(res["expected_impact"]),
        "; ".join(res["reasons"])
    ))

    return res
