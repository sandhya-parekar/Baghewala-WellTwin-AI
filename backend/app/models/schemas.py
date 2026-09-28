"""
Baghewala WellTwin AI - Pydantic Data Models & Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Well Schemas ---
class WellBase(BaseModel):
    well_id: str
    name: str
    field: str
    formation: str
    reservoir_depth_m: float
    api_gravity: float
    asphaltene_pct: float
    initial_res_temp_c: float
    initial_res_pressure_bar: float
    current_status: str
    current_css_cycle: int
    srp_type: str
    surface_unit: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WellDetail(WellBase):
    latest_oil_bpd: Optional[float] = None
    latest_temp_c: Optional[float] = None
    latest_viscosity_cp: Optional[float] = None
    latest_health_score: Optional[float] = None
    latest_risk_level: Optional[str] = "LOW"
    alert_count: int = 0

# --- Sensor Schemas ---
class SensorReading(BaseModel):
    id: Optional[int] = None
    well_id: str
    timestamp: str
    reservoir_temp_c: float
    reservoir_pressure_bar: float
    bottomhole_temp_c: float
    wellhead_temp_c: float
    wellhead_pressure_bar: float
    steam_injection_rate_tpd: float
    steam_pressure_bar: float
    steam_temperature_c: float
    oil_production_bpd: float
    water_cut_pct: float
    gas_rate_mscfd: float
    oil_viscosity_cp: float
    srp_spm: float
    srp_stroke_in: float
    srp_vfd_hz: float
    srp_peak_load_lbs: float
    srp_min_load_lbs: float
    srp_efficiency_pct: float
    power_consumption_kw: float
    health_score: float

# --- Production & CSS Schemas ---
class ProductionHistoryItem(BaseModel):
    date: str
    oil_bpd: float
    cumulative_oil_bbl: float
    water_bpd: float
    steam_injected_tons: float
    cum_steam_tons: float
    oil_steam_ratio: float
    avg_temp_c: float
    avg_pressure_bar: float
    srp_uptime_pct: float
    energy_kwh: float

class CssCycleItem(BaseModel):
    id: Optional[int] = None
    well_id: str
    cycle_number: int
    start_date: str
    end_date: Optional[str] = None
    current_phase: str
    steam_volume_tons: float
    steam_quality_pct: float
    injection_pressure_bar: float
    soak_days: int
    peak_temp_c: float
    cum_oil_produced_bbl: float
    oil_steam_ratio: float
    cut_off_temp_c: float
    status: str

# --- SRP & Dynacard Schemas ---
class DynacardPoint(BaseModel):
    pos: float
    load: float

class SrpReadingDetail(BaseModel):
    id: Optional[int] = None
    well_id: str
    timestamp: str
    stroke_length_in: float
    spm: float
    vfd_speed_hz: float
    peak_polished_rod_load_lbs: float
    min_polished_rod_load_lbs: float
    gearbox_torque_pct: float
    motor_current_amps: float
    pump_fillage_pct: float
    pump_displacement_bpd: float
    fluid_load_lbs: float
    rod_stress_psi: float
    dynacard_surface: List[DynacardPoint] = []
    dynacard_pump: List[DynacardPoint] = []
    card_type: str
    status: str

# --- AI Prediction Schemas ---
class PredictionRequest(BaseModel):
    well_id: str
    horizon_days: int = 14
    spm: Optional[float] = None
    vfd_hz: Optional[float] = None
    steam_volume_tons: Optional[float] = None
    soak_days: Optional[int] = None

class FeatureImportanceItem(BaseModel):
    feature: str
    display_name: Optional[str] = None
    importance_pct: float

class PredictionResponse(BaseModel):
    well_id: str
    horizon_days: int
    predicted_oil_bpd: float
    predicted_res_temp_c: float
    predicted_viscosity_cp: float
    cooling_rate_c_day: float
    predicted_pump_eff_pct: float
    predicted_equipment_risk: str
    rod_failure_risk_pct: float
    model_name: str
    model_confidence_pct: float
    mae: float
    rmse: float
    r2: float
    top_factors: List[FeatureImportanceItem] = []
    trend_forecast: List[Dict[str, Any]] = []
    disclaimer: str = "Prototype AI Prediction Model based on simulated heavy oil physics. Operator verification required."

# --- Optimization Schemas ---
class OptimizationWeights(BaseModel):
    production_weight: float = Field(0.40, ge=0.0, le=1.0)
    steam_efficiency_weight: float = Field(0.20, ge=0.0, le=1.0)
    energy_efficiency_weight: float = Field(0.20, ge=0.0, le=1.0)
    equipment_reliability_weight: float = Field(0.20, ge=0.0, le=1.0)

class OptimizationRequest(BaseModel):
    well_id: str
    weights: OptimizationWeights = Field(default_factory=OptimizationWeights)
    constraints: Optional[Dict[str, Any]] = None

class OptimizationResponse(BaseModel):
    well_id: str
    status: str = "OPTIMIZATION_SUGGESTION_READY"
    current_params: Dict[str, Any]
    recommended_params: Dict[str, Any]
    delta: Dict[str, Any]
    expected_impact: Dict[str, Any]
    reasons: List[str]
    trade_off_analysis: Dict[str, Any]
    label: str = "AI-Suggested Operating Scenario (Human-in-the-loop review mandatory)"

# --- What-If Simulation Schemas ---
class WhatIfRequest(BaseModel):
    well_id: str
    steam_volume_tons: float
    injection_pressure_bar: float
    soak_days: int
    production_cutoff_temp_c: float
    srp_stroke_in: float
    srp_spm: float
    srp_vfd_hz: float

class SimulationOutputItem(BaseModel):
    oil_production_bpd: float
    reservoir_temp_c: float
    oil_viscosity_cp: float
    steam_consumption_tons: float
    power_consumption_kw: float
    equipment_risk: str
    rod_floating_risk_pct: float
    pump_eff_pct: float
    peak_rod_load_lbs: float
    min_rod_load_lbs: float
    well_health_score: float

class WhatIfResponse(BaseModel):
    well_id: str
    current: SimulationOutputItem
    proposed: SimulationOutputItem
    delta_percentage: Dict[str, float]
    summary_verdict: str
    is_safe_to_operate: bool
    warnings: List[str] = []

# --- Alert Schemas ---
class AlertItem(BaseModel):
    id: int
    well_id: str
    timestamp: str
    category: str
    parameter: str
    current_value: str
    threshold: str
    reason: str
    suggested_action: str
    status: str
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    operator_name: str = "Field Operator"
    action: str = "ACKNOWLEDGE" # or "RESOLVE"

# --- Maintenance Schemas ---
class MaintenanceEventItem(BaseModel):
    id: int
    well_id: str
    timestamp: str
    pattern_name: str
    risk_level: str
    affected_component: str
    diagnostic_reason: str
    recommended_inspection: str
    status: str

# --- Scenario & Operator Decision Schemas ---
class ScenarioCreateRequest(BaseModel):
    well_id: str
    scenario_name: str
    strategy_type: str
    parameters: Dict[str, Any]
    simulated_outputs: Dict[str, Any]
    well_health_score: float
    notes: Optional[str] = None

class OperatorDecisionRequest(BaseModel):
    well_id: str
    scenario_or_rec_id: str
    action: str # ACCEPTED_FOR_PLANNING, REJECTED, MODIFIED
    operator_name: str
    operator_role: str
    rationale: str
    parameters: Dict[str, Any]
    notes: Optional[str] = None

# --- Explanations & Quality ---
class HealthScoreBreakdown(BaseModel):
    well_id: str
    total_score: float
    label: str
    positive_factors: List[Dict[str, str]]
    negative_factors: List[Dict[str, str]]
    category_scores: Dict[str, float]

class RootCauseFactor(BaseModel):
    factor_name: str
    contribution_pct: float
    direction: str # "DECREASING" or "INCREASING"
    impact_description: str

class RootCauseResponse(BaseModel):
    well_id: str
    event_timestamp: str
    production_drop_bpd: float
    primary_driver: str
    confidence_pct: float
    factors: List[RootCauseFactor]
    physics_explanation: str
    recommended_mitigation: str
    disclaimer: str

class DataQualitySummary(BaseModel):
    quality_score: float
    total_records_analyzed: int
    missing_values_count: int
    outliers_detected_count: int
    sensor_gaps_count: int
    duplicate_records_count: int
    sensor_health_breakdown: Dict[str, Dict[str, Any]]
    recommendations: List[str]
