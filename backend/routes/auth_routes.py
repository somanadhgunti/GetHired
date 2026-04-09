from flask import Blueprint

auth_bp = Blueprint("auth", __name__)

# POST /api/v1/auth/register
@auth_bp.post("/register")
def register():
    from controllers.auth_controller import register_user
    return register_user()

# POST /api/v1/auth/login
@auth_bp.post("/login")
def login():
    from controllers.auth_controller import login_user
    return login_user()

# POST /api/v1/auth/refresh
@auth_bp.post("/refresh")
def refresh():
    from controllers.auth_controller import refresh_token
    return refresh_token()

# POST /api/v1/auth/logout
@auth_bp.post("/logout")
def logout():
    from controllers.auth_controller import logout_user
    return logout_user()
