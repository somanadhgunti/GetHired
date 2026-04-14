"""
Representative service — profile CRUD + group management.
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.representative_model import (
    build_representative_profile,
    serialize_representative_profile,
)
from models.group_model import build_group, serialize_group


# ── Profile ───────────────────────────────────────────────────────────────────

def create_profile(user_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    if db["profiles"].find_one({"user_id": oid}):
        raise ValueError("Profile already exists for this user.")
    doc    = build_representative_profile(oid, data)
    result = db["profiles"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_representative_profile(doc)


def get_profile(user_id: str) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    doc = db["profiles"].find_one({"user_id": oid, "profile_type": "representative"})
    if not doc:
        raise ValueError("Representative profile not found.")
    return serialize_representative_profile(doc)


def update_profile(user_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    allowed = {"full_name", "phone", "location", "organization", "bio", "profile_picture"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        raise ValueError("No valid fields provided for update.")
    updates["updated_at"] = datetime.now(timezone.utc)
    db["profiles"].update_one(
        {"user_id": oid, "profile_type": "representative"},
        {"$set": updates},
    )
    return get_profile(user_id)


# ── Groups ────────────────────────────────────────────────────────────────────

def _get_group_or_raise(group_id: str, representative_id: ObjectId) -> dict:
    """Fetch a group that belongs to this representative or raise."""
    db = get_db()
    try:
        goid = ObjectId(group_id)
    except InvalidId:
        raise ValueError("Invalid group ID.")
    doc = db["groups"].find_one({"_id": goid, "representative_id": representative_id})
    if not doc:
        raise ValueError("Group not found or access denied.")
    return doc


def create_group(user_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    if not data.get("name", "").strip():
        raise ValueError("Group name is required.")
    doc    = build_group(oid, data)
    result = db["groups"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_group(doc)


def list_groups(user_id: str) -> list:
    db   = get_db()
    oid  = ObjectId(user_id)
    docs = db["groups"].find({"representative_id": oid}).sort("created_at", -1)
    return [serialize_group(d) for d in docs]


def get_group(user_id: str, group_id: str) -> dict:
    oid = ObjectId(user_id)
    doc = _get_group_or_raise(group_id, oid)
    return serialize_group(doc)


def update_group(user_id: str, group_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    _get_group_or_raise(group_id, oid)   # ownership check

    allowed  = {"name", "description", "tags"}
    updates  = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        raise ValueError("No valid fields provided for update.")
    updates["updated_at"] = datetime.now(timezone.utc)
    db["groups"].update_one({"_id": ObjectId(group_id)}, {"$set": updates})
    return get_group(user_id, group_id)


def delete_group(user_id: str, group_id: str) -> None:
    db  = get_db()
    oid = ObjectId(user_id)
    _get_group_or_raise(group_id, oid)
    db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
    )


def add_member(user_id: str, group_id: str, worker_id: str) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    _get_group_or_raise(group_id, oid)

    # Verify the worker exists
    try:
        woid = ObjectId(worker_id)
    except InvalidId:
        raise ValueError("Invalid worker ID.")
    worker_user = db["users"].find_one({"_id": woid, "role": "worker"})
    if not worker_user:
        raise ValueError("Worker not found.")

    db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {
            "$addToSet": {"worker_ids": woid},
            "$set":      {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return get_group(user_id, group_id)


def remove_member(user_id: str, group_id: str, worker_id: str) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    _get_group_or_raise(group_id, oid)

    try:
        woid = ObjectId(worker_id)
    except InvalidId:
        raise ValueError("Invalid worker ID.")

    db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {
            "$pull": {"worker_ids": woid},
            "$set":  {"updated_at": datetime.now(timezone.utc)},
        },
    )
    return get_group(user_id, group_id)
