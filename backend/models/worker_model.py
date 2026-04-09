"""
Worker profile model.

Collection: profiles  (role = "worker")
One-to-one with users via user_id.
Supports both technical and non-technical worker types.
"""

from datetime import datetime, timezone
from bson import ObjectId

WORKER_TYPES = {"technical", "non_technical"}

# ── Sub-document schemas ───────────────────────────────────────────────────────
#
# experience_entry:
#   { title, company, start_date, end_date, description }
#
# education_entry:
#   { degree, institution, year }
#
# ai_analysis (written by AI service):
#   { summary, strengths, gaps, score, analyzed_at }


def build_worker_profile(user_id: ObjectId, data: dict) -> dict:
    """Return a new worker profile document ready for insertion."""
    now = datetime.now(timezone.utc)
    return {
        "user_id":          user_id,                               # ref → users._id
        "profile_type":     "worker",
        "worker_type":      data.get("worker_type", "non_technical"),  # technical | non_technical
        "full_name":        data.get("full_name", ""),
        "headline":         data.get("headline", ""),              # short bio / tagline
        "location":         data.get("location", ""),
        "phone":            data.get("phone", ""),
        "skills":           data.get("skills", []),                # list[str]
        "experience":       data.get("experience", []),            # list[experience_entry]
        "education":        data.get("education", []),             # list[education_entry]
        "certifications":   data.get("certifications", []),        # list[str]
        "languages":        data.get("languages", []),             # list[str]
        "availability":     data.get("availability", "immediate"), # "immediate" | "2_weeks" | "1_month"
        "expected_salary":  data.get("expected_salary", None),     # number or null
        "profile_picture":  data.get("profile_picture", ""),       # URL
        "resume_url":       data.get("resume_url", ""),            # URL
        "ai_analysis":      None,                                  # filled by AI service
        "created_at":       now,
        "updated_at":       now,
    }


def serialize_worker_profile(doc: dict) -> dict:
    """Convert worker profile document to JSON-safe dict."""
    return {
        "id":               str(doc["_id"]),
        "user_id":          str(doc["user_id"]),
        "worker_type":      doc.get("worker_type"),
        "full_name":        doc.get("full_name"),
        "headline":         doc.get("headline"),
        "location":         doc.get("location"),
        "phone":            doc.get("phone"),
        "skills":           doc.get("skills", []),
        "experience":       doc.get("experience", []),
        "education":        doc.get("education", []),
        "certifications":   doc.get("certifications", []),
        "languages":        doc.get("languages", []),
        "availability":     doc.get("availability"),
        "expected_salary":  doc.get("expected_salary"),
        "profile_picture":  doc.get("profile_picture"),
        "resume_url":       doc.get("resume_url"),
        "ai_analysis":      doc.get("ai_analysis"),
        "created_at":       doc["created_at"].isoformat(),
        "updated_at":       doc["updated_at"].isoformat(),
    }
