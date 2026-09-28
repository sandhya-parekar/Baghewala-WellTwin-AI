"""
Baghewala WellTwin AI - Data Quality Monitor Router
"""

from fastapi import APIRouter
from typing import Optional
from app.services.data_quality_service import DataQualityService
from app.models.schemas import DataQualitySummary

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality Monitor"])

@router.get("", response_model=DataQualitySummary)
@router.get("/metrics", response_model=DataQualitySummary)
def get_field_data_quality():
    return DataQualityService.audit_telemetry_quality()

@router.get("/{well_id}", response_model=DataQualitySummary)
def get_well_data_quality(well_id: str):
    return DataQualityService.audit_telemetry_quality(well_id)
