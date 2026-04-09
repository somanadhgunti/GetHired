"""
Group model.

Collection: groups
A Group is owned by a Representative and contains a list of Worker user_ids.
Groups are the vehicle for group-based job applications.
"""

from datetime import datetime, timezone
from bson import ObjectId


def build_group(representative_id: ObjectId, data: dict) -> dict:
    """Return a new group document ready for insertion."""
    now = datetime.now(timezone.utc)
    return {
        "representative_id": representative_id,    # ref → users._id (role=representative)
        "name":              data.get("name", ""),
        "description":       data.get("description", ""),
        "worker_ids":        [],                   # list[ObjectId] → users._id (role=worker)
        "tags":              data.get("tags", []), # skill tags for quick filtering
        "is_active":         True,
        "created_at":        now,
        "updated_at":        now,
    }


def serialize_group(doc: dict) -> dict:
    """Convert group document to JSON-safe dict."""
    return {
        "id":                  str(doc["_id"]),
        "representative_id":   str(doc["representative_id"]),
        "name":                doc.get("name"),
        "description":         doc.get("description"),
        "worker_ids":          [str(wid) for wid in doc.get("worker_ids", [])],
        "member_count":        len(doc.get("worker_ids", [])),
        "tags":                doc.get("tags", []),
        "is_active":           doc.get("is_active", True),
        "created_at":          doc["created_at"].isoformat(),
        "updated_at":          doc["updated_at"].isoformat(),
    }
