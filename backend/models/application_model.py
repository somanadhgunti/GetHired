"""
Application model.

Collection: applications
Supports both individual (worker) and group (representative + workers) applications.

application_type : "individual" | "group"

Individual app:
  applicant_id  → users._id  (role=worker)
  group_id      → None

Group app:
  applicant_id  → users._id  (role=representative)
  group_id      → groups._id
  worker_ids    → list of users._id (role=worker) selected for this application

Statuses: pending → reviewed → shortlisted → rejected | accepted | withdrawn
"""

from datetime import datetime, timezone
from bson import ObjectId

APPLICATION_TYPES   = {"individual", "group"}
APPLICATION_STATUSES = {"pending", "reviewed", "shortlisted", "rejected", "accepted", "withdrawn"}


def build_individual_application(worker_id: ObjectId, job_id: ObjectId, data: dict) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "job_id":           job_id,             # ref → jobs._id
        "application_type": "individual",
        "applicant_id":     worker_id,          # ref → users._id (role=worker)
        "group_id":         None,
        "worker_ids":       [],                 # empty for individual
        "cover_letter":     data.get("cover_letter", ""),
        "resume_file_name": data.get("resume_file_name", ""),
        "resume_url":       data.get("resume_url", ""),
        "status":           "pending",
        "ai_score":         None,               # filled by AI service
        "employer_notes":   "",
        "applied_at":       now,
        "updated_at":       now,
    }


def build_group_application(
    representative_id: ObjectId,
    group_id: ObjectId,
    job_id: ObjectId,
    worker_ids: list,
    data: dict,
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "job_id":           job_id,             # ref → jobs._id
        "application_type": "group",
        "applicant_id":     representative_id,  # ref → users._id (role=representative)
        "group_id":         group_id,           # ref → groups._id
        "worker_ids":       worker_ids,         # list[ObjectId] selected workers
        "cover_letter":     data.get("cover_letter", ""),
        "resume_file_name": "",                # N/A for group
        "resume_url":       "",                 # N/A for group; individual resumes on profiles
        "status":           "pending",
        "ai_score":         None,
        "employer_notes":   "",
        "applied_at":       now,
        "updated_at":       now,
    }


def serialize_application(doc: dict) -> dict:
    """Convert application document to JSON-safe dict."""
    app_id = str(doc["_id"])
    resume_url = doc.get("resume_url", "")
    if doc.get("resume_file_name"):
        resume_url = f"/api/v1/applications/{app_id}/resume"

    return {
        "id":               app_id,
        "job_id":           str(doc["job_id"]),
        "application_type": doc.get("application_type"),
        "applicant_id":     str(doc["applicant_id"]),
        "group_id":         str(doc["group_id"]) if doc.get("group_id") else None,
        "worker_ids":       [str(wid) for wid in doc.get("worker_ids", [])],
        "cover_letter":     doc.get("cover_letter"),
        "resume_url":       resume_url,
        "status":           doc.get("status"),
        "ai_score":         doc.get("ai_score"),
        "employer_notes":   doc.get("employer_notes"),
        "applied_at":       doc["applied_at"].isoformat(),
        "updated_at":       doc["updated_at"].isoformat(),
    }
