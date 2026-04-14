"""
Groq API client wrapper.
Uses groq SDK with llama3-8b-8192 as default model.
"""

import json
from groq import Groq
from config import Config

_client = Groq(api_key=Config.GROQ_API_KEY)
GROQ_MODEL = "llama3-8b-8192"


def generate(prompt: str) -> dict | list:
    """
    Send a prompt to Groq and return parsed JSON.
    Raises ValueError if the response cannot be parsed as JSON.
    """
    completion = _client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Always respond with valid JSON only, no extra text.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    text = completion.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned non-JSON response: {e}\nRaw: {text}")
