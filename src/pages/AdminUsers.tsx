import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { adminUsersApi, type AdminUser, type ProvisionAdminResponse } from '../services/api'
import { provisioningErrorMessage } from '../features/auth/adminProvisioningErrors'
import { AdminShell } from './AdminConsole'

const activationLabels = { not_required: 'Active', pending: 'Activation pending', expired: 'Activation expired' } as const

function activationUrl(token: string) {
  const appUrl = window.location.href.split('#')[0]
  return `${appUrl}#/admin/activate?token=${encodeURIComponent(token)}`
}

export function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState<ProvisionAdminResponse | null>(null)
  const submitting = useRef(false)

  const loadAdmins = useCallback(async () => {
    try {
      setAdmins(await adminUsersApi.listAdmins())
      setListError('')
    } catch {
      setListError('Unable to load Admin identities. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadAdmins() }, [loadAdmins])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    if (!trimmedEmail) { setFormError('Email is required.'); return }
    submitting.current = true
    setIsSubmitting(true)
    setFormError('')
    setResult(null)
    try {
      const response = await adminUsersApi.provisionAdmin({ email: trimmedEmail, ...(trimmedName && { name: trimmedName }) })
      setResult(response)
      setEmail('')
      setName('')
      await loadAdmins()
    } catch (error) {
      setFormError(provisioningErrorMessage(error))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  const link = result?.activationRequired && result.activationToken ? activationUrl(result.activationToken) : null
  return <AdminShell active="users">
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black">Admin identities</h2>
        <p className="mt-2 text-slate-600">Admins with access to the platform console.</p>
        {loading && <p className="mt-5 text-sm text-slate-500">Loading Admins…</p>}
        {listError && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{listError}</p>}
        {!loading && !listError && <div className="mt-5 divide-y divide-slate-100">{admins.map(admin => <article className="grid gap-1 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-4" key={admin.id}><strong>{admin.name || 'Unnamed Admin'}</strong><span className="text-sm text-slate-600">{admin.email}</span><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{activationLabels[admin.activationState]}</span></article>)}</div>}
      </section>
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black">Add Admin</h2>
        <p className="mt-2 text-sm text-slate-600">Grant Admin access or create a one-time activation invitation.</p>
        <form className="mt-5" onSubmit={submit}>
          <label className="block text-sm font-bold" htmlFor="admin-email">Email</label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="admin-email" onChange={event => setEmail(event.target.value)} required type="email" value={email} />
          <label className="mt-4 block text-sm font-bold" htmlFor="admin-name">Name <span className="font-normal text-slate-500">(optional)</span></label>
          <input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="admin-name" onChange={event => setName(event.target.value)} value={name} />
          {formError && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{formError}</p>}
          <button className="mt-5 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-black disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Adding Admin…' : 'Add Admin'}</button>
        </form>
        {result && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          {!result.activationRequired && <p className="font-black text-emerald-900">Admin access granted.</p>}
          {result.activationRequired && <>
            <p className="font-black text-emerald-900">Admin invitation created.</p>
            <p className="mt-2 text-sm text-emerald-950">This activation link is shown once. Copy it now and share it securely.</p>
            <div className="mt-4 text-sm text-emerald-950">
              <h3 className="font-black">What to do next</h3>
              <p className="mt-1">Copy this link and send it securely to the new Admin.<br />They must open it to create their password and activate their Admin account.<br />The link can be used only once and expires after 24 hours.</p>
            </div>
            {link && <><input aria-label="Activation link" className="mt-3 w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs" readOnly value={link} /><button className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white" onClick={() => void navigator.clipboard?.writeText(link)} type="button">Copy link</button></>}
            {result.activationExpiresAt && <p className="mt-3 text-xs text-emerald-900">Expires: {new Date(result.activationExpiresAt).toLocaleString()}</p>}
          </>}
        </div>}
      </section>
    </div>
  </AdminShell>
}
