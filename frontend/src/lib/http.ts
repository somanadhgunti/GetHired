import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './api'
import { clearSession, getSession, setSession } from './authStorage'

let isRefreshing = false
let queuedResolvers: Array<(token: string | null) => void> = []

function notifyQueue(token: string | null) {
  queuedResolvers.forEach((resolve) => resolve(token))
  queuedResolvers = []
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const session = getSession()
    if (!session?.refreshToken) {
      clearSession()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedResolvers.push((token) => {
          if (!token) {
            reject(error)
            return
          }

          if (!originalRequest.headers) {
            originalRequest.headers = {} as InternalAxiosRequestConfig['headers']
          }

          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.refreshToken}`,
          },
        },
      )

      const newAccessToken = refreshResponse.data.access_token as string
      setSession({ ...session, accessToken: newAccessToken })
      notifyQueue(newAccessToken)

      if (!originalRequest.headers) {
        originalRequest.headers = {} as InternalAxiosRequestConfig['headers']
      }
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return apiClient(originalRequest)
    } catch (refreshError) {
      notifyQueue(null)
      clearSession()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
