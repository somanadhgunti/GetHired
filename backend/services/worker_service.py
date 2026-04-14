"""
Worker service — profile CRUD.
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.worker_model import build_worker_profile, serialize_worker_profile, WORKER_TYPES
from models.job_model import serialize_job


def _sanitize_list(items):
    if not isinstance(items, list):
        return []
    return [str(i).strip() for i in items if i]


def create_profile(user_id: str, data: dict) -> dict:
    """Create a worker profile. Raises ValueError if one already exists."""
    db  = get_db()
    oid = ObjectId(user_id)

    # Validation
    if data.get("worker_type") and data["worker_type"] not in WORKER_TYPES:
        raise ValueError(f"Invalid worker_type. Must be: {', '.join(WORKER_TYPES)}")

    if db["profiles"].find_one({"user_id": oid}):
        raise ValueError("Profile already exists for this user.")

    doc    = build_worker_profile(oid, data)
    result = db["profiles"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_worker_profile(doc)


def get_profile(user_id: str) -> dict:
    """Return logged-in worker's own profile. Raises ValueError if not found."""
    db  = get_db()
    oid = ObjectId(user_id)
    doc = db["profiles"].find_one({"user_id": oid, "profile_type": "worker"})
    if not doc:
        raise ValueError("Worker profile not found.")
    return serialize_worker_profile(doc)


def update_profile(user_id: str, data: dict) -> dict:
    """Partial update on the worker's own profile."""
    db  = get_db()
    oid = ObjectId(user_id)

    allowed_fields = {
        "full_name", "headline", "location", "phone", "skills",
        "experience", "education", "certifications", "languages",
        "availability", "expected_salary", "profile_picture",
        "resume_url", "worker_type",
    }
    updates = {k: v for k, v in data.items() if k in allowed_fields}
    if not updates:
        raise ValueError("No valid fields provided for update.")

    if updates.get("worker_type") and updates["worker_type"] not in WORKER_TYPES:
        raise ValueError(f"Invalid worker_type. Must be: {', '.join(WORKER_TYPES)}")

    # Sanitize lists
    for list_field in ["skills", "certifications", "languages"]:
        if list_field in updates:
            updates[list_field] = _sanitize_list(updates[list_field])

    updates["updated_at"] = datetime.now(timezone.utc)
    db["profiles"].update_one(
        {"user_id": oid, "profile_type": "worker"},
        {"$set": updates},
    )
    return get_profile(user_id)


def get_by_id(worker_id: str) -> dict:
    """Fetch any worker profile by its profile _id."""
    db = get_db()
    try:
        oid = ObjectId(worker_id)
    except InvalidId:
        raise ValueError("Invalid worker ID.")
    doc = db["profiles"].find_one({"_id": oid, "profile_type": "worker"})
    if not doc:
        raise ValueError("Worker not found.")
    return serialize_worker_profile(doc)


def list_all(filters: dict) -> list:
    """
    List workers with optional query params:
      ?skills=python,flask  ?worker_type=technical  ?location=Delhi
    """
    db    = get_db()
    query = {"profile_type": "worker"}

    if filters.get("worker_type"):
        query["worker_type"] = filters["worker_type"]
    if filters.get("location"):
        query["location"] = {"$regex": filters["location"], "$options": "i"}
    if filters.get("skills"):
        skill_list = [s.strip() for s in filters["skills"].split(",")]
        query["skills"] = {"$all": skill_list}

    docs = db["profiles"].find(query).sort("created_at", -1).limit(50)
    return [serialize_worker_profile(d) for d in docs]


def list_saved_jobs(user_id: str) -> list:
    """Return full job documents saved by this worker, newest saved first."""
    db = get_db()
    oid = ObjectId(user_id)

    saved_docs = list(
        db["saved_jobs"].find({"user_id": oid}).sort("created_at", -1)
    )
    if not saved_docs:
        return []

    ordered_job_ids = [d["job_id"] for d in saved_docs]
    jobs = list(db["jobs"].find({"_id": {"$in": ordered_job_ids}}))
    by_id = {job["_id"]: job for job in jobs}

    return [
        serialize_job(by_id[job_id])
        for job_id in ordered_job_ids
        if job_id in by_id
    ]


def save_job(user_id: str, job_id: str) -> dict:
    """Save a job for this worker. Idempotent."""
    db = get_db()
    oid = ObjectId(user_id)

    try:
        job_oid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")

    job_exists = db["jobs"].find_one({"_id": job_oid})
    if not job_exists:
        raise ValueError("Job not found.")

    db["saved_jobs"].update_one(
        {"user_id": oid, "job_id": job_oid},
        {"$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"saved": True, "job_id": job_id}


def unsave_job(user_id: str, job_id: str) -> dict:
    """Remove a saved job for this worker. Idempotent."""
    db = get_db()
    oid = ObjectId(user_id)

    try:
        job_oid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")

    result = db["saved_jobs"].delete_one({"user_id": oid, "job_id": job_oid})
    return {"saved": False, "job_id": job_id, "removed": result.deleted_count > 0}
