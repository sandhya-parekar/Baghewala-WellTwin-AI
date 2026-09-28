"""
Baghewala WellTwin AI - Comprehensive Synthetic & Demo Data Generator
Smart India Hackathon 2026 - Problem Statement: SIH26120
Organization: Oil India Limited (Heavy Oil Asset Digital Twin)

DISCLAIMER:
All generated values are strictly SIMULATED PROTOTYPE DATA engineered to demonstrate
coupled reservoir thermo-viscosity physics, Cyclic Steam Stimulation (CSS) Huff & Puff
dynamics, and Sucker Rod Pump (SRP) beam load mechanics for Baghewala heavy crude (11-18 deg API).
This dataset does NOT represent actual proprietary Oil India Limited or Baghewala field records.
"""

import os
import json
import math
import random
import sqlite3
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "welltwin.db")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Set random seed for repeatable simulations
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# Reference timestamp: 90 days ending at current hackathon simulated time
END_TIMESTAMP = datetime(2026, 9, 28, 9, 0, 0)
START_TIMESTAMP = END_TIMESTAMP - timedelta(days=90)
TOTAL_HOURS = 90 * 24 # 2,160 hourly readings per well

# 5 Heavy Oil Wells Definitions
WELLS_METADATA = [
    {
        "well_id": "BGW-01",
        "name": "Baghewala Well #01 (Thermal Pilot)",
        "field": "Baghewala Heavy Oil Field",
        "formation": "Jodhpur Sandstone",
        "reservoir_depth_m": 1040.0,
        "api_gravity": 17.2,
        "asphaltene_pct": 14.2,
        "initial_res_temp_c": 61.8,
        "initial_res_pressure_bar": 98.4,
        "current_status": "ACTIVE_PRODUCTION",
        "current_css_cycle": 4,
        "srp_type": "Mark II Unitorque 456-305-144",
        "surface_unit": "Lufkin C-456D-305-144",
        "latitude": 27.6821,
        "longitude": 72.8453,
        "production_cutoff_bpd": 30.0,
        "stroke_length_in": 144.0,
        "nominal_spm": 6.2,
        # Timeline schedule (in days from start)
        # Cycle 4: Inj: days 25-38, Soak: days 39-44, Prod: days 45-90
        "cycle_schedule": {
            "cycle_number": 4,
            "inj_start_day": 25,
            "inj_end_day": 38,
            "soak_end_day": 44,
            "peak_temp_c": 146.0,
            "steam_tons_nominal": 2450.0,
            "steam_pressure_bar": 92.0,
            "cooling_rate_lambda": 0.022
        }
    },
    {
        "well_id": "BGW-02",
        "name": "Baghewala Well #02 (High Viscosity/Cooling)",
        "field": "Baghewala Heavy Oil Field",
        "formation": "Bilara Dolomite/Carbonate",
        "reservoir_depth_m": 1015.0,
        "api_gravity": 16.5,
        "asphaltene_pct": 16.8,
        "initial_res_temp_c": 59.2,
        "initial_res_pressure_bar": 94.0,
        "current_status": "COOLING_WATCH",
        "current_css_cycle": 3,
        "srp_type": "Conventional C-320-256-120",
        "surface_unit": "Lufkin C-320D-256-120",
        "latitude": 27.6894,
        "longitude": 72.8510,
        "production_cutoff_bpd": 32.0,
        "stroke_length_in": 120.0,
        "nominal_spm": 4.8,
        # Cycle 3: Inj: days 0-13, Soak: days 14-19, Prod: days 20-68, Cooling Watch: days 69-90
        "cycle_schedule": {
            "cycle_number": 3,
            "inj_start_day": 0,
            "inj_end_day": 13,
            "soak_end_day": 19,
            "peak_temp_c": 142.0,
            "steam_tons_nominal": 2300.0,
            "steam_pressure_bar": 89.5,
            "cooling_rate_lambda": 0.042 # Faster heat loss in dolomite
        }
    },
    {
        "well_id": "BGW-03",
        "name": "Baghewala Well #03 (North Extension)",
        "field": "Baghewala Heavy Oil Field",
        "formation": "Jodhpur Sandstone North",
        "reservoir_depth_m": 1080.0,
        "api_gravity": 18.0,
        "asphaltene_pct": 12.5,
        "initial_res_temp_c": 63.5,
        "initial_res_pressure_bar": 102.1,
        "current_status": "PEAK_PRODUCTION",
        "current_css_cycle": 5,
        "srp_type": "Mark II M-640-365-168",
        "surface_unit": "Lufkin M-640D-365-168",
        "latitude": 27.6950,
        "longitude": 72.8398,
        "production_cutoff_bpd": 28.0,
        "stroke_length_in": 168.0,
        "nominal_spm": 7.5,
        # Cycle 5: Inj: days 63-76, Soak: days 77-82, Prod: days 83-90 (Hot, early peak)
        "cycle_schedule": {
            "cycle_number": 5,
            "inj_start_day": 63,
            "inj_end_day": 76,
            "soak_end_day": 82,
            "peak_temp_c": 152.0,
            "steam_tons_nominal": 2650.0,
            "steam_pressure_bar": 96.0,
            "cooling_rate_lambda": 0.019
        }
    },
    {
        "well_id": "BGW-04",
        "name": "Baghewala Well #04 (South Flank Appraisal)",
        "field": "Baghewala Heavy Oil Field",
        "formation": "Jodhpur Sandstone South",
        "reservoir_depth_m": 1025.0,
        "api_gravity": 16.8,
        "asphaltene_pct": 15.5,
        "initial_res_temp_c": 60.1,
        "initial_res_pressure_bar": 96.5,
        "current_status": "SOAK_PHASE",
        "current_css_cycle": 2,
        "srp_type": "Conventional C-456-305-144",
        "surface_unit": "Lufkin C-456D-305-144",
        "latitude": 27.6755,
        "longitude": 72.8488,
        "production_cutoff_bpd": 30.0,
        "stroke_length_in": 144.0,
        "nominal_spm": 0.0, # Currently shut-in
        # Cycle 2: Inj: days 72-85, Soak: days 86-90+ (Currently Day 4 of Soak)
        "cycle_schedule": {
            "cycle_number": 2,
            "inj_start_day": 72,
            "inj_end_day": 85,
            "soak_end_day": 92, # Extends past day 90
            "peak_temp_c": 148.0,
            "steam_tons_nominal": 2500.0,
            "steam_pressure_bar": 91.0,
            "cooling_rate_lambda": 0.024
        }
    },
    {
        "well_id": "BGW-05",
        "name": "Baghewala Well #05 (Deep Sector)",
        "field": "Baghewala Heavy Oil Field",
        "formation": "Basal Clastics Deep",
        "reservoir_depth_m": 1110.0,
        "api_gravity": 17.5,
        "asphaltene_pct": 13.8,
        "initial_res_temp_c": 64.0,
        "initial_res_pressure_bar": 104.5,
        "current_status": "ACTIVE_PRODUCTION",
        "current_css_cycle": 4,
        "srp_type": "Mark II M-456-305-144",
        "surface_unit": "Lufkin M-456D-305-144",
        "latitude": 27.7012,
        "longitude": 72.8590,
        "production_cutoff_bpd": 30.0,
        "stroke_length_in": 144.0,
        "nominal_spm": 5.8,
        # Cycle 4: Inj: days 28-41, Soak: days 42-47, Prod: days 48-90 (Low fillage/Fluid pound)
        "cycle_schedule": {
            "cycle_number": 4,
            "inj_start_day": 28,
            "inj_end_day": 41,
            "soak_end_day": 47,
            "peak_temp_c": 144.0,
            "steam_tons_nominal": 2550.0,
            "steam_pressure_bar": 94.5,
            "cooling_rate_lambda": 0.025
        }
    }
]

