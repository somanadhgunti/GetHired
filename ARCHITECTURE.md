# GetHired Architecture

## System Architecture Overview

GetHired follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - User Interface                                             │
│  - Client-side Routing                                        │
│  - State Management (Context API / Zustand)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ JSON
┌────────────────────────▼────────────────────────────────────┐
│              Backend API (Flask + SQLAlchemy)                │
│  - Request Processing                                         │
│  - Business Logic (Services)                                  │
│  - Authentication & Authorization                            │
│  - Database Operations (ORM)                                  │
│  - AI Integration                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Data Layer                                  │
│  - SQLite/PostgreSQL Database                                │
│  - Caching Layer (Redis - optional)                          │
│  - External AI APIs (Gemini, Groq)                           │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Architecture

### 1. Frontend Architecture

```
src/
├── components/          # Presentational components
│   ├── JobCard.tsx
│   ├── ApplicationForm.tsx
│   └── ...
├── pages/              # Page-level components (routed)
│   ├── JobList.tsx
│   ├── JobDetail.tsx
│   └── ...
├── services/           # API communication layer
│   ├── jobService.ts
│   ├── authService.ts
│   └── ...
├── context/            # Global state (Context API)
│   ├── AuthContext.tsx
│   └── ...
├── types/              # TypeScript interfaces
├── styles/             # Global and component styles
├── lib/                # Utility functions
└── App.tsx             # Root component with routing
```

**Data Flow:**
```
User Action → Component Event Handler 
  ↓
Service Layer (API call via Axios)
  ↓
Backend API
  ↓
Response → Update Component State
  ↓
Component Re-render
```

### 2. Backend Architecture

#### MVC + Service Pattern

```
Request
  ↓
Route (routes/*.py)
  ↓
Controller (controllers/*.py)
  ↓
Service (services/*.py)
  ↓
Model/ORM (models/*.py)
  ↓
Database
```

**Request Flow Example:**
```python
# routes/job_routes.py
@job_bp.route('/', methods=['POST'])
def create_job():
    return JobController.create_job()

# controllers/job_controller.py
class JobController:
    @staticmethod
    def create_job():
        data = request.json
        job = JobService.create_job(data)
        return jsonify(job.to_dict()), 201

# services/job_service.py
class JobService:
    @staticmethod
    def create_job(data):
        job = Job(**data)
        db.session.add(job)
        db.session.commit()
        return job

# models/job_model.py
class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    # ...
```

### 3. Database Schema

```sql
Users (Base)
├── Workers
├── Employers
└── Representatives

Jobs
├── ApplicationFK → User/Worker
├── EmployerFK → Employer
└── StatusField

Applications
├── JobFK → Job
├── WorkerFK → Worker
├── AIScoreField
└── StatusField

Groups
├── RepresentativeFK → Representative
└── UserFK → User
```

#### Entity Relationships

```
Employer  (1)─────────(N) Job
           │
           └──────[owns jobs]

Job       (1)─────────(N) Application
           │
           └──────[has applications]

Worker    (1)─────────(N) Application
           │
           └──────[submits applications]

Representative (1)─────────(N) Group
           │
           └──────[manages groups]

Group     (1)─────────(N) User
           │
           └──────[contains users]
```

## Design Patterns

### Service Layer Pattern

Separates business logic from HTTP handling:

```python
# Bad: Logic in controller
@app.route('/jobs', methods=['POST'])
def create_job():
    data = request.json
    if not data.get('title'): return error
    if len(data['title']) < 3: return error
    job = Job(**data)
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict())

# Good: Separate concerns
# Controller handles HTTP
@app.route('/jobs', methods=['POST'])
def create_job():
    return JobController.create_job()

# Controller delegates to service
class JobController:
    def create_job(self):
        data = request.json
        job = JobService.create_job(data)
        return jsonify(job.to_dict()), 201

# Service contains business logic
class JobService:
    @staticmethod
    def create_job(data):
        JobService.validate_job_data(data)
        job = Job(**data)
        db.session.add(job)
        db.session.commit()
        return job
```

### Repository Pattern (via ORM)

SQLAlchemy provides query operations:

```python
# Instead of writing SQL
user = db.session.execute(
    "SELECT * FROM users WHERE id = ?"
).first()

# Use ORM
user = User.query.get(user_id)
users = User.query.filter_by(role='employer').all()
```

### Factory Pattern

For complex object creation:

```python
class UserFactory:
    @staticmethod
    def create_user(email, name, role):
        if role == 'worker':
            return Worker(email=email, name=name)
        elif role == 'employer':
            return Employer(email=email, name=name)
        else:
            return Representative(email=email, name=name)
```

## Authentication & Authorization

### JWT Flow

```
Login Request
     ↓
Verify Credentials
     ↓
Generate JWT Token (header.payload.signature)
     ↓
Return Token to Client
     ↓
Client Stores Token
     ↓
Authenticated Requests
  ├─ Include Token in Header
  │  Authorization: Bearer <token>
  ├─ Server Validates Token
  └─ Process Request
```

