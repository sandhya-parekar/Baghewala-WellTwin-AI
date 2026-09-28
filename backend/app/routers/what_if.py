"""
Baghewala WellTwin AI - What-If Simulator Router
Enables virtual scenario experimentation by coupling CSS thermal parameters with SRP mechanical controls.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.database import query_one
from app.models.schemas import WhatIfRequest, WhatIfResponse, SimulationOutputItem
from app.services.digital_twin_engine import DigitalTwinEngine

router = APIRouter(prefix="/api/what-if", tags=["What-If Simulator"])

@router.post("", response_model=WhatIfResponse)
@router.post("/simulate", response_model=WhatIfResponse)
def run_what_if_simulation(req: WhatIfRequest):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (req.well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {req.well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (req.well_id,)
    ) or {}

    latest_css = query_one(
        "SELECT * FROM css_cycles WHERE well_id = ? ORDER BY cycle_number DESC LIMIT 1",
        (req.well_id,)
    ) or {}

    # 1. Baseline Current Scenario
    curr_steam = latest_css.get("steam_volume_tons", 2450.0)
    curr_inj_p = latest_css.get("injection_pressure_bar", 92.0)
    curr_soak = latest_css.get("soak_days", 5)
    curr_cutoff = latest_css.get("cut_off_temp_c", 68.0)
    curr_stroke = latest_sensor.get("srp_stroke_in", 144.0)
    curr_spm = latest_sensor.get("srp_spm", 6.0)
    curr_vfd = latest_sensor.get("srp_vfd_hz", 48.0)

    current_sim = DigitalTwinEngine.simulate_what_if(
        well_data=well,
        steam_volume_tons=curr_steam,
        injection_pressure_bar=curr_inj_p,
        soak_days=curr_soak,
        production_cutoff_temp_c=curr_cutoff,
        srp_stroke_in=curr_stroke,
        srp_spm=curr_spm,
        srp_vfd_hz=curr_vfd
    )

    # 2. User-Proposed Scenario
    proposed_sim = DigitalTwinEngine.simulate_what_if(
        well_data=well,
        steam_volume_tons=req.steam_volume_tons,
        injection_pressure_bar=req.injection_pressure_bar,
        soak_days=req.soak_days,
        production_cutoff_temp_c=req.production_cutoff_temp_c,
        srp_stroke_in=req.srp_stroke_in,
        srp_spm=req.srp_spm,
        srp_vfd_hz=req.srp_vfd_hz
    )

    # Delta percentages
    def pct_change(p, c):
        if c == 0:
            return 0.0
        return round(((p - c) / abs(c)) * 100.0, 1)

    delta = {
        "production_bpd": pct_change(proposed_sim["oil_production_bpd"], current_sim["oil_production_bpd"]),
        "steam_consumption": pct_change(proposed_sim["steam_consumption_tons"], current_sim["steam_consumption_tons"]),
        "power_consumption": pct_change(proposed_sim["power_consumption_kw"], current_sim["power_consumption_kw"]),
        "well_health_score": pct_change(proposed_sim["well_health_score"], current_sim["well_health_score"]),
        "viscosity_cp": pct_change(proposed_sim["oil_viscosity_cp"], current_sim["oil_viscosity_cp"])
    }

    # Safety Evaluation
    warnings = []
    is_safe = True

    if proposed_sim["min_rod_load_lbs"] < 2400.0:
        is_safe = False
        warnings.append(f"CRITICAL: Downstroke load drops to {proposed_sim['min_rod_load_lbs']:.0f} lbs, creating acute rod floating and compression fatigue.")

    if proposed_sim["peak_rod_load_lbs"] > 21500.0:
        is_safe = False
        warnings.append(f"WARNING: Peak load ({proposed_sim['peak_rod_load_lbs']:.0f} lbs) exceeds 90% rod yield threshold.")

    if req.injection_pressure_bar > 108.0:
        is_safe = False
        warnings.append("WARNING: Steam injection pressure nears formation fracture gradient (112 bar).")

    if is_safe and delta["production_bpd"] > 0:
        summary_verdict = f"PROPOSED SCENARIO FAVORABLE: Projected production increase of {delta['production_bpd']:+.1f}% while keeping rod loads within safety margins."
    elif is_safe:
        summary_verdict = f"CONSERVATIVE SCENARIO: Preserves equipment longevity, reduced power consumption by {abs(delta['power_consumption']):.1f}%."
    else:
        summary_verdict = "SCENARIO REJECTED BY SAFETY GUARD: Operating parameters violate sucker rod mechanical limits."

    return WhatIfResponse(
        well_id=req.well_id,
        current=SimulationOutputItem(**current_sim),
        proposed=SimulationOutputItem(**proposed_sim),
        delta_percentage=delta,
        summary_verdict=summary_verdict,
        is_safe_to_operate=is_safe,
        warnings=warnings
    )
