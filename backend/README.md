# GetHired Backend API

A Flask-based REST API backend for the GetHired job platform. Provides comprehensive endpoints for job management, user authentication, applications, AI-powered features, and platform administration.

## Tech Stack

- **Flask** - Web framework
- **SQLAlchemy** - ORM for database management
- **SQLite** - Database (development)
- **JWT** - Authentication and authorization
- **Gemini AI / Groq** - AI-powered resume scoring and recommendations
- **Python 3.9+** - Runtime

## Project Structure

```
backend/
├── app.py              # Flask application initialization
├── config.py           # Configuration settings
├── database.py         # Database setup and connection
├── run.py              # Application entry point
├── requirements.txt    # Python dependencies
├── test_api.py         # API testing utilities
├── utils.py            # Helper functions
├── ai/                 # AI integration modules
│   ├── gemini_client.py    # Google Gemini API client
│   ├── groq_client.py      # Groq API client
│   └── prompts.py          # AI prompt templates
├── models/             # SQLAlchemy ORM models
│   ├── user_model.py
│   ├── employer_model.py
│   ├── worker_model.py
│   ├── job_model.py
│   ├── application_model.py
│   ├── group_model.py
│   └── representative_model.py
├── controllers/        # Business logic and request handlers
│   ├── auth_controller.py
│   ├── job_controller.py
│   ├── application_controller.py
│   ├── employer_controller.py
│   ├── worker_controller.py
│   ├── ai_controller.py
│   └── representative_controller.py
├── routes/             # API endpoint definitions
│   ├── auth_routes.py
│   ├── job_routes.py
│   ├── application_routes.py
│   ├── employer_routes.py
│   ├── worker_routes.py
│   ├── ai_routes.py
│   └── representative_routes.py
├── services/           # Service layer for business logic
│   ├── auth_service.py
│   ├── job_service.py
│   ├── application_service.py
│   ├── employer_service.py
│   ├── worker_service.py
│   ├── ai_service.py
│   └── representative_service.py
└── scratch/            # Experimental code and testing

```

## Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize database:**
   ```bash
   python -c "from database import init_db; init_db()"
   ```

### Running the Application

```bash
python run.py
```

API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /verify` - Verify JWT token
- `POST /refresh` - Refresh access token

### Jobs (`/api/jobs`)
- `GET /` - Get all jobs with filtering
- `GET /<id>` - Get job details
- `POST /` - Create new job (employer)
- `PUT /<id>` - Update job (employer)
- `DELETE /<id>` - Delete job (employer)
- `GET /<id>/applications` - View job applications (employer)

### Applications (`/api/applications`)
- `GET /` - Get user applications
- `POST /` - Submit application
- `GET /<id>` - Get application details
- `PUT /<id>/status` - Update application status (employer/representative)
- `DELETE /<id>` - Withdraw application
- `GET /<id>/feedback` - Get AI feedback on application

### Employers (`/api/employers`)
- `GET /` - Get employer profile
- `PUT /` - Update employer profile
- `GET /jobs` - Get employer's jobs
- `GET /dashboard` - Get employer analytics
- `POST /verify` - Verify employer account

### Workers (`/api/workers`)
- `GET /` - Get worker profile
- `PUT /` - Update worker profile
- `GET /applications` - Get application history
- `POST /resume` - Upload/update resume
- `GET /recommendations` - Get job recommendations

### AI Features (`/api/ai`)
- `POST /score-resume` - AI resume scoring
- `POST /analyze-match` - Job matching analysis
- `POST /generate-cover-letter` - AI cover letter generator
- `POST /interview-prep` - Interview preparation assistant
- `GET /score-history` - Resume scoring history

### Platform Representatives (`/api/representatives`)
- `GET /users` - Get all users (admin)
- `PUT /users/<id>/status` - Ban/activate users
- `GET /applications` - View all applications
- `GET /disputes` - View disputes
- `POST /disputes/<id>/resolve` - Resolve dispute
- `GET /analytics` - Platform analytics

## Models

### User (Base Model)
```python
id: str (UUID)
email: str (unique)
password_hash: str
name: str
role: str (worker, employer, representative)
created_at: datetime
updated_at: datetime
```

### Worker
```python
user_id: str (FK)
resume: str (file path)
resume_score: float
skills: list[str]
experience_level: str
applied_jobs: list[Application]
```

### Employer
```python
user_id: str (FK)
company_name: str
company_url: str
description: str
industry: str
posted_jobs: list[Job]
is_verified: bool
```

### Job
```python
id: str (UUID)
employer_id: str (FK)
title: str
description: str
requirements: str
salary_min: float
salary_max: float
location: str
job_type: str (full-time, part-time, contract)
status: str (open, closed, draft)
posted_at: datetime
applications: list[Application]
```

### Application
```python
id: str (UUID)
job_id: str (FK)
worker_id: str (FK)
status: str (pending, reviewing, accepted, rejected)
ai_score: float
cover_letter: str
applied_at: datetime
```

## Authentication & Authorization

### JWT Implementation
- Tokens are issued on login and include user ID and role
- Tokens must be passed in `Authorization: Bearer <token>` header
- Tokens expire after 24 hours (configurable)

### Role-Based Access Control (RBAC)
```python
# Protect routes based on user role
@auth_required
@role_required(['employer'])
def create_job():
    # Only employers can create jobs
    pass
