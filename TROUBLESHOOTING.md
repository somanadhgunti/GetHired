# GetHired Troubleshooting Guide

Common issues and solutions for GetHired development and deployment.

## Backend Issues

### Python Environment

#### Issue: `python: command not found`

**Windows:**
```bash
# Check if Python is installed
python --version

# Add Python to PATH or use full path
C:\Python311\python.exe --version
```

**macOS/Linux:**
```bash
# Check if python3 is available
python3 --version

# Create alias if needed
alias python=python3
```

#### Issue: Virtual environment not activating

```bash
# macOS/Linux
source venv/bin/activate

# Windows (cmd)
venv\Scripts\activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

### Dependencies

#### Issue: `ModuleNotFoundError: No module named 'flask'`

```bash
# Verify virtual environment is active
which python  # Should point to venv

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check installed packages
pip list
```

#### Issue: Version conflicts in requirements.txt

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Install specific version
pip install flask==2.3.0

# Generate requirements from current env
pip freeze > requirements.txt
```

### Database

#### Issue: `sqlite3.OperationalError: database is locked`

```bash
# Another process has database open
# Try restarting the application
python run.py

# If still locked, check for stray processes
lsof | grep gethired.db  # macOS/Linux

# Remove lock file (be careful!)
rm gethired.db-shm
rm gethired.db-wal
```

#### Issue: `No such table: users`

```bash
# Database not initialized
python -c "from database import init_db; init_db()"

# Or restart app which auto-initializes
python run.py
```

#### Issue: Database migrations needed

```bash
# Backup current database
cp gethired.db gethired.db.backup

# Reinitialize (deletes existing data)
python -c "from database import init_db; init_db()"

# Restore backup if needed
cp gethired.db.backup gethired.db
```

#### Issue: PostgreSQL connection failed

```bash
# Check connection string
DATABASE_URL=postgresql://user:password@localhost:5432/gethired

# Test connection
psql postgresql://user:password@localhost:5432/gethired

# Verify PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

### Authentication

#### Issue: JWT token expired

```
Response: 401 Unauthorized - Token expired
```

Solution: Get a new token by logging in again

#### Issue: Invalid token signature

```
Response: 401 Unauthorized - Invalid token
```

**Causes:**
- SECRET_KEY changed
- Token from different environment
- Token tampered with

**Solution:** Request new token

#### Issue: CORS error with credentials

```
Error: Cross-Origin Request Blocked
```

**Solution:** In `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_ALLOW_CREDENTIALS=True
```

### API Issues

#### Issue: `404 Not Found` on endpoint

```bash
# Check if route is registered
# routes/*_routes.py
# Check if blueprint is registered in app.py

# Example error response
# POST /api/jobs/invalid-method returns 405
```

**Solution:** Verify method is POST/GET/PUT/DELETE

#### Issue: `400 Bad Request` - Missing fields

```json
{
  "success": false,
  "error": "Missing required field: title"
}
```

**Solution:** Include all required fields in request body

#### Issue: `500 Internal Server Error`

```bash
# Check Flask error logs
python run.py
# Error will show in console

# Enable detailed logging
FLASK_DEBUG=1 python run.py
```

### AI Integration

#### Issue: Gemini API error

```
Error: Failed to score resume
```

**Causes:**
- GEMINI_API_KEY not set
- API key invalid
- API quota exceeded
- Network error

**Solution:**
```bash
# Verify API key in .env
echo $GEMINI_API_KEY

# Test API connection
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY"

# Check quota at: https://console.cloud.google.com
```

#### Issue: Groq API timeout

```
Error: Request to Groq API timed out
```

**Solution:**
```bash
# Increase timeout in ai/groq_client.py
timeout = 30  # seconds

# Check Groq status
# https://status.groq.com
```

## Frontend Issues

### Node.js & npm

#### Issue: `command not found: npm`

```bash
# Check Node installation
node --version
npm --version

# Install Node.js from nodejs.org
# Or use nvm

# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

#### Issue: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Use different registry if needed
npm config set registry https://registry.npmmirror.com
```

### React & Vite

#### Issue: Port 5173 already in use

```bash
# Kill process using port
lsof -i :5173  # Find PID
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

#### Issue: Module not found error

```
Error: Cannot find module '@/components/JobCard'
```

**Solution:** Check `vite.config.ts` alias configuration:
```typescript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

#### Issue: Blank page on load

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab

2. **Common causes:**
   - API URL misconfigured
   - Missing .env.local file
   - CORS error

3. **Solution:**
   ```bash
   # Verify .env.local
   cat .env.local
   # Should have: VITE_API_URL=http://localhost:5000/api

   # Clear browser cache
   # Ctrl+Shift+Delete or Cmd+Shift+Delete
   ```

#### Issue: API calls failing with CORS error

```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

Backend (.env):
```
CORS_ORIGINS=http://localhost:5173
```

Backend (app.py):
```python
from flask_cors import CORS
CORS(app, origins=[os.getenv('CORS_ORIGINS')])
```

#### Issue: TypeScript errors

```
TS2339: Property 'xyz' does not exist
```

