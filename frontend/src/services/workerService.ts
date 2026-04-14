import { apiClient } from '../lib/http'
import type { Application, Job } from '../types/domain'

export type JobFilters = {
  title?: string
  location?: string
  job_type?: string
  work_mode?: string
  accepts_group?: boolean
}

export async function fetchJobs(filters: JobFilters = {}): Promise<Job[]> {
  const params: Record<string, string | boolean> = {}

  if (filters.title?.trim()) {
    params.title = filters.title.trim()
  }
  if (filters.location?.trim()) {
    params.location = filters.location.trim()
  }
  if (filters.job_type?.trim()) {
    params.job_type = filters.job_type.trim()
  }
  if (filters.work_mode?.trim()) {
    params.work_mode = filters.work_mode.trim()
  }
  if (filters.accepts_group) {
    params.accepts_group = true
  }

  const response = await apiClient.get<{ jobs: Job[] }>('/jobs/', { params })
  return response.data.jobs ?? []
}

export async function fetchOpenJobs(): Promise<Job[]> {
  return fetchJobs()
}

export async function fetchSavedJobs(): Promise<Job[]> {
  const response = await apiClient.get<{ jobs: Job[] }>('/workers/saved-jobs')
  return response.data.jobs ?? []
}

export async function saveJob(jobId: string): Promise<void> {
  await apiClient.post(`/workers/saved-jobs/${jobId}`)
}

export async function unsaveJob(jobId: string): Promise<void> {
  await apiClient.delete(`/workers/saved-jobs/${jobId}`)
}

export async function fetchJobById(jobId: string): Promise<Job> {
  const response = await apiClient.get<Job>(`/jobs/${jobId}`)
  return response.data
}

export async function fetchMyApplications(): Promise<Application[]> {
  const response = await apiClient.get<{ applications: Application[] }>('/applications/my')
  return response.data.applications ?? []
}

export async function applyToJob(payload: {
  job_id: string
  cover_letter?: string
  resume_file: File
}): Promise<void> {
  const formData = new FormData()
  formData.append('job_id', payload.job_id)
  if (payload.cover_letter) {
    formData.append('cover_letter', payload.cover_letter)
  }
  formData.append('resume', payload.resume_file)

  await apiClient.post('/applications/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function fetchWorkerProfile(): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>('/workers/profile')
  return response.data
}

export async function createWorkerProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.post('/workers/profile', payload)
}

export async function updateWorkerProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.put('/workers/profile', payload)
}
