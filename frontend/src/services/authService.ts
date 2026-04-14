import { apiClient } from '../lib/http'
import type { AuthPayload, AuthUser, UserRole } from '../types/domain'

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  email: string
  password: string
  role: UserRole
}

type AuthApiResponse = {
  user: AuthUser
  access_token: string
  refresh_token: string
  message: string
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const response = await apiClient.post<AuthApiResponse>('/auth/login', input)
  return {
    user: response.data.user,
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  }
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const response = await apiClient.post<AuthApiResponse>('/auth/register', input)
  return {
    user: response.data.user,
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await apiClient.get<{ user: AuthUser }>('/auth/me')
  return response.data.user
}

export async function updateMe(payload: {
  email?: string
  current_password?: string
  new_password?: string
}): Promise<AuthUser> {
  const response = await apiClient.patch<{ user: AuthUser }>('/auth/me', payload)
  return response.data.user
}
