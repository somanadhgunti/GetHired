"""
Shared utilities: role guard decorator, response helpers.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*roles):
    """
    Decorator that enforces JWT authentication AND role membership.

    Usage:
        @role_required("employer")
        def create_job(): ...

        @role_required("worker", "representative")
        def apply(): ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role", "")
            if user_role not in roles:
                return jsonify({
                    "error": f"Access denied. Required role(s): {', '.join(roles)}."
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def success(data: dict | list, status: int = 200):
    return jsonify(data), status


def error(message: str, status: int = 400):
    return jsonify({"error": message}), status
