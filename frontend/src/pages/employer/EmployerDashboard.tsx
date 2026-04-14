import { useQuery } from '@tanstack/react-query'
import { BookmarkCheck, BriefcaseBusiness, Building2, FileText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TransitionLink } from '../../components/transitions/TransitionLink'
import { useAuth } from '../../context/useAuth'
import * as employerService from '../../services/employerService'

export default function EmployerDashboard() {
  const { user } = useAuth()

  const jobsQuery = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: employerService.fetchMyJobs,
  })

  const totalJobs = jobsQuery.data?.length ?? 0
  const openJobs = (jobsQuery.data ?? []).filter((job) => job.status === 'open').length
  const closedJobs = (jobsQuery.data ?? []).filter((job) => job.status === 'closed').length

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">
              <Sparkles size={14} />
              Hiring marketplace
            </p>
            <h2>Run hiring with the same clean workflow.</h2>
            <p>
              Post jobs, manage your listings, review applicants, and keep your company profile updated from dedicated pages.
            </p>
            <div className="hub-actions">
              <TransitionLink to="/app/employer/post-job" variant="primary" icon={<BriefcaseBusiness size={15} />}>
                Post Job
              </TransitionLink>
              <TransitionLink to="/app/employer/jobs" variant="subtle" icon={<FileText size={15} />}>
                Manage Jobs
              </TransitionLink>
              <TransitionLink to="/app/employer/profile" variant="subtle" icon={<Building2 size={15} />}>
                Company Profile
              </TransitionLink>
            </div>
          </div>

          <div className="dashboard-hero-stats">
            <article className="summary-card">
              <strong>{totalJobs}</strong>
              <span>Total postings</span>
            </article>
            <article className="summary-card">
              <strong>{openJobs}</strong>
              <span>Open jobs</span>
            </article>
            <article className="summary-card">
              <strong>{closedJobs}</strong>
              <span>Closed jobs</span>
            </article>
            <article className="summary-card">
              <strong>{user?.email ?? 'Employer'}</strong>
              <span>Signed in account</span>
            </article>
          </div>
        </div>
      </section>

      <section className="grid three">
        <Link to="/app/employer/post-job" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <BriefcaseBusiness size={16} />
            </div>
            <h3>Post Job</h3>
            <p>Create openings with role details, location, and salary range.</p>
          </article>
        </Link>

        <Link to="/app/employer/jobs" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <FileText size={16} />
            </div>
            <h3>Manage Jobs</h3>
            <p>Change status, open pipelines, and review applications in one place.</p>
          </article>
        </Link>

        <Link to="/app/employer/profile" className="hub-card-link">
          <article className="hub-card">
            <div className="panel-head-icon">
              <Building2 size={16} />
            </div>
            <h3>Company Profile</h3>
            <p>Keep contact info and account security updated professionally.</p>
          </article>
        </Link>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <BookmarkCheck size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Recent Job Posts</h3>
            <p className="panel-subtitle">Quick access to your newest openings.</p>
          </div>
        </div>
        <hr className="section-divider" />
        <div className="job-preview-grid">
          {(jobsQuery.data ?? []).slice(0, 4).map((job) => (
            <Link key={job.id} to={`/app/employer/jobs/${job.id}`} className="job-preview-card">
              <strong>{job.title}</strong>
              <span>{job.location}</span>
              <p>{job.description.slice(0, 110)}{job.description.length > 110 ? '...' : ''}</p>
              <div className="job-preview-footer">
                <span className={`status-pill status-${job.status.toLowerCase()}`}>{job.status}</span>
                <small>Open manager</small>
              </div>
            </Link>
          ))}
        </div>
        {!jobsQuery.isLoading && (jobsQuery.data ?? []).length === 0 ? (
          <p className="empty-state">No postings yet. Open Post Job and publish your first role.</p>
        ) : null}
      </section>
    </div>
  )
}
