# GetHired Frontend

A modern React + TypeScript + Vite frontend application for the GetHired job platform. This application provides a comprehensive interface for job seekers, employers, and platform representatives.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** + **Custom CSS** - Styling
- **Axios** - HTTP client
- **Zustand** (optional) - State management

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page-level components (routed)
├── services/           # API services and HTTP utilities
├── context/            # React Context for state management
├── types/              # TypeScript interfaces and types
├── assets/             # Images, fonts, and media
├── styles/             # Global and component styles
│   ├── global.css      # Color variables and base styles
│   ├── buttons.css     # Button variants and styles
│   ├── forms.css       # Form controls and inputs
│   ├── utilities.css   # Utility classes (alerts, pills, etc.)
│   └── responsive.css  # Media queries and responsive design
├── lib/                # Utility functions and helpers
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.9+ (for backend API)

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Component Guidelines

### Component Structure

```tsx
import React from 'react'

interface ComponentProps {
  title: string
  onAction?: () => void
}

export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="component-container">
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  )
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `JobCard.tsx`)
- **Pages**: PascalCase (e.g., `JobListPage.tsx`)
- **Services**: camelCase with `Service` suffix (e.g., `jobService.ts`)
- **Types**: PascalCase (e.g., `Job.ts`, `types/index.ts`)
- **CSS Classes**: kebab-case (e.g., `job-card`, `btn-primary`)

## Styling

### CSS Architecture

The project uses a modular CSS approach with:

1. **global.css** - CSS variables, reset styles, and typography
2. **buttons.css** - Button components and variants
3. **forms.css** - Form inputs, labels, and validation
4. **utilities.css** - Helper classes (alerts, pills, spacing)
5. **responsive.css** - Breakpoints and mobile-first design

### Using CSS Variables

```css
/* Colors */
color: var(--ink);
background: var(--accent);
border: 1px solid var(--line-strong);

/* Shadows */
box-shadow: var(--shadow);

/* Spacing */
margin: calc(var(--spacing-base) * 2);
```

### Responsive Breakpoints

- **Mobile**: <= 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## API Integration

### Service Layer

Services handle all API communication:

```tsx
// src/services/jobService.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const jobService = {
  getJobs: async () => {
    const { data } = await axios.get(`${API_URL}/jobs`)
    return data
  },
  getJobById: async (id: string) => {
    const { data } = await axios.get(`${API_URL}/jobs/${id}`)
    return data
  },
}
```

### Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GetHired
```

## Type Safety

All API responses and component props should have TypeScript types:

```tsx
// src/types/index.ts
export interface Job {
  id: string
  title: string
  company: string
  description: string
  salary: number
  datePosted: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'worker' | 'employer' | 'representative'
}
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# (Optional) Run tests
npm run test
```

## Key Features

### For Job Seekers (Workers)
- Browse and search job listings
- Apply for positions
- Manage profile and resume
- Track application status
- Receive job recommendations

### For Employers
- Post and manage job listings
- Review applications
- AI-powered candidate screening
- Analytics dashboard
- Company profile management

### For Representatives
- Moderate platform content
- Manage user disputes
- View platform analytics
- System administration

## State Management

### Context API Usage

For simple state that doesn't require external libraries:

```tsx
// src/context/AuthContext.tsx
import React, { createContext, useState } from 'react'

export const AuthContext = createContext({})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Performance Optimization

- Lazy load routes using `React.lazy()` and `Suspense`
- Optimize images using native lazy loading
- Memoize components with `React.memo()` when needed
- Keep API calls in services and use caching strategies

## Debugging

### Browser DevTools

1. React DevTools Chrome Extension
2. Redux DevTools (if using Redux)
3. Network tab for API debugging

### Development Tips

- Use TypeScript strict mode for better type safety
- Check console for warnings and errors
- Use React DevTools Profiler to identify performance issues
- Test responsive design using Chrome DevTools device emulation

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following the style guide
3. Commit with clear messages: `git commit -m 'Add feature'`
4. Push and create a Pull Request

## License

This project is part of the GetHired platform.

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
