import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, FileText, Sparkles, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import * as employerService from '../../services/employerService'

function buildResumeHref(resumeUrl: string | null): string {
  if (!resumeUrl) {
    return ''
  }
  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
    return resumeUrl
  }
  return `${API_BASE_URL}${resumeUrl.replace('/api/v1', '')}`
}

export default function EmployerJobDetailPage() {
  const { jobId = '' } = useParams()
  const queryClient = useQueryClient()

  const jobQuery = useQuery({
    queryKey: ['employer-job-detail', jobId],
    queryFn: () => employerService.fetchJobById(jobId),
    enabled: Boolean(jobId),
  })

  const appsForJobQuery = useQuery({
    queryKey: ['employer-apps', jobId],
    queryFn: () => employerService.fetchApplicationsForJob(jobId),
    enabled: Boolean(jobId),
  })

  const updateJobStatusMutation = useMutation({
    mutationFn: (status: string) => employerService.updateJobStatus(jobId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employer-job-detail', jobId] })
      await queryClient.invalidateQueries({ queryKey: ['employer-jobs'] })
    },
  })

  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => employerService.updateApplicationStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employer-apps', jobId] })
    },
  })

  const job = jobQuery.data

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Job Detail</p>
          <h2>{job?.title ?? 'Loading job...'}</h2>
          <p>Full view of this posting with job controls and candidate pipeline.</p>
          <div className="hub-actions">
            <Link to="/app/employer/jobs" className="btn subtle">Back to Jobs</Link>
            <Link to="/app/employer/post-job" className="btn subtle">Post Another Job</Link>
          </div>
        </div>
      </section>

      {jobQuery.isLoading ? (
        <div className="panel">
          <div className="skeleton-stack" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </div>
      ) : null}

      {jobQuery.isError ? <p className="error-box">{getErrorMessage(jobQuery.error)}</p> : null}

      {job ? (
        <section className="detail-layout">
          <article className="panel">
            <div className="panel-head">
              <div className="panel-head-icon">
                <BriefcaseBusiness size={16} />
              </div>
              <div className="panel-head-text">
                <h3 className="panel-title">Posting Overview</h3>
                <p className="panel-subtitle">View role details exactly as workers see them.</p>
              </div>
            </div>
            <hr className="section-divider" />

            <h3 className="detail-title">{job.title}</h3>
            <div className="detail-badges">
              <span className={`pill compact status-pill status-${job.status.toLowerCase()}`}>{job.status}</span>
              <span className="pill compact summary-pill">{job.location}</span>
              <span className="pill compact summary-pill">{job.job_type.replace('_', ' ')}</span>
              <span className="pill compact summary-pill">{job.work_mode.replace('_', ' ')}</span>
            </div>

            <p className="detail-text">{job.description}</p>

            <div className="detail-grid">
              <article>
                <strong>Requirements</strong>
                {job.requirements.length > 0 ? (
                  <ul>
                    {job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
                  </ul>
                ) : (
                  <p>No structured requirements posted.</p>
                )}
              </article>

              <article>
                <strong>Skills Required</strong>
                <div className="chip-wrap">
                  {job.skills_required.length > 0 ? (
                    job.skills_required.map((skill) => <span key={skill} className="pill compact summary-pill">{skill}</span>)
                  ) : (
                    <p>No skills posted.</p>
                  )}
                </div>
              </article>
            </div>
          </article>

          <aside className="panel detail-aside">
            <div className="panel-head">
              <div className="panel-head-icon">
                <Sparkles size={16} />
              </div>
              <div className="panel-head-text">
                <h3 className="panel-title">Job Controls</h3>
                <p className="panel-subtitle">Adjust posting status and monitor key metadata.</p>
              </div>
            </div>
            <hr className="section-divider" />

            <div className="detail-meta">
              <span><strong>Vacancies:</strong> {job.vacancies}</span>
              <span><strong>Accepts group:</strong> {job.accepts_group ? 'Yes' : 'No'}</span>
              <span><strong>Deadline:</strong> {job.application_deadline ?? 'Not set'}</span>
            </div>

            <div className="inline-fields">
              <button type="button" className="btn subtle" onClick={() => void updateJobStatusMutation.mutate('open')}>
                Mark Open
              </button>
              <button type="button" className="btn subtle" onClick={() => void updateJobStatusMutation.mutate('closed')}>
                Mark Closed
              </button>
              <button type="button" className="btn subtle" onClick={() => void updateJobStatusMutation.mutate('cancelled')}>
                Cancel Job
              </button>
            </div>
          </aside>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <Users size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Applications For This Job</h3>
            <p className="panel-subtitle">Review resumes and update candidate status directly.</p>
          </div>
        </div>
        <hr className="section-divider" />

        {appsForJobQuery.isLoading ? (
          <div className="skeleton-stack" aria-hidden="true">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : null}
        {appsForJobQuery.isError ? <p className="error-box">{getErrorMessage(appsForJobQuery.error)}</p> : null}
        {!appsForJobQuery.isLoading && (appsForJobQuery.data ?? []).length === 0 ? (
          <p className="empty-state">No applications yet for this job. Check back after workers apply.</p>
        ) : null}

        <div className="list">
          {(appsForJobQuery.data ?? []).map((app) => (
            <article key={app.id} className="list-item app-card">
              <strong>Application {app.id}</strong>
              <span>Type: {app.application_type}</span>
              <span className={`pill compact status-pill status-${app.status.toLowerCase()}`}>{app.status}</span>
              {app.resume_url ? (
                <a href={buildResumeHref(app.resume_url)} target="_blank" rel="noreferrer" className="btn subtle">
                  <FileText size={15} />
                  View Resume PDF
                </a>
              ) : (
                <span className="muted">Resume not attached</span>
              )}
              <div className="inline-fields">
                <button
                  type="button"
                  className="btn subtle"
                  onClick={() => void updateApplicationStatusMutation.mutate({ id: app.id, status: 'reviewed' })}
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  className="btn subtle"
                  onClick={() => void updateApplicationStatusMutation.mutate({ id: app.id, status: 'shortlisted' })}
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  className="btn subtle"
                  onClick={() => void updateApplicationStatusMutation.mutate({ id: app.id, status: 'accepted' })}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn subtle"
                  onClick={() => void updateApplicationStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
