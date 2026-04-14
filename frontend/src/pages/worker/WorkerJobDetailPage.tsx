import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BriefcaseBusiness, Sparkles } from 'lucide-react'
import { getErrorMessage } from '../../lib/errors'
import * as workerService from '../../services/workerService'

export default function WorkerJobDetailPage() {
  const { jobId = '' } = useParams()
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const jobQuery = useQuery({
    queryKey: ['worker-job-detail', jobId],
    queryFn: () => workerService.fetchJobById(jobId),
    enabled: Boolean(jobId),
  })

  const applyMutation = useMutation({
    mutationFn: workerService.applyToJob,
    onSuccess: () => {
      setFeedback('Application submitted successfully.')
      setCoverLetter('')
      setResumeFile(null)
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const job = jobQuery.data

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Job Details</p>
          <h2>{job?.title ?? 'Loading job...'}</h2>
          <p>Full posting view with resume upload and application form.</p>
          <div className="hub-actions">
            <Link to="/app/worker/jobs" className="btn subtle">Back to Search</Link>
            <Link to="/app/worker/profile" className="btn subtle">My Profile</Link>
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
                <p className="panel-subtitle">Read the full job post before applying.</p>
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
                <h3 className="panel-title">Apply Now</h3>
                <p className="panel-subtitle">Upload your PDF resume and submit the application.</p>
              </div>
            </div>
            <hr className="section-divider" />

            <div className="detail-meta">
              <span><strong>Vacancies:</strong> {job.vacancies}</span>
              <span><strong>Accepts group:</strong> {job.accepts_group ? 'Yes' : 'No'}</span>
              <span><strong>Deadline:</strong> {job.application_deadline ?? 'Not set'}</span>
            </div>

            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Cover letter"
              rows={6}
            />
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn primary full"
              onClick={() => {
                if (!resumeFile) {
                  setFeedback('Please attach your resume in PDF format.')
                  return
                }
                void applyMutation.mutate({ job_id: job.id, cover_letter: coverLetter, resume_file: resumeFile })
              }}
              disabled={applyMutation.isPending || !resumeFile}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
            {feedback ? <p className="notice">{feedback}</p> : null}
          </aside>
        </section>
      ) : null}
    </div>
  )
}
