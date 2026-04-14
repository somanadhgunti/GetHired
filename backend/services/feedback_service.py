"""
Feedback service: validate payload, persist message, and notify via email.
"""

from datetime import datetime, timezone
from email.message import EmailMessage
import smtplib

from database import get_db
from config import Config


def _require_text(value: str, field_name: str, max_len: int) -> str:
    text = str(value or "").strip()
    if not text:
        raise ValueError(f"{field_name} is required.")
    if len(text) > max_len:
        raise ValueError(f"{field_name} must be at most {max_len} characters.")
    return text


def _build_email_subject(subject: str) -> str:
    return f"GetHired Feedback: {subject}"


def _build_email_body(payload: dict) -> str:
    return (
        "New feedback received from GetHired landing page\n\n"
        f"Name: {payload['name']}\n"
        f"Email: {payload['email']}\n"
        f"Topic: {payload['topic']}\n"
        f"Subject: {payload['subject']}\n"
        "Message:\n"
        f"{payload['message']}\n"
    )


def _send_feedback_email(payload: dict) -> None:
    if not Config.FEEDBACK_TO_EMAIL:
        raise ValueError("FEEDBACK_TO_EMAIL is not configured.")
    if not Config.SMTP_HOST:
        raise ValueError("SMTP_HOST is not configured.")

    sender = Config.SMTP_FROM_EMAIL or Config.SMTP_USERNAME or Config.FEEDBACK_TO_EMAIL
    if not sender:
        raise ValueError("SMTP sender address is not configured.")

    message = EmailMessage()
    message["Subject"] = _build_email_subject(payload["subject"])
    message["From"] = sender
    message["To"] = Config.FEEDBACK_TO_EMAIL
    message["Reply-To"] = payload["email"]
    message.set_content(_build_email_body(payload))

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=20) as smtp:
        if Config.SMTP_USE_TLS:
            smtp.starttls()
        if Config.SMTP_USERNAME and Config.SMTP_PASSWORD:
            smtp.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
        smtp.send_message(message)


def submit_feedback(data: dict) -> dict:
    payload = {
        "name": _require_text(data.get("name", ""), "Name", 100),
        "email": _require_text(data.get("email", ""), "Email", 180),
        "topic": _require_text(data.get("topic", ""), "Topic", 80),
        "subject": _require_text(data.get("subject", ""), "Subject", 140),
        "message": _require_text(data.get("message", ""), "Message", 4000),
    }

    now = datetime.now(timezone.utc)
    feedback_doc = {
        **payload,
        "created_at": now,
    }

    db = get_db()
    result = db["feedback_messages"].insert_one(feedback_doc)

    _send_feedback_email(payload)

    return {
        "id": str(result.inserted_id),
        "message": "Feedback submitted successfully.",
    }
