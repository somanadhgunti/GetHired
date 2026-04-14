import { useQuery } from '@tanstack/react-query'
import { BookmarkCheck, BriefcaseBusiness, FileText, Search, Sparkles, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TransitionLink } from '../../components/transitions/TransitionLink'
import { useAuth } from '../../context/useAuth'
import { getErrorMessage } from '../../lib/errors'
import * as workerService from '../../services/workerService'

export default function WorkerDashboard() {
  const { user } = useAuth()

  const jobsQuery = useQuery({
    queryKey: ['worker-jobs'],
    queryFn: workerService.fetchOpenJobs,
  })

  const appsQuery = useQuery({
    queryKey: ['worker-applications'],
    queryFn: workerService.fetchMyApplications,
  })

  const featuredJobs = (jobsQuery.data ?? []).slice(0, 4)

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">
              <Sparkles size={14} />
              Job marketplace
            </p>
            <h2>Find work the same way you shop online.</h2>
            <p>
              Browse open roles, open any posting for full details, and apply when the fit looks right.
            </p>
            <div className="hub-actions">
              <TransitionLink to="/app/worker/jobs" variant="primary" icon={<Search size={15} />}>
                Search Jobs
              </TransitionLink>
              <TransitionLink to="/app/worker/profile" variant="subtle" icon={<UserRound size={15} />}>
                My Profile
              </TransitionLink>
              <TransitionLink to="/app/worker/applications" variant="subtle" icon={<FileText size={15} />}>
                My Applications
              </TransitionLink>
              <TransitionLink to="/app/worker/saved" variant="subtle" icon={<BookmarkCheck size={15} />}>
                Saved Jobs
              </TransitionLink>
            </div>
          </div>

          <div className="dashboard-hero-stats">
            <article className="summary-card">
              <strong>{jobsQuery.data?.length ?? 0}</strong>
              <span>Open jobs</span>
            </article>
            <article className="summary-card">
              <strong>{appsQuery.data?.length ?? 0}</strong>
              <span>Submitted applications</span>
            </article>
            <article className="summary-card">
              <strong>{user?.email ?? 'Worker'}</strong>
              <span>Signed in account</span>
            </article>
          </div>
        </div>
      </section>

      <section className="grid three">
        <Link to="/app/worker/profile" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <UserRound size={16} />
            </div>
            <h3>Profile</h3>
            <p>Update your personal details, email, phone number, and password.</p>
          </article>
        </Link>

        <Link to="/app/worker/jobs" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <BriefcaseBusiness size={16} />
            </div>
            <h3>Search Jobs</h3>
            <p>Browse all available jobs and filter them like a product catalog.</p>
          </article>
        </Link>

        <Link to="/app/worker/applications" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <FileText size={16} />
            </div>
            <h3>Applications</h3>
            <p>Track everything you have applied to and check review status.</p>
          </article>
        </Link>

        <Link to="/app/worker/saved" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <BookmarkCheck size={16} />
            </div>
            <h3>Saved Jobs</h3>
            <p>Keep a shortlist of roles and return to them anytime.</p>
          </article>
        </Link>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <BriefcaseBusiness size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Featured Openings</h3>
            <p className="panel-subtitle">Tap a job card to open the full post in its own page.</p>
          </div>
        </div>
        <hr className="section-divider" />
        {jobsQuery.isLoading ? (
          <div className="skeleton-stack" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : null}
        {jobsQuery.isError ? <p className="error-box">{getErrorMessage(jobsQuery.error)}</p> : null}
        {!jobsQuery.isLoading && featuredJobs.length === 0 ? (
          <p className="empty-state">No open jobs are visible right now. Check back soon for new openings.</p>
        ) : null}
        <div className="job-preview-grid">
          {featuredJobs.map((job) => (
            <Link key={job.id} to={`/app/worker/jobs/${job.id}`} className="job-preview-card">
              <strong>{job.title}</strong>
              <span>{job.location}</span>
              <p>{job.description.slice(0, 110)}{job.description.length > 110 ? '...' : ''}</p>
              <div className="job-preview-footer">
                <span className="status-pill status-open">{job.status}</span>
                <small>View details</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
