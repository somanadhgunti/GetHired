"""
Employer controller — request parsing + response shaping.
All mutating routes require role=employer.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from utils import role_required, success, error
import services.employer_service as employer_service


@role_required("employer")
def get_employer_profile():
    """GET /api/v1/employers/profile"""
    user_id = get_jwt_identity()
    try:
        profile = employer_service.get_profile(user_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(profile)


@role_required("employer")
def create_employer_profile():
    """POST /api/v1/employers/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = employer_service.create_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile, 201)


@role_required("employer")
def update_employer_profile():
    """PUT /api/v1/employers/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = employer_service.update_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile)


def get_employer_by_id(employer_id: str):
    """GET /api/v1/employers/<employer_id>  (public)"""
    try:
        profile = employer_service.get_by_id(employer_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(profile)
