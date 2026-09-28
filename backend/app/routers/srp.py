"""
Baghewala WellTwin AI - Sucker Rod Pump (SRP) Router
Surveillance of rod loads, dynamometer cards (dynacards), VFD control, and pump efficiency.
"""

from fastapi import APIRouter, HTTPException
import json
from typing import Dict, Any, List
from app.database import query_one, query_all

router = APIRouter(prefix="/api/srp", tags=["SRP Operations"])

@router.get("/{well_id}")
@router.get("/{well_id}/dynacards/latest")
def get_srp_operations(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    latest_srp = query_one(
        "SELECT * FROM srp_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    # Parse Dynacard JSON coordinates
    surface_dyn = []
    pump_dyn = []
    try:
        if latest_srp.get("dynacard_surface_json"):
            surface_dyn = json.loads(latest_srp["dynacard_surface_json"])
        if latest_srp.get("dynacard_pump_json"):
            pump_dyn = json.loads(latest_srp["dynacard_pump_json"])
    except Exception:
        pass

    mprl = latest_srp.get("min_polished_rod_load_lbs", 3500.0)
    pprl = latest_srp.get("peak_polished_rod_load_lbs", 18500.0)
    eff = latest_srp.get("pump_fillage_pct", 82.0)
    
    # Status classification
    if mprl < 2200.0 or pprl > 21500.0:
        status = "CRITICAL"
        status_msg = "Severe downstroke rod compression or peak tension overload!"
    elif mprl < 3000.0 or pprl > 19500.0 or eff < 65.0:
        status = "WARNING"
        status_msg = "Incipient rod floating margin or incomplete pump fillage detected."
    else:
        status = "NORMAL"
        status_msg = "Rod loads and stroke harmonic balance within optimal API limits."

    # Load history for trend chart
    recent_srp = query_all(
        "SELECT timestamp, peak_polished_rod_load_lbs, min_polished_rod_load_lbs, pump_fillage_pct, spm, vfd_speed_hz FROM srp_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 24",
        (well_id,)
    )
    recent_srp.reverse()

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "surface_unit": well["surface_unit"],
        "srp_type": well["srp_type"],
        "status": status,
        "status_message": status_msg,
        "parameters": {
            "stroke_length_in": latest_srp.get("stroke_length_in", 144.0),
            "spm": latest_srp.get("spm", 6.0),
            "vfd_speed_hz": latest_srp.get("vfd_speed_hz", 48.0),
            "peak_polished_rod_load_lbs": pprl,
            "min_polished_rod_load_lbs": mprl,
            "gearbox_torque_pct": latest_srp.get("gearbox_torque_pct", 74.0),
            "motor_current_amps": latest_srp.get("motor_current_amps", 38.5),
            "pump_fillage_pct": eff,
            "pump_displacement_bpd": latest_srp.get("pump_displacement_bpd", 145.0),
            "fluid_load_lbs": latest_srp.get("fluid_load_lbs", 4200.0),
            "rod_stress_psi": latest_srp.get("rod_stress_psi", 23500.0),
            "card_type": latest_srp.get("card_type", "NORMAL")
        },
        "dynacards": {
            "surface_card": surface_dyn,
            "pump_card": pump_dyn,
            "card_classification": latest_srp.get("card_type", "NORMAL")
        },
        "load_trend_history": recent_srp
    }
