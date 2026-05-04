"""
Worker controller — request parsing + response shaping.
All routes require a valid JWT with role=worker.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from utils import role_required, success, error
import services.worker_service as worker_service


@role_required("worker")
def get_worker_profile():
    """GET /api/v1/workers/profile"""
    user_id = get_jwt_identity()
    try:
        profile = worker_service.get_profile(user_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(profile)


@role_required("worker")
def create_worker_profile():
    """POST /api/v1/workers/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = worker_service.create_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile, 201)


@role_required("worker")
def update_worker_profile():
    """PUT /api/v1/workers/profile"""
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    try:
        profile = worker_service.update_profile(user_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(profile)


def get_worker_by_id(worker_id: str):
    """GET /api/v1/workers/<worker_id>  (public)"""
    try:
        profile = worker_service.get_by_id(worker_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(profile)


def list_workers():
    """GET /api/v1/workers/?skills=python&worker_type=technical&location=Delhi"""
    filters = {
        "skills":      request.args.get("skills"),
        "worker_type": request.args.get("worker_type"),
        "location":    request.args.get("location"),
    }
    workers = worker_service.list_all(filters)
    return success({"workers": workers, "count": len(workers)})


@role_required("worker")
def get_saved_jobs():
    """GET /api/v1/workers/saved-jobs"""
    user_id = get_jwt_identity()
    jobs = worker_service.list_saved_jobs(user_id)
    return success({"jobs": jobs, "count": len(jobs)})


@role_required("worker")
def save_job(job_id: str):
    """POST /api/v1/workers/saved-jobs/<job_id>"""
    user_id = get_jwt_identity()
    try:
        result = worker_service.save_job(user_id, job_id)
    except ValueError as e:
        return error(str(e), 400)
    return success(result, 201)


@role_required("worker")
def unsave_job(job_id: str):
    """DELETE /api/v1/workers/saved-jobs/<job_id>"""
    user_id = get_jwt_identity()
    try:
        result = worker_service.unsave_job(user_id, job_id)
    except ValueError as e:
        return error(str(e), 400)
    return success(result)
