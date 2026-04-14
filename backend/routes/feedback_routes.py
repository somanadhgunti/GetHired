from flask import Blueprint

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.post("/")
def create_feedback():
    from controllers.feedback_controller import submit_feedback
    return submit_feedback()
