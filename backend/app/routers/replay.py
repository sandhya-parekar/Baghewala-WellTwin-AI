"""
Baghewala WellTwin AI - Digital Twin Replay Router
Provides multi-channel synchronized historical playback over 1h, 6h, and 24h timelines.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.database import query_all, query_one

router = APIRouter(prefix="/api/replay", tags=["Digital Twin Replay"])

@router.get("/{well_id}")
def get_replay_telemetry(
    well_id: str,
    window: str = Query("6h", pattern="^(1h|6h|24h)$")
):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    limit_map = {"1h": 12, "6h": 24, "24h": 48}
    limit = limit_map.get(window, 24)

    rows = query_all("""
        SELECT 
            timestamp,
            reservoir_temp_c,
            reservoir_pressure_bar,
            oil_production_bpd,
            oil_viscosity_cp,
            srp_spm,
            srp_stroke_in,
            srp_vfd_hz,
            srp_peak_load_lbs,
            srp_min_load_lbs,
            srp_efficiency_pct,
            power_consumption_kw,
            health_score
        FROM sensor_readings
        WHERE well_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (well_id, limit))

    rows.reverse()

    # Calculate key physical dynamics observed in this window
    if rows:
        temp_delta = round(rows[-1]["reservoir_temp_c"] - rows[0]["reservoir_temp_c"], 2)
        prod_delta = round(rows[-1]["oil_production_bpd"] - rows[0]["oil_production_bpd"], 1)
        mprl_delta = round(rows[-1]["srp_min_load_lbs"] - rows[0]["srp_min_load_lbs"], 0)
    else:
        temp_delta = prod_delta = mprl_delta = 0

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "window": window,
        "total_frames": len(rows),
        "frame_interval_seconds": 3600 if window == "24h" else (900 if window == "6h" else 300),
        "telemetry_frames": rows,
        "replay_insights": {
            "temperature_drift_c": temp_delta,
            "production_drift_bpd": prod_delta,
            "min_rod_load_change_lbs": mprl_delta,
            "coupling_summary": "Thermal dissipation causes dynamic viscosity rise, which directly decelerates downstroke rod velocity (reduced MPRL)."
        }
    }
