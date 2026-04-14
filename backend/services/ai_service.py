import json
import logging
import re
from typing import Any, Dict, List, Optional, Union

import google.generativeai as genai
from groq import Groq

from config import Config

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered features in the Work Marketplace."""

    def __init__(self):
        self.provider = Config.AI_PROVIDER.lower()
        self._gemini_flash = None
        self._gemini_pro = None
        self._groq_client = None

    @property
    def gemini_flash(self):
        if self._gemini_flash is None and Config.GEMINI_API_KEY:
            try:
                genai.configure(api_key=Config.GEMINI_API_KEY)
                self._gemini_flash = genai.GenerativeModel(Config.GEMINI_FLASH_MODEL)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Flash: {e}")
        return self._gemini_flash

    @property
    def gemini_pro(self):
        if self._gemini_pro is None and Config.GEMINI_API_KEY:
            try:
                genai.configure(api_key=Config.GEMINI_API_KEY)
                self._gemini_pro = genai.GenerativeModel(Config.GEMINI_PRO_MODEL)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Pro: {e}")
        return self._gemini_pro

    @property
    def groq_client(self):
        if self._groq_client is None and Config.GROQ_API_KEY:
            try:
                self._groq_client = Groq(api_key=Config.GROQ_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
        return self._groq_client

    def _clean_json_response(self, text: str) -> str:
        """Extract JSON content from a text that might contain markdown blocks."""
        # Find JSON block in markdown
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        return text.strip()

    def _call_ai(self, prompt: str, system_instruction: str = "", model_type: str = "flash") -> Dict[str, Any]:
        """Generic AI call wrapper with JSON parsing and error handling."""
        try:
            if self.provider == "gemini":
                return self._call_gemini(prompt, system_instruction, model_type)
            elif self.provider == "groq":
                return self._call_groq(prompt, system_instruction)
            else:
                raise ValueError(f"Unsupported AI provider: {self.provider}")
        except Exception as e:
            logger.error(f"AI Call failed: {str(e)}")
            return {"error": "AI service unavailable", "details": str(e)}

    def _call_gemini(self, prompt: str, system_instruction: str, model_type: str) -> Dict[str, Any]:
        model = self.gemini_pro if model_type == "pro" else self.gemini_flash
        if not model:
            raise ValueError("Gemini API key not configured")

        full_prompt = f"{system_instruction}\n\nUSER INPUT:\n{prompt}\n\nStrictly return JSON only."
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        if not response.text:
            raise ValueError("Empty response from Gemini")
            
        return json.loads(self._clean_json_response(response.text))

    def _call_groq(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        if not self.groq_client:
            raise ValueError("Groq API key not configured")

        response = self.groq_client.chat.completions.create(
            model=Config.GROQ_MODEL,
            messages=[
                {"role": "system", "content": f"{system_instruction}\nStrictly return JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    def analyze_profile(self, resume_text: str) -> Dict[str, Any]:
        """Analyze a resume/profile for strengths, weaknesses, and scores."""
        system_instruction = """
        You are an expert HR and recruitment AI. Analyze the provided resume text.
        Output MUST be a JSON object with these fields:
        - score: (number 0-100)
        - strengths: (list of strings)
        - weaknesses: (list of strings)
        - missing_skills: (list of strings)
        - suggestions: (list of strings)
        """
        return self._call_ai(resume_text, system_instruction, model_type="pro")

    def match_job(self, profile_data: Union[str, Dict], job_description: str) -> Dict[str, Any]:
        """Evaluate how well a profile matches a specific job."""
        prompt = f"PROFILE:\n{json.dumps(profile_data) if isinstance(profile_data, dict) else profile_data}\n\nJOB:\n{job_description}"
        system_instruction = """
        You are a job matching AI. Compare the profile against the job description.
        Output MUST be a JSON object with these fields:
        - match_score: (number 0-100)
        - eligibility: ("Yes" or "No")
        - reasoning: (string explaining the decision)
        """
        return self._call_ai(prompt, system_instruction, model_type="flash")

    def simplify_job(self, job_description: str) -> Dict[str, Any]:
        """Simplify a technical or complex job description for non-tech users."""
        system_instruction = """
        You are a clarity expert. Rewrite the job description to be simple, easy to understand, and jargon-free.
        Identify the core tasks and benefits.
        Output MUST be a JSON object:
        { "simplified_text": "..." }
        """
        return self._call_ai(job_description, system_instruction, model_type="flash")

    def recommend_jobs(self, skills: List[str], location: str, context_jobs: List[Dict]) -> Dict[str, Any]:
        """Rank and filter existing jobs from context based on user profile."""
        if not context_jobs:
            # Fallback to broad categories
            system_instruction = """
            No specific jobs provided. Suggest 5 broad job categories based on the skills and location.
            Output MUST be a JSON object:
            { "recommendations": [{"category": "...", "explanation": "..."}] }
            """
            prompt = f"SKILLS: {', '.join(skills)}\nLOCATION: {location}"
            return self._call_ai(prompt, system_instruction, model_type="flash")

        # Extract only necessary fields for context to save tokens
        simplified_context = []
        for job in context_jobs:
            simplified_context.append({
                "job_id": str(job.get("_id", job.get("job_id", ""))),
                "title": job.get("title", ""),
                "description": job.get("description", "")[:500] # Truncate for efficiency
            })

        prompt = f"SKILLS: {', '.join(skills)}\nLOCATION: {location}\nAVAILABLE JOBS:\n{json.dumps(simplified_context)}"
        system_instruction = """
        Rank the provided AVAILABLE JOBS based on how well they match the user's SKILLS and LOCATION.
        Return the top 5 most relevant jobs.
        Output MUST be a JSON object:
        { "recommendations": [{"job_id": "...", "title": "...", "match_score": 0-100, "explanation": "..."}] }
        """
        return self._call_ai(prompt, system_instruction, model_type="flash")

# Global instance
ai_service = AIService()
