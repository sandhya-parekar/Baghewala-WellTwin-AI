"""
Baghewala WellTwin AI - Cyclic Steam Stimulation (CSS) Router
Manages Huff & Puff thermal cycles, operational cut-offs, and historical steam performance.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.database import query_all, query_one

router = APIRouter(prefix="/api/css", tags=["CSS Operations"])

@router.get("/{well_id}")
def get_css_operations(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    # Current active CSS cycle
    current_cycle = query_one(
        "SELECT * FROM css_cycles WHERE well_id = ? ORDER BY cycle_number DESC LIMIT 1",
        (well_id,)
    ) or {}

    # Historical cycles
    all_cycles = query_all(
        "SELECT * FROM css_cycles WHERE well_id = ? ORDER BY cycle_number ASC",
        (well_id,)
    )

    # Current parameters
    curr_steam_vol = current_cycle.get("steam_volume_tons", 2450.0)
    curr_inj_press = current_cycle.get("injection_pressure_bar", 92.0)
    curr_soak_days = current_cycle.get("soak_days", 5)
    curr_cutoff_temp = current_cycle.get("cut_off_temp_c", 68.0)

    # AI Recommended parameters
    rec_steam_vol = 2600.0 if curr_cutoff_temp > 65 else 2350.0
    rec_inj_press = 94.0
    rec_soak_days = 5
    rec_cutoff_temp = 66.5

    parameters = [
        {
            "parameter_name": "Steam Volume",
            "unit": "Tons",
            "current_value": curr_steam_vol,
            "recommended_value": rec_steam_vol,
            "difference": round(rec_steam_vol - curr_steam_vol, 1),
            "expected_impact": "Expands heated reservoir zone by 2.4m, sustaining viscosity < 100 cP for 18 additional days."
        },
        {
            "parameter_name": "Injection Pressure",
            "unit": "Bar",
            "current_value": curr_inj_press,
            "recommended_value": rec_inj_press,
            "difference": round(rec_inj_press - curr_inj_press, 1),
            "expected_impact": "Maintains injection below formation parting limit (110 bar) while ensuring uniform steam distribution."
        },
        {
            "parameter_name": "Soak Time",
            "unit": "Days",
            "current_value": curr_soak_days,
            "recommended_value": rec_soak_days,
            "difference": rec_soak_days - curr_soak_days,
            "expected_impact": "Allows thermal conduction equilibrium across drainage radius without excessive overburden heat loss."
        },
        {
            "parameter_name": "Production Cut-off Temp",
            "unit": "°C",
            "current_value": curr_cutoff_temp,
            "recommended_value": rec_cutoff_temp,
            "difference": round(rec_cutoff_temp - curr_cutoff_temp, 1),
            "expected_impact": "Optimizes cycle turnaround threshold to prevent severe rod floating as heavy oil cools."
        }
    ]

    # CSS Cycle Stages for Stepper Visualization
    # Stages: INJECTION -> SOAK -> PRODUCTION -> COOLING -> NEXT CYCLE
    active_phase = current_cycle.get("current_phase", "PRODUCTION")
    cycle_phases = [
        {
            "stage_id": "INJECTION",
            "name": "Steam Injection",
            "duration": "14 - 21 Days",
            "target": "2,400 - 2,800 Tons @ 285°C",
            "description": "High-enthalpy saturated steam (80% quality) injected into heavy oil formation.",
            "is_current": active_phase == "INJECTION",
            "is_completed": active_phase in ["SOAK", "PRODUCTION", "COOLING", "MATURE_DEPLETION"]
        },
        {
            "stage_id": "SOAK",
            "name": "Heat Soak Period",
            "duration": "4 - 7 Days",
            "target": "Conductive Matrix Diffusion",
            "description": "Well shut-in to allow latent heat to transfer from steam condensation into cold heavy oil.",
            "is_current": active_phase == "SOAK",
            "is_completed": active_phase in ["PRODUCTION", "COOLING", "MATURE_DEPLETION"]
        },
        {
            "stage_id": "PRODUCTION",
            "name": "Thermal Production",
            "duration": "60 - 120 Days",
            "target": "Peak Inflow (120 - 180 BPD)",
            "description": "Sucker rod pump lifts hot, low-viscosity crude under favorable mobility ratio.",
            "is_current": active_phase == "PRODUCTION",
            "is_completed": active_phase in ["COOLING", "MATURE_DEPLETION"]
        },
        {
            "stage_id": "COOLING",
            "name": "Thermal Cooling Watch",
            "duration": "20 - 40 Days",
            "target": "Cut-off Temp: 68°C",
            "description": "Reservoir temperature decays towards native baseline, viscosity increases, rod load monitored.",
            "is_current": active_phase == "COOLING",
            "is_completed": active_phase == "MATURE_DEPLETION"
        },
        {
            "stage_id": "NEXT_CYCLE",
            "name": "Next Huff & Puff Cycle",
            "duration": "Turnaround Phase",
            "target": f"Initiate Cycle #{current_cycle.get('cycle_number', 4) + 1}",
            "description": "Well prepped for steam line hookup and casing thermal relief check.",
            "is_current": active_phase == "MATURE_DEPLETION",
            "is_completed": False
        }
    ]

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "current_cycle": current_cycle,
        "parameters_comparison": parameters,
        "cycle_phases": cycle_phases,
        "historical_cycles": all_cycles,
        "oil_steam_ratio": current_cycle.get("oil_steam_ratio", 0.18),
        "cumulative_steam_tons": sum(c.get("steam_volume_tons", 0) for c in all_cycles),
        "cumulative_oil_bbl": sum(c.get("cum_oil_produced_bbl", 0) for c in all_cycles)
    }
