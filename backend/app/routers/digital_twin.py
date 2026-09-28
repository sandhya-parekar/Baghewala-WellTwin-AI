"""
Baghewala WellTwin AI - Digital Twin Router
Provides interconnected physical state for the 2D Well-to-Surface interactive visualization.
"""

import math
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.database import query_one
from app.services.digital_twin_engine import DigitalTwinEngine

router = APIRouter(prefix="/api/digital-twin", tags=["Digital Twin"])

@router.get("/{well_id}")
@router.get("/{well_id}/state")
def get_digital_twin_state(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    latest_css = query_one(
        "SELECT * FROM css_cycles WHERE well_id = ? ORDER BY cycle_number DESC LIMIT 1",
        (well_id,)
    ) or {}

    latest_srp = query_one(
        "SELECT * FROM srp_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    # State parameters
    temp = latest_sensor.get("reservoir_temp_c", 65.0)
    press = latest_sensor.get("reservoir_pressure_bar", 95.0)
    visc = latest_sensor.get("oil_viscosity_cp", 450.0)
    spm = latest_sensor.get("srp_spm", 6.0)
    stroke = latest_sensor.get("srp_stroke_in", 144.0)
    vfd = latest_sensor.get("srp_vfd_hz", 48.0)
    pprl = latest_sensor.get("srp_peak_load_lbs", 18500.0)
    mprl = latest_sensor.get("srp_min_load_lbs", 3800.0)
    prod = latest_sensor.get("oil_production_bpd", 120.0)

    # Derived physics indicators
    # Thermal radius: steam penetration into heavy oil sand
    steam_radius_m = round(math.sqrt(latest_css.get("steam_volume_tons", 2400) / 120.0) * 1.8, 1) if temp > 75 else 8.5
    # Rod fall velocity & floating warning
    rod_fall_velocity_fps = round((2.0 * (stroke / 12.0) * spm) / 60.0, 2) if spm > 0 else 0.0

    return {
        "well_id": well_id,
        "well_name": well["name"],
        "timestamp": latest_sensor.get("timestamp"),
        "formation": well["formation"],
        "depth_m": well["reservoir_depth_m"],
        
        # 1. Reservoir Subsystem
        "reservoir": {
            "temperature_c": temp,
            "pressure_bar": press,
            "viscosity_cp": visc,
            "native_temp_c": well["initial_res_temp_c"],
            "native_pressure_bar": well["initial_res_pressure_bar"],
            "thermal_plume_radius_m": steam_radius_m,
            "fluid_regime": "LOW_VISCOSITY_HEATED" if visc < 150 else ("MODERATE_DRAG" if visc < 800 else "HIGH_VISCOSITY_RESISTANCE"),
            "status": "THERMALLY_STIMULATED" if temp > 80 else "COOLING_DEPLETION"
        },

        # 2. Wellbore & Completion Subsystem
        "wellbore": {
            "casing_dia_in": 7.0,
            "tubing_dia_in": 2.875,
            "bottomhole_temp_c": latest_sensor.get("bottomhole_temp_c", temp + 2.5),
            "wellhead_temp_c": latest_sensor.get("wellhead_temp_c", temp * 0.65),
            "wellhead_pressure_bar": latest_sensor.get("wellhead_pressure_bar", 4.2),
            "perforation_interval_m": f"{well['reservoir_depth_m'] - 12:.0f} - {well['reservoir_depth_m']:.0f} m",
            "steam_injection_status": latest_css.get("current_phase", "PRODUCTION")
        },

        # 3. Sucker Rod Pump (SRP) Subsystem
        "srp": {
            "surface_unit": well["surface_unit"],
            "rod_string_taper": "API 76 (7/8\" + 3/4\" Grade D)",
            "stroke_length_in": stroke,
            "spm": spm,
            "vfd_speed_hz": vfd,
            "peak_polished_rod_load_lbs": pprl,
            "min_polished_rod_load_lbs": mprl,
            "rod_floating_margin_lbs": mprl,
            "rod_floating_risk": "CRITICAL" if mprl < 2200 else ("HIGH" if mprl < 3000 else "NORMAL"),
            "pump_fillage_pct": latest_srp.get("pump_fillage_pct", 82.0),
            "pump_efficiency_pct": latest_sensor.get("srp_efficiency_pct", 80.0),
            "card_type": latest_srp.get("card_type", "NORMAL"),
            "rod_fall_velocity_fps": rod_fall_velocity_fps
        },

        # 4. Surface Production & Flowline Subsystem
        "surface": {
            "oil_production_bpd": prod,
            "water_cut_pct": latest_sensor.get("water_cut_pct", 42.0),
            "gas_rate_mscfd": latest_sensor.get("gas_rate_mscfd", 1.8),
            "power_consumption_kw": latest_sensor.get("power_consumption_kw", 22.0),
            "surface_flowline_temp_c": round(latest_sensor.get("wellhead_temp_c", 45.0) - 4.0, 1),
            "flowline_viscosity_cp": round(visc * 1.4, 1)
        },

        # Dynamic Coupling Rules
        "physics_coupling": {
            "thermal_viscosity_rule": "Walther equation: higher temperature suppresses heavy oil viscosity exponentially.",
            "viscosity_rod_drag_rule": "High viscosity increases downstroke fluid drag, lowering MPRL and elevating rod floating hazard.",
            "steam_production_response": "Higher steam heat unlocks sandface inflow deliverability, increasing pump fillage."
        },
        "simulation_disclaimer": "Simulated Digital Twin representation. Physics-calibrated prototype."
    }

import math
