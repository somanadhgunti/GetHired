"""
Auth controller — parses requests, calls auth_service, returns JSON responses.
"""

from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

import services.auth_service as auth_service


def register_user():
    """
    POST /api/v1/auth/register
    Body: { email, password, role }
    """
    body = request.get_json(silent=True) or {}
    email    = body.get("email", "").strip()
    password = body.get("password", "")
    role     = body.get("role", "").strip()

    try:
        user = auth_service.register(email, password, role)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    access_token  = create_access_token(identity=user["id"],
                                        additional_claims={"role": user["role"]})
    refresh_token = create_refresh_token(identity=user["id"],
                                         additional_claims={"role": user["role"]})

    return jsonify({
        "message":       "Account created successfully.",
        "user":          user,
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 201


def login_user():
    """
    POST /api/v1/auth/login
    Body: { email, password }
    """
    body = request.get_json(silent=True) or {}
    email    = body.get("email", "").strip()
    password = body.get("password", "")

    try:
        user = auth_service.login(email, password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    access_token  = create_access_token(identity=user["id"],
                                        additional_claims={"role": user["role"]})
    refresh_token = create_refresh_token(identity=user["id"],
                                         additional_claims={"role": user["role"]})

    return jsonify({
        "message":       "Login successful.",
        "user":          user,
        "access_token":  access_token,
        "refresh_token": refresh_token,
    }), 200


@jwt_required(refresh=True)
def refresh_token():
    """
    POST /api/v1/auth/refresh
    Header: Authorization: Bearer <refresh_token>
    """
    identity = get_jwt_identity()
    claims   = get_jwt()
    role     = claims.get("role", "")

    new_access = create_access_token(identity=identity,
                                     additional_claims={"role": role})

    return jsonify({"access_token": new_access}), 200


@jwt_required()
def logout_user():
    """
    POST /api/v1/auth/logout
    (Stateless JWT — client must discard the token.
     Token blocklist can be added later via Redis.)
    """
    return jsonify({"message": "Logged out successfully."}), 200


@jwt_required()
def get_me():
    """GET /api/v1/auth/me"""
    user_id = get_jwt_identity()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user}), 200


@jwt_required()
def update_me():
    """
    PATCH /api/v1/auth/me
    Body supports:
      - email
      - current_password + new_password
    """
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}

    try:
        user = auth_service.update_user(user_id, body)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"user": user, "message": "Account updated successfully."}), 200
