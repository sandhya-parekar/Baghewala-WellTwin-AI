"""
Baghewala WellTwin AI - Live Simulation Controller Router
Drives real-time simulated telemetry ticks, allows Start/Pause/Reset controls.
"""

from fastapi import APIRouter, HTTPException
import random
import math
from datetime import datetime, timedelta
from app.database import query_one, execute_write
from app.services.digital_twin_engine import DigitalTwinEngine
from app.services.health_score_service import calculate_health_score

router = APIRouter(prefix="/api/simulation", tags=["Live Simulation Engine"])

# In-memory simulation state
sim_state = {
    "is_running": True,
    "tick_count": 0,
    "speed_multiplier": 1.0,
    "last_tick": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

@router.get("/status")
def get_simulation_status():
    return sim_state

@router.post("/start")
def start_simulation():
    sim_state["is_running"] = True
    return {"status": "RUNNING", "message": "Live simulated sensor stream active"}

@router.post("/pause")
def pause_simulation():
    sim_state["is_running"] = False
    return {"status": "PAUSED", "message": "Simulation paused"}

@router.post("/reset/{well_id}")
def reset_simulation(well_id: str):
    sim_state["tick_count"] = 0
    # Reset well to nominal state
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    return {"status": "RESET_COMPLETE", "well_id": well_id, "message": "Well parameters restored to base physical state"}

@router.post("/tick/{well_id}")
def step_simulation_tick(well_id: str):
    """
    Generates the next real-time telemetry frame with small physical perturbation.
    """
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,))
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    latest = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sim_state["tick_count"] += 1
    sim_state["last_tick"] = now_str

    # Small continuous physical drift
    cur_temp = latest.get("reservoir_temp_c", 85.0)
    # Natural cooling trend
    cooling_step = random.uniform(-0.15, 0.05)
    new_temp = max(round(cur_temp + cooling_step, 2), well["initial_res_temp_c"])

    api = well["api_gravity"]
    asphaltene = well["asphaltene_pct"]
    new_visc = DigitalTwinEngine.calculate_viscosity(new_temp, api, asphaltene)

    cur_press = latest.get("reservoir_pressure_bar", 95.0)
    new_press = round(cur_press + random.uniform(-0.1, 0.1), 2)

    spm = latest.get("srp_spm", 6.0)
    stroke = latest.get("srp_stroke_in", 144.0)
    vfd = latest.get("srp_vfd_hz", 48.0)

    # SRP load update
    srp_mech = DigitalTwinEngine.calculate_srp_mechanics(
        stroke_in=stroke,
        spm=spm,
        vfd_hz=vfd,
        viscosity_cp=new_visc,
        depth_m=well["reservoir_depth_m"]
    )

    # Inflow delivery
    inflow = 210.0 * (115.0 / (new_visc ** 0.42))
    new_prod = round(min(srp_mech["pump_displacement_bpd"] * (srp_mech["pump_eff_pct"] / 100.0), inflow), 1)

    h_eval = calculate_health_score(
        prod_bpd=new_prod,
        temp_c=new_temp,
        pump_eff_pct=srp_mech["pump_eff_pct"],
        pprl_lbs=srp_mech["pprl_lbs"],
        mprl_lbs=srp_mech["mprl_lbs"],
        rod_stress_psi=srp_mech["rod_stress_psi"]
    )

    # Insert into sensor_readings
    execute_write("""
    INSERT INTO sensor_readings (
        well_id, timestamp, reservoir_temp_c, reservoir_pressure_bar, bottomhole_temp_c,
        wellhead_temp_c, wellhead_pressure_bar, steam_injection_rate_tpd, steam_pressure_bar,
        steam_temperature_c, oil_production_bpd, water_cut_pct, gas_rate_mscfd, oil_viscosity_cp,
        srp_spm, srp_stroke_in, srp_vfd_hz, srp_peak_load_lbs, srp_min_load_lbs,
        srp_efficiency_pct, power_consumption_kw, health_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        well_id, now_str, new_temp, new_press, new_temp + 2.0,
        round(new_temp * 0.65, 1), 4.2, 0.0, 0.0, 0.0,
        new_prod, 42.0, 1.8, new_visc, spm, stroke, vfd,
        srp_mech["pprl_lbs"], srp_mech["mprl_lbs"], srp_mech["pump_eff_pct"],
        srp_mech["power_consumption_kw"], h_eval["total_score"]
    ))

    return {
        "well_id": well_id,
        "timestamp": now_str,
        "reservoir_temp_c": new_temp,
        "oil_viscosity_cp": new_visc,
        "reservoir_pressure_bar": new_press,
        "oil_production_bpd": new_prod,
        "srp_spm": spm,
        "srp_peak_load_lbs": srp_mech["pprl_lbs"],
        "srp_min_load_lbs": srp_mech["mprl_lbs"],
        "srp_efficiency_pct": srp_mech["pump_eff_pct"],
        "power_consumption_kw": srp_mech["power_consumption_kw"],
        "health_score": h_eval["total_score"],
        "equipment_risk": srp_mech["equipment_risk"],
        "is_simulated": True
    }
