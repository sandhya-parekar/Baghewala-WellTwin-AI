"""
Baghewala WellTwin AI - Master ML Training Script
Trains Production, Temperature, and Equipment Risk models, and generates unified model catalog.
"""

import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from ml.train_production_model import train_production_model
from ml.train_temperature_model import train_temperature_model
from ml.train_equipment_risk_model import train_equipment_risk_model

def train_all_models():
    print("=======================================================")
    print("Baghewala WellTwin AI - ML Training Pipeline")
    print("SIH 2026 Problem Statement: SIH26120")
    print("=======================================================\n")
    
    print("[1/3] Training Heavy Crude Production Regressor...")
    prod_meta = train_production_model()
    
    print("\n[2/3] Training Reservoir Temperature Decay Model...")
    temp_meta = train_temperature_model()
    
    print("\n[3/3] Training SRP Equipment & Rod Failure Risk Classifier...")
    risk_meta = train_equipment_risk_model()
    
    summary = {
        "status": "ALL_MODELS_TRAINED",
        "production": prod_meta,
        "temperature": temp_meta,
        "equipment_risk": risk_meta,
    }
    
    catalog_path = os.path.join(BASE_DIR, "ml", "saved_models", "models_catalog.json")
    with open(catalog_path, "w") as f:
        json.dump(summary, f, indent=2)
        
    print("\n=======================================================")
    print("All ML Models Trained and Saved to ml/saved_models/")
    print(f"Catalog saved to {catalog_path}")
    print("=======================================================")
    return summary

if __name__ == "__main__":
    train_all_models()
