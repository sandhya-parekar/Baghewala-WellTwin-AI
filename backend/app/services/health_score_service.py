"""
Baghewala WellTwin AI - Well Health Score Service
Calculates a 0-100 composite prototype score and provides explainable contributing factors.
"""

from typing import Dict, Any, List

def calculate_health_score(
    prod_bpd: float,
    temp_c: float,
    pump_eff_pct: float,
    pprl_lbs: float,
    mprl_lbs: float,
    rod_stress_psi: float
) -> Dict[str, Any]:
    """
    Computes prototype composite health score and identifies positive and negative drivers.
    """
    score = 100.0
    positive_factors = []
    negative_factors = []

    # 1. Production Performance (Target 90 - 150 BPD for Baghewala heavy oil wells)
    if prod_bpd >= 115.0:
        positive_factors.append({"factor": "Oil Production", "detail": f"Robust rate at {prod_bpd:.1f} BPD (+5)"})
        score += 3.0
    elif prod_bpd >= 85.0:
        positive_factors.append({"factor": "Oil Production", "detail": f"Stable commercial flow at {prod_bpd:.1f} BPD"})
    elif prod_bpd >= 50.0:
        negative_factors.append({"factor": "Low Production", "detail": f"Sub-optimal delivery at {prod_bpd:.1f} BPD (-12)"})
        score -= 12.0
    else:
        negative_factors.append({"factor": "Critical Low Production", "detail": f"Marginal or restricted inflow at {prod_bpd:.1f} BPD (-24)"})
        score -= 24.0

    # 2. Reservoir Thermal Condition (Target 75 - 130 °C)
    if 85.0 <= temp_c <= 135.0:
        positive_factors.append({"factor": "Thermal Profile", "detail": f"Well temperature at {temp_c:.1f} °C maintains low viscosity"})
    elif temp_c > 135.0:
        negative_factors.append({"factor": "High Steam Heat", "detail": f"High thermal exposure ({temp_c:.1f} °C) induces thermal expansion stress (-4)"})
        score -= 4.0
    elif temp_c >= 70.0:
        negative_factors.append({"factor": "Cooling Trend", "detail": f"Moderate cooling at {temp_c:.1f} °C increasing viscosity (-8)"})
        score -= 8.0
    else:
        negative_factors.append({"factor": "Severe Well Cooling", "detail": f"Critical cooling at {temp_c:.1f} °C: viscosity exceeds 1800 cP (-20)"})
        score -= 20.0

    # 3. SRP Pump Volumetric Efficiency (Target > 75%)
    if pump_eff_pct >= 82.0:
        positive_factors.append({"factor": "Pump Volumetric Efficiency", "detail": f"High efficiency at {pump_eff_pct:.1f}% indicates complete fillage"})
    elif pump_eff_pct >= 70.0:
        positive_factors.append({"factor": "Pump Efficiency", "detail": f"Nominal operation at {pump_eff_pct:.1f}%"})
    elif pump_eff_pct >= 55.0:
        negative_factors.append({"factor": "Pump Fillage Deficit", "detail": f"Volumetric slip / incomplete fillage ({pump_eff_pct:.1f}%) (-12)"})
        score -= 12.0
    else:
        negative_factors.append({"factor": "Severe Pump Degradation", "detail": f"Critical low efficiency ({pump_eff_pct:.1f}%): gas lock or fluid pound risk (-22)"})
        score -= 22.0

    # 4. Rod String Mechanics & Floating Margin (Minimum Polished Rod Load)
    if mprl_lbs < 2000.0:
        negative_factors.append({"factor": "Rod Floating Hazard", "detail": f"Downstroke load at {mprl_lbs:.0f} lbs creates severe buckling risk (-25)"})
        score -= 25.0
    elif mprl_lbs < 2800.0:
        negative_factors.append({"factor": "Low Downstroke Margin", "detail": f"Downstroke tension margin narrow ({mprl_lbs:.0f} lbs) (-10)"})
        score -= 10.0
    else:
        positive_factors.append({"factor": "Rod Fall Margin", "detail": f"Downstroke tension healthy ({mprl_lbs:.0f} lbs)"})

    # 5. Peak Polished Rod Load & Tensile Stress
    if pprl_lbs > 21500.0:
        negative_factors.append({"factor": "Peak Load Overload", "detail": f"Polished rod peak tension ({pprl_lbs:.0f} lbs) exceeds 90% yield (-18)"})
        score -= 18.0
    elif pprl_lbs > 19000.0:
        negative_factors.append({"factor": "Elevated Peak Load", "detail": f"Upstroke tension ({pprl_lbs:.0f} lbs) elevated due to heavy fluid column (-7)"})
        score -= 7.0
    else:
        positive_factors.append({"factor": "Mechanical Integrity", "detail": f"Peak rod load within safe envelope ({pprl_lbs:.0f} lbs)"})

    final_score = max(min(round(score, 1), 100.0), 12.0)

    category_scores = {
        "production": round(max(min(prod_bpd / 1.5, 100.0), 10.0), 1),
        "thermal": round(max(min((temp_c - 50.0) * 1.4, 100.0), 15.0), 1),
        "pump_mechanics": round(max(min(pump_eff_pct, 100.0), 10.0), 1),
        "structural_safety": round(max(min((mprl_lbs / 4500.0) * 100.0, 100.0), 10.0), 1),
    }

    label = "OPTIMAL" if final_score >= 85 else ("STABLE" if final_score >= 70 else ("ATTENTION" if final_score >= 50 else "CRITICAL"))

    return {
        "total_score": final_score,
        "label": label,
        "positive_factors": positive_factors,
        "negative_factors": negative_factors,
        "category_scores": category_scores,
        "note": "Prototype Composite Score for decision-support only. Not a certified field KPI."
    }
