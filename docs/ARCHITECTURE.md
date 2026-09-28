# Baghewala WellTwin AI — Technical Architecture
## SIH 2026 Problem Statement ID: SIH26120 (Oil India Limited)

```
===================================================================================
                       SYSTEM ARCHITECTURE TOPOLOGY
===================================================================================

[ FIELD RTU / SCADA TELEMETRY ]
        │
        ▼
[ DATA INGESTION & DATA QUALITY MONITOR ]
  ├── Outlier / Sensor Spike Filter
  ├── Timestamp Gap Imputation
  └── Zero-Variance Stuck Sensor Detection
        │
        ▼
[ SQLITE EMBEDDED TIME-SERIES REPOSITORY (welltwin.db) ]
  ├── wells (geological & completion parameters)
  ├── sensor_readings (high-frequency telemetry)
  ├── production_history (90-day recovery curves)
  ├── srp_readings (dynacards & load dynamics)
  ├── css_cycles (steam volume, soak, cut-offs)
  └── operator_decisions (audit trails & compliance)
        │
        ▼
[ PYTHON FASTAPI INDUSTRIAL REST API LAYER ]
  ├── CORS & Middleware Gateways
  ├── Async Telemetry Stream Controllers
  └── Model Catalog Registry
        │
        ├────────────────────────┬────────────────────────┐
        ▼                        ▼                        ▼
[ DIGITAL TWIN ENGINE ]   [ AI / ML PIPELINE ]    [ OPTIMIZATION ENGINE ]
  ├── Walther Viscosity     ├── RandomForest Reg    ├── Constrained Pareto
  │   Coupling              │   (Production BPD)    ├── Production (40%)
  ├── Vogel Heavy Crude     ├── GradientBoosting    ├── Steam Utility (20%)
  │   IPR Deliverability    │   (Reservoir Cooling) ├── Lifting Energy (20%)
  ├── SRP Beam Mechanics    └── RandomForest Clf    └── Rod Reliability (20%)
  │   (PPRL / MPRL)             (Failure Risk)          (Floating Margin >2400)
  └── Rod Floating Margin
        │
        ▼
[ REACT 19 + TYPESCRIPT + TAILWIND CSS INDUSTRIAL UI ]
  ├── 2D Well-to-Surface Interactive Digital Twin SVG
  ├── Dynamometer Cards (Surface & Pump Dynacards via Recharts)
  ├── Multi-Parameter Virtual What-If Sandbox
  ├── AI Feature Importance / Explainability Attributions
  ├── Real-Time Simulation Stream Controls (Start/Pause/Reset)
  ├── Alarm Triage & Smart Alert Engine
  ├── Longitudinal Analytics (7d / 30d / 90d)
  ├── Multi-Channel Replay Mode (1h / 6h / 24h)
  └── Operator Decision Center (Human-in-the-Loop Sign-off)
```

---

### Key Architectural Characteristics
1. **Zero External Paid APIs**: Runs 100% locally on standard Windows hardware without cloud dependencies or subscription APIs.
2. **Coupled Thermo-Mechanical Physics**: Reservoir thermal decay directly drives dynamic fluid viscosity, which in turn decelerates sucker rod downstroke velocity (rod floating risk).
3. **True Model Validation**: Computes actual Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R² on test splits.
4. **Human-in-the-Loop Protocol**: Direct physical well actuation is disabled by design. Suggestions require manual review and digital sign-off by asset engineers.
