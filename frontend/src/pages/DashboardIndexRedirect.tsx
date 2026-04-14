import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function DashboardIndexRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (user.role === 'worker') {
    return <Navigate to="/app/worker" replace />
  }

  if (user.role === 'employer') {
    return <Navigate to="/app/employer" replace />
  }

  return <Navigate to="/app/admin" replace />
}
