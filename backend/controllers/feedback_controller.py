"""
Feedback controller.
"""

from flask import request

from utils import error, success
import services.feedback_service as feedback_service


def submit_feedback():
    data = request.get_json(silent=True) or {}
    try:
        result = feedback_service.submit_feedback(data)
    except ValueError as e:
        return error(str(e), 400)
    except Exception:
        return error("Unable to process feedback at the moment.", 500)

    return success(result, 201)
