"""
Baghewala WellTwin AI - Predictive Maintenance Router
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import query_all, query_one
from app.services.predictive_maintenance import PredictiveMaintenanceEngine

router = APIRouter(prefix="/api/maintenance", tags=["Predictive Maintenance"])

@router.get("/{well_id}")
def get_maintenance_diagnostics(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    # Real-time automated diagnosis
    active_diagnostics = PredictiveMaintenanceEngine.evaluate_equipment_health(latest_sensor)

    # Historical maintenance events logged
    history = query_all(
        "SELECT * FROM maintenance_events WHERE well_id = ? ORDER BY timestamp DESC LIMIT 20",
        (well_id,)
    )

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "active_diagnostics": active_diagnostics,
        "maintenance_history": history,
        "disclaimer": "Predictive diagnostic signatures derived from mathematical digital twin models. Physical field inspection mandatory."
    }
