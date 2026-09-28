"""
Baghewala WellTwin AI - Authentication & Role-Based Access Control Router
Provides prototype authentication and permissions for ADMIN, ENGINEER, OPERATOR, and VIEWER roles.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import query_one

router = APIRouter(prefix="/api/auth", tags=["Authentication & Roles"])

class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    username: str
    name: str
    role: str
    title: str
    department: str
    permissions: dict

PERMISSIONS_MAP = {
    "ADMIN": {
        "can_view_dashboard": True,
        "can_run_simulation": True,
        "can_run_prediction": True,
        "can_run_optimization": True,
        "can_manage_alerts": True,
        "can_make_operator_decisions": True,
        "can_edit_scenarios": True,
        "can_export_reports": True,
        "can_train_models": True
    },
    "ENGINEER": {
        "can_view_dashboard": True,
        "can_run_simulation": True,
        "can_run_prediction": True,
        "can_run_optimization": True,
        "can_manage_alerts": True,
        "can_make_operator_decisions": False,
        "can_edit_scenarios": True,
        "can_export_reports": True,
        "can_train_models": True
    },
    "OPERATOR": {
        "can_view_dashboard": True,
        "can_run_simulation": True,
        "can_run_prediction": False,
        "can_run_optimization": False,
        "can_manage_alerts": True,
        "can_make_operator_decisions": True,
        "can_edit_scenarios": True,
        "can_export_reports": True,
        "can_train_models": False
    },
    "VIEWER": {
        "can_view_dashboard": True,
        "can_run_simulation": False,
        "can_run_prediction": False,
        "can_run_optimization": False,
        "can_manage_alerts": False,
        "can_make_operator_decisions": False,
        "can_edit_scenarios": False,
        "can_export_reports": True,
        "can_train_models": False
    }
}

@router.post("/login", response_model=UserProfile)
def login(req: LoginRequest):
    user = query_one(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        (req.username.lower(), req.password)
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    role = user["role"]
    perms = PERMISSIONS_MAP.get(role, PERMISSIONS_MAP["VIEWER"])

    return UserProfile(
        username=user["username"],
        name=user["name"],
        role=role,
        title=user["title"],
        department=user["department"],
        permissions=perms
    )

@router.get("/users")
def list_demo_users():
    return [
        {"username": "admin", "name": "Dr. Rajesh Sharma", "role": "ADMIN", "title": "Chief Digital Officer"},
        {"username": "engineer", "name": "Priya Verma", "role": "ENGINEER", "title": "Senior Reservoir Engineer"},
        {"username": "operator", "name": "Anil Kumar Meena", "role": "OPERATOR", "title": "Field Operations Lead"},
        {"username": "viewer", "name": "SIH Evaluator", "role": "VIEWER", "title": "Guest Technical Observer"}
    ]
