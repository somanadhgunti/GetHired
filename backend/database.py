from pymongo import MongoClient
from pymongo.database import Database
from config import Config

_client: MongoClient = None
_db: Database = None


def init_db() -> Database:
    """Initialise the MongoDB connection and return the database handle."""
    global _client, _db
    _client = MongoClient(Config.MONGO_URI)
    _db = _client[Config.MONGO_DB_NAME]
    _ensure_indexes()
    return _db


def get_db() -> Database:
    """Return the active database handle. Raises if init_db() was not called."""
    if _db is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")
    return _db


def _ensure_indexes() -> None:
    """Create all collection indexes on startup."""
    # users
    _db["users"].create_index("email", unique=True)

    # profiles
    _db["profiles"].create_index("user_id", unique=True)

    # jobs
    _db["jobs"].create_index([("title", "text"), ("description", "text")])
    _db["jobs"].create_index("employer_id")
    _db["jobs"].create_index("status")

    # applications
    _db["applications"].create_index("job_id")
    _db["applications"].create_index("applicant_id")

    # groups
    _db["groups"].create_index("representative_id")
