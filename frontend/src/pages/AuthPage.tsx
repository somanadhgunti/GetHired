import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../lib/errors'
import type { UserRole } from '../types/domain'

type AuthMode = 'login' | 'register'

function nextPathByRole(role: UserRole): string {
  if (role === 'worker') {
    return '/app/worker'
  }

  if (role === 'employer') {
    return '/app/employer'
  }

  return '/app/admin'
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('worker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    try {
      setLoading(true)
      setError(null)

      if (mode === 'login') {
        const authenticatedUser = await login(email, password)
        navigate(nextPathByRole(authenticatedUser.role), { replace: true })
      } else {
        const registeredUser = await register(email, password, role)
        navigate(nextPathByRole(registeredUser.role), { replace: true })
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-side-panel">
          <img src="/images/logo.png" alt="GetHired" className="auth-logo" />
          <p className="auth-kicker">Secure access • role aware • production ready</p>
          <h2>Hiring operations with clarity and control.</h2>
          <p>One secure workspace for workers, job givers, and admin managers to work without friction.</p>
          <ul className="auth-value-list">
            <li>Role-aware dashboard access from the first login</li>
            <li>JWT secured sessions with refresh token flow</li>
            <li>Production backend connected to MongoDB Atlas</li>
          </ul>
        </aside>

        <div className="auth-card">
          <p className="auth-card-kicker">Welcome to your account workspace</p>
          <h1>GetHired Access</h1>
          <p>Secure role-based entry for worker, customer, and admin-manager operations.</p>

          <div className="switch-row">
            <button
              type="button"
              className={`switch-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`switch-btn${mode === 'register' ? ' active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="At least 6 characters"
          />

          {mode === 'register' ? (
            <>
              <label className="field-label" htmlFor="role">
                Registration Role
              </label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="worker">Worker</option>
                <option value="employer">Customer (Job Giver)</option>
                <option value="representative">Admin Manager</option>
              </select>
            </>
          ) : null}

          {error ? <p className="error-box">{error}</p> : null}

          <button type="button" className="btn primary full" onClick={() => void submit()} disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
