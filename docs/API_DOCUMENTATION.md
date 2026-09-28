# Baghewala WellTwin AI — REST API Documentation
**Smart India Hackathon 2026 | Problem Statement SIH26120**  
**Organization:** Oil India Limited  
**System Base URL:** `http://127.0.0.1:8000`  
**Interactive Swagger UI:** `http://127.0.0.1:8000/docs`  
**ReDoc Reference:** `http://127.0.0.1:8000/redoc`

---

## 1. Overview & Architecture

The Baghewala WellTwin AI API is engineered with **Python FastAPI** and provides real-time telemetry ingestion, coupled reservoir-wellbore-surface physics simulations, predictive machine learning inference, multi-objective parameter optimization, and audit logging.

### Standard Response Structure
All successful responses return JSON with standard HTTP status codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully registered or created.
- `400 Bad Request`: Validation failure or invalid parameters.
- `401 Unauthorized`: Missing or invalid credentials.
- `404 Not Found`: Entity (well, card, alert) does not exist.
- `422 Unprocessable Entity`: Schema validation error.

---

## 2. Authentication & System Status

### `GET /`
- **Description**: Root system metadata and API status.
- **Response**:
```json
{
  "system": "Baghewala WellTwin AI",
  "version": "1.0.0",
  "status": "online",
  "organization": "Oil India Limited",
  "hackathon": "Smart India Hackathon 2026",
  "problem_statement": "SIH26120",
  "docs_url": "/docs"
}
```

