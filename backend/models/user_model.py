"""
User model — base authentication entity.

Collection: users
Every user has exactly one role: worker | employer | representative
"""

from datetime import datetime, timezone
from bson import ObjectId


# ── Schema definition (used as documentation + validation reference) ──────────
USER_SCHEMA = {
    "_id":        ObjectId,          # MongoDB auto-generated
    "email":      str,               # unique, indexed
    "password":   str,               # bcrypt hash
    "role":       str,               # "worker" | "employer" | "representative"
    "is_active":  bool,              # soft-delete / ban flag
    "created_at": datetime,
    "updated_at": datetime,
}

ALLOWED_ROLES = {"worker", "employer", "representative"}


def build_user_document(email: str, hashed_password: str, role: str) -> dict:
    """Return a new user document ready to be inserted into MongoDB."""
    if role not in ALLOWED_ROLES:
        raise ValueError(f"Invalid role '{role}'. Must be one of {ALLOWED_ROLES}")

    now = datetime.now(timezone.utc)
    return {
        "email":      email.lower().strip(),
        "password":   hashed_password,
        "role":       role,
        "is_active":  True,
        "created_at": now,
        "updated_at": now,
    }


def serialize_user(doc: dict) -> dict:
    """Convert a MongoDB user document to a JSON-safe dict (no password)."""
    return {
        "id":         str(doc["_id"]),
        "email":      doc["email"],
        "role":       doc["role"],
        "is_active":  doc.get("is_active", True),
        "created_at": doc["created_at"].isoformat(),
        "updated_at": doc["updated_at"].isoformat(),
    }
