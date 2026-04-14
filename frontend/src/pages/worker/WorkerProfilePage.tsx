import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { KeyRound, UserRound } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getErrorMessage } from '../../lib/errors'
import * as authService from '../../services/authService'
import * as workerService from '../../services/workerService'

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

export default function WorkerProfilePage() {
  const queryClient = useQueryClient()
  const { user, setAuthenticatedUser } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ['worker-profile'],
    queryFn: workerService.fetchWorkerProfile,
    retry: false,
  })

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        full_name: fullName,
        phone,
        headline,
        location,
        skills: skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      }

      if (profileQuery.data?.id) {
        await workerService.updateWorkerProfile(payload)
      } else {
        await workerService.createWorkerProfile(payload)
      }

      if (email.trim() && email.trim() !== user?.email) {
        const updatedUser = await authService.updateMe({ email: email.trim() })
        setAuthenticatedUser(updatedUser)
      }
    },
    onSuccess: async () => {
      setFeedback('Profile saved successfully.')
      await queryClient.invalidateQueries({ queryKey: ['worker-profile'] })
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
      setEmail(user.email)
    }
  }, [user?.email])

  useEffect(() => {
    const data = profileQuery.data as Record<string, unknown> | undefined
    if (!data) {
      return
    }

    setFullName((data.full_name as string) ?? '')
    setPhone((data.phone as string) ?? '')
    setHeadline((data.headline as string) ?? '')
    setLocation((data.location as string) ?? '')
    setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : '')
  }, [profileQuery.data])

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <div className="panel-head-text">
          <p className="auth-card-kicker">Profile</p>
          <h2>My Details</h2>
          <p>Change your personal details, email, phone number, and profile information.</p>
        </div>
        {feedback ? <p className="notice">{feedback}</p> : null}
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <UserRound size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Personal Details</h3>
              <p className="panel-subtitle">Edit the details employers see on your profile.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full Name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone Number" />
          <input value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Headline" />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
          <input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Skills (comma separated)" />
          <button type="button" className="btn primary" onClick={() => void saveProfileMutation.mutate()}>
            {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
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
              <p className="panel-subtitle">Keep your account safe by updating your password anytime.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <button type="button" className="btn subtle" onClick={() => setShowPasswords((prev) => !prev)}>
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
