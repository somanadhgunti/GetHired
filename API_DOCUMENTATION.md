# GetHired API Documentation

Complete REST API documentation for the GetHired platform.

## Base URL

```
http://localhost:5000/api
```

Production: `https://api.gethired.com/api`

## Authentication

### JWT Token Format

All authenticated requests require:

```
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "worker"
  }
}
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "code": "SUCCESS"
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication Routes

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Doe",
  "role": "worker"
}
```

**Parameters:**
- `email` (string): User email address (unique)
- `password` (string): Password (min 8 characters)
- `name` (string): Full name
- `role` (string): One of `worker`, `employer`, `representative`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "worker",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "worker"
    }
  }
}
```

#### Verify Token

```http
GET /auth/verify
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "user-123",
    "role": "worker"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-token-here"
  }
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### Jobs Routes

#### Get All Jobs

```http
GET /jobs?page=1&per_page=20&title=Developer&location=NYC
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `title` (string): Filter by job title
- `location` (string): Filter by location
- `salary_min` (int): Minimum salary
- `salary_max` (int): Maximum salary
- `job_type` (string): `full-time`, `part-time`, `contract`
- `status` (string): `open`, `closed`, `draft`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-123",
        "title": "Senior Developer",
        "company": "Tech Corp",
        "company_id": "employer-123",
        "description": "We are looking for...",
        "requirements": "5+ years experience",
        "location": "New York, NY",
        "job_type": "full-time",
        "salary_min": 80000,
        "salary_max": 120000,
        "status": "open",
        "posted_at": "2024-01-10T09:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 50,
    "pages": 3,
    "current_page": 1
  }
}
```

#### Get Job Details

```http
GET /jobs/job-123
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "job-123",
    "title": "Senior Developer",
    "company": "Tech Corp",
    "description": "We are looking for a senior developer with...",
    "requirements": "5+ years experience with React, Node.js",
    "location": "New York, NY",
    "job_type": "full-time",
    "salary_min": 80000,
    "salary_max": 120000,
    "status": "open",
    "applications_count": 15,
    "posted_at": "2024-01-10T09:00:00Z",
    "employer": {
      "id": "employer-123",
      "name": "Tech Corp",
      "website": "https://techcorp.com",
      "industry": "Technology"
    }
  }
}
```

#### Create Job (Employer)

```http
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "requirements": "5+ years experience",
  "location": "New York, NY",
  "job_type": "full-time",
  "salary_min": 80000,
  "salary_max": 120000
}
```

**Required (Employer only):**
- `title` (string)
- `description` (string)
- `location` (string)

**Optional:**
- `requirements` (string)
- `job_type` (string): default `full-time`
- `salary_min` (int)
- `salary_max` (int)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "job-new123",
    "title": "Senior Developer",
    "employer_id": "employer-123",
    "status": "draft"
  }
}
```

#### Update Job (Employer)

```http
PUT /jobs/job-123
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lead Developer",
  "salary_min": 90000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "job-123",
    "title": "Lead Developer",
    "salary_min": 90000
  }
}
```

#### Delete Job (Employer)

```http
DELETE /jobs/job-123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Job deleted successfully"
  }
}
```

#### Get Job Applications (Employer)

```http
GET /jobs/job-123/applications?status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (string): Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-123",
        "worker_id": "worker-123",
        "worker_name": "Jane Smith",
        "status": "pending",
        "ai_score": 8.5,
        "applied_at": "2024-01-14T15:30:00Z"
      }
    ],
    "total": 12
  }
}
```

---

### Applications Routes

#### Submit Application

```http
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job-123",
  "cover_letter": "I am interested in this position..."
}
```

**Required:**
- `job_id` (string)

**Optional:**
- `cover_letter` (string)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "app-new123",
    "job_id": "job-123",
    "worker_id": "worker-123",
    "status": "pending",
    "applied_at": "2024-01-15T11:00:00Z"
  }
}
```

#### Get User Applications

```http
GET /applications?status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (string): Filter by status
- `page` (int): Page number
- `per_page` (int): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-123",
        "job_id": "job-123",
        "job_title": "Senior Developer",
        "company": "Tech Corp",
        "status": "reviewing",
        "ai_score": 8.5,
        "applied_at": "2024-01-14T15:30:00Z"
      }
    ],
    "total": 5
  }
}
```

#### Get Application Details

```http
GET /applications/app-123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "app-123",
    "job_id": "job-123",
    "worker_id": "worker-123",
    "status": "reviewing",
    "cover_letter": "I am interested...",
    "ai_score": 8.5,
    "ai_feedback": "Strong technical background...",
    "applied_at": "2024-01-14T15:30:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Update Application Status (Employer)

```http
PUT /applications/app-123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

**Status Values:**
- `pending` - Initial state
- `reviewing` - Being reviewed
- `accepted` - Approved by employer
- `rejected` - Declined by employer

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "app-123",
    "status": "accepted",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

#### Get AI Feedback

