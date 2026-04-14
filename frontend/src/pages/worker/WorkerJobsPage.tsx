import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck, BriefcaseBusiness, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../lib/errors'
import * as workerService from '../../services/workerService'
import type { JobFilters } from '../../services/workerService'
const PAGE_SIZE = 6

export default function WorkerJobsPage() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [acceptsGroup, setAcceptsGroup] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<JobFilters>({})
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const jobsQuery = useQuery({
    queryKey: ['worker-job-search', appliedFilters],
    queryFn: () => workerService.fetchJobs(appliedFilters),
  })

  const savedJobsQuery = useQuery({
    queryKey: ['worker-saved-jobs'],
    queryFn: workerService.fetchSavedJobs,
  })

  const saveMutation = useMutation({
    mutationFn: (jobId: string) => workerService.saveJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['worker-saved-jobs'] })
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => workerService.unsaveJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['worker-saved-jobs'] })
    },
  })

  useEffect(() => {
    setPage(1)
  }, [appliedFilters])

  const jobResults = jobsQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(jobResults.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedJobs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return jobResults.slice(start, start + PAGE_SIZE)
  }, [jobResults, safePage])

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const savedJobs = savedJobsQuery.data ?? []

  const toggleSavedJob = (jobId: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      unsaveMutation.mutate(jobId)
      return
    }

    saveMutation.mutate(jobId)
  }

  const isSaved = (jobId: string) => savedJobs.some((saved) => saved.id === jobId)

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Search Jobs</p>
          <h2>Browse open roles</h2>
          <p>Search jobs like products, filter them fast, and open any listing for the full posting.</p>
        </div>
      </section>

      <section className="marketplace-layout">
        <aside className="market-sidebar panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <Search size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Filters</h3>
              <p className="panel-subtitle">Narrow the catalog by title, location, type, or work mode.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <div className="sidebar-stack">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Search by title" />
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
            <select value={jobType} onChange={(event) => setJobType(event.target.value)}>
              <option value="">All job types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value)}>
              <option value="">All work modes</option>
              <option value="on_site">On Site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <label className="check-row">
              <input
                type="checkbox"
                checked={acceptsGroup}
                onChange={(event) => setAcceptsGroup(event.target.checked)}
              />
              Accepts Group
            </label>
            <button
              type="button"
              className="btn primary"
              onClick={() =>
                setAppliedFilters({
                  title,
                  location,
                  job_type: jobType,
                  work_mode: workMode,
                  accepts_group: acceptsGroup,
                })
              }
            >
              Search Jobs
            </button>
            <button
              type="button"
              className="btn subtle"
              onClick={() => {
                setTitle('')
                setLocation('')
                setJobType('')
                setWorkMode('')
                setAcceptsGroup(false)
                setAppliedFilters({})
              }}
            >
              Reset Filters
            </button>
          </div>

          <div className="saved-jobs-block">
            <div className="panel-head">
              <div className="panel-head-icon">
                <BookmarkCheck size={16} />
              </div>
              <div className="panel-head-text">
                <h3 className="panel-title">Saved Jobs</h3>
                <p className="panel-subtitle">Quick access to jobs you bookmarked.</p>
              </div>
            </div>
            <hr className="section-divider" />
            {savedJobsQuery.isLoading ? (
              <div className="skeleton-stack" aria-hidden="true">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ) : null}
            {savedJobsQuery.isError ? <p className="error-box">{getErrorMessage(savedJobsQuery.error)}</p> : null}
            {!savedJobsQuery.isLoading && savedJobs.length === 0 ? (
              <p className="empty-state">No saved jobs yet. Bookmark roles from the catalog.</p>
            ) : (
              <div className="saved-job-list">
                {savedJobs.map((savedJob) => (
                  <Link key={savedJob.id} to={`/app/worker/jobs/${savedJob.id}`} className="saved-job-item">
                    <strong>{savedJob.title}</strong>
                    <span>{savedJob.location}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/app/worker/saved" className="btn subtle">
              Open Saved Jobs Page
            </Link>
          </div>
        </aside>

        <section className="panel market-main-panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <BriefcaseBusiness size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Available Jobs</h3>
              <p className="panel-subtitle">Open any job for the full description and application form.</p>
            </div>
          </div>
          <hr className="section-divider" />
          {jobsQuery.isLoading ? <div className="skeleton-stack" aria-hidden="true"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div> : null}
          {jobsQuery.isError ? <p className="error-box">{getErrorMessage(jobsQuery.error)}</p> : null}
          {!jobsQuery.isLoading && jobResults.length === 0 ? (
            <p className="empty-state">No jobs matched your filters. Try widening the search.</p>
          ) : null}
          <div className="job-market-grid">
            {paginatedJobs.map((job) => {
              const saved = isSaved(job.id)

              return (
                <article key={job.id} className="job-card-shell">
                  <button
                    type="button"
                    className="bookmark-btn"
                    onClick={() => toggleSavedJob(job.id, saved)}
                    disabled={saveMutation.isPending || unsaveMutation.isPending}
                    aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
                  >
                    {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                  <Link to={`/app/worker/jobs/${job.id}`} className="job-card-link">
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
                </article>
              )
            })}
          </div>

          <div className="pager-row">
            <button type="button" className="btn subtle" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1}>
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="pager-meta">
              Page {safePage} of {totalPages}
            </span>
            <button type="button" className="btn subtle" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages}>
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </section>
    </div>
  )
}
