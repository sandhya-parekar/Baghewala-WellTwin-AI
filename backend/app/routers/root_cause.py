"""
Baghewala WellTwin AI - Root Cause Explorer Router
"""

from fastapi import APIRouter, HTTPException
from app.database import query_one
from app.services.root_cause_service import RootCauseService
from app.models.schemas import RootCauseResponse

router = APIRouter(prefix="/api/root-cause", tags=["Root Cause Explorer"])

@router.get("/{well_id}", response_model=RootCauseResponse)
@router.get("/{well_id}/diagnose", response_model=RootCauseResponse)
def analyze_well_root_cause(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    res = RootCauseService.analyze_production_drop(well, latest_sensor)
    return res
