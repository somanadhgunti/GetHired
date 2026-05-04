from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

from config import Config
from database import init_db


def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__)

    # ── Config ─────────────────────────────────────────────
    app.config["SECRET_KEY"] = Config.SECRET_KEY
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(seconds=Config.JWT_REFRESH_TOKEN_EXPIRES)
    app.config["RESUME_UPLOAD_DIR"] = Config.RESUME_UPLOAD_DIR
    app.config["MAX_CONTENT_LENGTH"] = Config.MAX_RESUME_FILE_SIZE_MB * 1024 * 1024

    os.makedirs(app.config["RESUME_UPLOAD_DIR"], exist_ok=True)

    # ── Extensions ─────────────────────────────────────────
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=False,
    )
    JWTManager(app)

    # ── Database ───────────────────────────────────────────
    init_db()

    # ── Blueprints ─────────────────────────────────────────
    from routes.auth_routes import auth_bp
    from routes.worker_routes import worker_bp
    from routes.employer_routes import employer_bp
    from routes.representative_routes import representative_bp
    from routes.job_routes import job_bp
    from routes.application_routes import application_bp
    from routes.ai_routes import ai_bp
    from routes.feedback_routes import feedback_bp

    app.register_blueprint(auth_bp,           url_prefix="/api/v1/auth")
    app.register_blueprint(worker_bp,         url_prefix="/api/v1/workers")
    app.register_blueprint(employer_bp,       url_prefix="/api/v1/employers")
    app.register_blueprint(representative_bp, url_prefix="/api/v1/representatives")
    app.register_blueprint(job_bp,            url_prefix="/api/v1/jobs")
    app.register_blueprint(application_bp,    url_prefix="/api/v1/applications")
    app.register_blueprint(ai_bp,             url_prefix="/api/v1/ai")
    app.register_blueprint(feedback_bp,       url_prefix="/api/v1/feedback")

    # ── Health check ───────────────────────────────────────
    @app.get("/api/v1/health")
    def health():
        return {"status": "ok", "version": "1.0.0"}

    return app
