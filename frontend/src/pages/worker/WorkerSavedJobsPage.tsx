import { useQuery } from '@tanstack/react-query'
import { BookmarkCheck, BriefcaseBusiness } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../lib/errors'
import * as workerService from '../../services/workerService'

export default function WorkerSavedJobsPage() {
  const savedJobsQuery = useQuery({
    queryKey: ['worker-saved-jobs'],
    queryFn: workerService.fetchSavedJobs,
  })

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Saved Jobs</p>
          <h2>Your shortlist</h2>
          <p>All bookmarked jobs are saved in your account and available from any device.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <BookmarkCheck size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Bookmarked Listings</h3>
            <p className="panel-subtitle">Open any card to review details and apply.</p>
          </div>
        </div>
        <hr className="section-divider" />

        {savedJobsQuery.isLoading ? (
          <div className="skeleton-stack" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : null}

        {savedJobsQuery.isError ? <p className="error-box">{getErrorMessage(savedJobsQuery.error)}</p> : null}

        {!savedJobsQuery.isLoading && (savedJobsQuery.data ?? []).length === 0 ? (
          <div className="empty-state">
            No saved jobs yet. Explore the catalog and use the bookmark icon to save roles.
            <div className="hub-actions">
              <Link to="/app/worker/jobs" className="btn primary">
                <BriefcaseBusiness size={15} />
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : null}

        <div className="job-market-grid">
          {(savedJobsQuery.data ?? []).map((job) => (
            <Link key={job.id} to={`/app/worker/jobs/${job.id}`} className="job-card-link">
              <article className="job-card">
                <div className="job-card-top">
                  <strong>{job.title}</strong>
                  <span className={`pill compact status-pill status-${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <p>{job.description.slice(0, 140)}{job.description.length > 140 ? '...' : ''}</p>
                <div className="job-card-meta">
                  <span>{job.location}</span>
                  <span>{job.job_type.replace('_', ' ')}</span>
                  <span>{job.work_mode.replace('_', ' ')}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
