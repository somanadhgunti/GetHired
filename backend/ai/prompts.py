"""
Prompt templates for all AI features.
Keep all prompts here so they can be versioned and improved independently.
"""

# ── Profile Analysis ───────────────────────────────────────────────────────────

ANALYZE_WORKER_PROFILE_PROMPT = """
You are an expert HR analyst and career coach. Analyze the following worker profile and provide a structured evaluation.

Worker Profile:
{profile_json}

Respond ONLY with a valid JSON object in this exact structure:
{{
  "summary": "2-3 sentence professional summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "score": <integer 0-100 representing overall profile strength>,
  "analyzed_at": "<ISO 8601 timestamp>"
}}
"""

# ── Job Matching ───────────────────────────────────────────────────────────────

JOB_MATCH_PROMPT = """
You are an expert job-matching engine. Given a worker profile and a list of job postings, score each job by how well it matches the worker.

Worker Profile:
{profile_json}

Job Postings:
{jobs_json}

Respond ONLY with a valid JSON array, one object per job, sorted by match_score descending:
[
  {{
    "job_id": "<job _id>",
    "match_score": <integer 0-100>,
    "match_reasons": ["reason1", "reason2"],
    "missing_skills": ["skill1"]
  }}
]
"""

# ── Job Recommendations ────────────────────────────────────────────────────────

JOB_RECOMMENDATION_PROMPT = """
You are a smart job recommendation engine. Based on the worker's profile and past application history, recommend the most suitable jobs from the available listings.

Worker Profile:
{profile_json}

Application History (job titles applied to):
{history_json}

Available Jobs:
{jobs_json}

Respond ONLY with a valid JSON array of recommended job_ids, ordered by relevance:
{{
  "recommended_job_ids": ["<job_id_1>", "<job_id_2>", ...],
  "reasoning": "Brief explanation of recommendation logic"
}}
"""

# ── Application Scoring ────────────────────────────────────────────────────────

SCORE_APPLICATION_PROMPT = """
You are an AI recruiter assistant. Score the following job application against the job requirements.

Job:
{job_json}

Applicant Profile:
{profile_json}

Cover Letter:
{cover_letter}

Respond ONLY with a valid JSON object:
{{
  "score": <integer 0-100>,
  "verdict": "strong_match" | "moderate_match" | "weak_match",
  "highlights": ["highlight1", "highlight2"],
  "concerns": ["concern1"]
}}
"""
