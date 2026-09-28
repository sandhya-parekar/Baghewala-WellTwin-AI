"""
Baghewala WellTwin AI - Scenario Comparison Router
Manages saved simulation scenarios (Conservative, Balanced, Aggressive) for comparative decision support.
"""

from fastapi import APIRouter, HTTPException
import json
from typing import List, Dict, Any
from app.database import query_all, query_one, execute_write
from app.models.schemas import ScenarioCreateRequest

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.get("/{well_id}")
def get_scenarios_for_well(well_id: str):
    rows = query_all("SELECT * FROM scenarios WHERE well_id = ? ORDER BY id ASC", (well_id,))
    parsed = []
    for r in rows:
        item = dict(r)
        try:
            item["parameters"] = json.loads(item["parameters_json"])
            item["simulated_outputs"] = json.loads(item["simulated_outputs_json"])
        except Exception:
            item["parameters"] = {}
            item["simulated_outputs"] = {}
        parsed.append(item)
    return parsed

@router.post("")
def save_new_scenario(req: ScenarioCreateRequest):
    sec_id = execute_write("""
    INSERT INTO scenarios (
        well_id, scenario_name, strategy_type, parameters_json,
        simulated_outputs_json, well_health_score, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        req.well_id,
        req.scenario_name,
        req.strategy_type,
        json.dumps(req.parameters),
        json.dumps(req.simulated_outputs),
        req.well_health_score,
        req.notes
    ))
    return {"status": "SUCCESS", "scenario_id": sec_id, "message": "Scenario saved successfully"}
