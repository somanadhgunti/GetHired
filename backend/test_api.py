"""
End-to-end smoke test for the Work Marketplace API.
Runs against a live local server (http://127.0.0.1:5000).

Note: Forces UTF-8 stdout so Unicode chars render on Windows.

Usage:
    # Terminal 1 — start the server
    python run.py

    # Terminal 2 — run the tests
    python test_api.py
"""

import sys
import io
import json
import requests

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = "http://127.0.0.1:5000/api/v1"
PASS = "[PASS]"
FAIL = "[FAIL]"

errors = []

def check(label: str, resp: requests.Response, expected_status: int) -> dict:
    ok   = resp.status_code == expected_status
    icon = PASS if ok else FAIL
    print(f"  {icon} {label}  [{resp.status_code}]")
    if not ok:
        errors.append(f"{label}: expected {expected_status}, got {resp.status_code} — {resp.text[:200]}")
    try:
        return resp.json()
    except Exception:
        return {}


def h(token: str = None) -> dict:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


print("\n" + "=" * 45)
print("  Work Marketplace API -- Smoke Test")
print("=" * 45 + "\n")

# ── Health ─────────────────────────────────────────────────
print("[ Health ]")
r = requests.get(f"{BASE}/health")
check("GET /health", r, 200)

# ── Auth ───────────────────────────────────────────────────
print("\n[ Auth — Worker ]")
r = requests.post(f"{BASE}/auth/register", json={
    "email": "worker1@test.com", "password": "pass1234", "role": "worker"
}, headers=h())
d = check("POST /auth/register (worker)", r, 201)
worker_token = d.get("access_token", "")

r = requests.post(f"{BASE}/auth/login", json={
    "email": "worker1@test.com", "password": "pass1234"
}, headers=h())
d = check("POST /auth/login (worker)", r, 200)
worker_token = d.get("access_token", worker_token)

print("\n[ Auth — Employer ]")
r = requests.post(f"{BASE}/auth/register", json={
    "email": "employer1@test.com", "password": "pass1234", "role": "employer"
}, headers=h())
d = check("POST /auth/register (employer)", r, 201)
employer_token = d.get("access_token", "")

print("\n[ Auth — Representative ]")
r = requests.post(f"{BASE}/auth/register", json={
    "email": "rep1@test.com", "password": "pass1234", "role": "representative"
}, headers=h())
d = check("POST /auth/register (representative)", r, 201)
rep_token = d.get("access_token", "")

r = requests.post(f"{BASE}/auth/refresh", headers=h(d.get("refresh_token", "")))
check("POST /auth/refresh", r, 200)

# ── Worker Profile ─────────────────────────────────────────
print("\n[ Worker Profile ]")
r = requests.post(f"{BASE}/workers/profile", json={
    "full_name": "Alice Dev",
    "headline": "Python Backend Engineer",
    "skills": ["python", "flask", "mongodb"],
    "worker_type": "technical",
    "location": "Delhi",
    "availability": "immediate",
}, headers=h(worker_token))
check("POST /workers/profile", r, 201)

r = requests.get(f"{BASE}/workers/profile", headers=h(worker_token))
check("GET /workers/profile", r, 200)

r = requests.put(f"{BASE}/workers/profile", json={
    "headline": "Senior Python Engineer",
    "expected_salary": 80000,
}, headers=h(worker_token))
check("PUT /workers/profile", r, 200)

r = requests.get(f"{BASE}/workers/?skills=python&worker_type=technical")
check("GET /workers/ (list)", r, 200)

# ── Employer Profile ───────────────────────────────────────
print("\n[ Employer Profile ]")
r = requests.post(f"{BASE}/employers/profile", json={
    "company_name": "TechCorp Ltd",
    "industry": "Software",
    "company_size": "11-50",
    "location": "Bangalore",
    "contact_name": "Bob HR",
}, headers=h(employer_token))
check("POST /employers/profile", r, 201)

r = requests.get(f"{BASE}/employers/profile", headers=h(employer_token))
check("GET /employers/profile", r, 200)

# ── Representative Profile + Groups ───────────────────────
print("\n[ Representative Profile + Groups ]")
r = requests.post(f"{BASE}/representatives/profile", json={
    "full_name": "Carol Rep",
    "organization": "WorkForce Agency",
    "location": "Mumbai",
}, headers=h(rep_token))
check("POST /representatives/profile", r, 201)

r = requests.post(f"{BASE}/representatives/groups", json={
    "name": "Python Squad",
    "description": "Group of Python developers",
    "tags": ["python", "backend"],
}, headers=h(rep_token))
d = check("POST /representatives/groups", r, 201)
group_id = d.get("id", "")

r = requests.get(f"{BASE}/representatives/groups", headers=h(rep_token))
check("GET /representatives/groups", r, 200)

