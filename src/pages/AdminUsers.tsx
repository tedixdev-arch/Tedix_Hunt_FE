import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { adminUsersApi, type ProfessionalRole, type ProfessionalUser, type ProvisionProfessionalResponse } from '../services/api'
import { provisioningErrorMessage } from '../features/auth/adminProvisioningErrors'
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
        {!loading && !listError && <div className="mt-5 divide-y divide-slate-100">{users.map(user => <article className="grid gap-1 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-4" key={user.id}><strong>{user.name || `Unnamed ${content.label}`}</strong><span className="text-sm text-slate-600">{user.email}</span><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{activationLabels[user.activationState]}</span></article>)}</div>}
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
          {result.response.activationRequired && <><p className="font-bold text-emerald-900">{resultLabel} invitation created.</p><p className="mt-2 text-sm text-emerald-950">This activation link is shown once. Copy it now and share it securely.</p>{link && <><input aria-label="Activation link" className="mt-3 w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs" readOnly value={link} /><button className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" onClick={() => void navigator.clipboard?.writeText(link)} type="button">Copy link</button></>}{result.response.activationExpiresAt && <p className="mt-3 text-xs text-emerald-900">Expires: {new Date(result.response.activationExpiresAt).toLocaleString()}</p>}</>}
        </div>}
      </section>
    </div>
  </AdminShell>
}
