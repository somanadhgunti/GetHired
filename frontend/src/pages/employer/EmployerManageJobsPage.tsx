import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as employerService from '../../services/employerService'

export default function EmployerManageJobsPage() {
  const jobsQuery = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: employerService.fetchMyJobs,
  })

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Manage Jobs</p>
          <h2>Hiring pipeline manager</h2>
          <p>Open any job card to view complete details, update status, and review applications.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <FileText size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">My Job Postings</h3>
            <p className="panel-subtitle">Each card opens its own detail page with full pipeline controls.</p>
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
        {!jobsQuery.isLoading && (jobsQuery.data ?? []).length === 0 ? (
          <p className="empty-state">No job postings yet. Use Post Job to create your first opening.</p>
        ) : null}
        <div className="job-market-grid">
          {(jobsQuery.data ?? []).map((job) => (
            <Link key={job.id} to={`/app/employer/jobs/${job.id}`} className="job-card-link">
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
