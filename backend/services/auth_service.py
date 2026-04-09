"""
Auth service — business logic for register, login, token refresh, logout.
"""

import bcrypt
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.user_model import build_user_document, serialize_user, ALLOWED_ROLES


# ── helpers ───────────────────────────────────────────────────────────────────

def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def _check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── public service functions ──────────────────────────────────────────────────

def register(email: str, password: str, role: str) -> dict:
    """
    Create a new user account.
    Returns the serialized user document.
    Raises ValueError on validation errors or duplicate email.
    """
    db = get_db()

    # Validate
    if not email or not password or not role:
        raise ValueError("email, password, and role are required.")
    if role not in ALLOWED_ROLES:
        raise ValueError(f"Invalid role. Must be one of: {', '.join(ALLOWED_ROLES)}")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    # Check duplicate
    if db["users"].find_one({"email": email.lower().strip()}):
        raise ValueError("An account with this email already exists.")

    # Build + insert
    doc = build_user_document(email, _hash_password(password), role)
    result = db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id

    return serialize_user(doc)


def login(email: str, password: str) -> dict:
    """
    Verify credentials and return the user document.
    Raises ValueError on bad credentials.
    """
    db = get_db()

    if not email or not password:
        raise ValueError("email and password are required.")

    user = db["users"].find_one({"email": email.lower().strip()})
    if not user:
        raise ValueError("Invalid email or password.")
    if not user.get("is_active", True):
        raise ValueError("Account is deactivated.")
    if not _check_password(password, user["password"]):
        raise ValueError("Invalid email or password.")

    return serialize_user(user)


def get_user_by_id(user_id: str) -> dict | None:
    """Fetch a user by string ObjectId. Returns serialized doc or None."""
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        return None
    user = db["users"].find_one({"_id": oid})
    return serialize_user(user) if user else None
