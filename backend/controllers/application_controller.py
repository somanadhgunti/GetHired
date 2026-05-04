"""
Application controller — individual + group job applications.
"""

import os
from uuid import uuid4

from flask import request
from flask import current_app, send_from_directory
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename

from utils import role_required, success, error
import services.application_service as app_service


@role_required("worker")
def apply_to_job():
    """
    POST /api/v1/applications/
    Body: multipart/form-data with fields { job_id, cover_letter?, resume=<pdf> }
    """
    worker_id = get_jwt_identity()
    data = {}
    saved_resume_path = None

    if request.content_type and "multipart/form-data" in request.content_type:
        data["job_id"] = (request.form.get("job_id") or "").strip()
        data["cover_letter"] = (request.form.get("cover_letter") or "").strip()

        resume = request.files.get("resume")
        if not resume:
            return error("resume PDF file is required.", 400)

        incoming_name = secure_filename(resume.filename or "")
        if not incoming_name.lower().endswith(".pdf"):
            return error("Only PDF resumes are allowed.", 400)

        unique_name = f"{uuid4().hex}.pdf"
        upload_dir = current_app.config["RESUME_UPLOAD_DIR"]
        os.makedirs(upload_dir, exist_ok=True)
        saved_resume_path = os.path.join(upload_dir, unique_name)
        resume.save(saved_resume_path)

        data["resume_file_name"] = unique_name
    else:
        data = request.get_json(silent=True) or {}

    if not data.get("job_id"):
        return error("job_id is required.", 400)
    try:
        application = app_service.apply_individual(worker_id, data)
    except ValueError as e:
        if saved_resume_path and os.path.exists(saved_resume_path):
            os.remove(saved_resume_path)
        return error(str(e), 400)
    return success(application, 201)


@role_required("representative")
def apply_as_group():
    """
    POST /api/v1/applications/group
    Body: { job_id, group_id, worker_ids: [...], cover_letter? }
    """
    rep_id = get_jwt_identity()
    data   = request.get_json(silent=True) or {}
    for field in ("job_id", "group_id", "worker_ids"):
        if not data.get(field):
            return error(f"{field} is required.", 400)
    try:
        application = app_service.apply_group(rep_id, data)
    except ValueError as e:
        return error(str(e), 400)
    return success(application, 201)


@role_required("worker", "representative")
def get_my_applications():
    """GET /api/v1/applications/my"""
    user_id      = get_jwt_identity()
    applications = app_service.get_my_applications(user_id)
    return success({"applications": applications, "count": len(applications)})


@role_required("worker", "representative", "employer")
def get_application_by_id(application_id: str):
    """GET /api/v1/applications/<application_id>"""
    user_id = get_jwt_identity()
    try:
        application = app_service.get_by_id(application_id, user_id)
    except ValueError as e:
        return error(str(e), 404)
    return success(application)


@role_required("employer")
def get_applications_for_job(job_id: str):
    """GET /api/v1/applications/job/<job_id>"""
    employer_id  = get_jwt_identity()
    try:
        applications = app_service.get_for_job(job_id, employer_id)
    except ValueError as e:
        return error(str(e), 400)
    return success({"applications": applications, "count": len(applications)})


@role_required("employer")
def update_application_status(application_id: str):
    """
    PATCH /api/v1/applications/<application_id>/status
    Body: { "status": "shortlisted" }
    """
    employer_id = get_jwt_identity()
    body        = request.get_json(silent=True) or {}
    status      = body.get("status", "")
    if not status:
        return error("status is required.", 400)
    try:
        application = app_service.update_status(application_id, employer_id, status)
    except ValueError as e:
        return error(str(e), 400)
    return success(application)


@role_required("worker", "representative")
def withdraw_application(application_id: str):
    """DELETE /api/v1/applications/<application_id>"""
    user_id = get_jwt_identity()
    try:
        app_service.withdraw(application_id, user_id)
    except ValueError as e:
        return error(str(e), 400)
    return success({"message": "Application withdrawn successfully."})


@role_required("worker", "representative", "employer")
def download_application_resume(application_id: str):
    """GET /api/v1/applications/<application_id>/resume"""
    user_id = get_jwt_identity()
    try:
        resume_file_name = app_service.get_resume_file_name(application_id, user_id)
    except ValueError as e:
        return error(str(e), 404)

    upload_dir = current_app.config["RESUME_UPLOAD_DIR"]
    return send_from_directory(upload_dir, resume_file_name, as_attachment=False, mimetype="application/pdf")
