import { createContext } from 'react'
import type { AuthUser, UserRole } from '../types/domain'

export type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (email: string, password: string, role: UserRole) => Promise<AuthUser>
  setAuthenticatedUser: (nextUser: AuthUser) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
