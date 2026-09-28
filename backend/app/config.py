"""
Baghewala WellTwin AI - Backend Configuration
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Baghewala WellTwin AI"
    PROJECT_SUBTITLE: str = "AI-Enabled Well-to-Surface Digital Twin for Heavy Oil Optimization"
    PROBLEM_STATEMENT_ID: str = "SIH26120"
    ORGANIZATION: str = "Oil India Limited (Baghewala Field)"
    VERSION: str = "2.0.26-SIH"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH: str = os.path.join(BASE_DIR, "database", "welltwin.db")
    ML_MODEL_DIR: str = os.path.join(BASE_DIR, "ml", "saved_models")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Industrial simulation constants for Baghewala heavy crude
    NATIVE_RESERVOIR_TEMP_C: float = 61.8
    NATIVE_RESERVOIR_PRESSURE_BAR: float = 98.4
    STEAM_INJECTION_TEMP_C: float = 285.0
    STEAM_QUALITY_NOMINAL: float = 0.80

settings = Settings()
