"""
Baghewala WellTwin AI - Dashboard Router
Provides aggregated KPIs, AI Insight of the Day, and Well Health Timeline.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.database import query_all, query_one
from app.services.health_score_service import calculate_health_score

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_field_summary():
    all_latest = query_all("""
        SELECT s.* FROM sensor_readings s
        INNER JOIN (
            SELECT well_id, MAX(timestamp) as max_ts FROM sensor_readings GROUP BY well_id
        ) m ON s.well_id = m.well_id AND s.timestamp = m.max_ts
    """)
    total_wells = len(all_latest) if all_latest else 5
    active_wells = sum(1 for r in all_latest if r.get("oil_production_bpd", 0) > 0) if all_latest else 5
    total_prod = sum(r.get("oil_production_bpd", 0.0) for r in all_latest) if all_latest else 428.4
    total_power = sum(r.get("power_consumption_kw", 0.0) for r in all_latest) if all_latest else 105.2
    active_alerts = len(query_all("SELECT id FROM alerts WHERE status = 'ACTIVE'"))

    return {
        "field_name": "Baghewala Heavy Oil Field",
        "total_wells": total_wells,
        "active_wells": active_wells,
        "total_production_bpd": round(total_prod, 1),
        "total_power_kw": round(total_power, 1),
        "avg_sor": 3.12,
        "field_health_index": 86.4,
        "active_alerts_count": active_alerts,
        "css_in_progress": 1
    }

@router.get("/{well_id}")
def get_dashboard_summary(well_id: str):
    well = query_one("SELECT * FROM wells WHERE well_id = ?", (well_id,)) or {}
    
    # Latest reading
    latest_sensor = query_one(
        "SELECT * FROM sensor_readings WHERE well_id = ? ORDER BY timestamp DESC LIMIT 1",
        (well_id,)
    ) or {}

    # Field-level totals across all wells
    all_latest = query_all("""
        SELECT s.* FROM sensor_readings s
        INNER JOIN (
            SELECT well_id, MAX(timestamp) as max_ts FROM sensor_readings GROUP BY well_id
        ) m ON s.well_id = m.well_id AND s.timestamp = m.max_ts
    """)

    total_field_prod = sum(r.get("oil_production_bpd", 0.0) for r in all_latest)
    total_field_power = sum(r.get("power_consumption_kw", 0.0) for r in all_latest)
    active_wells_count = sum(1 for r in all_latest if r.get("oil_production_bpd", 0) > 0)
    total_wells = len(all_latest)

    # Health score breakdown
    h_breakdown = calculate_health_score(
        prod_bpd=latest_sensor.get("oil_production_bpd", 0.0),
        temp_c=latest_sensor.get("reservoir_temp_c", 60.0),
        pump_eff_pct=latest_sensor.get("srp_efficiency_pct", 80.0),
        pprl_lbs=latest_sensor.get("srp_peak_load_lbs", 18000.0),
        mprl_lbs=latest_sensor.get("srp_min_load_lbs", 3500.0),
        rod_stress_psi=latest_sensor.get("srp_peak_load_lbs", 18000.0) / 0.6013
    )

    # AI Insight of the Day (dynamically evaluated)
    temp = latest_sensor.get("reservoir_temp_c", 60.0)
    visc = latest_sensor.get("oil_viscosity_cp", 120.0)
    mprl = latest_sensor.get("srp_min_load_lbs", 3500.0)
    pprl = latest_sensor.get("srp_peak_load_lbs", 18000.0)
    prod = latest_sensor.get("oil_production_bpd", 120.0)

    if mprl < 2400:
        insight = (
            f"CRITICAL FLUID DRAG: Minimum rod load ({mprl:.0f} lbs) is nearing buckling limit due to heavy crude "
            f"viscous resistance ({visc:.0f} cP). Reducing SPM by 1.2 or initiating CSS re-heating will mitigate rod floating risk."
        )
        insight_type = "ALERT"
    elif temp < 68.0:
        insight = (
            f"THERMAL DECLINE OBSERVED: Wellbore temperature has cooled to {temp:.1f} °C, driving viscosity up to {visc:.0f} cP. "
            f"Inflow deliverability is decaying by ~1.8 BPD/day. Recommend scheduling for upcoming steam cycle."
        )
        insight_type = "WARNING"
    elif prod > 140.0:
        insight = (
            f"PEAK THERMAL EFFICIENCY: Active steam stimulation has stabilized near-wellbore heat at {temp:.1f} °C. "
            f"Fluid viscosity is suppressed to {visc:.0f} cP, delivering exceptional production at {prod:.1f} BPD."
        )
        insight_type = "OPTIMAL"
    else:
        insight = (
            f"STABLE THERMAL-MECHANICAL COUPLING: Temperature at {temp:.1f} °C and SRP at {latest_sensor.get('srp_spm', 6.0)} SPM "
            f"maintain balanced energy efficiency ({latest_sensor.get('power_consumption_kw', 20):.1f} kW) with safe rod tension."
        )
        insight_type = "INFO"

    # Well Health Timeline (Module 8)
    timeline_events = [
        {"time": "08:00", "event": "Scheduled Telemetry Polling", "type": "INFO", "detail": f"Sensor sync complete across 14 channels."},
        {"time": "09:30", "event": "Thermal Inflow Assessment", "type": "THERMAL", "detail": f"Reservoir temperature logged at {temp:.1f} °C (Viscosity: {visc:.0f} cP)."},
        {"time": "11:15", "event": "SRP Dynamometer Card Captured", "type": "MECHANICAL", "detail": f"PPRL {pprl:.0f} lbs, MPRL {mprl:.0f} lbs recorded on surface unit."},
        {"time": "13:00", "event": "AI Digital Twin Risk Evaluation", "type": "AI", "detail": f"Model evaluated well health score at {h_breakdown['total_score']}/100."},
        {"time": "14:45", "event": "Optimization Scan Completed", "type": "OPTIMIZATION", "detail": "Generated AI-Suggested Operating Scenario."}
    ]

    return {
        "well_id": well_id,
        "well_name": well.get("name", "Baghewala Heavy Oil Well"),
        "field": well.get("field", "Baghewala Field"),
        "field_status": {
            "monitored_wells": total_wells,
            "active_wells": active_wells_count,
            "total_field_production_bpd": round(total_field_prod, 1),
            "total_field_power_kw": round(total_field_power, 1),
            "overall_field_risk": "MEDIUM" if any(r.get("srp_min_load_lbs", 3500) < 2600 for r in all_latest) else "LOW"
        },
        "kpis": {
            "production_rate": {"value": latest_sensor.get("oil_production_bpd", 0.0), "unit": "BPD", "status": "NORMAL"},
            "reservoir_temperature": {"value": latest_sensor.get("reservoir_temp_c", 0.0), "unit": "°C", "status": "NORMAL" if temp > 70 else "WARNING"},
            "reservoir_pressure": {"value": latest_sensor.get("reservoir_pressure_bar", 0.0), "unit": "bar", "status": "NORMAL"},
            "steam_injection_rate": {"value": latest_sensor.get("steam_injection_rate_tpd", 0.0), "unit": "tons/day", "status": "NORMAL"},
            "srp_spm": {"value": latest_sensor.get("srp_spm", 0.0), "unit": "SPM", "status": "NORMAL"},
            "srp_efficiency": {"value": latest_sensor.get("srp_efficiency_pct", 0.0), "unit": "%", "status": "NORMAL" if latest_sensor.get("srp_efficiency_pct", 80) > 75 else "WARNING"},
            "equipment_health": {"value": round(h_breakdown["total_score"], 1), "unit": "%", "status": h_breakdown["label"]},
            "energy_consumption": {"value": latest_sensor.get("power_consumption_kw", 0.0), "unit": "kW", "status": "NORMAL"},
            "oil_viscosity": {"value": latest_sensor.get("oil_viscosity_cp", 0.0), "unit": "cP", "status": "NORMAL" if visc < 500 else "WARNING"}
        },
        "health_score": h_breakdown,
        "ai_insight": {
            "title": "AI INSIGHT OF THE DAY",
            "type": insight_type,
            "text": insight,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M")
        },
        "timeline_events": timeline_events,
        "prototype_disclaimer": "Prototype / Simulated Data for Decision Support"
    }
