export type UserRole = 'worker' | 'employer' | 'representative'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  is_active?: boolean
}

export type AuthPayload = {
  user: AuthUser
  access_token: string
  refresh_token: string
}

export type Job = {
  id: string
  employer_id: string
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  job_type: string
  work_mode: string
  location: string
  salary?: {
    min?: number
    max?: number
    currency?: string
    period?: string
  } | null
  vacancies: number
  accepts_group: boolean
  group_size_min?: number | null
  group_size_max?: number | null
  application_deadline?: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Application = {
  id: string
  job_id: string
  application_type: 'individual' | 'group'
  applicant_id: string
  group_id: string | null
  worker_ids: string[]
  status: string
  cover_letter: string
  resume_url: string | null
  applied_at: string
  updated_at: string
}

export type Group = {
  id: string
  representative_id: string
  name: string
  description: string
  worker_ids: string[]
  member_count: number
  tags: string[]
}
