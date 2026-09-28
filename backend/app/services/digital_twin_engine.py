"""
Baghewala WellTwin AI - Digital Twin Simulation Engine
Implements physics-coupled well-to-surface modeling for heavy crude operations:
- Cyclic Steam Stimulation (CSS) heat injection & dissipation
- Arrhenius-Walther temperature-viscosity relationship
- Sucker Rod Pump (SRP) kinematics and polished rod load dynamics
- Rod floating risk & downhole friction quantification
"""

import math
import json
import random
from typing import Dict, Any, Tuple, List

class DigitalTwinEngine:
    """
    Simulates integrated wellbore, reservoir, and surface lifting dynamics.
    Calibrated for typical Baghewala crude properties (~16-18 API, high asphaltene).
    """

    @staticmethod
    def calculate_viscosity(temp_c: float, api_gravity: float = 17.2, asphaltene_pct: float = 14.2) -> float:
        """
        Walther-Arrhenius heavy oil dynamic viscosity model.
        Returns viscosity in centipoise (cP).
        """
        t_k = max(temp_c + 273.15, 273.15)
        t_ref_k = 60.0 + 273.15
        # Asphaltene aggregates amplify viscosity at low temperatures
        asphaltene_factor = 1.0 + (asphaltene_pct - 10.0) * 0.08
        mu_ref = 3400.0 * ((17.5 / max(api_gravity, 12.0)) ** 2.2) * asphaltene_factor
        activation_energy_b = 4850.0

        mu = mu_ref * math.exp(activation_energy_b * (1.0 / t_k - 1.0 / t_ref_k))
        return max(round(mu, 1), 8.0)

    @staticmethod
    def calculate_srp_mechanics(
        stroke_in: float,
        spm: float,
        vfd_hz: float,
        viscosity_cp: float,
        depth_m: float = 1040.0,
        plunger_dia_in: float = 2.25
    ) -> Dict[str, Any]:
        """
        Calculates rod string loads, power consumption, pump displacement, and rod floating margin.
        """
        if spm <= 0 or stroke_in <= 0:
            return {
                "pump_displacement_bpd": 0.0,
                "pump_eff_pct": 0.0,
                "pprl_lbs": 0.0,
                "mprl_lbs": 0.0,
                "rod_floating_margin_lbs": 5000.0,
                "rod_stress_psi": 0.0,
                "power_consumption_kw": 0.0,
                "equipment_risk": "LOW",
                "rod_floating_risk_pct": 0.0
            }

        # Plunger displacement
        displacement_bpd = 0.1166 * (plunger_dia_in ** 2) * stroke_in * spm

        # Pump efficiency degrades with extreme viscosity (valve delay & viscous slip)
        visc_penalty = max(0.0, (math.log10(max(viscosity_cp, 10.0)) - 1.7) * 22.0)
        pump_eff_pct = max(min(90.0 - visc_penalty, 94.0), 32.0)

        # Rod string buoyant weight (approx 1.8 lbs/ft for API Grade D taper)
        depth_ft = depth_m * 3.28084
        rod_weight_air = depth_ft * 1.82
        buoyant_factor = 0.865
        rod_weight_buoyant = rod_weight_air * buoyant_factor

        # Fluid column load
        fluid_head_psi = depth_ft * 0.433 * 0.95
        plunger_area = (math.pi / 4.0) * (plunger_dia_in ** 2)
        fluid_load = fluid_head_psi * plunger_area * (pump_eff_pct / 100.0)

        # Dynamic friction drag on rod string in heavy crude
        # Drag increases with viscosity, rod velocity (SPM * stroke), and rod area
        rod_vel_fps = (2.0 * (stroke_in / 12.0) * spm) / 60.0
        viscous_friction_lbs = (viscosity_cp / 8.5) * (spm / 5.5) * (rod_vel_fps / 1.5)
        viscous_friction_lbs = min(viscous_friction_lbs, 6500.0)

        # Inertial acceleration factor
        accel_factor = (stroke_in * (spm ** 2)) / 70500.0

        # Peak Polished Rod Load (Upstroke)
        pprl_lbs = rod_weight_buoyant * (1.0 + accel_factor) + fluid_load + viscous_friction_lbs

        # Minimum Polished Rod Load (Downstroke)
        # On downstroke, fluid friction acts UPWARD opposing gravity, reducing tension!
        mprl_lbs = rod_weight_buoyant * (1.0 - accel_factor) - viscous_friction_lbs

        # Rod floating margin
        rod_floating_margin = mprl_lbs
        rod_floating_risk_pct = 0.0
        if mprl_lbs < 1800:
            rod_floating_risk_pct = 95.0
            risk_level = "CRITICAL"
        elif mprl_lbs < 2600:
            rod_floating_risk_pct = 65.0
            risk_level = "HIGH"
        elif mprl_lbs < 3600 or pprl_lbs > 19500:
            rod_floating_risk_pct = 35.0
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Rod stress on top 7/8" rod
        rod_stress_psi = pprl_lbs / 0.6013

        # Hydraulic and motor power
        hydraulic_hp = (pprl_lbs * (stroke_in / 12.0) * spm) / 33000.0
        motor_kw = (hydraulic_hp / 0.68) * 0.746 + 3.8

        return {
            "pump_displacement_bpd": round(displacement_bpd, 1),
            "pump_eff_pct": round(pump_eff_pct, 1),
            "pprl_lbs": round(pprl_lbs, 1),
            "mprl_lbs": round(mprl_lbs, 1),
            "rod_floating_margin_lbs": round(rod_floating_margin, 1),
            "rod_stress_psi": round(rod_stress_psi, 1),
            "power_consumption_kw": round(motor_kw, 1),
            "equipment_risk": risk_level,
            "rod_floating_risk_pct": round(rod_floating_risk_pct, 1)
        }

    @staticmethod
    def simulate_what_if(
        well_data: Dict[str, Any],
        steam_volume_tons: float,
        injection_pressure_bar: float,
        soak_days: int,
        production_cutoff_temp_c: float,
        srp_stroke_in: float,
        srp_spm: float,
        srp_vfd_hz: float
    ) -> Dict[str, Any]:
        """
        Calculates interconnected CSS and SRP operational response.
        """
        api = well_data.get("api_gravity", 17.2)
        native_t = well_data.get("initial_res_temp_c", 61.8)
        native_p = well_data.get("initial_res_pressure_bar", 98.4)

        # Thermal response from steam volume and pressure
        # Specific enthalpy of steam ~ 2700 kJ/kg
        nominal_steam = 2400.0
        steam_ratio = steam_volume_tons / nominal_steam
        
        # Soak effectiveness: optimal soak is 4 to 6 days
        # Too short (< 3 days): heat channel not diffused
        # Too long (> 8 days): excessive overburden conductive heat loss
        soak_penalty = 1.0 - abs(soak_days - 5.0) * 0.04
        soak_penalty = max(min(soak_penalty, 1.05), 0.75)

        # Resulting reservoir near-wellbore temperature
        delta_temp = 55.0 * (steam_ratio ** 0.65) * (injection_pressure_bar / 95.0) ** 0.3 * soak_penalty
        sim_temp = min(native_t + delta_temp, 165.0)

        # Viscosity response
        sim_visc = DigitalTwinEngine.calculate_viscosity(sim_temp, api)

        # SRP response
        srp_res = DigitalTwinEngine.calculate_srp_mechanics(
            stroke_in=srp_stroke_in,
            spm=srp_spm,
            vfd_hz=srp_vfd_hz,
            viscosity_cp=sim_visc,
            depth_m=well_data.get("reservoir_depth_m", 1040.0)
        )

        # Oil production delivery
        # Heavy oil inflow is inversely related to viscosity and directly related to drawdown
        inflow_potential = 220.0 * (120.0 / (sim_visc ** 0.42))
        production_bpd = min(srp_res["pump_displacement_bpd"] * (srp_res["pump_eff_pct"] / 100.0), inflow_potential)
        production_bpd = round(max(production_bpd, 0.0), 1)

        # Composite health score
        from app.services.health_score_service import calculate_health_score
        health = calculate_health_score(
            prod_bpd=production_bpd,
            temp_c=sim_temp,
            pump_eff_pct=srp_res["pump_eff_pct"],
            pprl_lbs=srp_res["pprl_lbs"],
            mprl_lbs=srp_res["mprl_lbs"],
            rod_stress_psi=srp_res["rod_stress_psi"]
        )

        return {
            "oil_production_bpd": production_bpd,
            "reservoir_temp_c": round(sim_temp, 1),
            "oil_viscosity_cp": round(sim_visc, 1),
            "steam_consumption_tons": round(steam_volume_tons, 1),
            "power_consumption_kw": srp_res["power_consumption_kw"],
            "equipment_risk": srp_res["equipment_risk"],
            "rod_floating_risk_pct": srp_res["rod_floating_risk_pct"],
            "pump_eff_pct": srp_res["pump_eff_pct"],
            "peak_rod_load_lbs": srp_res["pprl_lbs"],
            "min_rod_load_lbs": srp_res["mprl_lbs"],
            "well_health_score": health["total_score"]
        }
