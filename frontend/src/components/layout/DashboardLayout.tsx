import { Bell, BriefcaseBusiness, Building2, LogOut, ShieldCheck, UserRound, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import type { UserRole } from '../../types/domain'

type NavItem = {
  to: string
  label: string
}

function roleLabel(role: UserRole): string {
  if (role === 'worker') {
    return 'Worker'
  }
  if (role === 'employer') {
    return 'Customer (Job Giver)'
  }
  return 'Admin Manager'
}

function roleIcon(role: UserRole) {
  if (role === 'worker') {
    return <UserRound size={16} />
  }
  if (role === 'employer') {
    return <Building2 size={16} />
  }
  return <ShieldCheck size={16} />
}

function navByRole(role: UserRole): NavItem[] {
  if (role === 'worker') {
    return [
      { to: '/app/worker', label: 'Dashboard' },
      { to: '/app/worker/profile', label: 'My Profile' },
      { to: '/app/worker/jobs', label: 'Search Jobs' },
      { to: '/app/worker/saved', label: 'Saved Jobs' },
      { to: '/app/worker/applications', label: 'Applications' },
    ]
  }

  if (role === 'employer') {
    return [
      { to: '/app/employer', label: 'Dashboard' },
      { to: '/app/employer/post-job', label: 'Post Job' },
      { to: '/app/employer/jobs', label: 'Manage Jobs' },
      { to: '/app/employer/profile', label: 'Company Profile' },
    ]
  }

  return [{ to: '/app/admin', label: 'Dashboard' }]
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const navItems = navByRole(user.role)

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-left">
          <img src="/images/logo.png" alt="GetHired" className="brand-logo" />
          <div>
            <p className="brand-title">GetHired</p>
            <p className="brand-sub">Role based professional hiring suite</p>
          </div>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" type="button" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <span className="pill role-pill">
            {roleIcon(user.role)}
            {roleLabel(user.role)}
          </span>
          <span className="pill mail-pill">{user.email}</span>
          <button className="icon-btn danger" type="button" onClick={() => void logout()} aria-label="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-head">
            <BriefcaseBusiness size={16} />
            <span>Main Navigation</span>
          </div>
          <nav className="nav-list" aria-label="Role navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-metrics">
              <article>
                <strong>Live</strong>
                <span>API + DB connected</span>
              </article>
              <article>
                <strong>Secure</strong>
                <span>JWT role-based access</span>
              </article>
            </div>
            <div className="pill compact summary-pill">
              <Users size={14} />
              Multi-role access enabled
            </div>
          </div>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
