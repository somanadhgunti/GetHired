"""
Job service — CRUD for job postings.
Only employers can create/update/delete jobs.
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.job_model import build_job, serialize_job, JOB_STATUSES


def create_job(employer_id: str, data: dict) -> dict:
    """Create a new job posting. Status starts as 'draft'."""
    db = get_db()

    if not data.get("title", "").strip():
        raise ValueError("Job title is required.")
    if not data.get("description", "").strip():
        raise ValueError("Job description is required.")

    oid    = ObjectId(employer_id)
    doc    = build_job(oid, data)
    result = db["jobs"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_job(doc)


def list_jobs(filters: dict) -> list:
    """
    List open jobs with optional filters:
      ?title=python  ?location=Delhi  ?job_type=full_time
      ?work_mode=remote  ?accepts_group=true
    """
    db    = get_db()
    query = {"status": "open"}

    if filters.get("title"):
        query["$text"] = {"$search": filters["title"]}
    if filters.get("location"):
        query["location"] = {"$regex": filters["location"], "$options": "i"}
    if filters.get("job_type"):
        query["job_type"] = filters["job_type"]
    if filters.get("work_mode"):
        query["work_mode"] = filters["work_mode"]
    if filters.get("accepts_group") in ("true", "1", True):
        query["accepts_group"] = True

    docs = db["jobs"].find(query).sort("created_at", -1).limit(100)
    return [serialize_job(d) for d in docs]


def get_job(job_id: str) -> dict:
    """Fetch a single job by ID."""
    db = get_db()
    try:
        oid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")
    doc = db["jobs"].find_one({"_id": oid})
    if not doc:
        raise ValueError("Job not found.")
    return serialize_job(doc)


def update_job(employer_id: str, job_id: str, data: dict) -> dict:
    """Partial update — employer can only edit their own jobs."""
    db  = get_db()
    oid = ObjectId(employer_id)
    try:
        joid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")

    job = db["jobs"].find_one({"_id": joid, "employer_id": oid})
    if not job:
        raise ValueError("Job not found or access denied.")

    allowed = {
        "title", "description", "requirements", "skills_required",
        "job_type", "work_mode", "location", "salary", "vacancies",
        "accepts_group", "group_size_min", "group_size_max", "application_deadline",
    }
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        raise ValueError("No valid fields provided for update.")

    updates["updated_at"] = datetime.now(timezone.utc)
    db["jobs"].update_one({"_id": joid}, {"$set": updates})
    return get_job(job_id)


def update_status(employer_id: str, job_id: str, status: str) -> dict:
    """Change job status (draft → open → closed | cancelled)."""
    if status not in JOB_STATUSES:
        raise ValueError(f"Invalid status. Must be one of: {', '.join(JOB_STATUSES)}")

    db  = get_db()
    oid = ObjectId(employer_id)
    try:
        joid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")

    job = db["jobs"].find_one({"_id": joid, "employer_id": oid})
    if not job:
        raise ValueError("Job not found or access denied.")

    db["jobs"].update_one(
        {"_id": joid},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
    )
    return get_job(job_id)


def delete_job(employer_id: str, job_id: str) -> None:
    """Soft-delete by setting status to 'cancelled'."""
    update_status(employer_id, job_id, "cancelled")


def get_employer_jobs(employer_id: str) -> list:
    """Fetch all jobs posted by this employer (all statuses)."""
    db   = get_db()
    oid  = ObjectId(employer_id)
    docs = db["jobs"].find({"employer_id": oid}).sort("created_at", -1)
    return [serialize_job(d) for d in docs]
