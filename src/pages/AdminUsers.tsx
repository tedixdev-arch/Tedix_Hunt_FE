import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { adminUsersApi, type ProfessionalRole, type ProfessionalUser, type ProvisionProfessionalResponse } from '../services/api'
import { provisioningErrorMessage } from '../features/auth/adminProvisioningErrors'
import { adminUserManagementError } from '../features/auth/adminUserManagementErrors'
import { useAuth } from '../app/providers/AuthProvider'
import { AdminShell } from './AdminConsole'

const roles: ProfessionalRole[] = ['admin', 'organizer', 'creator']
const activationLabels = { not_required: 'Active', pending: 'Activation pending', expired: 'Activation expired' } as const
const roleContent = {
  admin: { label: 'Admin', description: 'Admins with access to the platform console.' },
  organizer: { label: 'Organizer', description: 'Organizers with access to Hunt organization tools.' },
  creator: { label: 'Creator', description: 'Creators with access to the Creator Studio.' },
} as const

export function professionalActivationUrl(role: ProfessionalRole, token: string) {
  const paths: Record<ProfessionalRole, string> = { admin: '/admin/activate', organizer: '/organizer/activate-direct', creator: '/creator/activate' }
  return `${window.location.href.split('#')[0]}#${paths[role]}?token=${encodeURIComponent(token)}`
}

