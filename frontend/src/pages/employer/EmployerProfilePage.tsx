import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, KeyRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { getErrorMessage } from '../../lib/errors'
import * as authService from '../../services/authService'
import * as employerService from '../../services/employerService'

function getPasswordStrength(password: string): { label: 'Weak' | 'Medium' | 'Strong'; color: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: 'Weak', color: '#dc2626' }
  if (score <= 4) return { label: 'Medium', color: '#d97706' }
  return { label: 'Strong', color: '#16a34a' }
}

export default function EmployerProfilePage() {
  const queryClient = useQueryClient()
  const { user, setAuthenticatedUser } = useAuth()

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ['employer-profile'],
    queryFn: employerService.fetchEmployerProfile,
    retry: false,
  })

  const upsertProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        company_name: companyName,
        industry,
        location: companyLocation,
        contact_name: contactName,
        contact_phone: contactPhone,
      }
      if (profileQuery.data?.id) {
        await employerService.updateEmployerProfile(payload)
      } else {
        await employerService.createEmployerProfile(payload)
      }

      if (contactEmail.trim() && contactEmail.trim() !== user?.email) {
        const updatedUser = await authService.updateMe({ email: contactEmail.trim() })
        setAuthenticatedUser(updatedUser)
      }
    },
    onSuccess: async () => {
      setFeedback('Employer profile saved successfully.')
      await queryClient.invalidateQueries({ queryKey: ['employer-profile'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new Error('Please fill current password, new password, and confirm password.')
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('New password and confirm password do not match.')
      }

      await authService.updateMe({
        current_password: currentPassword,
        new_password: newPassword,
      })
    },
    onSuccess: () => {
      setFeedback('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const passwordStrength = getPasswordStrength(newPassword)
  const canSubmitPasswordChange =
    Boolean(currentPassword && newPassword && confirmNewPassword) &&
    newPassword === confirmNewPassword &&
    passwordStrength.label !== 'Weak'

  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email)
    }
  }, [user?.email])

  useEffect(() => {
    const data = profileQuery.data as Record<string, unknown> | undefined
    if (!data) {
      return
    }

    setCompanyName((data.company_name as string) ?? '')
    setIndustry((data.industry as string) ?? '')
    setCompanyLocation((data.location as string) ?? '')
    setContactName((data.contact_name as string) ?? '')
    setContactPhone((data.contact_phone as string) ?? '')
  }, [profileQuery.data])

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Company Profile</p>
          <h2>Organization settings</h2>
          <p>Update your hiring contact details and account security from one place.</p>
          {feedback ? <p className="notice">{feedback}</p> : null}
        </div>
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <Building2 size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Company Details</h3>
              <p className="panel-subtitle">Keep your contact and business details up to date.</p>
            </div>
          </div>
          <hr className="section-divider" />

          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="Contact name"
          />
          <input
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Contact email"
            type="email"
          />
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="Contact number"
          />
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Company name"
          />
          <input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="Industry" />
          <input
            value={companyLocation}
            onChange={(event) => setCompanyLocation(event.target.value)}
            placeholder="Company location"
          />

          <button type="button" className="btn primary" onClick={() => void upsertProfileMutation.mutate()}>
            {upsertProfileMutation.isPending ? 'Saving...' : 'Save Company Profile'}
          </button>
          {profileQuery.data ? <pre className="json-block">{JSON.stringify(profileQuery.data, null, 2)}</pre> : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <KeyRound size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Account Security</h3>
              <p className="panel-subtitle">Update your password and keep your employer account secure.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <button
            type="button"
            className="btn subtle"
            onClick={() => setShowPasswords((prev) => !prev)}
          >
            {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
          </button>
          <input
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current Password"
            type={showPasswords ? 'text' : 'password'}
          />
          <input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New Password"
            type={showPasswords ? 'text' : 'password'}
          />
          {newPassword ? (
            <p className="muted" style={{ color: passwordStrength.color }}>
              Password strength: {passwordStrength.label}
            </p>
          ) : null}
          <input
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            placeholder="Confirm New Password"
            type={showPasswords ? 'text' : 'password'}
          />
          <button
            type="button"
            className="btn subtle"
            onClick={() => void changePasswordMutation.mutate()}
            disabled={changePasswordMutation.isPending || !canSubmitPasswordChange}
          >
            {changePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}
          </button>
        </article>
      </section>
    </div>
  )
}
