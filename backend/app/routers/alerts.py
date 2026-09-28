"""
Baghewala WellTwin AI - Alerts Router
Handles real-time alarm surveillance, filtering, acknowledgement, and resolution workflows.
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from app.database import query_all, query_one, execute_write
from app.models.schemas import AlertItem, AlertAcknowledgeRequest

router = APIRouter(prefix="/api/alerts", tags=["Smart Alert Engine"])

@router.get("", response_model=List[AlertItem])
def get_alerts(
    well_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    sql = "SELECT * FROM alerts WHERE 1=1"
    params = []

    if well_id and well_id != "ALL":
        sql += " AND well_id = ?"
        params.append(well_id)

    if category and category != "ALL":
        sql += " AND category = ?"
        params.append(category)

    if status and status != "ALL":
        sql += " AND status = ?"
        params.append(status)

    if search:
        sql += " AND (reason LIKE ? OR parameter LIKE ? OR suggested_action LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    sql += " ORDER BY timestamp DESC LIMIT 100"
    rows = query_all(sql, tuple(params))
    return rows

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, req: AlertAcknowledgeRequest):
    alert = query_one("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    execute_write(
        "UPDATE alerts SET status = 'ACKNOWLEDGED', acknowledged_by = ? WHERE id = ?",
        (req.operator_name, alert_id)
    )
    return {"status": "SUCCESS", "message": f"Alert {alert_id} acknowledged by {req.operator_name}"}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, req: AlertAcknowledgeRequest):
    alert = query_one("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    execute_write(
        "UPDATE alerts SET status = 'RESOLVED', acknowledged_by = ?, resolved_at = ? WHERE id = ?",
        (req.operator_name, now_str, alert_id)
    )
    return {"status": "SUCCESS", "message": f"Alert {alert_id} marked as resolved"}

@router.post("/generate")
def generate_sample_alert(well_id: str = "BGW-01", category: str = "WARNING"):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if category == "CRITICAL":
        param = "Downstroke Rod Load"
        curr_val = "1,980 lbs"
        thresh = "Min 2,400 lbs"
        reason = "Viscous fluid drag deceleration exceeds safety margin, initiating rod floating warning."
        action = "Throttle SPM via VFD and schedule hot water flush."
    elif category == "WARNING":
        param = "Reservoir Temperature Decay"
        curr_val = "64.2 °C"
        thresh = "Cut-off 68.0 °C"
        reason = "Thermal plume cooling faster than forecast model. Sandface viscosity rising."
        action = "Prepare well candidate documentation for next CSS cycle."
    else:
        param = "CSS Thermal Soak Complete"
        curr_val = "Day 5 Soak"
        thresh = "Soak Cycle 5 Days"
        reason = "Heat equilibrium achieved across 18m drainage radius. Viscosity reduced to 42 cP."
        action = "Initiate SRP startup protocol at 4.2 SPM."

    alert_id = execute_write("""
    INSERT INTO alerts (well_id, timestamp, category, parameter, current_value, threshold, reason, suggested_action, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    """, (well_id, now_str, category, param, curr_val, thresh, reason, action))

    return {"status": "ALERT_GENERATED", "alert_id": alert_id}
