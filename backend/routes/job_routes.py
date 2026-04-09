from flask import Blueprint

job_bp = Blueprint("jobs", __name__)

# POST /api/v1/jobs/
@job_bp.post("/")
def create_job():
    from controllers.job_controller import create_job
    return create_job()

# GET  /api/v1/jobs/         (list + search + filter)
@job_bp.get("/")
def list_jobs():
    from controllers.job_controller import list_jobs
    return list_jobs()

# GET  /api/v1/jobs/<job_id>
@job_bp.get("/<job_id>")
def get_job(job_id):
    from controllers.job_controller import get_job_by_id
    return get_job_by_id(job_id)

# PUT  /api/v1/jobs/<job_id>
@job_bp.put("/<job_id>")
def update_job(job_id):
    from controllers.job_controller import update_job
    return update_job(job_id)

# DELETE /api/v1/jobs/<job_id>
@job_bp.delete("/<job_id>")
def delete_job(job_id):
    from controllers.job_controller import delete_job
    return delete_job(job_id)

# PATCH /api/v1/jobs/<job_id>/status
@job_bp.patch("/<job_id>/status")
def update_job_status(job_id):
    from controllers.job_controller import update_job_status
    return update_job_status(job_id)

# GET  /api/v1/jobs/my        (employer's own postings)
@job_bp.get("/my")
def my_jobs():
    from controllers.job_controller import get_employer_jobs
    return get_employer_jobs()