```

## AI Integration

### Gemini API
- Used for resume analysis and matching
- Configured in `ai/gemini_client.py`
- Requires `GEMINI_API_KEY` environment variable

### Groq API
- Alternative AI provider for high-speed responses
- Configured in `ai/groq_client.py`
- Requires `GROQ_API_KEY` environment variable

### Example Usage
```python
from ai.gemini_client import score_resume

score = score_resume(resume_text)
# Returns: { "score": 8.5, "analysis": "...", "suggestions": [...] }
```

## Configuration

### Environment Variables (`.env`)
```
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///gethired.db
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
JWT_EXPIRATION=86400
CORS_ORIGINS=http://localhost:5173
```

### Configuration File (`config.py`)
```python
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///gethired.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
```

## Service Layer Architecture

Each resource has a dedicated service class:

```python
# services/job_service.py
class JobService:
    @staticmethod
    def get_all_jobs(filters=None):
        # Query and return filtered jobs
        pass
    
    @staticmethod
    def create_job(employer_id, data):
        # Create and return new job
        pass
    
    @staticmethod
    def update_job(job_id, data):
        # Update and return job
        pass
```

## Error Handling

Standard API error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid/missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## Testing

### Running Tests
```bash
python test_api.py
```

### Test Structure
```python
# test_api.py
def test_user_login():
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
```

## Database Management

### Migrations
The application uses SQLAlchemy for schema management. To update the schema:

1. Modify model files in `models/`
2. Recreate database: `python -c "from database import init_db; init_db()"`

### Backup
```bash
# Backup SQLite database
cp gethired.db gethired.db.backup
```

## Development Workflow

### Adding a New Endpoint

1. **Create/update model** in `models/`
```python
# models/example_model.py
class Example(db.Model):
    __tablename__ = 'examples'
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
```

2. **Create service** in `services/`
```python
# services/example_service.py
class ExampleService:
    @staticmethod
    def get_all():
        return Example.query.all()
```

3. **Create controller** in `controllers/`
```python
# controllers/example_controller.py
class ExampleController:
    @staticmethod
    def get_all():
        examples = ExampleService.get_all()
        return jsonify([e.to_dict() for e in examples])
```

4. **Add routes** in `routes/`
```python
# routes/example_routes.py
@example_bp.route('/', methods=['GET'])
def get_examples():
    return ExampleController.get_all()
```

5. **Register blueprint** in `app.py`
```python
from routes.example_routes import example_bp
app.register_blueprint(example_bp, url_prefix='/api/examples')
```

## Performance Optimization

### Database Queries
- Use `select()` with filters to limit results
- Implement pagination: `LIMIT 20 OFFSET 0`
- Index frequently queried columns

### Caching
- Implement Redis caching for expensive operations
- Cache AI scoring results

### API Response
- Return only necessary fields
- Use pagination for large result sets
- Compress responses with gzip

## Security Best Practices

1. **Input Validation** - Validate all inputs in services
2. **SQL Injection Prevention** - Use SQLAlchemy ORM
3. **Password Hashing** - Use bcrypt for password storage
4. **JWT Secrets** - Use strong, random secret keys
5. **CORS** - Configure allowed origins
6. **Rate Limiting** - Implement rate limiting on public endpoints

### Password Security
```python
from werkzeug.security import generate_password_hash, check_password_hash

# Hash password
hashed = generate_password_hash(password)

# Verify password
if check_password_hash(hashed, password):
    # Password is correct
    pass
```

## Deployment

### Production Checklist
- [ ] Set `FLASK_ENV=production`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure database for production (PostgreSQL recommended)
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS origins properly
- [ ] Set up logging and monitoring
- [ ] Run database migrations
- [ ] Create backups

### Running with Production Server
```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database file
ls -la gethired.db

# Reinitialize database
python -c "from database import init_db; init_db()"
```

### AI API Errors
- Verify API keys in `.env`
- Check API rate limits
- Review API documentation

### JWT Token Issues
- Verify token not expired
- Check Authorization header format
- Ensure SECRET_KEY matches

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Follow PEP 8 style guide
3. Add tests for new features
4. Update documentation
5. Submit pull request

## License

This project is part of the GetHired platform.

## Support

For issues and questions, contact the development team.
