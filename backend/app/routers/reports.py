"""
Baghewala WellTwin AI - Reports Router
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{well_id}")
def get_comprehensive_well_report(well_id: str):
    report = ReportService.generate_well_report(well_id)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report
