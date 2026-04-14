# GetHired - AI-Powered Job Matching Platform

GetHired is a comprehensive job platform that leverages AI to match job seekers with suitable positions and help employers find the right candidates. The platform includes features for resume analysis, job recommendations, AI-powered screening, and complete job lifecycle management.

## 🎯 Project Overview

GetHired connects three main user types:
- **Job Seekers (Workers)** - Browse jobs, apply, get AI resume feedback
- **Employers** - Post jobs, review applications, AI candidate screening
- **Platform Representatives** - Moderate content, manage disputes, analytics

## 🏗️ Project Structure

```
GetHired/
├── backend/                 # Flask REST API
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration
│   ├── database.py         # Database setup
│   ├── models/             # SQLAlchemy ORM models
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints
│   ├── ai/                 # AI integration
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
├── frontend/               # React + TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API integration
│   │   ├── types/          # TypeScript types
│   │   ├── styles/         # CSS stylesheets
│   │   ├── context/        # React Context
│   │   ├── assets/         # Images, fonts
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.9+, pip
- **Frontend**: Node.js 16+, npm
- **API Keys**: Gemini AI or Groq API keys (for AI features)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings (API keys, etc.)

# Initialize database
python -c "from database import init_db; init_db()"

# Run development server
python run.py
```

Backend will be available at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo 'VITE_API_URL=http://localhost:5000/api' > .env.local

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🔑 Key Features

### For Job Seekers
- ✅ Browse and search job listings
- ✅ AI-powered resume analysis and scoring
- ✅ Job recommendations based on profile
- ✅ Apply for positions with AI assistance
- ✅ Track application status
- ✅ Interview preparation with AI

### For Employers
- ✅ Post and manage job listings
- ✅ Review and manage applications
- ✅ AI-powered candidate screening
- ✅ Employer dashboard and analytics
- ✅ Company profile management
- ✅ Candidate matching insights

### For Platform Representatives
- ✅ User account management
- ✅ Content moderation
- ✅ Dispute resolution
- ✅ Platform analytics
- ✅ System administration

## 📚 Technology Stack

### Backend
- **Framework**: Flask (Python web framework)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini API, Groq API

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: CSS + Tailwind
- **HTTP Client**: Axios
- **State Management**: React Context / Zustand

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Jobs
- `GET /jobs` - List all jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs` - Create job (employers)
- `PUT /jobs/:id` - Update job (employers)
- `DELETE /jobs/:id` - Delete job (employers)

#### Applications
- `POST /applications` - Submit application
- `GET /applications` - Get user applications
- `PUT /applications/:id/status` - Update application status
- `GET /applications/:id/feedback` - Get AI feedback

#### AI Features
- `POST /ai/score-resume` - Score resume with AI
- `POST /ai/analyze-match` - Analyze job-resume match
- `POST /ai/generate-cover-letter` - Generate cover letter
- `POST /ai/interview-prep` - Interview preparation

#### Users
- `GET /workers` - Get worker profile
- `PUT /workers` - Update worker profile
- `GET /employers` - Get employer profile
- `PUT /employers` - Update employer profile

For detailed API documentation, see [Backend README](./backend/README.md)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

```
Header: Authorization: Bearer <token>
```

### Login Flow
1. User submits email and password
2. Server validates credentials
3. Server returns JWT token
4. Client includes token in subsequent requests
5. Token expires after 24 hours (configurable)

## 🎨 Design System

### Colors
```css
--accent: #7fc241 (Green)
--ink: #1d3557 (Dark Blue)
--danger: #c84b62 (Red)
--surface: #ffffff (White)
--line: #d8e0ea (Light Border)
```

### Typography
- **Headings**: Space Grotesk (sans-serif)
- **Body**: GT Sectra (serif)
- **Size**: 14px base, scales responsively

### Spacing System
- 8px base unit
- Multiples used: 8px, 12px, 16px, 24px, 32px

### Buttons
- **Primary**: Green background, white text
- **Secondary**: White background, outlined
- **Danger**: Red background, white text

## 🚀 Deployment

### Backend Deployment (Production)

1. Set up PostgreSQL database
2. Consider using Gunicorn or uWSGI as WSGI server
3. Configure reverse proxy (Nginx/Apache)
4. Set `FLASK_ENV=production`
5. Configure HTTPS with SSL certificates

```bash
# With Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to your hosting service (Vercel, Netlify, AWS, etc.)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test_api.py
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 📝 Environment Variables

### Backend (.env)
```
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///gethired.db
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
JWT_EXPIRATION=86400
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GetHired
```

## 🔧 Development Workflow

### Adding a New Feature

1. **Backend**:
   - Create/modify model in `models/`
   - Create service in `services/`
   - Create controller in `controllers/`
   - Add routes in `routes/`
   - Register blueprint in `app.py`

2. **Frontend**:
   - Create component in `components/` or `pages/`
   - Create service in `services/` for API calls
   - Add TypeScript types in `types/`
   - Add styles in `styles/`
   - Update routing in `App.tsx`

### Testing Changes
1. Start backend: `python run.py`
2. Start frontend: `npm run dev`
3. Test API with [test_api.py](./backend/test_api.py) or Postman
4. Test UI in browser

## 📚 Documentation

- [Backend README](./backend/README.md) - API, models, services
- [Frontend README](./frontend/README.md) - Components, styling, services
- [API Postman Collection](./docs/GetHired.postman_collection.json) (if available)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes following the structure above
3. Test thoroughly
4. Commit with clear messages: `git commit -m 'Add feature description'`
5. Push and create Pull Request

### Code Style
- **Python**: Follow PEP 8
- **JavaScript/TypeScript**: Use ESLint configuration
- **CSS**: Follow BEM naming convention

## 🐛 Troubleshooting

### Backend Issues
- Check Python version: `python --version` (need 3.9+)
- Verify virtual environment is activated
- Check database initialization
- Review `.env` configuration

### Frontend Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (need 16+)
- Verify API URL in `.env.local`
- Check browser console for errors

### API Connection Issues
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API URL in frontend `.env.local`
- Check network tab in browser DevTools

## 📊 Project Statistics

- **Backend**: ~2000+ lines of Python code
- **Frontend**: ~3000+ lines of TypeScript/React code
- **Database Models**: 7 main models
- **API Endpoints**: 40+ endpoints
- **Components**: 20+ reusable components

## 📄 License

This project is part of the GetHired platform.

## 👥 Support

For issues, questions, or suggestions, please open an issue or contact the development team.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core job listing and application system
- ✅ AI resume scoring
- ✅ User authentication

### Phase 2 (Planned)
- 🔄 Advanced job filtering and search
- 🔄 Real-time notifications
- 🔄 Video interview integration

### Phase 3 (Future)
- 📅 Marketplace for freelance work
- 📅 Skill verification system
- 📅 Mobile applications

---

Built with ❤️ for job seekers and employers
