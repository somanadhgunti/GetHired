"""
Job model.

Collection: jobs
Posted by employers. Supports individual and group applications.

Statuses: open → closed | cancelled (draft still supported for legacy/manual flows)
"""

from datetime import datetime, timezone
from bson import ObjectId

JOB_STATUSES = {"draft", "open", "closed", "cancelled"}
JOB_TYPES    = {"full_time", "part_time", "contract", "freelance", "internship"}
WORK_MODES   = {"on_site", "remote", "hybrid"}

# ── Salary sub-document ───────────────────────────────────
# { min: int, max: int, currency: str, period: "monthly" | "yearly" | "hourly" }


def build_job(employer_id: ObjectId, data: dict) -> dict:
    """Return a new job document ready for insertion."""
    now = datetime.now(timezone.utc)
    return {
        "employer_id":         employer_id,                         # ref → users._id
        "title":               data.get("title", ""),
        "description":         data.get("description", ""),
        "requirements":        data.get("requirements", []),        # list[str]
        "skills_required":     data.get("skills_required", []),     # list[str]
        "job_type":            data.get("job_type", "full_time"),   # JOB_TYPES
        "work_mode":           data.get("work_mode", "on_site"),    # WORK_MODES
        "location":            data.get("location", ""),
        "salary":              data.get("salary", None),            # salary sub-doc
        "vacancies":           data.get("vacancies", 1),            # int
        "accepts_group":       data.get("accepts_group", False),    # bool: allow group apps
        "group_size_min":      data.get("group_size_min", None),    # min workers in group
        "group_size_max":      data.get("group_size_max", None),    # max workers in group
        "application_deadline": data.get("application_deadline", None),  # datetime | null
        "status":              data.get("status", "open"),         # JOB_STATUSES
        "created_at":          now,
        "updated_at":          now,
    }


def serialize_job(doc: dict) -> dict:
    """Convert job document to JSON-safe dict."""
    return {
        "id":                  str(doc["_id"]),
        "employer_id":         str(doc["employer_id"]),
        "title":               doc.get("title"),
        "description":         doc.get("description"),
        "requirements":        doc.get("requirements", []),
        "skills_required":     doc.get("skills_required", []),
        "job_type":            doc.get("job_type"),
        "work_mode":           doc.get("work_mode"),
        "location":            doc.get("location"),
        "salary":              doc.get("salary"),
        "vacancies":           doc.get("vacancies"),
        "accepts_group":       doc.get("accepts_group", False),
        "group_size_min":      doc.get("group_size_min"),
        "group_size_max":      doc.get("group_size_max"),
        "application_deadline": doc["application_deadline"].isoformat()
                                 if doc.get("application_deadline") else None,
        "status":              doc.get("status"),
        "created_at":          doc["created_at"].isoformat(),
        "updated_at":          doc["updated_at"].isoformat(),
    }
