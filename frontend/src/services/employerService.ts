import { apiClient } from '../lib/http'
import type { Application, Job } from '../types/domain'

export async function fetchMyJobs(): Promise<Job[]> {
  const response = await apiClient.get<{ jobs: Job[] }>('/jobs/my')
  return response.data.jobs ?? []
}

export async function fetchJobById(jobId: string): Promise<Job> {
  const response = await apiClient.get<Job>(`/jobs/${jobId}`)
  return response.data
}

export async function createJob(payload: Record<string, unknown>): Promise<void> {
  await apiClient.post('/jobs/', payload)
}

export async function updateJobStatus(jobId: string, status: string): Promise<void> {
  await apiClient.patch(`/jobs/${jobId}/status`, { status })
}

export async function fetchApplicationsForJob(jobId: string): Promise<Application[]> {
  const response = await apiClient.get<{ applications: Application[] }>(`/applications/job/${jobId}`)
  return response.data.applications ?? []
}

export async function updateApplicationStatus(applicationId: string, status: string): Promise<void> {
  await apiClient.patch(`/applications/${applicationId}/status`, { status })
}

export async function fetchEmployerProfile(): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>('/employers/profile')
  return response.data
}

export async function createEmployerProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.post('/employers/profile', payload)
}

export async function updateEmployerProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.put('/employers/profile', payload)
}