**Solution:**
```bash
# Check tsconfig.json
# Restart TypeScript server in VS Code: Cmd+Shift+P > "Restart TS Server"

# Or run type check
npx tsc --noEmit
```

### Styling Issues

#### Issue: Styles not applying

```bash
# Check if CSS files are imported in App.tsx
import './styles/global.css'

# Verify CSS class names
# Check class in HTML vs CSS file

# Clear cache and rebuild
npm run build
npm run dev
```

#### Issue: CSS variables not working

**Solution:** Ensure `:root` in `global.css`:
```css
:root {
  --accent: #7fc241;
  --ink: #1d3557;
  /* ... */
}
```

## Development Workflow

### Git Issues

#### Issue: Merge conflicts

```bash
# Identify conflicted files
git status

# Edit files and resolve conflicts
# Remove conflict markers: <<<<<<<, =======, >>>>>>>

# Mark as resolved
git add .
git commit -m "Resolve merge conflicts"
```

#### Issue: Accidentally committed to wrong branch

```bash
# Revert last commit (keep changes)
git reset HEAD~1

# Switch to correct branch
git checkout -b correct-branch

# Commit changes
git add .
git commit -m "Correct commit message"
```

### Testing

#### Issue: Tests not running

```bash
# Backend tests
cd backend
python test_api.py

# If import errors:
# Add backend directory to PYTHONPATH
PYTHONPATH=$PYTHONPATH:/path/to/backend python test_api.py
```

#### Issue: Database locked during tests

```bash
# Use in-memory database for tests
# In test file
DATABASE_URL = "sqlite:///:memory:"
```

## Production Issues

### Deployment

#### Issue: Application won't start on Heroku

```bash
# Check logs
heroku logs --tail

# Verify Procfile exists
cat Procfile
# Should contain: web: gunicorn app:app

# Restart app
heroku restart
```

#### Issue: Static assets 404 on production

**Frontend:**
```bash
# Verify build output
npm run build
ls -la dist/

# Check asset paths in index.html
# Should not have absolute paths
```

#### Issue: Database empty after deployment

```bash
# Run migrations
heroku run python -c "from database import init_db; init_db()"

# Check database connection
heroku config:get DATABASE_URL
```

### Performance

#### Issue: Slow API responses

1. **Check database queries:**
   ```bash
   # Enable query logging
   SQLALCHEMY_ECHO=True python run.py
   ```

2. **Optimize queries:**
   - Add database indexes
   - Use pagination
   - Implement caching

3. **Monitor:**
   ```python
   import time
   
   @app.before_request
   def log_request_time():
       g.start_time = time.time()
   
   @app.after_request
   def log_response_time(response):
       elapsed = time.time() - g.start_time
       print(f"Request took {elapsed}s")
       return response
   ```

#### Issue: High memory usage

1. **Check for memory leaks:**
   ```bash
   # Monitor process
   top -p <PID>
   ```

2. **Optimize:**
   - Use generators for large datasets
   - Implement proper caching
   - Close database connections

#### Issue: CPU usage high

1. **Identify bottleneck:**
   ```python
   import cProfile
   
   cProfile.run('function_name()')
   ```

2. **Optimize:**
   - Cache expensive operations
   - Use async operations
   - Optimize algorithms

## Debugging Tools

### Backend

#### Flask Debug Mode

```bash
FLASK_DEBUG=1 python run.py
```

Enables:
- Auto-reload on file changes
- Interactive debugger on errors
- Print stack traces

#### Database Inspection

```bash
# SQLite
sqlite3 gethired.db
SELECT * FROM users;

# PostgreSQL
psql gethired
\dt  # List tables
SELECT * FROM users;
```

### Frontend

#### Browser DevTools

1. **Console Tab:**
   - JavaScript errors
   - API logging
   - Custom console.log()

2. **Network Tab:**
   - API request/response
   - Response headers
   - Timing

3. **React DevTools:**
   - Component hierarchy
   - Props inspection
   - State values

#### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/run.py",
      "console": "integratedTerminal"
    }
  ]
}
```

## Getting Help

### Resources

1. **Documentation:**
   - [Backend README](./backend/README.md)
   - [Frontend README](./frontend/README.md)
   - [API Documentation](./API_DOCUMENTATION.md)

2. **External Resources:**
   - Flask: https://flask.palletsprojects.com
   - React: https://react.dev
   - SQLAlchemy: https://sqlalchemy.org

3. **Community:**
   - Stack Overflow
   - GitHub Discussions
   - Discord/Slack communities

### Reporting Issues

When reporting a bug, include:

1. **Error message** (full stack trace)
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment:**
   - OS and version
   - Python/Node version
   - Relevant package versions
6. **Logs** from application

### Debug Checklist

Before asking for help:

- [ ] Read error message carefully
- [ ] Check environment variables
- [ ] Verify dependencies installed
- [ ] Clear cache/rebuilt application
- [ ] Check logs for more details
- [ ] Try minimal reproduction
- [ ] Search existing issues
- [ ] Test in isolation

---

Still stuck? Create an issue with the information above!