# ── Jobs ───────────────────────────────────────────────────
print("\n[ Jobs ]")
r = requests.post(f"{BASE}/jobs/", json={
    "title": "Python Backend Developer",
    "description": "We need a Flask expert.",
    "skills_required": ["python", "flask"],
    "job_type": "full_time",
    "work_mode": "remote",
    "location": "Remote",
    "vacancies": 2,
    "accepts_group": True,
    "group_size_min": 1,
    "group_size_max": 5,
}, headers=h(employer_token))
d = check("POST /jobs/", r, 201)
job_id = d.get("id", "")

r = requests.patch(f"{BASE}/jobs/{job_id}/status", json={"status": "open"}, headers=h(employer_token))
check("PATCH /jobs/<id>/status → open", r, 200)

r = requests.get(f"{BASE}/jobs/")
check("GET /jobs/ (list)", r, 200)

r = requests.get(f"{BASE}/jobs/{job_id}")
check("GET /jobs/<id>", r, 200)

r = requests.get(f"{BASE}/jobs/my", headers=h(employer_token))
check("GET /jobs/my", r, 200)

# ── Individual Application ─────────────────────────────────
print("\n[ Individual Application ]")
r = requests.post(f"{BASE}/applications/", json={
    "job_id": job_id,
    "cover_letter": "I am a great Python developer.",
}, headers=h(worker_token))
d = check("POST /applications/ (individual)", r, 201)
app_id = d.get("id", "")

r = requests.get(f"{BASE}/applications/my", headers=h(worker_token))
check("GET /applications/my (worker)", r, 200)

r = requests.get(f"{BASE}/applications/job/{job_id}", headers=h(employer_token))
check("GET /applications/job/<id> (employer)", r, 200)

r = requests.patch(f"{BASE}/applications/{app_id}/status",
    json={"status": "shortlisted"}, headers=h(employer_token))
check("PATCH /applications/<id>/status → shortlisted", r, 200)

# ── Logout ─────────────────────────────────────────────────
print("\n[ Logout ]")
r = requests.post(f"{BASE}/auth/logout", headers=h(worker_token))
check("POST /auth/logout", r, 200)

# ── NEW: Group Application (The "IMPORTANT" feature) ──────────
print("\n[ Group Application Flow ]")
# 1. Create a second worker and profile
r = requests.post(f"{BASE}/auth/register", json={
    "email": "worker2@test.com", "password": "pass1234", "role": "worker"
}, headers=h())
d = check("POST /auth/register (worker 2)", r, 201)
worker2_id = d["user"]["id"]
worker2_token = d["access_token"]

requests.post(f"{BASE}/workers/profile", json={
    "full_name": "Bob Junior", "worker_type": "technical", "skills": ["python"]
}, headers=h(worker2_token))

# 2. Add worker 2 to the Python Squad group
r = requests.post(f"{BASE}/representatives/groups/{group_id}/members",
    json={"worker_id": worker2_id}, headers=h(rep_token))
check("POST /groups/id/members (Add Worker 2)", r, 200)

# 3. Apply as group to the job
r = requests.post(f"{BASE}/applications/group", json={
    "job_id": job_id,
    "group_id": group_id,
    "worker_ids": [worker2_id],
    "cover_letter": "Team submission for Python role."
}, headers=h(rep_token))
check("POST /applications/group (Success)", r, 201)

# 4. Try to apply as group AGAIN (Duplicate check)
r = requests.post(f"{BASE}/applications/group", json={
    "job_id": job_id,
    "group_id": group_id,
    "worker_ids": [worker2_id],
}, headers=h(rep_token))
check("POST /applications/group (Duplicate Bloocked)", r, 400)

# 5. Try individual application for worker who is in the group (Duplicate check)
r = requests.post(f"{BASE}/applications/", json={
    "job_id": job_id,
}, headers=h(worker2_token))
check("POST /applications/ (Worker 2 Bloocked because already in Group App)", r, 400)

# ── Negative Tests ─────────────────────────────────────────
print("\n[ Negative Tests ]")
r = requests.post(f"{BASE}/jobs/", json={"title": "Hack"}, headers=h(worker_token))
check("Worker trying to post job (RBAC)", r, 403)

r = requests.post(f"{BASE}/workers/profile", json={"worker_type": "magician"}, headers=h(worker_token))
check("Invalid worker_type (Validation)", r, 400)

# ── Summary ─────────────────────────────────────────────────
print("\n" + "=" * 45)
if errors:
    print(f"  {FAIL} {len(errors)} test(s) FAILED:\n")
    for e in errors:
        print(f"    * {e}")
else:
    print(f"  {PASS} All tests passed!")
print("=" * 45 + "\n")

sys.exit(1 if errors else 0)
