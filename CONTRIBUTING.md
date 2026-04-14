# Contributing to GetHired

Thank you for your interest in contributing to GetHired! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others succeed

## Getting Started

### Fork and Clone

```bash
git clone https://github.com/yourusername/GetHired.git
cd GetHired
git remote add upstream https://github.com/original/GetHired.git
```

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-video-interviews`
- `fix/fix-resume-upload-bug`
- `docs/update-api-documentation`

## Development Setup

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python -c "from database import init_db; init_db()"

# Run tests
python test_api.py

# Start development server
python run.py
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## Code Style Guidelines

### Python (Backend)

Follow PEP 8:

```python
# Class names: PascalCase
class UserService:
    # Method names: snake_case
    def get_user_by_id(self, user_id):
        # Variable names: snake_case
        user = User.query.get(user_id)
        return user

# Constants: UPPER_SNAKE_CASE
MAX_FILE_SIZE = 5242880  # 5MB

# Private methods/attributes: _leading_underscore
def _validate_email(email):
    pass
```

### TypeScript/JavaScript (Frontend)

Follow ESLint configuration:

```typescript
// Component names: PascalCase
export const JobCard: React.FC<Props> = ({ job }) => {
  // Variable names: camelCase
  const jobTitle = job.title
  
  // Functions: camelCase
  const handleApply = () => {
    // Implementation
  }
  
  return <div className="job-card">{jobTitle}</div>
}

// Constants: UPPER_SNAKE_CASE
const API_TIMEOUT = 5000

// CSS classes: kebab-case
// className="job-card__title job-card__title--featured"
```

### CSS

Follow BEM (Block Element Modifier) naming:

```css
/* Block */
.job-card {
  padding: 16px;
  border-radius: 8px;
}

/* Element */
.job-card__title {
  font-size: 18px;
  font-weight: 600;
}

/* Modifier */
.job-card--featured {
  box-shadow: var(--shadow);
}

.job-card__title--primary {
  color: var(--accent);
}
```

## Testing

### Backend Tests

```bash
cd backend
python test_api.py
```

Write tests for new features:

```python
def test_create_job():
    job_data = {
        'title': 'Senior Developer',
        'description': 'We are looking for...',
        'salary_min': 80000,
        'salary_max': 120000
    }
    response = client.post('/api/jobs', json=job_data)
    assert response.status_code == 201
    assert response.json['success'] == True
```

### Frontend Tests

```bash
cd frontend
npm run test
```

Write component tests:

```typescript
import { render, screen } from '@testing-library/react'
import { JobCard } from './JobCard'

test('renders job title', () => {
  const job = { id: '1', title: 'Dev Job', company: 'Tech Co' }
  render(<JobCard job={job} />)
  expect(screen.getByText('Dev Job')).toBeInTheDocument()
})
```

## Making Changes

### 1. Create Your Branch

```bash
git checkout -b feature/your-feature
```

### 2. Make Your Changes

- Write clean, focused commits
- Update documentation if needed
- Add tests for new features

### 3. Test Your Changes

```bash
# Backend
cd backend && python test_api.py

# Frontend
cd frontend && npm run lint && npm run test
```

### 4. Commit with Clear Messages

```bash
git commit -m "Add feature: describe what you added

- Bullet point 1
- Bullet point 2

Fixes #123"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature
```

### 6. Create a Pull Request

Open a PR with:
- Clear title describing the change
- Description of what changed and why
- Link to related issues
- Screenshot (for UI changes)

## Pull Request Guidelines

### Title Format

```
[Type] Brief description

Type: feat, fix, docs, style, refactor, test, chore
```

Examples:
- `[feat] Add AI resume scoring feature`
- `[fix] Fix login validation error`
- `[docs] Update API documentation`

### Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [x] Backend tests pass
- [x] Frontend tests pass
- [x] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Fixes #123
Related to #456

## Checklist
- [x] Code follows style guidelines
- [x] Self-reviewed code
- [x] Added comments for complex logic
- [x] Updated documentation
- [x] No breaking changes
```

## Documentation

### Adding Documentation

1. **Code Comments**: Explain the "why", not the "what"
   ```python
   # Bad
   x = 5  # Set x to 5
   
   # Good
   MAX_ATTEMPTS = 5  # Allow up to 5 login attempts before lockout
   ```

2. **Function Docstrings**:
   ```python
   def get_jobs(filters=None, page=1, per_page=20):
       """
       Get paginated list of jobs with optional filtering.
       
       Args:
           filters (dict): Filter criteria (title, location, salary_min, etc.)
           page (int): Page number (default: 1)
           per_page (int): Jobs per page (default: 20)
       
       Returns:
           dict: {"jobs": [...], "total": int, "pages": int}
       
       Raises:
           ValidationError: If filters are invalid
       """
       pass
   ```

3. **README Updates**: Keep docs up-to-date with code changes

## Performance Considerations

### Backend
- Use database indexes for frequently queried columns
- Implement pagination for large result sets
- Cache expensive operations
- Use connection pooling for databases

### Frontend
- Lazy load routes and components
- Memoize expensive components
- Optimize images
- Minimize bundle size

## Security

### Backend
- Validate all inputs
- Use parameterized queries (SQLAlchemy handles this)
- Hash passwords with bcrypt
- Use HTTPS in production
- Implement rate limiting

### Frontend
- Validate user input
- Sanitize API responses
- Use security headers
- Avoid storing sensitive data in localStorage

## Commit Best Practices

### Good Commit Messages

```
[type] Summary (50 chars max)

Detailed explanation if needed (wrap at 72 chars).

- Bullet point 1
- Bullet point 2

Fixes #123
```

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (no logic change)
- `refactor:` - Code structure (no behavior change)
- `test:` - Adding/updating tests
- `chore:` - Maintenance (dependencies, configs)

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Reinitialize database
python -c "from database import init_db; init_db()"
```

**Frontend won't build**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Tests failing**
- Run tests individually to isolate issues
- Check environment variables
- Verify database state

## Getting Help

- Check existing issues and PRs
- Ask in discussions
- Contact maintainers
- Review documentation

## Review Process

1. **Automated Checks**: Tests and linting must pass
2. **Code Review**: Maintainers review changes
3. **Approval**: Requires approval from 1+ maintainers
4. **Merge**: Squash and merge to main

## What We're Looking For

✅ **Good contributions have:**
- Clear commit history
- Tests for new features
- Documentation
- Focused scope (one feature per PR)
- No breaking changes
- Performance considerations
- Accessibility improvements

❌ **Avoid:**
- Multiple features in one PR
- Large refactors without discussion
- Undocumented changes
- Decreasing test coverage
- Breaking changes without discussion

## Recognition

Contributors will be recognized in:
- Release notes
- Contributors list
- Project documentation

## Code Review Checklist

When reviewing PR, check:

- [ ] Code follows style guidelines
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Security vulnerabilities addressed
- [ ] No breaking changes
- [ ] Commit messages are clear
- [ ] PR description is complete

## Questions?

- Open an issue with your question
- Check existing documentation
- Ask in discussions
- Contact the team

---

Thank you for contributing to GetHired! 🎉
