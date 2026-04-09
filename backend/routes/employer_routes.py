from flask import Blueprint

employer_bp = Blueprint("employers", __name__)

# GET  /api/v1/employers/profile
@employer_bp.get("/profile")
def get_profile():
    from controllers.employer_controller import get_employer_profile
    return get_employer_profile()

# POST /api/v1/employers/profile
@employer_bp.post("/profile")
def create_profile():
    from controllers.employer_controller import create_employer_profile
    return create_employer_profile()

# PUT  /api/v1/employers/profile
@employer_bp.put("/profile")
def update_profile():
    from controllers.employer_controller import update_employer_profile
    return update_employer_profile()

# GET  /api/v1/employers/<employer_id>
@employer_bp.get("/<employer_id>")
def get_employer(employer_id):
    from controllers.employer_controller import get_employer_by_id
    return get_employer_by_id(employer_id)