```http
GET /applications/app-123/feedback
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 8.5,
    "feedback": "Strong technical background with React and Node.js",
    "strengths": [
      "Extensive experience with required technologies",
      "Good educational background"
    ],
    "areas_for_improvement": [
      "Limited management experience"
    ]
  }
}
```

#### Withdraw Application

```http
DELETE /applications/app-123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Application withdrawn"
  }
}
```

---

### Workers Routes

#### Get Worker Profile

```http
GET /workers
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "worker-123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "resume_url": "/uploads/resumes/worker-123.pdf",
    "resume_score": 8.2,
    "skills": ["React", "Node.js", "Python"],
    "experience_level": "senior",
    "bio": "Passionate developer with 5+ years experience"
  }
}
```

#### Update Worker Profile

```http
PUT /workers
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["React", "Vue", "Node.js"],
  "experience_level": "senior"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "worker-123",
    "name": "Jane Doe",
    "bio": "Updated bio",
    "skills": ["React", "Vue", "Node.js"]
  }
}
```

#### Upload Resume

```http
POST /workers/resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary pdf content>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resume_url": "/uploads/resumes/worker-123.pdf",
    "resume_score": 8.5,
    "parsed_content": "..."
  }
}
```

#### Get Job Recommendations

```http
GET /workers/recommendations
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "job_id": "job-123",
        "title": "Senior Developer",
        "company": "Tech Corp",
        "match_score": 8.7,
        "reason": "Your skills match 85% of requirements"
      }
    ]
  }
}
```

---

### Employers Routes

#### Get Employer Profile

```http
GET /employers
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "employer-123",
    "company_name": "Tech Corp",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "description": "Leading tech company",
    "is_verified": true
  }
}
```

#### Update Employer Profile

```http
PUT /employers
Authorization: Bearer <token>
Content-Type: application/json

{
  "company_name": "Tech Corp Inc",
  "website": "https://techcorp.com",
  "industry": "Technology"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "employer-123",
    "company_name": "Tech Corp Inc"
  }
}
```

#### Verify Employer Account

```http
POST /employers/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "verification_document": "base64-encoded-file"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verification_status": "pending",
    "message": "Verification submitted for review"
  }
}
```

#### Get Employer Dashboard

```http
GET /employers/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posted_jobs": 5,
    "total_applications": 42,
    "accepted_candidates": 3,
    "active_jobs": 3
  }
}
```

---

### AI Routes

#### Score Resume

```http
POST /ai/score-resume
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 8.5,
    "analysis": "Strong technical background...",
    "suggestions": [
      "Add more project examples",
      "Highlight leadership experience"
    ]
  }
}
```

#### Analyze Job Match

```http
POST /ai/analyze-match
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "match_percentage": 85,
    "matched_skills": ["React", "Node.js"],
    "missing_skills": ["AWS"],
    "analysis": "You have most required skills..."
  }
}
```

#### Generate Cover Letter

```http
POST /ai/generate-cover-letter
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job-123",
  "tone": "professional"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my interest..."
  }
}
```

#### Interview Preparation

```http
POST /ai/interview-prep
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job-123",
  "topic": "technical"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      "What is your experience with React?",
      "Describe your biggest technical challenge"
    ],
    "tips": ["Be specific with examples", "Show your problem-solving approach"]
  }
}
```

#### Score History

```http
GET /ai/score-history
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "job_id": "job-123",
        "job_title": "Senior Developer",
        "score": 8.5,
        "scored_at": "2024-01-14T15:30:00Z"
      }
    ]
  }
}
```

---

### Representative Routes (Admin Only)

#### Get All Users

```http
GET /representatives/users?role=worker&status=active
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "worker",
        "status": "active"
      }
    ],
    "total": 150
  }
}
```

#### Ban/Activate User

```http
PUT /representatives/users/user-123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "banned",
  "reason": "Violation of terms"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "user-123",
    "status": "banned"
  }
}
```

#### View All Applications

```http
GET /representatives/applications?status=pending
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [...]
  }
}
```

#### View Disputes

```http
GET /representatives/disputes
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "disputes": [
      {
        "id": "dispute-123",
        "type": "inappropriate_application",
        "status": "open",
        "reported_by": "user-123",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Resolve Dispute

```http
POST /representatives/disputes/dispute-123/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution": "approved",
  "reason": "Verified that application is appropriate"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dispute_id": "dispute-123",
    "status": "resolved"
  }
}
```

#### Platform Analytics

```http
GET /representatives/analytics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 500,
    "total_jobs": 150,
    "total_applications": 2000,
    "active_employers": 45,
    "new_users_today": 12,
    "applications_today": 25
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid JWT token |
| FORBIDDEN | 403 | Insufficient permissions for action |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

- **Public endpoints**: 100 requests/hour
- **Authenticated endpoints**: 1000 requests/hour
- **AI endpoints**: 100 requests/day

Headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

---

For more information, see [Backend README](./backend/README.md)
