// Baghewala WellTwin AI - TypeScript Definitions

export interface Well {
  well_id: string;
  name: string;
  field: string;
  formation: string;
  reservoir_depth_m: number;
  api_gravity: number;
  asphaltene_pct: number;
  initial_res_temp_c: number;
  initial_res_pressure_bar: number;
  current_status: string;
  current_css_cycle: number;
  srp_type: string;
  surface_unit: string;
  latitude?: number;
  longitude?: number;
  latest_oil_bpd?: number;
  latest_temp_c?: number;
  latest_viscosity_cp?: number;
  latest_health_score?: number;
  latest_risk_level?: string;
  alert_count?: number;
}

export interface KpiMetric {
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OPTIMAL' | 'STABLE' | 'ATTENTION';
}

export interface HealthScoreBreakdown {
  total_score: number;
  label: string;
  positive_factors: Array<{ factor: string; detail: string }>;
  negative_factors: Array<{ factor: string; detail: string }>;
  category_scores: {
    production: number;
    thermal: number;
    pump_mechanics: number;
    structural_safety: number;
  };
  note: string;
}

export interface DashboardData {
  well_id: string;
  well_name: string;
  field: string;
  field_status: {
    monitored_wells: number;
    active_wells: number;
    total_field_production_bpd: number;
    total_field_power_kw: number;
    overall_field_risk: string;
  };
  kpis: {
    production_rate: KpiMetric;
    reservoir_temperature: KpiMetric;
    reservoir_pressure: KpiMetric;
    steam_injection_rate: KpiMetric;
    srp_spm: KpiMetric;
    srp_efficiency: KpiMetric;
    equipment_health: KpiMetric;
    energy_consumption: KpiMetric;
    oil_viscosity: KpiMetric;
  };
  health_score: HealthScoreBreakdown;
  ai_insight: {
    title: string;
    type: 'ALERT' | 'WARNING' | 'OPTIMAL' | 'INFO';
    text: string;
    generated_at: string;
  };
  timeline_events: Array<{
    time: string;
    event: string;
    type: string;
    detail: string;
  }>;
  prototype_disclaimer: string;
}

export interface DigitalTwinState {
  well_id: string;
  well_name: string;
  timestamp: string;
  formation: string;
  depth_m: number;
  reservoir: {
    temperature_c: number;
    pressure_bar: number;
    viscosity_cp: number;
    native_temp_c: number;
    native_pressure_bar: number;
    thermal_plume_radius_m: number;
    fluid_regime: string;
    status: string;
  };
  wellbore: {
    casing_dia_in: number;
    tubing_dia_in: number;
    bottomhole_temp_c: number;
    wellhead_temp_c: number;
    wellhead_pressure_bar: number;
    perforation_interval_m: string;
    steam_injection_status: string;
  };
  srp: {
    surface_unit: string;
    rod_string_taper: string;
    stroke_length_in: number;
    spm: number;
    vfd_speed_hz: number;
    peak_polished_rod_load_lbs: number;
    min_polished_rod_load_lbs: number;
    rod_floating_margin_lbs: number;
    rod_floating_risk: string;
    pump_fillage_pct: number;
    pump_efficiency_pct: number;
    card_type: string;
    rod_fall_velocity_fps: number;
  };
  surface: {
    oil_production_bpd: number;
    water_cut_pct: number;
    gas_rate_mscfd: number;
    power_consumption_kw: number;
    surface_flowline_temp_c: number;
    flowline_viscosity_cp: number;
  };
  physics_coupling: {
    thermal_viscosity_rule: string;
    viscosity_rod_drag_rule: string;
    steam_production_response: string;
  };
  simulation_disclaimer: string;
}

export interface DynacardPoint {
  pos: number;
  load: number;
}

export interface SrpOperationsData {
  well_id: string;
  well_name: string;
  surface_unit: string;
  srp_type: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  status_message: string;
  parameters: {
    stroke_length_in: number;
    spm: number;
    vfd_speed_hz: number;
    peak_polished_rod_load_lbs: number;
    min_polished_rod_load_lbs: number;
    gearbox_torque_pct: number;
    motor_current_amps: number;
    pump_fillage_pct: number;
    pump_displacement_bpd: number;
    fluid_load_lbs: number;
    rod_stress_psi: number;
    card_type: string;
  };
  dynacards: {
    surface_card: DynacardPoint[];
    pump_card: DynacardPoint[];
    card_classification: string;
  };
  load_trend_history: Array<{
    timestamp: string;
    peak_polished_rod_load_lbs: number;
    min_polished_rod_load_lbs: number;
    pump_fillage_pct: number;
    spm: number;
    vfd_speed_hz: number;
  }>;
}

export interface CssOperationsData {
  well_id: string;
  well_name: string;
  current_cycle: any;
  parameters_comparison: Array<{
    parameter_name: string;
    unit: string;
    current_value: number;
    recommended_value: number;
    difference: number;
    expected_impact: string;
  }>;
  cycle_phases: Array<{
    stage_id: string;
    name: string;
    duration: string;
    target: string;
    description: string;
    is_current: boolean;
    is_completed: boolean;
  }>;
  historical_cycles: any[];
  oil_steam_ratio: number;
  cumulative_steam_tons: number;
  cumulative_oil_bbl: number;
}

export interface PredictionData {
  well_id: string;
  horizon_days: number;
  predicted_oil_bpd: number;
  predicted_res_temp_c: number;
  predicted_viscosity_cp: number;
  cooling_rate_c_day: number;
  predicted_pump_eff_pct: number;
  predicted_equipment_risk: string;
  rod_failure_risk_pct: number;
  model_name: string;
  model_confidence_pct: number;
  mae: number;
  rmse: number;
  r2: number;
  top_factors: Array<{
    feature: string;
    display_name: string;
    importance_pct: number;
  }>;
  trend_forecast: Array<{
    day: number;
    projected_temp_c: number;
    projected_prod_bpd: number;
    cooling_loss_c: number;
  }>;
  disclaimer: string;
}

export interface WhatIfOutput {
  oil_production_bpd: number;
  reservoir_temp_c: number;
  oil_viscosity_cp: number;
  steam_consumption_tons: number;
  power_consumption_kw: number;
  equipment_risk: string;
  rod_floating_risk_pct: number;
  pump_eff_pct: number;
  peak_rod_load_lbs: number;
  min_rod_load_lbs: number;
  well_health_score: number;
}

export interface WhatIfResponse {
  well_id: string;
  current: WhatIfOutput;
  proposed: WhatIfOutput;
  delta_percentage: {
    production_bpd: number;
    steam_consumption: number;
    power_consumption: number;
    well_health_score: number;
    viscosity_cp: number;
  };
  summary_verdict: string;
  is_safe_to_operate: boolean;
  warnings: string[];
}

export interface OptimizationResponse {
  well_id: string;
  status: string;
  current_params: any;
  recommended_params: any;
  delta: any;
  expected_impact: any;
  reasons: string[];
  trade_off_analysis: any;
  label: string;
}

export interface AlertItem {
  id: number;
  well_id: string;
  timestamp: string;
  category: 'INFO' | 'WARNING' | 'CRITICAL';
  parameter: string;
  current_value: string;
  threshold: string;
  reason: string;
  suggested_action: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledged_by?: string;
  resolved_at?: string;
}

export interface UserProfile {
  username: string;
  name: string;
  role: 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER';
  title: string;
  department: string;
  permissions: Record<string, boolean>;
}
