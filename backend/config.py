import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Flask ──────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    DEBUG: bool = os.getenv("FLASK_DEBUG", "0") == "1"

    # ── MongoDB ────────────────────────────────────────────
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "work_marketplace")

    # ── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-jwt")
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))

    # ── AI ─────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")  # "gemini" | "groq"
    
    # Models
    GEMINI_FLASH_MODEL: str = os.getenv("GEMINI_FLASH_MODEL", "gemini-1.5-flash")
    GEMINI_PRO_MODEL: str = os.getenv("GEMINI_PRO_MODEL", "gemini-1.5-pro")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3-8b-8192")