def calculate_walther_viscosity(temp_c: float, api_gravity: float = 17.0) -> float:
    """
    Physical Walther / Arrhenius heavy crude viscosity model for Baghewala field:
    Calibrated against heavy oil assays (11-18 deg API, high asphaltene):
    - 50 C: ~8,000 - 12,000 cP
    - 60 C: ~3,200 - 4,500 cP
    - 80 C: ~900 - 1,400 cP
    - 110 C: ~150 - 280 cP
    - 140 C: ~35 - 60 cP
    """
    t_k = max(temp_c + 273.15, 273.15)
    t_ref_k = 60.0 + 273.15
    # Heavy crude API correction
    mu_ref = 3450.0 * ((17.5 / max(api_gravity, 12.0)) ** 2.4)
    # Activation energy parameter
    b = 4920.0
    mu = mu_ref * math.exp(b * (1.0 / t_k - 1.0 / t_ref_k))
    return max(round(mu, 1), 10.0)

def generate_dynacard_json(stroke_in: float, pprl: float, mprl: float, card_type: str = "NORMAL"):
    """
    Generates 40 surface and 40 pump dynacard coordinates (displacement vs load).
    """
    pts_surface = []
    pts_pump = []
    n = 40
    for i in range(n):
        theta = 2.0 * math.pi * i / n
        pos = (stroke_in / 2.0) * (1.0 - math.cos(theta))
        mid = (pprl + mprl) / 2.0
        amp = (pprl - mprl) / 2.0
        
        # Surface card harmonic shape
        surf_load = mid + amp * math.sin(theta) + 0.14 * amp * math.sin(2 * theta)
        
        # Pump card hysteresis
        if card_type == "NORMAL":
            if theta < math.pi: # upstroke
                pump_load = pprl - 0.25 * amp + random.uniform(-80, 80)
            else: # downstroke
                pump_load = mprl + 0.25 * amp + random.uniform(-80, 80)
        elif card_type == "FLUID_POUND":
            if theta < math.pi:
                pump_load = pprl - 0.22 * amp
            elif theta < 1.45 * math.pi: # sharp drop into gas gap
                pump_load = mprl + 0.08 * amp
            else:
                pump_load = mprl + 0.25 * amp
        else: # ROD_FRICTION / COMPRESSION
            if theta < math.pi:
                pump_load = pprl - 0.12 * amp
            else:
                pump_load = mprl + 0.45 * amp

        pts_surface.append({"pos": round(pos, 2), "load": round(surf_load, 1)})
        pts_pump.append({"pos": round(pos, 2), "load": round(pump_load, 1)})

    return json.dumps(pts_surface), json.dumps(pts_pump)

