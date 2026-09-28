# Smart India Hackathon 2026 — Problem Statement Mapping
## Problem Statement ID: SIH26120
**Organization**: Oil India Limited  
**Project Name**: Baghewala WellTwin AI  
**Challenge**: Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field.

---

### Comprehensive Problem-to-Solution Implementation Matrix

| # | Problem Component | Core Industrial Challenge | Baghewala WellTwin AI Implementation | Exact Application Module |
|---|---|---|---|---|
| **1** | **Heavy Crude Oil / Extreme Viscosity** | Native crude viscosity is 1500–5000+ cP at low reservoir temp (~60°C), impeding fluid movement and causing immense friction. | Walther-Arrhenius thermo-viscosity coupling engine calculates real-time viscosity decay from downhole temperature telemetry. | `Digital Twin`, `Live Monitoring`, `Dashboard` |
| **2** | **Interconnected CSS & SRP Operations** | Operators adjust steam injection and beam pumping independently, causing pump unsetting, rod floating, or thermal shock. | Integrated Well-to-Surface Digital Twin models the multi-physics link between steam soak heat dissipation, fluid mobility, and pump displacement. | `Digital Twin`, `CSS Monitoring`, `SRP Monitoring` |
| **3** | **Cyclic Steam Stimulation (CSS) Optimization** | Over-injection wastes steam & fuel; premature production cut-off leaves heavy crude cold, leading to viscous drag. | Evaluates steam volume (tons), injection pressure (bar), soak duration (days), and production cut-off temp (°C). | `CSS Monitoring`, `Multi-Objective Optimization` |
| **4** | **Sucker Rod Pump (SRP) Dynamics & Dynacards** | Viscous drag decelerates downstroke fall rate, creating rod floating, compression buckling, and impact loading. | Dynacard simulation (Surface & Pump cards), Peak & Minimum Polished Rod Load surveillance, and VFD speed tuning. | `SRP Monitoring`, `Predictive Maintenance` |
| **5** | **AI-Enabled Production Forecasting** | Heavy oil production decline post-soak is non-linear and coupled to thermal conductivity of rock matrix. | Random Forest & Gradient Boosting regression pipelines trained on physical parameters with real validation metrics (MAE, RMSE, R²). | `AI Prediction` |
| **6** | **Reservoir Cooling & Viscosity Rise Prediction** | Matrix heat dissipation reduces sandface flowability over time. | Thermal decay modeling predicts future reservoir cooling rate (°C/day) and optimal turnaround day for the next CSS cycle. | `AI Prediction`, `CSS Monitoring` |
| **7** | **Multi-Objective Optimization** | Maximizing production alone destroys rod string life and incurs excessive steam & power consumption. | Constrained Pareto optimization balancing: Production (40%), Steam efficiency (20%), Energy efficiency (20%), Reliability (20%). | `Multi-Objective Optimization` |
| **8** | **Predictive Maintenance & Rod Floating Prevention** | Undetected compressive downstroke loads lead to parted rod strings and expensive workover interventions. | Diagnostic engine detecting: Rod Floating Margin, Peak Tension Overload, Impact Loading / Fluid Pound, and Stuffing Box wear. | `Predictive Maintenance`, `Smart Alert Engine` |
| **9** | **Virtual What-If Simulation** | Testing operating parameters on live wells carries high risk. | Sandbox simulator allowing operators to adjust CSS steam/pressure and SRP SPM/stroke/VFD and observe simulated responses. | `What-If Simulator`, `Scenario Comparison` |
| **10** | **Human-in-the-Loop Decision Support** | Fully autonomous actuation on oil wells violates safety and environmental risk standards. | Operator Decision Center with explicit review workflows ("Review Recommendation", "Accept for Planning", "Reject"). | `Operator Decision Center`, `Safety Banner` |

---

### Technical Credibility & Non-Autonomous Guardrails
- **Human-in-the-Loop Principle**: System provides "AI-Suggested Operating Scenarios". Operational review and physical sign-off are strictly enforced.
- **Physical Grounding**: Viscosity, rod loads, and thermal dissipation are derived from heavy crude reservoir physics rather than arbitrary black-box outputs.
- **Prototype Transparency**: Clearly marked as "Simulated / Prototype Data" to ensure ethical engineering integrity.
