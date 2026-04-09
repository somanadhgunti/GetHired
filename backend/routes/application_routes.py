from flask import Blueprint

application_bp = Blueprint("applications", __name__)

# ── Individual application ─────────────────────────────────
# POST /api/v1/applications/
@application_bp.post("/")
def apply():
    from controllers.application_controller import apply_to_job
    return apply_to_job()

# ── Group application ──────────────────────────────────────
# POST /api/v1/applications/group
@application_bp.post("/group")
def apply_as_group():
    from controllers.application_controller import apply_as_group
    return apply_as_group()

# ── Applicant views ───────────────────────────────────────
# GET  /api/v1/applications/my
@application_bp.get("/my")
def my_applications():
    from controllers.application_controller import get_my_applications
    return get_my_applications()

# GET  /api/v1/applications/<application_id>
@application_bp.get("/<application_id>")
def get_application(application_id):
    from controllers.application_controller import get_application_by_id
    return get_application_by_id(application_id)

# ── Employer views ─────────────────────────────────────────
# GET  /api/v1/applications/job/<job_id>
@application_bp.get("/job/<job_id>")
def applications_for_job(job_id):
    from controllers.application_controller import get_applications_for_job
    return get_applications_for_job(job_id)

# ── Status management (employer) ───────────────────────────
# PATCH /api/v1/applications/<application_id>/status
@application_bp.patch("/<application_id>/status")
def update_status(application_id):
    from controllers.application_controller import update_application_status
    return update_application_status(application_id)

# DELETE /api/v1/applications/<application_id>
@application_bp.delete("/<application_id>")
def withdraw(application_id):
    from controllers.application_controller import withdraw_application
    return withdraw_application(application_id)
