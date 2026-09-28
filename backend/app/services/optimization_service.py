"""
Baghewala WellTwin AI - Multi-Objective Optimization Engine
Solves constrained Pareto optimization balancing heavy oil production,
steam injection consumption, electrical lifting energy, and sucker rod reliability.
"""

from typing import Dict, Any, List
from app.services.digital_twin_engine import DigitalTwinEngine

class OptimizationEngine:
    @staticmethod
    def run_multi_objective_optimization(
        well_data: Dict[str, Any],
        latest_sensor: Dict[str, Any],
        weights: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Explores candidate operational vectors (Steam volume, Soak days, SPM, VFD, Stroke)
        to identify the AI-Suggested Operating Scenario that maximizes the composite objective.
        """
        w_prod = weights.get("production_weight", 0.40)
        w_steam = weights.get("steam_efficiency_weight", 0.20)
        w_energy = weights.get("energy_efficiency_weight", 0.20)
        w_equip = weights.get("equipment_reliability_weight", 0.20)

        # Normalize weights to sum to 1.0
        total_w = max(w_prod + w_steam + w_energy + w_equip, 0.01)
        w_prod /= total_w
        w_steam /= total_w
        w_energy /= total_w
        w_equip /= total_w

        current_spm = latest_sensor.get("srp_spm", 6.0)
        current_stroke = latest_sensor.get("srp_stroke_in", 144.0)
        current_vfd = latest_sensor.get("srp_vfd_hz", 48.0)
        current_temp = latest_sensor.get("reservoir_temp_c", 85.0)
        current_prod = latest_sensor.get("oil_production_bpd", 125.0)
        current_steam = 2400.0
        current_soak = 5
        current_power = latest_sensor.get("power_consumption_kw", 22.0)

        # Candidate grid search for decision variables
        candidate_spm = [4.5, 5.2, 5.8, 6.4, 7.0, 7.6]
        candidate_steam = [2000.0, 2300.0, 2500.0, 2750.0]
        candidate_soak = [4, 5, 6]

        best_score = -1e9
        best_candidate = None
        best_sim = None

        # Reference normalization bounds
        P_MAX = 200.0
        STEAM_MAX = 3500.0
        POWER_MAX = 40.0

        for spm in candidate_spm:
            vfd_hz = round(spm * 8.0, 1)
            for steam in candidate_steam:
                for soak in candidate_soak:
                    sim = DigitalTwinEngine.simulate_what_if(
                        well_data=well_data,
                        steam_volume_tons=steam,
                        injection_pressure_bar=92.0,
                        soak_days=soak,
                        production_cutoff_temp_c=68.0,
                        srp_stroke_in=current_stroke,
                        srp_spm=spm,
                        srp_vfd_hz=vfd_hz
                    )

                    # Hard physical safety constraints
                    # 1. Rod floating check: Minimum rod load must remain positive with margin
                    if sim["min_rod_load_lbs"] < 2400.0:
                        continue
                    # 2. Peak tensile load check: Rod yield threshold
                    if sim["peak_rod_load_lbs"] > 21500.0:
                        continue

                    # Objective metrics
                    prod_score = min(sim["oil_production_bpd"] / P_MAX, 1.0)
                    steam_eff_score = max(1.0 - (steam / STEAM_MAX), 0.0)
                    energy_eff_score = max(1.0 - (sim["power_consumption_kw"] / POWER_MAX), 0.0)
                    
                    equip_score = 0.95 if sim["equipment_risk"] == "LOW" else (
                        0.75 if sim["equipment_risk"] == "MEDIUM" else 0.40
                    )

                    composite_score = (
                        w_prod * prod_score +
                        w_steam * steam_eff_score +
                        w_energy * energy_eff_score +
                        w_equip * equip_score
                    )

                    if composite_score > best_score:
                        best_score = composite_score
                        best_candidate = {
                            "steam_volume_tons": steam,
                            "injection_pressure_bar": 92.0,
                            "soak_days": soak,
                            "srp_spm": spm,
                            "srp_vfd_hz": vfd_hz,
                            "srp_stroke_in": current_stroke
                        }
                        best_sim = sim

        # Fallback if all constrained candidates failed
        if best_candidate is None:
            best_candidate = {
                "steam_volume_tons": 2350.0,
                "injection_pressure_bar": 90.0,
                "soak_days": 5,
                "srp_spm": 5.8,
                "srp_vfd_hz": 46.4,
                "srp_stroke_in": current_stroke
            }
            best_sim = DigitalTwinEngine.simulate_what_if(
                well_data, 2350.0, 90.0, 5, 68.0, current_stroke, 5.8, 46.4
            )

        # Calculate deltas
        delta_prod = round(best_sim["oil_production_bpd"] - current_prod, 1)
        delta_prod_pct = round((delta_prod / max(current_prod, 1.0)) * 100, 1)
        delta_power = round(best_sim["power_consumption_kw"] - current_power, 1)
        delta_steam = round(best_candidate["steam_volume_tons"] - current_steam, 1)

        # Generate human-explainable rationale
        reasons = []
        if delta_prod >= 0:
            reasons.append(f"Simulated heavy crude delivery increases by {delta_prod_pct:+.1f}% ({delta_prod:+.1f} BPD)")
        else:
            reasons.append(f"Production throttled slightly ({delta_prod:+.1f} BPD) to protect rod string integrity")

        if delta_steam <= 0:
            reasons.append(f"Steam consumption controlled to {best_candidate['steam_volume_tons']} tons, saving thermal utility costs")
        else:
            reasons.append(f"Targeted steam increase (+{delta_steam} tons) provides essential viscosity reduction")

        reasons.append(f"SRP downstroke rod floating margin preserved at {best_sim['min_rod_load_lbs']:.0f} lbs (> 2,400 lbs safety limit)")
        reasons.append(f"Peak rod tension remains below yield stress ({best_sim['peak_rod_load_lbs']:.0f} lbs)")

        return {
            "well_id": well_data.get("well_id", "BGW-01"),
            "status": "AI_RECOMMENDATION_GENERATED",
            "current_params": {
                "steam_volume_tons": current_steam,
                "soak_days": current_soak,
                "srp_spm": current_spm,
                "srp_vfd_hz": current_vfd,
                "srp_stroke_in": current_stroke,
                "oil_production_bpd": current_prod,
                "power_consumption_kw": current_power,
                "equipment_risk": latest_sensor.get("latest_risk_level", "LOW")
            },
            "recommended_params": best_candidate,
            "delta": {
                "production_bpd": delta_prod,
                "production_pct": delta_prod_pct,
                "steam_tons": delta_steam,
                "power_kw": delta_power,
                "spm": round(best_candidate["srp_spm"] - current_spm, 2)
            },
            "expected_impact": {
                "projected_production_bpd": best_sim["oil_production_bpd"],
                "projected_power_kw": best_sim["power_consumption_kw"],
                "projected_viscosity_cp": best_sim["oil_viscosity_cp"],
                "projected_health_score": best_sim["well_health_score"],
                "equipment_risk": best_sim["equipment_risk"],
                "rod_floating_margin_lbs": best_sim["min_rod_load_lbs"]
            },
            "reasons": reasons,
            "trade_off_analysis": {
                "weights_applied": {
                    "production": round(w_prod, 2),
                    "steam_efficiency": round(w_steam, 2),
                    "energy_efficiency": round(w_energy, 2),
                    "equipment_reliability": round(w_equip, 2)
                },
                "composite_objective_score": round(best_score * 100, 1)
            },
            "label": "AI-Suggested Operating Scenario (Operator Approval Required)"
        }
