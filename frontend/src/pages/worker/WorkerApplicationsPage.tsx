import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../lib/errors'
import * as workerService from '../../services/workerService'

export default function WorkerApplicationsPage() {
  const appsQuery = useQuery({
    queryKey: ['worker-applications'],
    queryFn: workerService.fetchMyApplications,
  })

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Applications</p>
          <h2>My Applications</h2>
          <p>Track every job you applied to and watch the hiring progress from one place.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <FileText size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Application History</h3>
            <p className="panel-subtitle">Your submissions are listed with the latest status updates.</p>
          </div>
        </div>
        <hr className="section-divider" />
        {appsQuery.isLoading ? <div className="skeleton-stack" aria-hidden="true"><div className="skeleton-line" /><div className="skeleton-line" /></div> : null}
        {appsQuery.isError ? <p className="error-box">{getErrorMessage(appsQuery.error)}</p> : null}
        {!appsQuery.isLoading && (appsQuery.data ?? []).length === 0 ? (
          <p className="empty-state">You have not submitted any applications yet. Browse jobs to get started.</p>
        ) : null}
        <div className="list">
          {(appsQuery.data ?? []).map((app) => (
            <article key={app.id} className="list-item app-card">
              <strong>Job ID: {app.job_id}</strong>
              <span>Type: {app.application_type}</span>
              <span className={`pill compact status-pill status-${app.status.toLowerCase()}`}>{app.status}</span>
              <small>Applied: {new Date(app.applied_at).toLocaleString()}</small>
              <div className="hub-actions">
                <Link to={`/app/worker/jobs/${app.job_id}`} className="btn subtle">View Job</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