### Role-Based Access Control (RBAC)

```python
@app.route('/jobs', methods=['POST'])
@auth_required
@role_required(['employer'])
def create_job():
    # Only authenticated employers can create jobs
    pass
```

## Data Flow Examples

### Job Search & Filter

```
Frontend:
  User enters search criteria
    ↓
  JobListPage component
    ↓
  Calls jobService.getJobs(filters)
    ↓
Backend:
  GET /api/jobs?title=Developer&location=NYC
    ↓
  job_routes.py → get_jobs()
    ↓
  JobController.get_jobs()
    ↓
  JobService.get_jobs(filters)
    ↓
  Job.query.filter(*conditions).paginate()
    ↓
  Database query execution
    ↓
Frontend:
  Response received
    ↓
  Update component state
    ↓
  Render updated job list
```

### Application Submission with AI Scoring

```
Frontend:
  User clicks Apply
    ↓
  ApplicationForm.onSubmit()
    ↓
  applicationService.submitApplication()
    ↓
Backend:
  POST /api/applications
    ↓
  ApplicationController.create()
    ↓
  ApplicationService.create()
    ├─ Save application
    ├─ Trigger AI scoring
    │  └─ AIService.scoreResume()
    │     └─ Call Gemini API
    └─ Return application with score
    ↓
Frontend:
  Show success message
    ↓
  Redirect to applications page
```

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
  ├─ API Server 1
  ├─ API Server 2
  └─ API Server 3
      ↓
  Shared Database (Primary/Replica)
      ↓
  Cache Layer (Redis)
      ↓
  Object Storage (S3 for resumes)
      ↓
  AI API Quotas
```

### Performance Optimization

1. **Database**:
   - Index frequently queried columns
   - Use connection pooling
   - Implement query caching
   - Archive old data

2. **API**:
   - Implement pagination
   - Use response compression
   - Add HTTP caching headers
   - Rate limiting

3. **Frontend**:
   - Code splitting and lazy loading
   - Image optimization
   - CSS/JS minification
   - Service worker for offline

4. **Caching Strategy**:
   ```python
   @cache.cached(timeout=300)  # Cache for 5 minutes
   def get_featured_jobs():
       return JobService.get_featured()
   ```

## Security Architecture

```
┌─────────────────────────────────┐
│  HTTPS/TLS Encryption           │
├─────────────────────────────────┤
│  CORS Policy                    │
├─────────────────────────────────┤
│  JWT Authentication             │
├─────────────────────────────────┤
│  Input Validation               │
├─────────────────────────────────┤
│  SQL Injection Prevention (ORM) │
├─────────────────────────────────┤
│  Password Hashing (bcrypt)      │
├─────────────────────────────────┤
│  Rate Limiting                  │
├─────────────────────────────────┤
│  Authorization (RBAC)           │
└─────────────────────────────────┘
```

## Testing Architecture

### Unit Tests
```
test/
├── unit/
│   ├── controllers/
│   │   └── test_job_controller.py
│   ├── services/
│   │   └── test_job_service.py
│   └── models/
│       └── test_job_model.py
```

### Integration Tests
```
test/
├── integration/
│   ├── test_job_api.py
│   └── test_application_flow.py
```

### Test Pyramid
```
      /\
     /  \
    / E2E \
   /______\
   /      \
  / Integ. \
 /________\
 /        \
/ Unit     \
/___________\
```

## Deployment Architecture

### Development
```
Developer Laptop
  ├─ Frontend: localhost:5173 (Vite dev server)
  └─ Backend: localhost:5000 (Flask dev server)
```

### Production
```
┌─────────────────────────────────┐
│     CDN (CloudFlare/AWS)        │
│     (Static assets)             │
├─────────────────────────────────┤
│     Load Balancer               │
├─────────────────────────────────┤
│  API Servers (Gunicorn/uWSGI)   │
│  ├─ Instance 1                  │
│  ├─ Instance 2                  │
│  └─ Instance N                  │
├─────────────────────────────────┤
│  Database                       │
│  ├─ Primary (write)             │
│  └─ Replicas (read)             │
├─────────────────────────────────┤
│  Cache (Redis)                  │
├─────────────────────────────────┤
│  Object Storage (S3)            │
│  (Resumes, files)               │
└─────────────────────────────────┘
```

## Future Enhancements

### Event-Driven Architecture
```
Event Bus (RabbitMQ/Kafka)
  ├─ Job Posted Event
  │  └─ Trigger: Send notifications
  ├─ Application Submitted Event
  │  └─ Trigger: AI scoring, emails
  └─ Application Accepted Event
     └─ Trigger: Notifications, updates
```

### Microservices (Future)
```
API Gateway
  ├─ Auth Service
  ├─ Job Service
  ├─ Application Service
  ├─ AI Service
  ├─ Notification Service
  └─ Analytics Service
```

---

For more details, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
