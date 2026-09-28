"""
Baghewala WellTwin AI - Alert Engine
Evaluates telemetry against operational safety envelopes and dispatches tiered alerts.
"""

from typing import Dict, Any, List
import sqlite3
from app.config import settings

class AlertEngine:
    @staticmethod
    def evaluate_telemetry(well_id: str, sensor: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scans sensor parameters and generates tiered alerts.
        """
        alerts = []
        pprl = sensor.get("srp_peak_load_lbs", 0.0)
        mprl = sensor.get("srp_min_load_lbs", 0.0)
        temp = sensor.get("reservoir_temp_c", 0.0)
        eff = sensor.get("srp_efficiency_pct", 0.0)
        visc = sensor.get("oil_viscosity_cp", 0.0)
        prod = sensor.get("oil_production_bpd", 0.0)

        # 1. Rod floating alert
        if mprl < 2200.0 and mprl > 0:
            alerts.append({
                "well_id": well_id,
                "category": "CRITICAL",
                "parameter": "Downstroke Rod Load (MPRL)",
                "current_value": f"{mprl:.0f} lbs",
                "threshold": "Min Safe Tension: 2,400 lbs",
                "reason": "Severe viscous drag counteracts rod downward velocity, risking rod floating and permanent buckling.",
                "suggested_action": "Reduce SPM via VFD immediately to restore positive downstroke tension."
            })

        # 2. Peak load alert
        if pprl > 21500.0:
            alerts.append({
                "well_id": well_id,
                "category": "CRITICAL",
                "parameter": "Peak Polished Rod Load (PPRL)",
                "current_value": f"{pprl:.0f} lbs",
                "threshold": "Max Rating: 21,500 lbs",
                "reason": "Tensile stress exceeds allowable API Grade D fatigue endurance limit.",
                "suggested_action": "Check downhole friction and reduce stroke rate to avoid rod parting."
            })

        # 3. Thermal cut-off alert
        if temp < 68.0 and temp > 0:
            alerts.append({
                "well_id": well_id,
                "category": "WARNING",
                "parameter": "Reservoir Temperature",
                "current_value": f"{temp:.1f} °C",
                "threshold": "CSS Economic Cut-off: 68.0 °C",
                "reason": "Wellbore temperature approaching native cold reservoir baseline, causing steep viscosity surge.",
                "suggested_action": "Schedule well for candidate selection in next Huff & Puff steam stimulation cycle."
            })

        # 4. Volumetric efficiency alert
        if eff < 65.0 and eff > 0:
            alerts.append({
                "well_id": well_id,
                "category": "WARNING",
                "parameter": "Pump Volumetric Efficiency",
                "current_value": f"{eff:.1f}%",
                "threshold": "Target > 75.0%",
                "reason": "Incomplete pump chamber fillage indicates reservoir inflow cannot keep pace with plunger speed.",
                "suggested_action": "Throttle VFD speed down by 0.5-1.0 SPM to prevent fluid pounding damage."
            })

        # 5. Production decline
        if prod < 45.0 and prod > 0:
            alerts.append({
                "well_id": well_id,
                "category": "WARNING",
                "parameter": "Heavy Crude Delivery",
                "current_value": f"{prod:.1f} BPD",
                "threshold": "Baseline Minimum: 60.0 BPD",
                "reason": "Production has dropped below commercial operating baseline.",
                "suggested_action": "Run Root Cause Explorer to isolate thermal decay vs pump slip drivers."
            })

        return alerts
