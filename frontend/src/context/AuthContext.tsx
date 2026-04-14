import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './authContextObject'
import { clearSession, getSession, setSession } from '../lib/authStorage'
import * as authService from '../services/authService'
import type { AuthUser, UserRole } from '../types/domain'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialSession = getSession()

  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null)
  const [accessToken, setAccessToken] = useState<string | null>(initialSession?.accessToken ?? null)
  const [refreshToken, setRefreshToken] = useState<string | null>(initialSession?.refreshToken ?? null)

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setUser(response.user)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
    setSession({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })

    return response.user
  }

  const register = async (email: string, password: string, role: UserRole) => {
    const response = await authService.register({ email, password, role })
    setUser(response.user)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
    setSession({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })

    return response.user
  }

  const setAuthenticatedUser = (nextUser: AuthUser) => {
    setUser(nextUser)
    const existingSession = getSession()
    if (existingSession) {
      setSession({
        ...existingSession,
        user: nextUser,
      })
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setAccessToken(null)
      setRefreshToken(null)
      clearSession()
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      setAuthenticatedUser,
      logout,
    }),
    [accessToken, refreshToken, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
