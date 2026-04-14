import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import type { UserRole } from '../../types/domain'

type RoleRouteProps = {
  allowedRoles: UserRole[]
}

function rolePath(role: UserRole): string {
  if (role === 'worker') {
    return '/app/worker'
  }

  if (role === 'employer') {
    return '/app/employer'
  }

  return '/app/admin'
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={rolePath(user.role)} replace />
  }

  return <Outlet />
}
