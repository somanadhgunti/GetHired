import { Building2, BriefcaseBusiness, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import type { ComponentType } from 'react'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

export type BackendRouteGroup = {
  label: string
  icon: ComponentType<{ size?: number }>
  routes: Array<{ method: string; path: string }>
}

export const backendRouteGroups: BackendRouteGroup[] = [
  {
    label: 'Authentication',
    icon: ShieldCheck,
    routes: [
      { method: 'POST', path: '/auth/register' },
      { method: 'POST', path: '/auth/login' },
      { method: 'POST', path: '/auth/refresh' },
      { method: 'POST', path: '/auth/logout' },
    ],
  },
  {
    label: 'Jobs',
    icon: BriefcaseBusiness,
    routes: [
      { method: 'GET', path: '/jobs/' },
      { method: 'POST', path: '/jobs/' },
      { method: 'GET', path: '/jobs/:job_id' },
      { method: 'PATCH', path: '/jobs/:job_id/status' },
    ],
  },
  {
    label: 'Applications',
    icon: LayoutDashboard,
    routes: [
      { method: 'POST', path: '/applications/' },
      { method: 'POST', path: '/applications/group' },
      { method: 'GET', path: '/applications/my' },
      { method: 'PATCH', path: '/applications/:application_id/status' },
    ],
  },
  {
    label: 'Profiles',
    icon: Users,
    routes: [
      { method: 'GET', path: '/workers/profile' },
      { method: 'GET', path: '/employers/profile' },
      { method: 'GET', path: '/representatives/profile' },
    ],
  },
  {
    label: 'Groups',
    icon: Building2,
    routes: [
      { method: 'POST', path: '/representatives/groups' },
      { method: 'GET', path: '/representatives/groups' },
      { method: 'POST', path: '/representatives/groups/:group_id/members' },
    ],
  },
]
