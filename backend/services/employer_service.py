"""
Employer service — profile CRUD.
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.employer_model import build_employer_profile, serialize_employer_profile


def create_profile(user_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)

    if db["profiles"].find_one({"user_id": oid}):
        raise ValueError("Profile already exists for this user.")

    doc    = build_employer_profile(oid, data)
    result = db["profiles"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_employer_profile(doc)


def get_profile(user_id: str) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)
    doc = db["profiles"].find_one({"user_id": oid, "profile_type": "employer"})
    if not doc:
        raise ValueError("Employer profile not found.")
    return serialize_employer_profile(doc)


def update_profile(user_id: str, data: dict) -> dict:
    db  = get_db()
    oid = ObjectId(user_id)

    allowed_fields = {
        "company_name", "company_logo", "industry", "company_size",
        "website", "location", "description", "contact_name", "contact_phone",
    }
    updates = {k: v for k, v in data.items() if k in allowed_fields}
    if not updates:
        raise ValueError("No valid fields provided for update.")

    updates["updated_at"] = datetime.now(timezone.utc)
    db["profiles"].update_one(
        {"user_id": oid, "profile_type": "employer"},
        {"$set": updates},
    )
    return get_profile(user_id)


def get_by_id(employer_id: str) -> dict:
    db = get_db()
    try:
        oid = ObjectId(employer_id)
    except InvalidId:
        raise ValueError("Invalid employer ID.")
    doc = db["profiles"].find_one({"_id": oid, "profile_type": "employer"})
    if not doc:
        raise ValueError("Employer not found.")
    return serialize_employer_profile(doc)
