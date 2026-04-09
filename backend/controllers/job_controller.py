"""
Job controller — employer manages jobs; public can browse.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from utils import role_required, success, error
import services.job_service as job_service


@role_required("employer")
def create_job():
    """POST /api/v1/jobs/"""
    employer_id = get_jwt_identity()
    data        = request.get_json(silent=True) or {}
    try:
        job = job_service.create_job(employer_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(job, 201)


def list_jobs():
    """GET /api/v1/jobs/  (public)"""
    filters = {
        "title":         request.args.get("title"),
        "location":      request.args.get("location"),
        "job_type":      request.args.get("job_type"),
        "work_mode":     request.args.get("work_mode"),
        "accepts_group": request.args.get("accepts_group"),
    }
    jobs = job_service.list_jobs(filters)
    return success({"jobs": jobs, "count": len(jobs)})


def get_job_by_id(job_id: str):
    """GET /api/v1/jobs/<job_id>  (public)"""
    try:
        job = job_service.get_job(job_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(job)


@role_required("employer")
def update_job(job_id: str):
    """PUT /api/v1/jobs/<job_id>"""
    employer_id = get_jwt_identity()
    data        = request.get_json(silent=True) or {}
    try:
        job = job_service.update_job(employer_id, job_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(job)


@role_required("employer")
def delete_job(job_id: str):
    """DELETE /api/v1/jobs/<job_id>  (soft-delete → cancelled)"""
    employer_id = get_jwt_identity()
    try:
        job_service.delete_job(employer_id, job_id)
    except ValueError as e:
        return error(str(e), 400)
    return success({"message": "Job cancelled successfully."})


@role_required("employer")
def update_job_status(job_id: str):
    """PATCH /api/v1/jobs/<job_id>/status  — body: { "status": "open" }"""
    employer_id = get_jwt_identity()
    body        = request.get_json(silent=True) or {}
    status      = body.get("status", "")
    if not status:
        return error("status field is required.", 400)
    try:
        job = job_service.update_status(employer_id, job_id, status)
    except ValueError as e:
        return error(str(e), 400)
    return success(job)


@role_required("employer")
def get_employer_jobs():
    """GET /api/v1/jobs/my"""
    employer_id = get_jwt_identity()
    jobs        = job_service.get_employer_jobs(employer_id)
    return success({"jobs": jobs, "count": len(jobs)})
