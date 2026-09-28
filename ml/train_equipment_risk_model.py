"""
Baghewala WellTwin AI - ML Pipeline: Equipment & Rod Failure Risk Model
Trains a Random Forest Classifier to assess sucker rod stress, rod floating, and mechanical risk.
Calculates Accuracy, Precision, Recall, F1, and explainable feature attributions.
"""

import os
import json
import sqlite3
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "welltwin.db")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_equipment_risk_model():
    conn = sqlite3.connect(DB_PATH)
    query = """
    SELECT 
        srp_peak_load_lbs,
        srp_min_load_lbs,
        oil_viscosity_cp,
        srp_spm,
        power_consumption_kw,
        srp_efficiency_pct,
        reservoir_temp_c,
        health_score
    FROM sensor_readings
    WHERE srp_spm > 0
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    # Define risk labels based on physical boundaries
    # Low MPRL (< 2400) = Rod floating risk!
    # High PPRL (> 20000) = Gearbox / Rod overload!
    # Low Pump Eff (< 60) = Valve slip / Fluid pound!
    def label_risk(row):
        mprl = row["srp_min_load_lbs"]
        pprl = row["srp_peak_load_lbs"]
        eff = row["srp_efficiency_pct"]
        if mprl < 2200 or pprl > 22000:
            return "CRITICAL"
        elif mprl < 3000 or pprl > 19500 or eff < 65:
            return "HIGH"
        elif mprl < 3800 or pprl > 17500 or eff < 75:
            return "MEDIUM"
        else:
            return "LOW"

    df["risk_label"] = df.apply(label_risk, axis=1)

    feature_cols = [
        "srp_peak_load_lbs",
        "srp_min_load_lbs",
        "oil_viscosity_cp",
        "srp_spm",
        "power_consumption_kw",
        "srp_efficiency_pct",
        "reservoir_temp_c"
    ]

    X = df[feature_cols]
    y = df["risk_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    importances = model.feature_importances_
    factors = []
    # User-friendly feature display labels
    name_map = {
        "srp_min_load_lbs": "Min Polished Rod Load (Floating Margin)",
        "srp_peak_load_lbs": "Peak Polished Rod Load (Tension Stress)",
        "oil_viscosity_cp": "Fluid Dynamic Viscosity",
        "srp_spm": "Pumping Speed (SPM Dynamics)",
        "power_consumption_kw": "Motor Power & Mechanical Drag",
        "srp_efficiency_pct": "Pump Volumetric Efficiency",
        "reservoir_temp_c": "Reservoir Thermal State"
    }

    for col, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True):
        factors.append({
            "feature": col,
            "display_name": name_map.get(col, col),
            "importance_pct": round(float(imp * 100), 1)
        })

    model_path = os.path.join(MODEL_DIR, "equipment_risk_model.joblib")
    meta_path = os.path.join(MODEL_DIR, "equipment_risk_metrics.json")

    joblib.dump(model, model_path)
    metadata = {
        "model_name": "RandomForestClassifier (Sucker Rod Equipment Risk)",
        "features": feature_cols,
        "classes": list(model.classes_),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "model_confidence_pct": round(f1 * 100, 1)
        },
        "feature_importances": factors,
        "n_samples": len(df)
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Equipment Risk Model Trained Successfully!")
    print(f"Accuracy: {acc*100:.1f}% | F1: {f1:.4f}")
    return metadata

if __name__ == "__main__":
    train_equipment_risk_model()