export function AdminUsersPage() {
  const { user: currentAdmin } = useAuth()
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole>('admin')
  const [formRole, setFormRole] = useState<ProfessionalRole>('admin')
  const [users, setUsers] = useState<ProfessionalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState<{ role: ProfessionalRole; response: ProvisionProfessionalResponse } | null>(null)
  const submitting = useRef(false)
  const [managed, setManaged] = useState<ProfessionalUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [managementError, setManagementError] = useState('')
  const [managementSuccess, setManagementSuccess] = useState('')
  const [working, setWorking] = useState(false)
  const [mode, setMode] = useState<'overview' | 'edit' | 'password' | 'block' | 'delete'>('overview')

  const loadUsers = useCallback(async (role: ProfessionalRole) => {
    setLoading(true)
    try { setUsers(await adminUsersApi.listUsers(role)); setListError('') }
    catch { setListError(`Unable to load ${roleContent[role].label} identities. Please try again.`) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadUsers(selectedRole) }, [loadUsers, selectedRole])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    const trimmedOrganization = organizationName.trim()
    if (!trimmedEmail) { setFormError('Email is required.'); return }
    if (formRole === 'organizer' && !trimmedOrganization) { setFormError('Organization name is required.'); return }
    submitting.current = true
    setIsSubmitting(true); setFormError(''); setResult(null)
    try {
      const response = formRole === 'admin'
        ? await adminUsersApi.provisionAdmin({ email: trimmedEmail, ...(trimmedName && { name: trimmedName }) })
        : formRole === 'organizer'
          ? await adminUsersApi.provisionProfessional({ email: trimmedEmail, ...(trimmedName && { name: trimmedName }), role: 'organizer', organizationName: trimmedOrganization })
          : await adminUsersApi.provisionProfessional({ email: trimmedEmail, ...(trimmedName && { name: trimmedName }), role: 'creator' })
      setResult({ role: formRole, response }); setEmail(''); setName(''); setOrganizationName('')
      if (selectedRole === formRole) await loadUsers(formRole)
      else setSelectedRole(formRole)
    } catch (error) { setFormError(provisioningErrorMessage(error)) }
    finally { submitting.current = false; setIsSubmitting(false) }
  }

  function openManage(user: ProfessionalUser) {
    setManaged(user); setEditName(user.name ?? ''); setEditEmail(user.email ?? '')
    setMode('overview'); setManagementError(''); setManagementSuccess(''); setPassword(''); setConfirmPassword('')
  }

  async function manage(action: () => Promise<unknown>, success: string, close = false) {
    if (!managed || working) return
    setWorking(true); setManagementError(''); setManagementSuccess('')
    try {
      const response = await action()
      if (response && typeof response === 'object' && 'id' in response) setManaged(response as ProfessionalUser)
      await loadUsers(selectedRole)
      setManagementSuccess(success)
      if (close) setManaged(null)
      else setMode('overview')
      return true
    } catch (error) { setManagementError(adminUserManagementError(error)); return false }
    finally { setWorking(false) }
  }

  async function submitEdit(event: FormEvent) {
    event.preventDefault()
    const nextName = editName.trim(); const nextEmail = editEmail.trim()
    if (!nextEmail) { setManagementError('Email is required.'); return }
    await manage(() => adminUsersApi.updateUser(managed!.id, { name: nextName || null, email: nextEmail }), 'User details updated.')
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8) { setManagementError('Use at least 8 characters.'); return }
    if (password !== confirmPassword) { setManagementError('Passwords do not match.'); return }
    const succeeded = await manage(() => adminUsersApi.setPassword(managed!.id, { newPassword: password, confirmPassword }), 'Password set. Existing sessions for this user were revoked.')
    if (succeeded) { setPassword(''); setConfirmPassword('') }
  }

  const content = roleContent[selectedRole]
  const resultLabel = result && roleContent[result.role].label
  const link = result?.response.activationRequired && result.response.activationToken ? professionalActivationUrl(result.role, result.response.activationToken) : null
  return <AdminShell active="users">
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div aria-label="Identity role" className="mb-5 inline-flex rounded-xl bg-slate-100 p-1" role="tablist">
          {roles.map(role => <button aria-selected={selectedRole === role} className={`rounded-lg px-4 py-2 text-sm font-bold ${selectedRole === role ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`} key={role} onClick={() => setSelectedRole(role)} role="tab" type="button">{roleContent[role].label}</button>)}
        </div>
        <h2 className="text-2xl font-bold">{content.label} identities</h2>
        <p className="mt-2 text-slate-600">{content.description}</p>
        {loading && <p className="mt-5 text-sm text-slate-500">Loading {content.label}s…</p>}
        {listError && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{listError}</p>}
        {!loading && !listError && <div className="mt-5 divide-y divide-slate-100">{users.map(user => { const blocked = user.isBlocked === true || user.status === 'blocked'; return <article className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:gap-4" key={user.id}><strong>{user.name || `Unnamed ${content.label}`}</strong><span className="text-sm text-slate-600">{user.email}</span><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${blocked ? 'bg-red-100 text-red-800' : 'bg-slate-100'}`}>{blocked ? 'Blocked' : activationLabels[user.activationState]}</span><button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" onClick={() => openManage(user)} type="button">Manage</button></article> })}</div>}
      </section>
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Add professional user</h2>
        <p className="mt-2 text-sm text-slate-600">Grant a professional capability or create a one-time activation invitation.</p>
        <form className="mt-5" onSubmit={submit}>
          <label className="block text-sm font-bold" htmlFor="professional-role">Role</label>
          <select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="professional-role" onChange={event => { setFormRole(event.target.value as ProfessionalRole); setOrganizationName(''); setFormError(''); setResult(null) }} value={formRole}>{roles.map(role => <option key={role} value={role}>{roleContent[role].label}</option>)}</select>
          <label className="mt-4 block text-sm font-bold" htmlFor="professional-email">Email</label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="professional-email" onChange={event => setEmail(event.target.value)} required type="email" value={email} />
          <label className="mt-4 block text-sm font-bold" htmlFor="professional-name">Name <span className="font-normal text-slate-500">(optional)</span></label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="professional-name" onChange={event => setName(event.target.value)} value={name} />
          {formRole === 'organizer' && <><label className="mt-4 block text-sm font-bold" htmlFor="organization-name">Organization name</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="organization-name" onChange={event => setOrganizationName(event.target.value)} required value={organizationName} /></>}
          {formError && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{formError}</p>}
          <button className="mt-5 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-bold disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Adding user…' : 'Add professional user'}</button>
        </form>
        {result && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          {!result.response.activationRequired && <><p className="font-bold text-emerald-900">{resultLabel} access granted.</p>{result.role === 'organizer' && result.response.organization && <p className="mt-2 text-sm text-emerald-950">Organization: {result.response.organization.name}</p>}</>}
          {result.response.activationRequired && <>
            <p className="font-bold text-emerald-900">{resultLabel} invitation created.</p>
            <p className="mt-2 text-sm text-emerald-950">This activation link is shown once. Copy it now and share it securely.</p>
            <div className="mt-4 text-sm text-emerald-950">
              <h3 className="font-bold">What to do next</h3>
              <p className="mt-1">Copy this link and send it securely to the new {resultLabel}.<br />They must open it to create their password and activate their {resultLabel} access.<br />The link can be used only once and expires after 24 hours.</p>
            </div>
            {link && <><input aria-label="Activation link" className="mt-3 w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs" readOnly value={link} /><button className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" onClick={() => void navigator.clipboard?.writeText(link)} type="button">Copy link</button></>}
            {result.response.activationExpiresAt && <p className="mt-3 text-xs text-emerald-900">Expires: {new Date(result.response.activationExpiresAt).toLocaleString()}</p>}
          </>}
        </div>}
      </section>
    </div>
    {managed && <div aria-labelledby="manage-user-title" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6" role="dialog">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold" id="manage-user-title">Manage user</h2><p className="mt-1 text-sm text-slate-600">{managed.name || 'Unnamed user'} · {managed.email}</p></div><button aria-label="Close user management" className="rounded-lg border px-3 py-2" onClick={() => setManaged(null)} type="button">Close</button></div>
        {managementError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{managementError}</p>}
        {managementSuccess && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900" role="status">{managementSuccess}</p>}
        {mode === 'overview' && <div className="mt-6 space-y-6">
          <div><h3 className="font-bold">Account state</h3><p className="mt-2">{managed.isBlocked === true || managed.status === 'blocked' ? 'Blocked' : 'Active'}</p></div>
          <div><h3 className="font-bold">Global capabilities</h3><div className="mt-3 grid gap-2 sm:grid-cols-3">{roles.map(role => { const held = managed.roles.includes(role); const isCurrentAdmin = managed.id === currentAdmin?.id; if (isCurrentAdmin) return <div className={`rounded-lg border px-3 py-2 text-sm font-bold ${held ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 text-slate-500'}`} key={role}>{roleContent[role].label}: {held ? 'Granted' : 'Not granted'}</div>; if (role === 'organizer' && !held) return <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" key={role}>Organizer provisioning uses Add professional user.</div>; return <button className={`rounded-lg border px-3 py-2 text-sm font-bold ${held ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`} disabled={working} key={role} onClick={() => void manage(() => held ? adminUsersApi.removeRole(managed.id, role) : adminUsersApi.grantRole(managed.id, role), `${roleContent[role].label} capability ${held ? 'removed' : 'granted'}.`)} type="button">{held ? `Remove ${roleContent[role].label}` : `Grant ${roleContent[role].label}`}</button> })}</div></div>
          <div className="flex flex-wrap gap-2 border-t pt-5"><button className="rounded-lg border border-slate-300 px-4 py-2 font-bold" onClick={() => setMode('edit')} type="button">Edit name and email</button>{!managed.roles.includes('admin') && managed.id !== currentAdmin?.id && <button className="rounded-lg border border-slate-300 px-4 py-2 font-bold" onClick={() => setMode('password')} type="button">Set password</button>}<button className="rounded-lg border border-slate-300 px-4 py-2 font-bold" disabled={working} onClick={() => managed.isBlocked === true || managed.status === 'blocked' ? void manage(() => adminUsersApi.unblockUser(managed.id), 'User unblocked.') : setMode('block')} type="button">{managed.isBlocked === true || managed.status === 'blocked' ? 'Unblock' : 'Block'}</button>{managed.id !== currentAdmin?.id && <button className="rounded-lg border border-red-300 px-4 py-2 font-bold text-red-700" onClick={() => setMode('delete')} type="button">Delete user</button>}</div>
        </div>}
        {mode === 'edit' && <form className="mt-6" onSubmit={submitEdit}><label className="block text-sm font-bold" htmlFor="manage-name">Name</label><input className="mt-2 min-h-12 w-full rounded-xl border px-3" id="manage-name" onChange={e => setEditName(e.target.value)} value={editName}/><label className="mt-4 block text-sm font-bold" htmlFor="manage-email">Email</label><input className="mt-2 min-h-12 w-full rounded-xl border px-3" id="manage-email" onChange={e => setEditEmail(e.target.value)} required type="email" value={editEmail}/><div className="mt-5 flex gap-2"><button className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white" disabled={working} type="submit">Save changes</button><button className="rounded-lg border px-4 py-2" onClick={() => setMode('overview')} type="button">Cancel</button></div></form>}
        {mode === 'password' && <form className="mt-6" onSubmit={submitPassword}><p className="mb-4 text-sm text-slate-600">Setting a password revokes this user’s existing sessions.</p><label className="block text-sm font-bold" htmlFor="manage-password">New password</label><input className="mt-2 min-h-12 w-full rounded-xl border px-3" id="manage-password" onChange={e => setPassword(e.target.value)} type="password" value={password}/><label className="mt-4 block text-sm font-bold" htmlFor="manage-confirm-password">Confirm password</label><input className="mt-2 min-h-12 w-full rounded-xl border px-3" id="manage-confirm-password" onChange={e => setConfirmPassword(e.target.value)} type="password" value={confirmPassword}/><div className="mt-5 flex gap-2"><button className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white" disabled={working} type="submit">Set password</button><button className="rounded-lg border px-4 py-2" onClick={() => setMode('overview')} type="button">Cancel</button></div></form>}
        {mode === 'block' && <div className="mt-6"><h3 className="font-bold">Block this user?</h3><p className="mt-2 text-sm text-slate-600">Blocking immediately terminates the user’s active sessions.</p><div className="mt-5 flex gap-2"><button className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white" disabled={working} onClick={() => void manage(() => adminUsersApi.blockUser(managed.id), 'User blocked.')} type="button">Confirm block</button><button className="rounded-lg border px-4 py-2" onClick={() => setMode('overview')} type="button">Cancel</button></div></div>}
        {mode === 'delete' && <div className="mt-6"><h3 className="font-bold text-red-800">Delete this user?</h3><p className="mt-2 text-sm text-slate-600">Deletion is permanent and is possible only when this identity has no protected business or history dependencies. The backend will verify this.</p><div className="mt-5 flex gap-2"><button className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white" disabled={working} onClick={() => void manage(() => adminUsersApi.deleteUser(managed.id), 'User deleted.', true)} type="button">Confirm delete</button><button className="rounded-lg border px-4 py-2" onClick={() => setMode('overview')} type="button">Cancel</button></div></div>}
      </section>
    </div>}
  </AdminShell>
}
