from flask import Blueprint

representative_bp = Blueprint("representatives", __name__)

# ── Representative profile ─────────────────────────────────
# GET  /api/v1/representatives/profile
@representative_bp.get("/profile")
def get_profile():
    from controllers.representative_controller import get_representative_profile
    return get_representative_profile()

# POST /api/v1/representatives/profile
@representative_bp.post("/profile")
def create_profile():
    from controllers.representative_controller import create_representative_profile
    return create_representative_profile()

# PUT  /api/v1/representatives/profile
@representative_bp.put("/profile")
def update_profile():
    from controllers.representative_controller import update_representative_profile
    return update_representative_profile()

# ── Group management ───────────────────────────────────────
# POST /api/v1/representatives/groups
@representative_bp.post("/groups")
def create_group():
    from controllers.representative_controller import create_group
    return create_group()

# GET  /api/v1/representatives/groups
@representative_bp.get("/groups")
def list_groups():
    from controllers.representative_controller import list_groups
    return list_groups()

# GET  /api/v1/representatives/groups/<group_id>
@representative_bp.get("/groups/<group_id>")
def get_group(group_id):
    from controllers.representative_controller import get_group_by_id
    return get_group_by_id(group_id)

# PUT  /api/v1/representatives/groups/<group_id>
@representative_bp.put("/groups/<group_id>")
def update_group(group_id):
    from controllers.representative_controller import update_group
    return update_group(group_id)

# DELETE /api/v1/representatives/groups/<group_id>
@representative_bp.delete("/groups/<group_id>")
def delete_group(group_id):
    from controllers.representative_controller import delete_group
    return delete_group(group_id)

# POST /api/v1/representatives/groups/<group_id>/members
@representative_bp.post("/groups/<group_id>/members")
def add_member(group_id):
    from controllers.representative_controller import add_group_member
    return add_group_member(group_id)

# DELETE /api/v1/representatives/groups/<group_id>/members/<worker_id>
@representative_bp.delete("/groups/<group_id>/members/<worker_id>")
def remove_member(group_id, worker_id):
    from controllers.representative_controller import remove_group_member
    return remove_group_member(group_id, worker_id)
