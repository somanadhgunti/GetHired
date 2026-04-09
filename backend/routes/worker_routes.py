from flask import Blueprint

worker_bp = Blueprint("workers", __name__)

# GET  /api/v1/workers/profile
@worker_bp.get("/profile")
def get_profile():
    from controllers.worker_controller import get_worker_profile
    return get_worker_profile()

# POST /api/v1/workers/profile
@worker_bp.post("/profile")
def create_profile():
    from controllers.worker_controller import create_worker_profile
    return create_worker_profile()

# PUT  /api/v1/workers/profile
@worker_bp.put("/profile")
def update_profile():
    from controllers.worker_controller import update_worker_profile
    return update_worker_profile()

# GET  /api/v1/workers/<worker_id>
@worker_bp.get("/<worker_id>")
def get_worker(worker_id):
    from controllers.worker_controller import get_worker_by_id
    return get_worker_by_id(worker_id)

# GET  /api/v1/workers/  (list / search)
@worker_bp.get("/")
def list_workers():
    from controllers.worker_controller import list_workers
    return list_workers()
