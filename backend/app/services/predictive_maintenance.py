"""
Baghewala WellTwin AI - Predictive Maintenance Engine
Simulates automated equipment health surveillance for Sucker Rod Pumping systems
operating in high-viscosity heavy oil.
"""

from typing import Dict, Any, List

class PredictiveMaintenanceEngine:
    @staticmethod
    def evaluate_equipment_health(
        latest_sensor: Dict[str, Any],
        latest_srp: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Analyzes mechanical telemetry to detect signatures of rod floating,
        impact loading, high friction, and mechanical fatigue.
        """
        issues = []
        pprl = latest_sensor.get("srp_peak_load_lbs", 18500.0)
        mprl = latest_sensor.get("srp_min_load_lbs", 3800.0)
        visc = latest_sensor.get("oil_viscosity_cp", 120.0)
        pump_eff = latest_sensor.get("srp_efficiency_pct", 82.0)
        spm = latest_sensor.get("srp_spm", 6.0)
        temp = latest_sensor.get("reservoir_temp_c", 85.0)

        # 1. Rod Floating & Compressive Buckling Pattern
        if mprl < 2200.0:
            issues.append({
                "pattern_name": "Rod Floating & Downstroke Compression",
                "risk_level": "CRITICAL",
                "affected_component": "Sucker Rod String (Lower Taper & Pump Plunger)",
                "diagnostic_reason": f"Minimum polished rod load has dropped to {mprl:.0f} lbs in high-viscosity crude ({visc:.0f} cP). Downward viscous drag counteracts rod gravity fall, placing rods into compression and risking helical buckling.",
                "recommended_inspection": "Immediate VFD deceleration by 1.5 SPM. Verify downhole sinker bar weight and schedule thermal steam stimulation.",
                "action_urgency": "IMMEDIATE"
            })
        elif mprl < 2900.0:
            issues.append({
                "pattern_name": "Low Downstroke Margin (Incipient Floating)",
                "risk_level": "WARNING",
                "affected_component": "Sucker Rod String Guides & Couplings",
                "diagnostic_reason": f"Downstroke tension margin narrow at {mprl:.0f} lbs. Viscous drag is accelerating coupling wear against tubing.",
                "recommended_inspection": "Inspect rod guide wear indicators and monitor dynamometer card downstroke contour.",
                "action_urgency": "NEXT_SHIFT"
            })

        # 2. Peak Load Overload / Tensile Fatigue
        if pprl > 21500.0:
            issues.append({
                "pattern_name": "Peak Polished Rod Tension Overload",
                "risk_level": "CRITICAL",
                "affected_component": "Polished Rod, Carrier Bar, and Surface Gearbox",
                "diagnostic_reason": f"Peak load ({pprl:.0f} lbs) exceeds 92% of maximum rated API Grade D rod yield stress. Heavy fluid column combined with friction generates extreme tensile fatigue.",
                "recommended_inspection": "Inspect polished rod clamp torque and gearbox oil level. Counterbalance re-phasing recommended.",
                "action_urgency": "IMMEDIATE"
            })
        elif pprl > 19500.0:
            issues.append({
                "pattern_name": "Elevated Peak Tensile Load",
                "risk_level": "WARNING",
                "affected_component": "Gearbox Reducer & Structural Bearings",
                "diagnostic_reason": f"Peak load elevated at {pprl:.0f} lbs. Operating near 85% unit structure rating.",
                "recommended_inspection": "Check counterbalance phase balance and verify gearbox thermal rise.",
                "action_urgency": "SCHEDULED"
            })

        # 3. Impact Loading / Fluid Pound
        if pump_eff < 65.0 and spm > 0:
            issues.append({
                "pattern_name": "Fluid Pound / Incomplete Fillage",
                "risk_level": "WARNING",
                "affected_component": "Downhole Traveling Valve & Pump Barrel",
                "diagnostic_reason": f"Pump volumetric efficiency degraded to {pump_eff:.1f}%. Incomplete chamber fillage causes plunger to strike heavy oil surface mid-stroke, inducing shock waves up the rod string.",
                "recommended_inspection": "Throttle SPM to allow proper pump fillage. Perform dynamometer valve check (standing valve and traveling valve leakage test).",
                "action_urgency": "SCHEDULED"
            })

        # 4. Severe Viscosity Thermal Shock
        if temp < 65.0:
            issues.append({
                "pattern_name": "Thermal Viscous Freeze Hazard",
                "risk_level": "CRITICAL",
                "affected_component": "Tubing Annulus & Wellhead Flowline",
                "diagnostic_reason": f"Well temperature at {temp:.1f} °C has decayed to native reservoir baseline. Fluid viscosity ({visc:.0f} cP) causes severe flowline pressure surge.",
                "recommended_inspection": "Verify flowline surface heating elements. Initiate CSS steam candidate re-injection protocol.",
                "action_urgency": "IMMEDIATE"
            })

        # Default healthy event if no issues
        if not issues:
            issues.append({
                "pattern_name": "Nominal Mechanical Health",
                "risk_level": "LOW",
                "affected_component": "Wellbore & Surface Lifting Assembly",
                "diagnostic_reason": f"PPRL ({pprl:.0f} lbs), MPRL ({mprl:.0f} lbs), and Pump Efficiency ({pump_eff:.1f}%) within optimal API operating limits.",
                "recommended_inspection": "Continue scheduled preventative maintenance and automated surveillance.",
                "action_urgency": "ROUTINE"
            })

        return issues