### `GET /health`
- **Description**: System health check verifying database and ML model readiness.
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-27T16:30:00.000Z",
  "database": "connected",
  "models_loaded": {
    "production": true,
    "temperature": true,
    "equipment_risk": true
  }
}
```

### `POST /api/auth/login`
- **Description**: Authenticate user and obtain access credentials.
- **Request Body**:
```json
{
  "username": "engineer",
  "password": "eng123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "username": "engineer",
    "name": "Field Reservoir Engineer",
    "role": "engineer",
    "permissions": ["view", "optimize", "what_if", "export"]
  }
}
```

---

## 3. Well Assets & Overview

### `GET /api/wells`
- **Description**: Returns a list of all active heavy oil wells in Baghewala field (`BGW-01` to `BGW-05`).
- **Response**:
```json
[
  {
    "well_id": "BGW-01",
    "name": "Baghewala Production Well 01",
    "status": "active",
    "reservoir_depth_m": 1050.0,
    "current_cycle": 3,
    "last_stimulation_date": "2026-08-15",
    "health_score": 88.5,
    "target_formation": "Jodhpur Sandstone"
  }
]
```

### `GET /api/wells/{well_id}`
- **Description**: Detailed telemetry, mechanical specifications, and historical parameters for a specific well.
- **Path Parameter**: `well_id` (e.g. `BGW-01`)

### `GET /api/dashboard/summary`
- **Description**: Aggregated field KPIs including total oil production, average steam-oil ratio (SOR), active alerts count, and fleet average health score.
- **Response**:
```json
{
  "field_name": "Baghewala Heavy Oil Field",
  "total_wells": 5,
  "active_wells": 5,
  "total_production_bpd": 428.4,
  "avg_sor": 3.12,
  "field_health_index": 84.6,
  "active_alerts_count": 2,
  "css_in_progress": 1
}
```

---

## 4. Digital Twin Simulation Engine

### `GET /api/digital-twin/{well_id}/state`
- **Description**: Computes the complete coupled digital twin state across reservoir, wellbore, pump, and surface facilities.
- **Response**:
```json
{
  "well_id": "BGW-01",
  "timestamp": "2026-09-27T16:30:00Z",
  "reservoir": {
    "pressure_bar": 42.5,
    "temperature_c": 118.4,
    "oil_viscosity_cp": 1420.0,
    "flow_regime": "Pseudo-steady pseudo-plastic"
  },
  "wellbore": {
    "head_pressure_bar": 14.2,
    "bottomhole_temp_c": 122.1,
    "temperature_gradient_c_per_100m": 4.1,
    "wax_asphaltene_precipitation_risk": "low"
  },
  "srp": {
    "spm": 3.2,
    "stroke_length_m": 2.4,
    "pump_fillage_pct": 89.4,
    "peak_polished_rod_load_kn": 44.2,
    "minimum_polished_rod_load_kn": 12.8,
    "rod_floating_risk": "safe",
    "gearbox_torque_pct": 68.2
  },
  "surface": {
    "flowline_temp_c": 76.5,
    "flowline_pressure_bar": 6.8,
    "flowline_viscosity_cp": 890.0,
    "emulsion_water_cut_pct": 28.0
  }
}
```

### `POST /api/digital-twin/simulate`
- **Description**: On-demand physics simulation for arbitrary wellbore and surface operational parameters.
- **Request Body**:
```json
{
  "well_id": "BGW-01",
  "steam_temp_c": 290.0,
  "steam_quality": 0.82,
  "spm": 3.5,
  "stroke_length_m": 2.4,
  "flowline_pressure_bar": 7.0
}
```

---

## 5. Cyclic Steam Stimulation (CSS) Operations

### `GET /api/css/{well_id}/cycles`
- **Description**: Returns all historical CSS injection, soak, and production cycles for a well.

### `POST /api/css/{well_id}/log-cycle`
- **Description**: Log a new CSS intervention cycle into the audit trail.
- **Request Body**:
```json
{
  "cycle_number": 4,
  "injection_volume_tons": 2400.0,
  "injection_pressure_bar": 88.0,
  "steam_quality": 0.80,
  "soak_days": 6,
  "start_date": "2026-09-01"
}
```

---

## 6. Sucker Rod Pump (SRP) & Dynacard Diagnostic Engine

### `GET /api/srp/{well_id}/dynacards/latest`
- **Description**: Returns the latest surface and downhole pump dynamometer card (position vs load) and diagnostic classification.
- **Response**:
```json
{
  "card_id": "CARD-BGW01-LATEST",
  "well_id": "BGW-01",
  "timestamp": "2026-09-27T16:00:00Z",
  "stroke_length_m": 2.4,
  "spm": 3.2,
  "diagnostic_pattern": "Normal Operation",
  "confidence_pct": 96.8,
  "rod_floating_detected": false,
  "surface_card": [
    {"position_m": 0.0, "load_kn": 14.5},
    {"position_m": 0.6, "load_kn": 38.2},
    {"position_m": 1.2, "load_kn": 42.1},
    {"position_m": 2.4, "load_kn": 44.0}
  ],
  "downhole_card": [
    {"position_m": 0.0, "load_kn": 12.0},
    {"position_m": 0.6, "load_kn": 32.0},
    {"position_m": 2.4, "load_kn": 36.5}
  ]
}
```

### `POST /api/srp/diagnose-card`
- **Description**: Upload or submit a custom dynamometer card for automated diagnostic classification.

---

## 7. Machine Learning Inferences & Explainability

### `POST /api/prediction/production`
- **Description**: Predict next 30-day oil production rate (BPD) based on current CSS cycle maturity, reservoir temperature, and SRP configuration.
- **Request Body**:
```json
{
  "well_id": "BGW-01",
  "days_since_steam": 22,
  "bottomhole_temp_c": 121.5,
  "spm": 3.2,
  "stroke_length_m": 2.4,
  "fluid_level_m": 620.0
}
```
- **Response**:
```json
{
  "predicted_oil_rate_bpd": 92.4,
  "confidence_interval": [88.1, 96.7],
  "model_mae": 2.17,
  "model_r2": 0.9997,
  "feature_importance": [
    {"feature": "bottomhole_temp_c", "contribution_pct": 42.5},
    {"feature": "days_since_steam", "contribution_pct": 28.3},
    {"feature": "spm", "contribution_pct": 18.2},
    {"feature": "fluid_level_m", "contribution_pct": 11.0}
  ]
}
```

### `POST /api/prediction/thermal-cooling`
- **Description**: Forecast reservoir and near-wellbore thermal decay over subsequent production days.

### `POST /api/prediction/equipment-risk`
- **Description**: Multi-class failure probability inference (Rod Floating, Sucker Rod Buckling, Fluid Pound, Tubing Wear).

---

## 8. What-If Simulation Sandbox

### `POST /api/what-if/simulate`
- **Description**: Run real-time comparative sandbox scenario comparing Baseline vs Proposed operational adjustments.
- **Request Body**:
```json
{
  "well_id": "BGW-01",
  "spm_delta": 0.5,
  "stroke_delta_m": 0.2,
  "steam_volume_delta_tons": 300,
  "diluent_injection_rate_m3d": 1.2
}
```
- **Response**:
```json
{
  "baseline": {
    "oil_rate_bpd": 88.0,
    "viscosity_cp": 1420.0,
    "power_consumption_kw": 18.2,
    "sor": 3.10
  },
  "proposed": {
    "oil_rate_bpd": 96.5,
    "viscosity_cp": 1180.0,
    "power_consumption_kw": 20.1,
    "sor": 2.92
  },
  "delta_production_pct": 9.66,
  "delta_net_revenue_usd_day": 485.0,
  "safety_assessment": "Safe: Wellbore stress margins within API Spec 11B limits"
}
```

---

## 9. Constrained Multi-Objective Optimization

### `POST /api/optimization/run`
- **Description**: Solve multi-objective optimization problem with user-specified objective weights and physical boundaries.
- **Request Body**:
```json
{
  "well_id": "BGW-01",
  "weights": {
    "production": 0.40,
    "steam_efficiency": 0.20,
    "energy_conservation": 0.20,
    "equipment_reliability": 0.20
  },
  "constraints": {
    "max_spm": 4.5,
    "min_spm": 1.5,
    "max_rod_stress_pct": 85.0,
    "max_steam_boiler_pressure_bar": 105.0
  }
}
```
- **Response**:
```json
{
  "optimal_parameters": {
    "recommended_spm": 3.4,
    "recommended_stroke_length_m": 2.4,
    "recommended_steam_injection_tons": 2250.0,
    "recommended_soak_days": 6
  },
  "projected_improvements": {
    "production_gain_pct": 8.4,
    "sor_reduction_pct": 6.2,
    "energy_savings_kwh_day": 34.0,
    "composite_objective_score": 91.8
  },
  "pareto_frontier": [
    {"production_bpd": 94.0, "sor": 2.95, "stress_pct": 74.0},
    {"production_bpd": 96.2, "sor": 3.05, "stress_pct": 78.5},
    {"production_bpd": 98.1, "sor": 3.20, "stress_pct": 83.2}
  ]
}
```

---

## 10. Predictive Maintenance & Asset Health

### `GET /api/maintenance/{well_id}/diagnostics`
- **Description**: Returns failure mode risk probabilities, remaining useful life (RUL) estimates, and recommended workover interventions.

### `GET /api/maintenance/composite-health/{well_id}`
- **Description**: Multi-factor composite health score (0–100) decomposed into thermal, mechanical, chemical, and hydrodynamics sub-indices with positive and negative drivers.

---

## 11. Alerts & Operational Safety Guardrails

### `GET /api/alerts`
- **Description**: Query active operational alarms, filtered by `severity` (`info`, `warning`, `critical`), `status` (`active`, `acknowledged`, `resolved`), or `well_id`.

### `POST /api/alerts/{alert_id}/acknowledge`
- **Description**: Human-in-the-loop operator acknowledgement of critical alert.
- **Request Body**:
```json
{
  "operator_username": "operator",
  "action_comment": "Inspected flowline temperature drop; dispatched technician for trace heating verification."
}
```

---

## 12. Operator Decision Workflow & Audit Log

### `POST /api/decisions/propose`
- **Description**: Propose an operational setpoint change based on digital twin recommendations.

### `POST /api/decisions/{decision_id}/approve`
- **Description**: Approves a setpoint change with digital signature, preserving full audit log.

### `GET /api/decisions/audit-trail`
- **Description**: Returns complete history of operator decisions, timestamps, approving roles, and post-intervention validation metrics.

---

## 13. Reports, Data Quality & Replay Engine

### `GET /api/data-quality/metrics`
- **Description**: Automated telemetry data validation audit (null checks, range validation, sensor drift detection, and signal noise metrics).

### `GET /api/replay/{well_id}`
- **Description**: Telemetry time-travel replay endpoint providing step-by-step playback of historical well incidents (e.g. CSS steam breakthrough or SRP rod float event).

### `POST /api/reports/generate`
- **Description**: Compiles an executive technical dossier for the well asset and returns a downloadable summary artifact or PDF structure.
