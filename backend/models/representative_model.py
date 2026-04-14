"""
Representative profile model.

Collection: profiles  (role = "representative")
One-to-one with users via user_id.
A representative manages one or more Groups.
"""

from datetime import datetime, timezone
from bson import ObjectId


def build_representative_profile(user_id: ObjectId, data: dict) -> dict:
    """Return a new representative profile document ready for insertion."""
    now = datetime.now(timezone.utc)
    return {
        "user_id":       user_id,               # ref → users._id
        "profile_type":  "representative",
        "full_name":     data.get("full_name", ""),
        "phone":         data.get("phone", ""),
        "location":      data.get("location", ""),
        "organization":  data.get("organization", ""),   # agency / org they represent
        "bio":           data.get("bio", ""),
        "profile_picture": data.get("profile_picture", ""),  # URL
        "created_at":    now,
        "updated_at":    now,
    }


def serialize_representative_profile(doc: dict) -> dict:
    """Convert representative profile document to JSON-safe dict."""
    return {
        "id":              str(doc["_id"]),
        "user_id":         str(doc["user_id"]),
        "full_name":       doc.get("full_name"),
        "phone":           doc.get("phone"),
        "location":        doc.get("location"),
        "organization":    doc.get("organization"),
        "bio":             doc.get("bio"),
        "profile_picture": doc.get("profile_picture"),
        "created_at":      doc["created_at"].isoformat(),
        "updated_at":      doc["updated_at"].isoformat(),
    }
