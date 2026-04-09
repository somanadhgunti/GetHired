"""
Employer profile model.

Collection: profiles  (role = "employer")
One-to-one with users via user_id.
"""

from datetime import datetime, timezone
from bson import ObjectId


def build_employer_profile(user_id: ObjectId, data: dict) -> dict:
    """Return a new employer profile document ready for insertion."""
    now = datetime.now(timezone.utc)
    return {
        "user_id":          user_id,               # ref → users._id
        "profile_type":     "employer",
        "company_name":     data.get("company_name", ""),
        "company_logo":     data.get("company_logo", ""),   # URL
        "industry":         data.get("industry", ""),
        "company_size":     data.get("company_size", ""),   # "1-10" | "11-50" | "51-200" | "200+"
        "website":          data.get("website", ""),
        "location":         data.get("location", ""),
        "description":      data.get("description", ""),
        "contact_name":     data.get("contact_name", ""),
        "contact_phone":    data.get("contact_phone", ""),
        "verified":         False,                          # admin-verified flag
        "created_at":       now,
        "updated_at":       now,
    }


def serialize_employer_profile(doc: dict) -> dict:
    """Convert employer profile document to JSON-safe dict."""
    return {
        "id":            str(doc["_id"]),
        "user_id":       str(doc["user_id"]),
        "company_name":  doc.get("company_name"),
        "company_logo":  doc.get("company_logo"),
        "industry":      doc.get("industry"),
        "company_size":  doc.get("company_size"),
        "website":       doc.get("website"),
        "location":      doc.get("location"),
        "description":   doc.get("description"),
        "contact_name":  doc.get("contact_name"),
        "contact_phone": doc.get("contact_phone"),
        "verified":      doc.get("verified", False),
        "created_at":    doc["created_at"].isoformat(),
        "updated_at":    doc["updated_at"].isoformat(),
    }
