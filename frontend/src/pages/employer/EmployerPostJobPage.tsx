import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness } from 'lucide-react'
import { useState } from 'react'
import { getErrorMessage } from '../../lib/errors'
import * as employerService from '../../services/employerService'

export default function EmployerPostJobPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full_time')
  const [workMode, setWorkMode] = useState('on_site')
  const [vacancies, setVacancies] = useState(1)
  const [acceptsGroup, setAcceptsGroup] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

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

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Post Job</p>
          <h2>Create a new opening</h2>
          <p>Publish roles with a complete description so workers can apply right away.</p>
          {feedback ? <p className="notice">{feedback}</p> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="panel-head-icon">
            <BriefcaseBusiness size={16} />
          </div>
          <div className="panel-head-text">
            <h3 className="panel-title">Job Details</h3>
            <p className="panel-subtitle">Make the posting clear and candidate-friendly.</p>
          </div>
        </div>
        <hr className="section-divider" />

        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Job title" />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Job description"
          rows={5}
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
      </section>
    </div>
  )
}
