import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BriefcaseBusiness, Building2, FileText, KeyRound, Users } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { API_BASE_URL } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import * as authService from '../../services/authService'
import * as employerService from '../../services/employerService'

function getPasswordStrength(password: string): { label: 'Weak' | 'Medium' | 'Strong'; color: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: 'Weak', color: '#dc2626' }
  if (score <= 4) return { label: 'Medium', color: '#d97706' }
  return { label: 'Strong', color: '#16a34a' }
}

function statusClass(status: string): string {
  return `pill compact status-pill status-${status.toLowerCase()}`
}

function buildResumeHref(resumeUrl: string | null): string {
  if (!resumeUrl) {
    return ''
  }
  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
    return resumeUrl
  }
  return `${API_BASE_URL}${resumeUrl.replace('/api/v1', '')}`
}

export default function EmployerDashboard() {
  const queryClient = useQueryClient()
  const { user, setAuthenticatedUser } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full_time')
  const [workMode, setWorkMode] = useState('on_site')
  const [vacancies, setVacancies] = useState(1)
  const [acceptsGroup, setAcceptsGroup] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')

  const [selectedJobId, setSelectedJobId] = useState('')
  const [newJobStatus, setNewJobStatus] = useState('open')

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const [feedback, setFeedback] = useState<string | null>(null)

  const jobsQuery = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: employerService.fetchMyJobs,
  })

  const appsForJobQuery = useQuery({
    queryKey: ['employer-apps', selectedJobId],
    queryFn: () => employerService.fetchApplicationsForJob(selectedJobId),
    enabled: Boolean(selectedJobId),
  })

  const profileQuery = useQuery({
    queryKey: ['employer-profile'],
    queryFn: employerService.fetchEmployerProfile,
    retry: false,
  })

  const createJobMutation = useMutation({
    mutationFn: employerService.createJob,
    onSuccess: async () => {
      setFeedback('Job created successfully.')
      setTitle('')
      setDescription('')
      setLocation('')
      setVacancies(1)
      setSalaryMin('')
      setSalaryMax('')
      await queryClient.invalidateQueries({ queryKey: ['employer-jobs'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const updateJobStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) => employerService.updateJobStatus(jobId, status),
    onSuccess: async () => {
      setFeedback('Job status updated.')
      await queryClient.invalidateQueries({ queryKey: ['employer-jobs'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      employerService.updateApplicationStatus(id, status),
    onSuccess: async () => {
      setFeedback('Application status updated.')
      await queryClient.invalidateQueries({ queryKey: ['employer-apps', selectedJobId] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const upsertProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        company_name: companyName,
        industry,
        location: companyLocation,
        contact_name: contactName,
        contact_phone: contactPhone,
      }
      if (profileQuery.data?.id) {
        await employerService.updateEmployerProfile(payload)
      } else {
        await employerService.createEmployerProfile(payload)
      }

      if (contactEmail.trim() && contactEmail.trim() !== user?.email) {
        const updatedUser = await authService.updateMe({ email: contactEmail.trim() })
        setAuthenticatedUser(updatedUser)
      }
    },
    onSuccess: async () => {
      setFeedback('Employer profile saved successfully.')
      await queryClient.invalidateQueries({ queryKey: ['employer-profile'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new Error('Please fill current password, new password, and confirm password.')
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('New password and confirm password do not match.')
      }

      await authService.updateMe({
        current_password: currentPassword,
        new_password: newPassword,
      })
    },
    onSuccess: () => {
      setFeedback('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const passwordStrength = getPasswordStrength(newPassword)
  const canSubmitPasswordChange =
    Boolean(currentPassword && newPassword && confirmNewPassword) &&
    newPassword === confirmNewPassword &&
    passwordStrength.label !== 'Weak'

  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email)
    }
  }, [user?.email])

  useEffect(() => {
    const data = profileQuery.data as Record<string, unknown> | undefined
    if (!data) {
      return
    }

    setCompanyName((data.company_name as string) ?? '')
    setIndustry((data.industry as string) ?? '')
    setCompanyLocation((data.location as string) ?? '')
    setContactName((data.contact_name as string) ?? '')
    setContactPhone((data.contact_phone as string) ?? '')
  }, [profileQuery.data])

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <h2>Employer Dashboard</h2>
        <p>Create openings, manage your hiring pipeline, and make candidate decisions faster.</p>
        {feedback ? <p className="notice">{feedback}</p> : null}
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <BriefcaseBusiness size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Create Job</h3>
              <p className="panel-subtitle">Publish openings and start receiving applications immediately.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Job title" />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Job description"
            rows={4}
          />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
          <div className="inline-fields">
            <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value)}>
              <option value="on_site">On Site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="inline-fields">
            <input
              value={String(vacancies)}
              onChange={(event) => setVacancies(Number(event.target.value) || 1)}
              placeholder="Vacancies"
            />
            <label className="check-row">
              <input
                type="checkbox"
                checked={acceptsGroup}
                onChange={(event) => setAcceptsGroup(event.target.checked)}
              />
              Accepts Group
            </label>
          </div>
          <div className="inline-fields">
            <input value={salaryMin} onChange={(event) => setSalaryMin(event.target.value)} placeholder="Salary min" />
            <input value={salaryMax} onChange={(event) => setSalaryMax(event.target.value)} placeholder="Salary max" />
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              void createJobMutation.mutate({
                title,
                description,
                location,
                job_type: jobType,
                work_mode: workMode,
                vacancies,
                accepts_group: acceptsGroup,
                salary:
                  salaryMin && salaryMax
                    ? {
                        min: Number(salaryMin),
                        max: Number(salaryMax),
                        currency: 'USD',
                        period: 'yearly',
                      }
                    : undefined,
              })
            }
          >
            {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
          </button>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <Building2 size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Company Profile</h3>
              <p className="panel-subtitle">Keep your organization details current for applicants and admins.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="Contact name"
          />
          <input
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Contact email"
            type="email"
          />
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="Contact number"
          />
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Company name"
          />
          <input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="Industry" />
          <input
            value={companyLocation}
            onChange={(event) => setCompanyLocation(event.target.value)}
            placeholder="Company location"
          />
          <button type="button" className="btn primary" onClick={() => void upsertProfileMutation.mutate()}>
            {upsertProfileMutation.isPending ? 'Saving...' : 'Save Company Profile'}
          </button>
          {profileQuery.data ? <pre className="json-block">{JSON.stringify(profileQuery.data, null, 2)}</pre> : null}
        </article>
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <FileText size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">My Job Postings</h3>
              <p className="panel-subtitle">Review live posts and open the candidate pipeline for each one.</p>
            </div>
          </div>
          <hr className="section-divider" />
          {jobsQuery.isLoading ? (
            <div className="skeleton-stack" aria-hidden="true">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          ) : null}
          {!jobsQuery.isLoading && (jobsQuery.data ?? []).length === 0 ? (
            <p className="empty-state">No job postings yet. Create your first opening to start receiving applicants.</p>
          ) : null}
          <div className="list">
            {(jobsQuery.data ?? []).map((job) => (
              <div className="list-item" key={job.id}>
                <strong>{job.title}</strong>
                <span>{job.location}</span>
                <small>ID: {job.id}</small>
                <span className={statusClass(job.status)}>{job.status}</span>
                <button
                  type="button"
                  className="btn subtle"
                  onClick={() => setSelectedJobId(job.id)}
                >
                  Review Applications
                </button>
              </div>
            ))}
          </div>

          <div className="inline-fields top-gap">
            <input
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              placeholder="Job ID for details"
            />
            <select value={newJobStatus} onChange={(event) => setNewJobStatus(event.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            type="button"
            className="btn subtle"
            onClick={() => void updateJobStatusMutation.mutate({ jobId: selectedJobId, status: newJobStatus })}
            disabled={!selectedJobId}
          >
            Update Job Status
          </button>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <Users size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Applications For Selected Job</h3>
              <p className="panel-subtitle">Inspect each applicant, view resumes, and take action fast.</p>
            </div>
          </div>
          <hr className="section-divider" />
          {selectedJobId ? <p className="muted">Reviewing job ID: {selectedJobId}</p> : <p className="muted">Select a job from "My Job Postings" to review applicants.</p>}
          {appsForJobQuery.isLoading ? (
            <div className="skeleton-stack" aria-hidden="true">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          ) : null}
          {appsForJobQuery.isError ? <p className="error-box">{getErrorMessage(appsForJobQuery.error)}</p> : null}
          {!appsForJobQuery.isLoading && selectedJobId && (appsForJobQuery.data ?? []).length === 0 ? (
            <p className="empty-state">No applications yet for this job. Check back after workers apply.</p>
          ) : null}
          <div className="list">
            {(appsForJobQuery.data ?? []).map((app) => (
              <div key={app.id} className="list-item">
                <strong>Application {app.id}</strong>
                <span>Type: {app.application_type}</span>
                <span className={statusClass(app.status)}>{app.status}</span>
                {app.resume_url ? (
                  <a
                    href={buildResumeHref(app.resume_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn subtle"
                  >
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
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid one">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <KeyRound size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Account Security</h3>
              <p className="panel-subtitle">Update your password and keep your employer account secure.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <button
            type="button"
            className="btn subtle"
            onClick={() => setShowPasswords((prev) => !prev)}
          >
            {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
          </button>
          <input
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current Password"
            type={showPasswords ? 'text' : 'password'}
          />
          <input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New Password"
            type={showPasswords ? 'text' : 'password'}
          />
          {newPassword ? (
            <p className="muted" style={{ color: passwordStrength.color }}>
              Password strength: {passwordStrength.label}
            </p>
          ) : null}
          <input
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            placeholder="Confirm New Password"
            type={showPasswords ? 'text' : 'password'}
          />
          <button
            type="button"
            className="btn subtle"
            onClick={() => void changePasswordMutation.mutate()}
            disabled={changePasswordMutation.isPending || !canSubmitPasswordChange}
          >
            {changePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}
          </button>
        </article>
      </section>
    </div>
  )
}
