import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FileText, UserRound, Users, UsersRound } from 'lucide-react'
import { getErrorMessage } from '../../lib/errors'
import * as representativeService from '../../services/representativeService'

function statusClass(status: string): string {
  return `pill compact status-pill status-${status.toLowerCase()}`
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupTags, setGroupTags] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [workerId, setWorkerId] = useState('')

  const [jobId, setJobId] = useState('')
  const [applyGroupId, setApplyGroupId] = useState('')
  const [workerIdsCsv, setWorkerIdsCsv] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  const [profileName, setProfileName] = useState('')
  const [organization, setOrganization] = useState('')
  const [location, setLocation] = useState('')

  const [feedback, setFeedback] = useState<string | null>(null)

  const groupsQuery = useQuery({
    queryKey: ['rep-groups'],
    queryFn: representativeService.fetchGroups,
  })

  const appsQuery = useQuery({
    queryKey: ['rep-apps'],
    queryFn: representativeService.fetchMyApplications,
  })

  const profileQuery = useQuery({
    queryKey: ['rep-profile'],
    queryFn: representativeService.fetchRepresentativeProfile,
    retry: false,
  })

  const createGroupMutation = useMutation({
    mutationFn: representativeService.createGroup,
    onSuccess: async () => {
      setFeedback('Group created successfully.')
      setGroupName('')
      setGroupDescription('')
      setGroupTags('')
      await queryClient.invalidateQueries({ queryKey: ['rep-groups'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      representativeService.addGroupMember(groupId, memberId),
    onSuccess: async () => {
      setFeedback('Member added to group.')
      setWorkerId('')
      await queryClient.invalidateQueries({ queryKey: ['rep-groups'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      representativeService.removeGroupMember(groupId, memberId),
    onSuccess: async () => {
      setFeedback('Member removed from group.')
      await queryClient.invalidateQueries({ queryKey: ['rep-groups'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const applyGroupMutation = useMutation({
    mutationFn: representativeService.applyAsGroup,
    onSuccess: async () => {
      setFeedback('Group application submitted.')
      setJobId('')
      setApplyGroupId('')
      setWorkerIdsCsv('')
      setCoverLetter('')
      await queryClient.invalidateQueries({ queryKey: ['rep-apps'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  const upsertProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        full_name: profileName,
        organization,
        location,
      }

      if (profileQuery.data?.id) {
        await representativeService.updateRepresentativeProfile(payload)
      } else {
        await representativeService.createRepresentativeProfile(payload)
      }
    },
    onSuccess: async () => {
      setFeedback('Admin manager profile saved successfully.')
      await queryClient.invalidateQueries({ queryKey: ['rep-profile'] })
    },
    onError: (error) => setFeedback(getErrorMessage(error)),
  })

  return (
    <div className="dashboard-page">
      <section className="headline-card">
        <h2>Admin Manager Dashboard</h2>
        <p>Manage representative groups, members, and group job applications.</p>
        {feedback ? <p className="notice">{feedback}</p> : null}
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <Users size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Create Group</h3>
              <p className="panel-subtitle">Set up representative groups to coordinate job applications.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Group name" />
          <textarea
            rows={3}
            value={groupDescription}
            onChange={(event) => setGroupDescription(event.target.value)}
            placeholder="Description"
          />
          <input
            value={groupTags}
            onChange={(event) => setGroupTags(event.target.value)}
            placeholder="Tags (comma separated)"
          />
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              void createGroupMutation.mutate({
                name: groupName,
                description: groupDescription,
                tags: groupTags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
          >
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </button>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <UserRound size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Admin Manager Profile</h3>
              <p className="panel-subtitle">Keep your organizational profile current for operational oversight.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Full name"
          />
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            placeholder="Organization"
          />
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
          <button type="button" className="btn primary" onClick={() => void upsertProfileMutation.mutate()}>
            {upsertProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
          {profileQuery.data ? <pre className="json-block">{JSON.stringify(profileQuery.data, null, 2)}</pre> : null}
        </article>
      </section>

      <section className="grid two">
        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <UsersRound size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Group Membership Controls</h3>
              <p className="panel-subtitle">Add or remove members and keep the group roster accurate.</p>
            </div>
          </div>
          <hr className="section-divider" />
          {groupsQuery.isLoading ? (
            <div className="skeleton-stack" aria-hidden="true">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          ) : null}
          {!groupsQuery.isLoading && (groupsQuery.data ?? []).length === 0 ? (
            <p className="empty-state">No groups yet. Create a group to start managing members.</p>
          ) : null}
          <div className="list">
            {(groupsQuery.data ?? []).map((group) => (
              <div key={group.id} className="list-item">
                <strong>{group.name}</strong>
                <span>{group.description}</span>
                <small>ID: {group.id}</small>
                <span className="pill compact summary-pill">Members: {group.member_count}</span>
              </div>
            ))}
          </div>

          <div className="inline-fields top-gap">
            <input
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              placeholder="Group ID"
            />
            <input value={workerId} onChange={(event) => setWorkerId(event.target.value)} placeholder="Worker ID" />
          </div>
          <div className="inline-fields">
            <button
              type="button"
              className="btn subtle"
              onClick={() => void addMemberMutation.mutate({ groupId: selectedGroupId, memberId: workerId })}
              disabled={!selectedGroupId || !workerId}
            >
              Add Member
            </button>
            <button
              type="button"
              className="btn subtle"
              onClick={() => void removeMemberMutation.mutate({ groupId: selectedGroupId, memberId: workerId })}
              disabled={!selectedGroupId || !workerId}
            >
              Remove Member
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div className="panel-head-icon">
              <FileText size={16} />
            </div>
            <div className="panel-head-text">
              <h3 className="panel-title">Submit Group Application</h3>
              <p className="panel-subtitle">Apply as a team using the group and worker IDs below.</p>
            </div>
          </div>
          <hr className="section-divider" />
          <input value={jobId} onChange={(event) => setJobId(event.target.value)} placeholder="Job ID" />
          <input value={applyGroupId} onChange={(event) => setApplyGroupId(event.target.value)} placeholder="Group ID" />
          <input
            value={workerIdsCsv}
            onChange={(event) => setWorkerIdsCsv(event.target.value)}
            placeholder="Worker IDs (comma separated)"
          />
          <textarea
            rows={3}
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Cover letter"
          />
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              void applyGroupMutation.mutate({
                job_id: jobId,
                group_id: applyGroupId,
                worker_ids: workerIdsCsv
                  .split(',')
                  .map((id) => id.trim())
                  .filter(Boolean),
                cover_letter: coverLetter,
              })
            }
          >
            {applyGroupMutation.isPending ? 'Submitting...' : 'Apply As Group'}
          </button>

          <h4 className="subhead">My Group Applications</h4>
          {appsQuery.isLoading ? (
            <div className="skeleton-stack" aria-hidden="true">
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          ) : null}
          {!appsQuery.isLoading && (appsQuery.data ?? []).length === 0 ? (
            <p className="empty-state">No group applications yet. Submit one from this panel.</p>
          ) : null}
          <div className="list">
            {(appsQuery.data ?? []).map((app) => (
              <div key={app.id} className="list-item">
                <strong>Application {app.id}</strong>
                <span>Job: {app.job_id}</span>
                <span className={statusClass(app.status)}>{app.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
