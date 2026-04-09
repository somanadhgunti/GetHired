from flask import Blueprint

ai_bp = Blueprint("ai", __name__)

# POST /api/v1/ai/profile/analyze
@ai_bp.post("/profile/analyze")
def analyze_profile():
    from controllers.ai_controller import analyze_profile
    return analyze_profile()

# POST /api/v1/ai/jobs/match
@ai_bp.post("/jobs/match")
def match_jobs():
    from controllers.ai_controller import match_jobs
    return match_jobs()

# GET  /api/v1/ai/jobs/recommend
@ai_bp.get("/jobs/recommend")
def recommend_jobs():
    from controllers.ai_controller import recommend_jobs
    return recommend_jobs()

# POST /api/v1/ai/applications/score
@ai_bp.post("/applications/score")
def score_application():
    from controllers.ai_controller import score_application
    return score_application()
