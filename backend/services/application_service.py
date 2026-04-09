"""
Application service — individual and group-based job applications.
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from database import get_db
from models.application_model import (
    build_individual_application,
    build_group_application,
    serialize_application,
    APPLICATION_STATUSES,
)


# ── helpers ───────────────────────────────────────────────────────────────────

def _get_job_or_raise(db, job_id: str) -> dict:
    try:
        joid = ObjectId(job_id)
    except InvalidId:
        raise ValueError("Invalid job ID.")
    job = db["jobs"].find_one({"_id": joid, "status": "open"})
    if not job:
        raise ValueError("Job not found or not open for applications.")

    # Check vacancies
    count = db["applications"].count_documents({
        "job_id": joid,
        "status": {"$in": ["pending", "reviewed", "shortlisted", "accepted"]}
    })
    if count >= job.get("vacancies", 1):
        raise ValueError("Job has reached its application capacity or is full.")

    return job


def _duplicate_check(db, job_id: ObjectId, worker_ids: list[ObjectId]) -> None:
    """
    Ensure NONE of the workers in the list already have an active application
    for this job (either as an individual or part of a group).
    """
    existing_apps = list(db["applications"].find({
        "job_id": job_id,
        "status": {"$ne": "withdrawn"}
    }))

    # Convert search list to string set for foolproof comparison
    search_ids = {str(wid) for wid in worker_ids}
    
    for app in existing_apps:
        # Check primary applicant
        if str(app["applicant_id"]) in search_ids:
            raise ValueError("One or more workers (or representative) have already applied to this job.")
        
        # Check workers inside group application
        for wid in app.get("worker_ids", []):
            if str(wid) in search_ids:
                raise ValueError("A worker in your group has already applied to this job (individually or in another group).")




# ── Individual application ────────────────────────────────────────────────────

def apply_individual(worker_id: str, data: dict) -> dict:
    """Worker applies to a job individually."""
    db  = get_db()
    job = _get_job_or_raise(db, data.get("job_id", ""))

    woid = ObjectId(worker_id)
    _duplicate_check(db, job["_id"], [woid])

    doc    = build_individual_application(woid, job["_id"], data)
    result = db["applications"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_application(doc)


# ── Group application ─────────────────────────────────────────────────────────

def apply_group(representative_id: str, data: dict) -> dict:
    """
    Representative applies on behalf of a group (or subset of workers).
    Required body fields: job_id, group_id, worker_ids (list)
    """
    db  = get_db()
    job = _get_job_or_raise(db, data.get("job_id", ""))

    if not job.get("accepts_group"):
        raise ValueError("This job does not accept group applications.")

    # Validate group ownership
    group_id = data.get("group_id", "")
    try:
        goid = ObjectId(group_id)
        reid = ObjectId(representative_id)
    except InvalidId:
        raise ValueError("Invalid group_id or representative_id.")

    group = db["groups"].find_one({"_id": goid, "representative_id": reid, "is_active": True})
    if not group:
        raise ValueError("Group not found or access denied.")

    # Validate worker_ids are in the group
    requested_ids = data.get("worker_ids", [])
    if not requested_ids:
        raise ValueError("worker_ids list cannot be empty.")

    try:
        worker_oids = [ObjectId(wid) for wid in requested_ids]
    except InvalidId:
        raise ValueError("One or more worker IDs are invalid.")

    group_worker_set = set(str(wid) for wid in group.get("worker_ids", []))
    for woid in worker_oids:
        if str(woid) not in group_worker_set:
            raise ValueError(f"Worker {woid} is not a member of this group.")

    # Size constraints if employer set them
    min_size = job.get("group_size_min")
    max_size = job.get("group_size_max")
    size     = len(worker_oids)
    if min_size and size < min_size:
        raise ValueError(f"Minimum group size for this job is {min_size}.")
    if max_size and size > max_size:
        raise ValueError(f"Maximum group size for this job is {max_size}.")

    _duplicate_check(db, job["_id"], [reid] + worker_oids)

    doc    = build_group_application(reid, goid, job["_id"], worker_oids, data)
    result = db["applications"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_application(doc)


# ── Reads ─────────────────────────────────────────────────────────────────────

def get_my_applications(applicant_id: str) -> list:
    """All applications by this worker or representative."""
    db   = get_db()
    oid  = ObjectId(applicant_id)
    docs = db["applications"].find({"applicant_id": oid}).sort("applied_at", -1)
    return [serialize_application(d) for d in docs]


def get_by_id(application_id: str, user_id: str) -> dict:
    """
    Fetch a single application.
    Accessible by: the applicant OR the employer who owns the job.
    """
    db = get_db()
    try:
        aid  = ObjectId(application_id)
        uoid = ObjectId(user_id)
    except InvalidId:
        raise ValueError("Invalid ID.")

    doc = db["applications"].find_one({"_id": aid})
    if not doc:
        raise ValueError("Application not found.")

    # Access check: is caller the applicant or the job's employer?
    job = db["jobs"].find_one({"_id": doc["job_id"]})
    is_applicant = doc["applicant_id"] == uoid
    is_employer  = job and job["employer_id"] == uoid

    if not (is_applicant or is_employer):
        raise ValueError("Access denied.")

    return serialize_application(doc)


def get_for_job(job_id: str, employer_id: str) -> list:
    """All applications for a job — employer only."""
    db = get_db()
    try:
        joid = ObjectId(job_id)
        eoid = ObjectId(employer_id)
    except InvalidId:
        raise ValueError("Invalid ID.")

    job = db["jobs"].find_one({"_id": joid, "employer_id": eoid})
    if not job:
        raise ValueError("Job not found or access denied.")

    docs = db["applications"].find({"job_id": joid}).sort("applied_at", -1)
    return [serialize_application(d) for d in docs]


# ── Status management ─────────────────────────────────────────────────────────

def update_status(application_id: str, employer_id: str, status: str) -> dict:
    """Employer updates application status."""
    if status not in APPLICATION_STATUSES:
        raise ValueError(f"Invalid status. Must be one of: {', '.join(APPLICATION_STATUSES)}")

    db = get_db()
    try:
        aid  = ObjectId(application_id)
        eoid = ObjectId(employer_id)
    except InvalidId:
        raise ValueError("Invalid ID.")

    doc = db["applications"].find_one({"_id": aid})
    if not doc:
        raise ValueError("Application not found.")

    job = db["jobs"].find_one({"_id": doc["job_id"], "employer_id": eoid})
    if not job:
        raise ValueError("Access denied — not your job.")

    db["applications"].update_one(
        {"_id": aid},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
    )
    doc["status"]     = status
    doc["updated_at"] = datetime.now(timezone.utc)
    return serialize_application(doc)


def withdraw(application_id: str, applicant_id: str) -> None:
    """Applicant withdraws their own application."""
    db = get_db()
    try:
        aid  = ObjectId(application_id)
        uoid = ObjectId(applicant_id)
    except InvalidId:
        raise ValueError("Invalid ID.")

    doc = db["applications"].find_one({"_id": aid, "applicant_id": uoid})
    if not doc:
        raise ValueError("Application not found or access denied.")
    if doc["status"] in ("accepted", "rejected"):
        raise ValueError("Cannot withdraw an already finalised application.")

    db["applications"].update_one(
        {"_id": aid},
        {"$set": {"status": "withdrawn", "updated_at": datetime.now(timezone.utc)}},
    )
