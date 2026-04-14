import { apiClient } from '../lib/http'
import type { Application, Group } from '../types/domain'

export async function fetchGroups(): Promise<Group[]> {
  const response = await apiClient.get<{ groups: Group[] }>('/representatives/groups')
  return response.data.groups ?? []
}

export async function createGroup(payload: { name: string; description?: string; tags?: string[] }): Promise<void> {
  await apiClient.post('/representatives/groups', payload)
}

export async function addGroupMember(groupId: string, workerId: string): Promise<void> {
  await apiClient.post(`/representatives/groups/${groupId}/members`, { worker_id: workerId })
}

export async function removeGroupMember(groupId: string, workerId: string): Promise<void> {
  await apiClient.delete(`/representatives/groups/${groupId}/members/${workerId}`)
}

export async function applyAsGroup(payload: {
  job_id: string
  group_id: string
  worker_ids: string[]
  cover_letter?: string
}): Promise<void> {
  await apiClient.post('/applications/group', payload)
}

export async function fetchMyApplications(): Promise<Application[]> {
  const response = await apiClient.get<{ applications: Application[] }>('/applications/my')
  return response.data.applications ?? []
}

export async function fetchRepresentativeProfile(): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>('/representatives/profile')
  return response.data
}

export async function createRepresentativeProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.post('/representatives/profile', payload)
}

export async function updateRepresentativeProfile(payload: Record<string, unknown>): Promise<void> {
  await apiClient.put('/representatives/profile', payload)
}
