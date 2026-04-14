"""
Representative controller — profile + group management endpoints.
All routes require role=representative.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from utils import role_required, success, error
import services.representative_service as rep_service


# ── Profile ───────────────────────────────────────────────────────────────────

@role_required("representative")
def get_representative_profile():
    """GET /api/v1/representatives/profile"""
    user_id = get_jwt_identity()
    try:
        profile = rep_service.get_profile(user_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(profile)


@role_required("representative")
def create_representative_profile():
    """POST /api/v1/representatives/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = rep_service.create_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile, 201)


@role_required("representative")
def update_representative_profile():
    """PUT /api/v1/representatives/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = rep_service.update_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile)


# ── Groups ────────────────────────────────────────────────────────────────────

@role_required("representative")
def create_group():
    """POST /api/v1/representatives/groups"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        group = rep_service.create_group(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(group, 201)


@role_required("representative")
def list_groups():
    """GET /api/v1/representatives/groups"""
    user_id = get_jwt_identity()
    groups  = rep_service.list_groups(user_id)
    return success({"groups": groups, "count": len(groups)})


@role_required("representative")
def get_group_by_id(group_id: str):
    """GET /api/v1/representatives/groups/<group_id>"""
    user_id = get_jwt_identity()
    try:
        group = rep_service.get_group(user_id, group_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(group)


@role_required("representative")
def update_group(group_id: str):
    """PUT /api/v1/representatives/groups/<group_id>"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        group = rep_service.update_group(user_id, group_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(group)


@role_required("representative")
def delete_group(group_id: str):
    """DELETE /api/v1/representatives/groups/<group_id>"""
    user_id = get_jwt_identity()
    try:
        rep_service.delete_group(user_id, group_id)
    except ValueError as e:
        return error(str(e), 404)
    return success({"message": "Group deleted successfully."})


@role_required("representative")
def add_group_member(group_id: str):
    """POST /api/v1/representatives/groups/<group_id>/members"""
    user_id   = get_jwt_identity()
    body      = request.get_json(silent=True) or {}
    worker_id = body.get("worker_id", "")
    if not worker_id:
        return error("worker_id is required.", 400)
    try:
        group = rep_service.add_member(user_id, group_id, worker_id)
    except ValueError as e:
        return error(str(e), 400)
    return success(group)


@role_required("representative")
def remove_group_member(group_id: str, worker_id: str):
    """DELETE /api/v1/representatives/groups/<group_id>/members/<worker_id>"""
    user_id = get_jwt_identity()
    try:
        group = rep_service.remove_member(user_id, group_id, worker_id)
    except ValueError as e:
        return error(str(e), 400)
    return success(group)
