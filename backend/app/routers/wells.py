"""
Baghewala WellTwin AI - Wells Router
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import query_all, query_one
from app.models.schemas import WellDetail

router = APIRouter(prefix="/api/wells", tags=["Wells"])

@router.get("", response_model=List[WellDetail])
def get_all_wells():
    wells = query_all("SELECT * FROM wells ORDER BY well_id ASC")
    results = []
    for w in wells:
        wid = w["well_id"]
        latest_sensor = query_one(
            "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
            (wid,)
        ) or {}
        
        alerts_count = query_one(
            "SELECT COUNT(*) as cnt FROM alerts WHERE well_id = ? AND status != 'RESOLVED'",
            (wid,)
        ) or {"cnt": 0}

        mprl = latest_sensor.get("srp_min_load_lbs", 3500.0)
        pprl = latest_sensor.get("srp_peak_load_lbs", 18000.0)
        if mprl < 2200.0 or pprl > 21500.0:
            risk = "CRITICAL"
        elif mprl < 3000.0 or pprl > 19500.0:
            risk = "HIGH"
        elif latest_sensor.get("srp_efficiency_pct", 80) < 70:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        results.append(WellDetail(
            **w,
            latest_oil_bpd=latest_sensor.get("oil_production_bpd", 0.0),
            latest_temp_c=latest_sensor.get("reservoir_temp_c", 0.0),
            latest_viscosity_cp=latest_sensor.get("oil_viscosity_cp", 0.0),
            latest_health_score=latest_sensor.get("health_score", 85.0),
            latest_risk_level=risk,
            alert_count=alerts_count.get("cnt", 0)
        ))
    return results

@router.get("/{well_id}", response_model=WellDetail)
def get_well_by_id(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")
        
    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}
    
    alerts_count = query_one(
        "SELECT COUNT(*) as cnt FROM alerts WHERE well_id = ? AND status != 'RESOLVED'",
        (well_id,)
    ) or {"cnt": 0}

    return WellDetail(
        **well,
        latest_oil_bpd=latest_sensor.get("oil_production_bpd", 0.0),
        latest_temp_c=latest_sensor.get("reservoir_temp_c", 0.0),
        latest_viscosity_cp=latest_sensor.get("oil_viscosity_cp", 0.0),
        latest_health_score=latest_sensor.get("health_score", 85.0),
        latest_risk_level="HIGH" if latest_sensor.get("srp_min_load_lbs", 3500) < 2600 else "LOW",
        alert_count=alerts_count.get("cnt", 0)
    )
