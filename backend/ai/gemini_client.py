"""
Gemini API client wrapper.
Uses google-generativeai SDK.
"""

import json
import google.generativeai as genai
from config import Config

# Initialise once at import time
genai.configure(api_key=Config.GEMINI_API_KEY)

_model = genai.GenerativeModel("gemini-1.5-flash")


def generate(prompt: str) -> dict | list:
    """
    Send a prompt to Gemini and return parsed JSON.
    Raises ValueError if the response cannot be parsed as JSON.
    """
    response = _model.generate_content(prompt)
    text = response.text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned non-JSON response: {e}\nRaw: {text}")