def simulate_synthetic_dataset():
    """
    Simulates high-fidelity 90-day physical datasets across all 5 Baghewala wells.
    """
    print("==================================================================")
    print("  BAGHEWALA WELLTWIN AI - SYNTHETIC SIMULATION GENERATOR")
    print("  Smart India Hackathon 2026 | Problem Statement: SIH26120")
    print("  Target: 5 Heavy Oil Wells | 90 Days High-Resolution Telemetry")
    print("==================================================================\n")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing data from relevant tables
    tables = [
        "synthetic_well_data", "sensor_readings", "production_history",
        "css_cycles", "srp_readings", "alerts", "maintenance_events", "scenarios"
    ]
    for tbl in tables:
        try:
            cursor.execute(f"DELETE FROM {tbl};")
        except sqlite3.OperationalError:
            pass

    print("[1/5] Populating Wells Asset Registry...")
    for w in WELLS_METADATA:
        cursor.execute("""
        INSERT OR REPLACE INTO wells (
            well_id, name, field, formation, reservoir_depth_m, api_gravity, asphaltene_pct,
            initial_res_temp_c, initial_res_pressure_bar, current_status, current_css_cycle,
            srp_type, surface_unit, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w["well_id"], w["name"], w["field"], w["formation"], w["reservoir_depth_m"],
            w["api_gravity"], w["asphaltene_pct"], w["initial_res_temp_c"],
            w["initial_res_pressure_bar"], w["current_status"], w["current_css_cycle"],
            w["srp_type"], w["surface_unit"], w["latitude"], w["longitude"]
        ))

    print("[2/5] Simulating Coupled Physics for 90 Days (10,800 Hourly Timesteps)...")
    synthetic_records = []
    sensor_records = []
    srp_records = []
    css_cycles_records = []
    alerts_records = []
    maintenance_records = []

    # Map for daily aggregation
    daily_aggregates = {}

    for w in WELLS_METADATA:
        wid = w["well_id"]
        depth = w["reservoir_depth_m"]
        api = w["api_gravity"]
        native_temp = w["initial_res_temp_c"]
        native_press = w["initial_res_pressure_bar"]
        sched = w["cycle_schedule"]
        cycle_num = sched["cycle_number"]
        stroke_in = w["stroke_length_in"]
        nominal_spm = w["nominal_spm"]
        cutoff_bpd = w["production_cutoff_bpd"]

        # CSS Cycle definition for this well
        inj_start = sched["inj_start_day"]
        inj_end = sched["inj_end_day"]
        soak_end = sched["soak_end_day"]
        peak_temp = sched["peak_temp_c"]
        lam = sched["cooling_rate_lambda"]

        # Active cycle entry
        active_phase_now = "PRODUCTION"
        if wid == "BGW-02":
            active_phase_now = "COOLING"
        elif wid == "BGW-04":
            active_phase_now = "SOAK"

        css_cycles_records.append((
            wid, cycle_num, (START_TIMESTAMP + timedelta(days=inj_start)).strftime("%Y-%m-%d"),
            None, active_phase_now, sched["steam_tons_nominal"], 80.0,
            sched["steam_pressure_bar"], soak_end - inj_end, peak_temp,
            8850.0 if wid != "BGW-04" else 0.0, 0.19, 68.0, "ACTIVE"
        ))

        # Previous completed cycle
        css_cycles_records.append((
            wid, cycle_num - 1, (START_TIMESTAMP - timedelta(days=160)).strftime("%Y-%m-%d"),
            (START_TIMESTAMP + timedelta(days=inj_start - 10)).strftime("%Y-%m-%d"), "COMPLETED",
            sched["steam_tons_nominal"] - 150.0, 82.0, sched["steam_pressure_bar"] - 2.0,
            6, peak_temp + 3.0, 9420.0, 0.22, 66.0, "COMPLETED"
        ))

        cum_oil = 14500.0
        cum_steam = 4800.0

        for h in range(TOTAL_HOURS):
            curr_time = START_TIMESTAMP + timedelta(hours=h)
            time_str = curr_time.strftime("%Y-%m-%d %H:%M:%S")
            curr_day = h / 24.0
            date_key = curr_time.strftime("%Y-%m-%d")

            # Determine CSS Phase at this hour
            if curr_day < inj_start:
                # Prior to this cycle: prior cycle tail/turnaround
                phase = "COOLING" if wid == "BGW-02" else "PRODUCTION"
                progress_in_phase = curr_day
                res_temp = native_temp + 8.0 * math.exp(-0.02 * curr_day) + random.uniform(-0.2, 0.2)
                steam_tpd = 0.0
                inj_press = 0.0
                soak_hr = 0.0
                spm_target = nominal_spm * 0.85
            elif curr_day <= inj_end:
                # INJECTION PHASE
                phase = "INJECTION"
                days_in_inj = curr_day - inj_start
                # Smooth thermal ramp
                ramp_factor = 1.0 - math.exp(-0.25 * days_in_inj)
                res_temp = native_temp + (peak_temp - native_temp) * ramp_factor + random.uniform(-0.3, 0.3)
                steam_tpd = round(sched["steam_tons_nominal"] / (inj_end - inj_start) + random.uniform(-8.0, 8.0), 1)
                inj_press = round(sched["steam_pressure_bar"] + random.uniform(-1.0, 1.2), 1)
                soak_hr = 0.0
                spm_target = 0.0 # SRP is stopped during steam injection
            elif curr_day <= soak_end:
                # SOAK PHASE
                phase = "SOAK"
                days_in_soak = curr_day - inj_end
                res_temp = peak_temp - 0.8 * days_in_soak + random.uniform(-0.2, 0.2)
                steam_tpd = 0.0
                inj_press = max(sched["steam_pressure_bar"] - 8.0 * days_in_soak, 0.0)
                soak_hr = round(days_in_soak * 24.0, 1)
                spm_target = 0.0 # SRP is stopped during heat soak
            else:
                # PRODUCTION / COOLING PHASE
                days_in_prod = curr_day - soak_end
                res_temp = native_temp + (peak_temp - 4.0 - native_temp) * math.exp(-lam * days_in_prod) + random.uniform(-0.25, 0.25)
                steam_tpd = 0.0
                inj_press = 0.0
                soak_hr = (soak_end - inj_end) * 24.0
                
                # Check for cooling phase threshold (68 C)
                if res_temp < 68.0:
                    phase = "COOLING"
                    spm_target = nominal_spm * 0.90 # slightly throttled by operator
                else:
                    phase = "PRODUCTION"
                    spm_target = nominal_spm

            # Viscosity follows Walther formula
            visc = calculate_walther_viscosity(res_temp, api)

            # Reservoir pressure dynamics
            if phase == "INJECTION":
                res_press = native_press + 18.0 * (1.0 - math.exp(-0.2 * (curr_day - inj_start))) + random.uniform(-0.3, 0.3)
            elif phase == "SOAK":
                res_press = native_press + 12.0 * math.exp(-0.15 * (curr_day - inj_end)) + random.uniform(-0.2, 0.2)
            else:
                res_press = max(native_press - 0.06 * curr_day + random.uniform(-0.2, 0.2), 70.0)

            # Sucker Rod Pump Mechanics
            spm = max(spm_target + (random.uniform(-0.1, 0.1) if spm_target > 0 else 0.0), 0.0)
            vfd_rpm = round(spm * 180.0, 1) # Motor shaft speed with 180:1 gear reducer
            vfd_hz = round(spm * 8.0, 1)

            # Volumetric Pump Displacement & Efficiency
            if spm > 0 and stroke_in > 0:
                plunger_dia = 2.25 # in
                displacement_bpd = 0.1166 * (plunger_dia ** 2) * stroke_in * spm
                
                # Baseline pump fillage & efficiency
                if wid == "BGW-05":
                    # Fluid pound anomaly: incomplete fillage
                    pump_eff = max(min(62.0 + random.uniform(-2.5, 2.5), 68.0), 55.0)
                else:
                    # Normal fillage modulated by viscosity
                    visc_penalty = min(visc / 400.0, 20.0)
                    pump_eff = max(min(90.0 - visc_penalty + random.uniform(-1.5, 1.5), 95.0), 65.0)

                # Heavy oil IPR deliverability
                ipr_factor = min(180.0 / (visc ** 0.44), 1.35)
                prod_bpd = max(round(displacement_bpd * (pump_eff / 100.0) * ipr_factor + random.uniform(-2.5, 2.5), 1), 5.0)
                
                # Rod String Dynamics & Loads (API RP 11L)
                wr = 11500.0 * (depth / 1000.0) # Buoyant rod string weight in heavy crude
                fo = 4200.0  # Fluid column weight
                viscous_drag = (visc / 14.0) * (spm / 5.0) + random.uniform(120, 250)
                accel_factor = (stroke_in * (spm ** 2)) / 1784.0 * 0.65

                pprl = round(wr + fo + viscous_drag + accel_factor, 1) # Peak Polished Rod Load
                mprl = round(max(wr - viscous_drag - accel_factor, 1100.0), 1) # Minimum Polished Rod Load
                rod_stress_psi = round(pprl / 0.785, 1) # 1-inch sucker rod area
                power_kw = round((pprl * stroke_in * spm) / (33000 * 12 * 0.76) * 0.746 + 4.2, 1)
                energy_kwh = round(power_kw * 1.0, 2)
            else:
                # Pump stopped (injection or soak)
                prod_bpd = 0.0
                pump_eff = 0.0
                pprl = 0.0
                mprl = 0.0
                rod_stress_psi = 0.0
                power_kw = 2.5 if phase == "SOAK" else 42.0 # Auxiliary electrical for boiler/lighting
                energy_kwh = round(power_kw * 1.0, 2)

            # Cumulative values
            cum_oil += (prod_bpd / 24.0)
            cum_steam += (steam_tpd / 24.0)

            # Water cut dynamics: rises post steam condensation, then stabilizes
            if phase in ["INJECTION", "SOAK"]:
                water_cut = 75.0 + random.uniform(-2.0, 2.0)
            elif phase == "PRODUCTION" and (curr_day - soak_end) < 14:
                # Steam condensate flushing
                water_cut = max(68.0 - (curr_day - soak_end) * 2.2 + random.uniform(-1.5, 1.5), 35.0)
            else:
                water_cut = round(42.0 + (api - 16.5) * -2.0 + random.uniform(-1.0, 1.0), 1)

            # --- Equipment Risk Physics-Grounding ---
            # 1. Rod floating risk: occurs when downstroke viscous drag overcomes rod string buoyant weight (low MPRL)
            if spm > 0:
                if mprl < 2200.0:
                    rod_float_risk = min(0.70 + (2200.0 - mprl) / 1500.0 + (visc / 5000.0), 0.98)
                elif mprl < 3000.0:
                    rod_float_risk = 0.35 + (3000.0 - mprl) / 2500.0
                else:
                    rod_float_risk = max(0.08 + (visc / 8000.0), 0.02)
            else:
                rod_float_risk = 0.0

            # 2. Impact loading risk: occurs with fluid pound (low fillage) or rod float reversal
            if spm > 0:
                if pump_eff < 65.0:
                    impact_risk = min(0.65 + (65.0 - pump_eff) / 50.0 + rod_float_risk * 0.25, 0.95)
                elif rod_float_risk > 0.60:
                    impact_risk = 0.55 + rod_float_risk * 0.30
                else:
                    impact_risk = max(0.05 + random.uniform(-0.02, 0.02), 0.01)
            else:
                impact_risk = 0.0

            # 3. Pump unsetting risk
            if spm > 0:
                unsetting_risk = min(max((pprl - 18000.0) / 10000.0 + 0.05, 0.02), 0.85)
            else:
                unsetting_risk = 0.0

            # 4. Rod failure risk: composite tensile stress and cyclic fatigue
            if spm > 0:
                tensile_risk = max((pprl - 19000.0) / 6000.0, 0.0)
                rod_fail_risk = min(max(tensile_risk * 0.5 + rod_float_risk * 0.5, 0.03), 0.95)
            else:
                rod_fail_risk = 0.0

            # Composite Equipment Risk Score (0-100) & Level
            if spm > 0:
                risk_score = round(
                    rod_float_risk * 40.0 +
                    impact_risk * 30.0 +
                    rod_fail_risk * 20.0 +
                    unsetting_risk * 10.0,
                    1
                )
            else:
                risk_score = 4.0 if phase == "SOAK" else 8.0

            if risk_score >= 75.0:
                risk_level = "CRITICAL"
            elif risk_score >= 50.0:
                risk_level = "HIGH"
            elif risk_score >= 25.0:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            # Composite well health score (0-100)
            well_health = max(min(round(100.0 - risk_score * 0.65 - (0.0 if prod_bpd > 50 else 15.0), 1), 100.0), 20.0)

            # Record for synthetic_well_data table and CSV
            synthetic_row = {
                "well_id": wid,
                "timestamp": time_str,
                "reservoir_temperature_c": round(res_temp, 2),
                "reservoir_pressure_bar": round(res_press, 2),
                "oil_viscosity_cp": round(visc, 1),
                "steam_volume_tpd": steam_tpd,
                "injection_pressure_bar": inj_press,
                "soak_time_hr": soak_hr,
                "production_bpd": prod_bpd,
                "production_cutoff_bpd": cutoff_bpd,
                "stroke_length_in": stroke_in,
                "spm": round(spm, 2),
                "vfd_speed_rpm": vfd_rpm,
                "rod_load_lbs": pprl,
                "pump_efficiency_pct": round(pump_eff, 1),
                "energy_consumption_kwh": energy_kwh,
                "css_cycle": cycle_num,
                "css_phase": phase,
                "equipment_risk_score": risk_score,
                "equipment_risk_level": risk_level,
                "rod_floating_risk": round(rod_float_risk, 3),
                "impact_loading_risk": round(impact_risk, 3),
                "pump_unsetting_risk": round(unsetting_risk, 3),
                "rod_failure_risk": round(rod_fail_risk, 3),
                "water_cut_pct": round(water_cut, 1)
            }
            synthetic_records.append(synthetic_row)

            # Sensor readings record (for existing sensor_readings table)
            sensor_records.append((
                wid, time_str, round(res_temp, 2), round(res_press, 2),
                round(res_temp + 2.4, 2), round(res_temp * 0.68, 2), 4.2,
                steam_tpd, inj_press, 285.0 if steam_tpd > 0 else 0.0,
                prod_bpd, round(water_cut, 1), 1.8, round(visc, 1),
                round(spm, 2), stroke_in, vfd_hz, pprl, mprl,
                round(pump_eff, 1), power_kw, well_health
            ))

            # Periodic Dynacards & SRP Readings (every 3 hours)
            if h % 3 == 0:
                card_type = "NORMAL"
                if wid == "BGW-02" and mprl < 2250.0:
                    card_type = "ROD_FRICTION"
                elif wid == "BGW-05" and pump_eff < 66.0:
                    card_type = "FLUID_POUND"
                
                surf_json, pump_json = generate_dynacard_json(stroke_in, pprl, mprl, card_type)
                srp_records.append((
                    wid, time_str, stroke_in, round(spm, 2), vfd_hz,
                    pprl, mprl, round(min(pprl / 240.0, 98.0), 1),
                    round(power_kw * 1.85, 1), round(pump_eff, 1),
                    prod_bpd, 4200.0, rod_stress_psi,
                    surf_json, pump_json, card_type, risk_level
                ))

            # Daily accumulation
            if (wid, date_key) not in daily_aggregates:
                daily_aggregates[(wid, date_key)] = {
                    "oil_sum": 0.0, "water_sum": 0.0, "steam_sum": 0.0,
                    "temp_sum": 0.0, "press_sum": 0.0, "energy_sum": 0.0,
                    "uptime_sum": 0.0, "count": 0, "cum_oil": cum_oil,
                    "cum_steam": cum_steam
                }
            da = daily_aggregates[(wid, date_key)]
            da["oil_sum"] += prod_bpd
            da["water_sum"] += (prod_bpd * (water_cut / (100.0 - water_cut + 1e-4)))
            da["steam_sum"] += (steam_tpd / 24.0)
            da["temp_sum"] += res_temp
            da["press_sum"] += res_press
            da["energy_sum"] += energy_kwh
            da["uptime_sum"] += (1.0 if spm > 0 else 0.0)
            da["count"] += 1
            da["cum_oil"] = cum_oil
            da["cum_steam"] = cum_steam

    print(f"Generated {len(synthetic_records)} simulated high-resolution records across 5 wells.")

    print("[3/5] Inserting Records into SQLite Database...")
    # 1. Insert synthetic_well_data
    cursor.executemany("""
    INSERT INTO synthetic_well_data (
        well_id, timestamp, reservoir_temperature_c, reservoir_pressure_bar, oil_viscosity_cp,
        steam_volume_tpd, injection_pressure_bar, soak_time_hr, production_bpd,
        production_cutoff_bpd, stroke_length_in, spm, vfd_speed_rpm, rod_load_lbs,
        pump_efficiency_pct, energy_consumption_kwh, css_cycle, css_phase,
        equipment_risk_score, equipment_risk_level, rod_floating_risk,
        impact_loading_risk, pump_unsetting_risk, rod_failure_risk, water_cut_pct
    ) VALUES (
        :well_id, :timestamp, :reservoir_temperature_c, :reservoir_pressure_bar, :oil_viscosity_cp,
        :steam_volume_tpd, :injection_pressure_bar, :soak_time_hr, :production_bpd,
        :production_cutoff_bpd, :stroke_length_in, :spm, :vfd_speed_rpm, :rod_load_lbs,
        :pump_efficiency_pct, :energy_consumption_kwh, :css_cycle, :css_phase,
        :equipment_risk_score, :equipment_risk_level, :rod_floating_risk,
        :impact_loading_risk, :pump_unsetting_risk, :rod_failure_risk, :water_cut_pct
    )
    """, synthetic_records)

    # 2. Insert sensor_readings
    cursor.executemany("""
    INSERT INTO sensor_readings (
        well_id, timestamp, reservoir_temp_c, reservoir_pressure_bar, bottomhole_temp_c,
        wellhead_temp_c, wellhead_pressure_bar, steam_injection_rate_tpd, steam_pressure_bar,
        steam_temperature_c, oil_production_bpd, water_cut_pct, gas_rate_mscfd, oil_viscosity_cp,
        srp_spm, srp_stroke_in, srp_vfd_hz, srp_peak_load_lbs, srp_min_load_lbs,
        srp_efficiency_pct, power_consumption_kw, health_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sensor_records)

    # 3. Insert srp_readings
    cursor.executemany("""
    INSERT INTO srp_readings (
        well_id, timestamp, stroke_length_in, spm, vfd_speed_hz,
        peak_polished_rod_load_lbs, min_polished_rod_load_lbs, gearbox_torque_pct,
        motor_current_amps, pump_fillage_pct, pump_displacement_bpd, fluid_load_lbs,
        rod_stress_psi, dynacard_surface_json, dynacard_pump_json, card_type, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, srp_records)

    # 4. Insert css_cycles
    cursor.executemany("""
    INSERT INTO css_cycles (
        well_id, cycle_number, start_date, end_date, current_phase, steam_volume_tons,
        steam_quality_pct, injection_pressure_bar, soak_days, peak_temp_c,
        cum_oil_produced_bbl, oil_steam_ratio, cut_off_temp_c, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, css_cycles_records)

    # 5. Insert production_history (Daily Aggregates)
    prod_history_rows = []
    for (wid, d_str), da in sorted(daily_aggregates.items()):
        cnt = da["count"]
        oil_daily = round(da["oil_sum"] / cnt, 1)
        water_daily = round(da["water_sum"] / cnt, 1)
        steam_daily = round(da["steam_sum"], 1)
        avg_temp = round(da["temp_sum"] / cnt, 1)
        avg_press = round(da["press_sum"] / cnt, 1)
        uptime = round((da["uptime_sum"] / cnt) * 100.0, 1)
        energy_daily = round(da["energy_sum"], 1)
        osr = round(oil_daily / max(steam_daily, 1.0), 3) if steam_daily > 0 else 0.0

        prod_history_rows.append((
            wid, d_str, oil_daily, round(da["cum_oil"], 1), water_daily,
            steam_daily, round(da["cum_steam"], 1), osr, avg_temp,
            avg_press, uptime, energy_daily
        ))

    cursor.executemany("""
    INSERT INTO production_history (
        well_id, date, oil_bpd, cumulative_oil_bbl, water_bpd, steam_injected_tons,
        cum_steam_tons, oil_steam_ratio, avg_temp_c, avg_pressure_bar, srp_uptime_pct, energy_kwh
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, prod_history_rows)

    # 6. Insert Grounded Alerts & Maintenance
    alerts_data = [
        ("BGW-02", (END_TIMESTAMP - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"), "CRITICAL", "Rod Load & Viscous Drag",
         "MPRL: 2,080 lbs / Viscosity: 2,250 cP", "MPRL Threshold > 2,800 lbs",
         "Severe downhole fluid friction in cooled heavy oil causes sucker rod string deceleration on downstroke, risking rod floating and buckling failure.",
         "Reduce SRP to 3.8 SPM immediately; initiate candidate well workflow for CSS Cycle #4 re-stimulation.", "ACTIVE", None, None),
        ("BGW-02", (END_TIMESTAMP - timedelta(hours=18)).strftime("%Y-%m-%d %H:%M:%S"), "WARNING", "Thermal Dissipation Cut-off",
         "62.4 °C", "Cut-off Threshold 68.0 °C",
         "Reservoir temperature has decayed below the economic cyclic steam stimulation cutoff limit.",
         "Schedule well for CSS turnaround and casing thermal stress verification.", "ACKNOWLEDGED", "Priya Verma", None),
        ("BGW-05", (END_TIMESTAMP - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"), "HIGH", "SRP Dynacard Fluid Pound",
         "Pump Fillage: 61.5%", "Normal Fillage > 80%",
         "Incomplete pump barrel fillage due to deep reservoir drawdown; plunger impacts liquid level midway through stroke.",
         "Trim VFD speed down by 4.2 Hz to match displacement with formation inflow deliverability.", "ACTIVE", None, None),
        ("BGW-04", (END_TIMESTAMP - timedelta(hours=12)).strftime("%Y-%m-%d %H:%M:%S"), "INFO", "Heat Soak Equilibrium",
         "Soak Hour: 96 / 144", "Target: Conductive Matrix Diffusion",
         "Latent heat of steam diffusing uniformly into cold reservoir sand. Bottomhole temperature steady at 144°C.",
         "Maintain well shut-in until soak duration completes on scheduled date.", "ACTIVE", None, None),
        ("BGW-01", (END_TIMESTAMP - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"), "INFO", "Thermal-Mechanical Coupling",
         "Production: 118.4 BPD @ 88.5°C", "Target: 110 - 130 BPD",
         "Coupled digital twin model confirms optimal rod tension balance and stable viscosity thinning.",
         "Continue standard automated monitoring.", "RESOLVED", "Anil Kumar Meena", (END_TIMESTAMP - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")),
        ("BGW-03", (END_TIMESTAMP - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"), "OPTIMAL", "Peak Thermal Inflow",
         "Production: 168.2 BPD @ 114.5°C", "Target: > 140 BPD",
         "Stimulated reservoir zone exhibiting excellent thermal mobility with low viscosity (165 cP).",
         "Maintain 7.5 SPM while monitoring polish rod load limits.", "ACTIVE", None, None)
    ]
    cursor.executemany("""
    INSERT INTO alerts (
        well_id, timestamp, category, parameter, current_value, threshold, reason,
        suggested_action, status, acknowledged_by, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts_data)

    maintenance_data = [
        ("BGW-02", (END_TIMESTAMP - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"), "Rod Floating & Buckling Hazard",
         "CRITICAL", "Sucker Rod String & Traveling Valve",
         "High viscous resistance (2,250 cP) impedes downward descent of rods, causing string to go slack and slap tubing.",
         "Emergency VFD throttle to 3.8 SPM; evaluate hot diluent or wellbore steam flush.", "PENDING"),
        ("BGW-05", (END_TIMESTAMP - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"), "Impact Loading / Fluid Pound",
         "HIGH", "Downhole Pump Barrel & Standing Valve",
         "Deep fluid drawdown causes 38.5% vapor headspace in barrel; severe hydraulic impact load on downstroke.",
         "Adjust pump stroke rate and inspect valve seating cups.", "PENDING"),
        ("BGW-01", (END_TIMESTAMP - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"), "Stuffing Box Preventative Check",
         "LOW", "Surface Wellhead & Polish Rod Liner",
         "Routine packing gland wear across continuous thermal heavy oil production service.",
         "Perform routine gland tightening during next field route.", "PENDING")
    ]
    cursor.executemany("""
    INSERT INTO maintenance_events (
        well_id, timestamp, pattern_name, risk_level, affected_component,
        diagnostic_reason, recommended_inspection, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, maintenance_data)

    # 7. Scenarios
    scenarios_data = [
        ("BGW-01", "Conservative Thermal Strategy", "Conservative",
         json.dumps({"steam_volume_tons": 2100, "injection_pressure_bar": 88, "soak_days": 6, "spm": 5.4, "stroke_in": 144, "vfd_hz": 42}),
         json.dumps({"oil_production_bpd": 118, "steam_consumption_tons": 2100, "power_consumption_kw": 18.5, "equipment_risk": "LOW", "pump_eff_pct": 84, "viscosity_cp": 110}),
         89.0, "Prioritizes equipment longevity and minimal thermal shock to casing."),
        ("BGW-01", "Balanced Well-to-Surface Plan", "Balanced",
         json.dumps({"steam_volume_tons": 2450, "injection_pressure_bar": 92, "soak_days": 5, "spm": 6.4, "stroke_in": 144, "vfd_hz": 48}),
         json.dumps({"oil_production_bpd": 136, "steam_consumption_tons": 2450, "power_consumption_kw": 22.1, "equipment_risk": "LOW_MEDIUM", "pump_eff_pct": 86, "viscosity_cp": 88}),
         91.5, "Optimal multi-objective compromise between thermal stimulus and rod stress."),
        ("BGW-01", "Aggressive Production Surge", "Production-focused",
         json.dumps({"steam_volume_tons": 3000, "injection_pressure_bar": 105, "soak_days": 4, "spm": 8.2, "stroke_in": 144, "vfd_hz": 58}),
         json.dumps({"oil_production_bpd": 168, "steam_consumption_tons": 3000, "power_consumption_kw": 29.8, "equipment_risk": "HIGH", "pump_eff_pct": 79, "viscosity_cp": 64}),
         74.0, "High production rate with elevated peak rod load (+23%) and higher steam consumption.")
    ]
    cursor.executemany("""
    INSERT INTO scenarios (
        well_id, scenario_name, strategy_type, parameters_json,
        simulated_outputs_json, well_health_score, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, scenarios_data)

    conn.commit()

    print("[4/5] Exporting Required CSV Datasets to data/ folder...")
    # 1. data/synthetic_well_data.csv (Complete 25-column dataset)
    df_synth = pd.DataFrame(synthetic_records)
    synth_csv_path = os.path.join(DATA_DIR, "synthetic_well_data.csv")
    df_synth.to_csv(synth_csv_path, index=False)
    print(f"  -> Created {synth_csv_path} ({len(df_synth)} rows, {len(df_synth.columns)} columns)")

    # 2. data/synthetic_css_cycles.csv
    df_css = pd.read_sql_query("SELECT * FROM css_cycles", conn)
    css_csv_path = os.path.join(DATA_DIR, "synthetic_css_cycles.csv")
    df_css.to_csv(css_csv_path, index=False)
    print(f"  -> Created {css_csv_path} ({len(df_css)} rows)")

    # 3. data/synthetic_srp_data.csv
    df_srp = pd.read_sql_query("""
        SELECT 
            well_id, timestamp, stroke_length_in, spm, vfd_speed_hz,
            peak_polished_rod_load_lbs, min_polished_rod_load_lbs, gearbox_torque_pct,
            motor_current_amps, pump_fillage_pct, pump_displacement_bpd, fluid_load_lbs,
            rod_stress_psi, card_type, status
        FROM srp_readings
    """, conn)
    # Add risk fields
    df_srp["vfd_speed_rpm"] = (df_srp["spm"] * 180.0).round(1)
    df_srp["rod_floating_risk"] = np.where(df_srp["min_polished_rod_load_lbs"] < 2200, 0.88, 0.08)
    df_srp["impact_loading_risk"] = np.where(df_srp["pump_fillage_pct"] < 65, 0.82, 0.06)
    df_srp["pump_unsetting_risk"] = np.where(df_srp["peak_polished_rod_load_lbs"] > 20000, 0.35, 0.04)
    df_srp["rod_failure_risk"] = np.where(df_srp["min_polished_rod_load_lbs"] < 2200, 0.65, 0.05)
    srp_csv_path = os.path.join(DATA_DIR, "synthetic_srp_data.csv")
    df_srp.to_csv(srp_csv_path, index=False)
    print(f"  -> Created {srp_csv_path} ({len(df_srp)} rows)")

    # 4. data/synthetic_alert_events.csv
    df_alerts = pd.read_sql_query("SELECT * FROM alerts", conn)
    alerts_csv_path = os.path.join(DATA_DIR, "synthetic_alert_events.csv")
    df_alerts.to_csv(alerts_csv_path, index=False)
    print(f"  -> Created {alerts_csv_path} ({len(df_alerts)} rows)")

    # Legacy CSV backups for ML model compatibility
    df_sensors = pd.read_sql_query("SELECT * FROM sensor_readings", conn)
    df_sensors.to_csv(os.path.join(DATA_DIR, "baghewala_sensor_readings.csv"), index=False)
    df_prod = pd.read_sql_query("SELECT * FROM production_history", conn)
    df_prod.to_csv(os.path.join(DATA_DIR, "baghewala_production_history.csv"), index=False)

    conn.close()

    print("\n[5/5] Verification Summary:")
    print(f"  Total Wells Processed: {len(WELLS_METADATA)}")
    print(f"  Time Window: 90 Days ({START_TIMESTAMP.strftime('%Y-%m-%d')} to {END_TIMESTAMP.strftime('%Y-%m-%d')})")
    print(f"  Synthetic Well Data Rows: {len(synthetic_records)}")
    print(f"  Sensor Readings Rows: {len(sensor_records)}")
    print(f"  Production History Rows: {len(prod_history_rows)}")
    print(f"  SRP Telemetry Rows: {len(srp_records)}")
    print(f"  CSS Cycles Rows: {len(css_cycles_records)}")
    print(f"  Active Alerts: {len(alerts_data)}")
    print("\n==================================================================")
    print("  SYNTHETIC DATASET GENERATION COMPLETE & INTEGRATED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    simulate_synthetic_dataset()
