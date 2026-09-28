"""
Baghewala WellTwin AI - Historical Analytics Router
Serves historical time-series datasets across 7-day, 30-day, and 90-day surveillance windows.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.database import query_all, query_one

router = APIRouter(prefix="/api/analytics", tags=["Historical Analytics"])

@router.get("/{well_id}")
def get_historical_analytics(
    well_id: str,
    days: int = Query(30, ge=7, le=90)
):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    records = query_all(
        "SELECT * FROM production_history WHERE well_id = ? ORDER BY date DESC LIMIT ?",
        (well_id, days)
    )
    records.reverse()

    # Calculate summary metrics
    if records:
        avg_oil = round(sum(r["oil_bpd"] for r in records) / len(records), 1)
        total_oil = round(sum(r["oil_bpd"] for r in records), 1)
        total_steam = round(sum(r["steam_injected_tons"] for r in records), 1)
        avg_temp = round(sum(r["avg_temp_c"] for r in records) / len(records), 1)
        avg_uptime = round(sum(r["srp_uptime_pct"] for r in records) / len(records), 1)
        total_energy = round(sum(r["energy_kwh"] for r in records), 1)
    else:
        avg_oil = total_oil = total_steam = avg_temp = avg_uptime = total_energy = 0.0

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "window_days": days,
        "summary": {
            "average_oil_bpd": avg_oil,
            "total_oil_produced_bbl": total_oil,
            "total_steam_injected_tons": total_steam,
            "average_reservoir_temp_c": avg_temp,
            "average_srp_uptime_pct": avg_uptime,
            "total_energy_kwh": total_energy,
            "oil_steam_ratio": round(total_oil / max(total_steam, 1.0), 3) if total_steam > 0 else 0.0
        },
        "timeseries": records
    }
