import type { AuthUser } from '../types/domain'

type SessionData = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

const STORAGE_KEY = 'gethired.session'

export function getSession(): SessionData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as SessionData
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setSession(data: SessionData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
