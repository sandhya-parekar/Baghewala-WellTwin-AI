"""
Baghewala WellTwin AI - SQLite Database Initialization
Defines database schemas and table structures for the digital twin system.
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "welltwin.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Wells Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wells (
        well_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        field TEXT NOT NULL,
        formation TEXT NOT NULL,
        reservoir_depth_m REAL NOT NULL,
        api_gravity REAL NOT NULL,
        asphaltene_pct REAL NOT NULL,
        initial_res_temp_c REAL NOT NULL,
        initial_res_pressure_bar REAL NOT NULL,
        current_status TEXT NOT NULL,
        current_css_cycle INTEGER NOT NULL,
        srp_type TEXT NOT NULL,
        surface_unit TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Sensor Readings (High-frequency time-series)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        reservoir_temp_c REAL NOT NULL,
        reservoir_pressure_bar REAL NOT NULL,
        bottomhole_temp_c REAL NOT NULL,
        wellhead_temp_c REAL NOT NULL,
        wellhead_pressure_bar REAL NOT NULL,
        steam_injection_rate_tpd REAL NOT NULL,
        steam_pressure_bar REAL NOT NULL,
        steam_temperature_c REAL NOT NULL,
        oil_production_bpd REAL NOT NULL,
        water_cut_pct REAL NOT NULL,
        gas_rate_mscfd REAL NOT NULL,
        oil_viscosity_cp REAL NOT NULL,
        srp_spm REAL NOT NULL,
        srp_stroke_in REAL NOT NULL,
        srp_vfd_hz REAL NOT NULL,
        srp_peak_load_lbs REAL NOT NULL,
        srp_min_load_lbs REAL NOT NULL,
        srp_efficiency_pct REAL NOT NULL,
        power_consumption_kw REAL NOT NULL,
        health_score REAL NOT NULL,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 3. Production History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS production_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        date DATE NOT NULL,
        oil_bpd REAL NOT NULL,
        cumulative_oil_bbl REAL NOT NULL,
        water_bpd REAL NOT NULL,
        steam_injected_tons REAL NOT NULL,
        cum_steam_tons REAL NOT NULL,
        oil_steam_ratio REAL NOT NULL,
        avg_temp_c REAL NOT NULL,
        avg_pressure_bar REAL NOT NULL,
        srp_uptime_pct REAL NOT NULL,
        energy_kwh REAL NOT NULL,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 4. CSS Cycles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS css_cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        cycle_number INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        current_phase TEXT NOT NULL, -- INJECTION, SOAK, PRODUCTION, COOLING
        steam_volume_tons REAL NOT NULL,
        steam_quality_pct REAL NOT NULL,
        injection_pressure_bar REAL NOT NULL,
        soak_days INTEGER NOT NULL,
        peak_temp_c REAL NOT NULL,
        cum_oil_produced_bbl REAL NOT NULL,
        oil_steam_ratio REAL NOT NULL,
        cut_off_temp_c REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 5. SRP Readings & Dynacards
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS srp_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        stroke_length_in REAL NOT NULL,
        spm REAL NOT NULL,
        vfd_speed_hz REAL NOT NULL,
        peak_polished_rod_load_lbs REAL NOT NULL,
        min_polished_rod_load_lbs REAL NOT NULL,
        gearbox_torque_pct REAL NOT NULL,
        motor_current_amps REAL NOT NULL,
        pump_fillage_pct REAL NOT NULL,
        pump_displacement_bpd REAL NOT NULL,
        fluid_load_lbs REAL NOT NULL,
        rod_stress_psi REAL NOT NULL,
        dynacard_surface_json TEXT, -- JSON coordinates: [{pos, load}]
        dynacard_pump_json TEXT,    -- JSON coordinates: [{pos, load}]
        card_type TEXT NOT NULL,    -- NORMAL, FLUID_POUND, GAS_INTERFERENCE, ROD_FRICTION
        status TEXT NOT NULL,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 6. Predictions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        horizon_days INTEGER NOT NULL,
        predicted_oil_bpd REAL NOT NULL,
        predicted_res_temp_c REAL NOT NULL,
        cooling_rate_c_day REAL NOT NULL,
        predicted_pump_eff_pct REAL NOT NULL,
        predicted_equipment_risk TEXT NOT NULL,
        rod_failure_risk_pct REAL NOT NULL,
        model_name TEXT NOT NULL,
        model_confidence_pct REAL NOT NULL,
        mae REAL,
        rmse REAL,
        r2 REAL,
        factors_json TEXT,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 7. Optimization Runs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS optimization_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        objective_weights_json TEXT NOT NULL,
        current_params_json TEXT NOT NULL,
        recommended_params_json TEXT NOT NULL,
        expected_impact_json TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 8. Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category TEXT NOT NULL, -- INFO, WARNING, CRITICAL
        parameter TEXT NOT NULL,
        current_value TEXT NOT NULL,
        threshold TEXT NOT NULL,
        reason TEXT NOT NULL,
        suggested_action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
        acknowledged_by TEXT,
        resolved_at TIMESTAMP,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 9. Maintenance Events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        pattern_name TEXT NOT NULL, -- Abnormal Rod Load, Rod Floating Risk, Impact Loading, etc.
        risk_level TEXT NOT NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
        affected_component TEXT NOT NULL,
        diagnostic_reason TEXT NOT NULL,
        recommended_inspection TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 10. Scenarios
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        scenario_name TEXT NOT NULL,
        strategy_type TEXT NOT NULL, -- Conservative, Balanced, Production-focused, Custom
        parameters_json TEXT NOT NULL,
        simulated_outputs_json TEXT NOT NULL,
        well_health_score REAL NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 11. Operator Decisions (Human-in-the-loop tracking)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS operator_decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        scenario_or_rec_id TEXT NOT NULL,
        action TEXT NOT NULL, -- ACCEPTED_FOR_PLANNING, REJECTED, MODIFIED, UNDER_REVIEW
        operator_name TEXT NOT NULL,
        operator_role TEXT NOT NULL,
        rationale TEXT NOT NULL,
        parameters_json TEXT NOT NULL,
        compliance_check_passed INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)

    # 12. Complete Synthetic Well Data (90-Day High Resolution Telemetry)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS synthetic_well_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        well_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        reservoir_temperature_c REAL NOT NULL,
        reservoir_pressure_bar REAL NOT NULL,
        oil_viscosity_cp REAL NOT NULL,
        steam_volume_tpd REAL NOT NULL,
        injection_pressure_bar REAL NOT NULL,
        soak_time_hr REAL NOT NULL,
        production_bpd REAL NOT NULL,
        production_cutoff_bpd REAL NOT NULL,
        stroke_length_in REAL NOT NULL,
        spm REAL NOT NULL,
        vfd_speed_rpm REAL NOT NULL,
        rod_load_lbs REAL NOT NULL,
        pump_efficiency_pct REAL NOT NULL,
        energy_consumption_kwh REAL NOT NULL,
        css_cycle INTEGER NOT NULL,
        css_phase TEXT NOT NULL,
        equipment_risk_score REAL NOT NULL,
        equipment_risk_level TEXT NOT NULL,
        rod_floating_risk REAL NOT NULL,
        impact_loading_risk REAL NOT NULL,
        pump_unsetting_risk REAL NOT NULL,
        rod_failure_risk REAL NOT NULL,
        water_cut_pct REAL NOT NULL,
        FOREIGN KEY (well_id) REFERENCES wells (well_id)
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_synth_well_ts ON synthetic_well_data(well_id, timestamp);")

    # 13. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL, -- ADMIN, ENGINEER, OPERATOR, VIEWER
        password_hash TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL
    );
    """)

    # Insert Demo Users
    demo_users = [
        ("admin", "Dr. Rajesh Sharma", "ADMIN", "admin123", "Chief Digital Officer", "Production Technology & AI"),
        ("engineer", "Priya Verma", "ENGINEER", "eng123", "Senior Reservoir & Thermal Engineer", "Heavy Oil Asset Team"),
        ("operator", "Anil Kumar Meena", "OPERATOR", "op123", "Field Operations Lead - Baghewala", "Surface & SRP Operations"),
        ("viewer", "SIH Evaluator", "VIEWER", "guest123", "Guest Technical Observer", "SIH 2026 Evaluation Panel")
    ]

    for u in demo_users:
        cursor.execute("""
        INSERT OR REPLACE INTO users (username, name, role, password_hash, title, department)
        VALUES (?, ?, ?, ?, ?, ?)
        """, u)

    conn.commit()
    conn.close()
    print("Database tables initialized successfully at:", DB_PATH)

if __name__ == "__main__":
    init_database()
