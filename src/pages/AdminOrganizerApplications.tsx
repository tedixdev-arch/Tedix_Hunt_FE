import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, notifyOrganizerApplicationsPendingChanged, organizerApplicationsApi, type OrganizerApplication, type OrganizerApplicationStatus } from '../services/api'
import { AdminShell } from './AdminConsole'

type ApplicationFilter = OrganizerApplicationStatus | 'all'

const filters: Array<{ value: ApplicationFilter; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const statusLabels: Record<OrganizerApplicationStatus, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
const organizationTypeLabels = { school: 'School', ngo: 'NGO', community: 'Community', other: 'Other' } as const

function hasAlreadyDecidedCode(value: unknown): boolean {
  if (value === 'application_already_decided') return true
  if (!value || typeof value !== 'object') return false
  return Object.values(value).some(hasAlreadyDecidedCode)
}

export function organizerApplicationDecisionError(error: unknown): string {
  return error instanceof ApiError && hasAlreadyDecidedCode(error.details)
    ? 'This application has already been reviewed. Refreshing its current status.'
    : 'Unable to update this application. Please try again.'
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function StatusBadge({ application }: { application: OrganizerApplication }) {
  const color = application.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : application.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${color}`}>{statusLabels[application.status]}</span>
}

export function AdminOrganizerApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationFilter>('pending')
  const [applications, setApplications] = useState<OrganizerApplication[]>([])
  const [selected, setSelected] = useState<OrganizerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [decisionError, setDecisionError] = useState('')
  const [isDeciding, setIsDeciding] = useState(false)
  const [activationToken, setActivationToken] = useState<string | null>(null)
  const deciding = useRef(false)

  const loadApplications = useCallback(async (nextFilter: ApplicationFilter, retainSelection = false) => {
    setLoading(true)
    setListError('')
    try {
      const result = await organizerApplicationsApi.list(nextFilter === 'all' ? undefined : nextFilter)
      setApplications(result)
      setSelected(current => retainSelection && current ? current : result[0] ?? null)
    } catch {
      setListError('Unable to load Organizer applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadApplications(filter) }, [filter, loadApplications])

  function changeFilter(nextFilter: ApplicationFilter) {
    setActivationToken(null)
    setDecisionError('')
    setFilter(nextFilter)
  }

  async function decide(action: 'approve' | 'reject') {
    if (!selected || selected.status !== 'pending' || deciding.current) return
    if (action === 'reject' && !window.confirm('Reject this Organizer application?')) return
    deciding.current = true
    setIsDeciding(true)
    setDecisionError('')
    setActivationToken(null)
    try {
      if (action === 'approve') {
        const result = await organizerApplicationsApi.approve(selected.id)
        setSelected(result.application)
        setActivationToken(result.activationToken)
      } else {
        const result = await organizerApplicationsApi.reject(selected.id)
        setSelected(result.application)
      }
      notifyOrganizerApplicationsPendingChanged()
      await loadApplications(filter, true)
    } catch (error) {
      const message = organizerApplicationDecisionError(error)
      setDecisionError(message)
      if (message.startsWith('This application has already been reviewed')) await loadApplications(filter)
    } finally {
      deciding.current = false
      setIsDeciding(false)
    }
  }

  const emptyLabel = filter === 'all' ? 'No Organizer applications.' : `No ${filter} Organizer applications.`

  return <AdminShell active="organizer-applications">
    <div className="mt-6">
      <h2 className="text-3xl font-black">Organizer Applications</h2>
      <p className="mt-2 text-slate-600">Review requests for Registered Organizer access.</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Application status filters">
        {filters.map(item => <button aria-pressed={filter === item.value} className={`min-h-10 rounded-lg px-4 text-sm font-black ${filter === item.value ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`} key={item.value} onClick={() => changeFilter(item.value)} type="button">{item.label}</button>)}
      </div>
    </div>
    {listError && <p className="mt-5 rounded-xl bg-amber-50 p-4 font-semibold text-amber-900" role="alert">{listError}</p>}
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Organizer application list">
        {loading && <p className="p-4 text-sm text-slate-500">Loading Organizer applications…</p>}
        {!loading && !listError && applications.length === 0 && <p className="p-4 text-slate-600">{emptyLabel}</p>}
        {!loading && applications.length > 0 && <div className="divide-y divide-slate-100">{applications.map(application => <button aria-pressed={selected?.id === application.id} className={`grid w-full gap-3 rounded-xl p-4 text-left sm:grid-cols-[1fr_auto] ${selected?.id === application.id ? 'bg-emerald-50 ring-2 ring-emerald-400' : 'hover:bg-slate-50'}`} key={application.id} onClick={() => { setSelected(application); setActivationToken(null); setDecisionError('') }} type="button"><div><h3 className="font-black">{application.name}</h3><p className="mt-1 text-sm font-semibold text-slate-700">{application.organizationName} · {organizationTypeLabels[application.organizationType]}</p><p className="mt-1 text-sm text-slate-500">{application.email}</p><p className="mt-2 text-xs text-slate-400">Submitted {formatDate(application.createdAt)}</p></div><StatusBadge application={application} /></button>)}</div>}
      </section>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Application details">
        {!selected && <p className="text-slate-500">Select an application to view its details.</p>}
        {selected && <>
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Applicant</p><h3 className="mt-1 text-2xl font-black">{selected.name}</h3></div><StatusBadge application={selected} /></div>
          <dl className="mt-5 space-y-4 text-sm">
            <Detail label="Email" value={selected.email} />
            {selected.phone && <Detail label="Phone" value={selected.phone} />}
            <div className="border-t border-slate-100 pt-4"><dt className="text-xs font-black uppercase tracking-wide text-slate-400">Organization</dt><dd className="mt-1 font-bold">{selected.organizationName}</dd><dd className="mt-1 text-slate-600">{organizationTypeLabels[selected.organizationType]}</dd></div>
            <Detail label="Reason" value={selected.reason} />
            <Detail label="Submitted" value={formatDate(selected.createdAt)} />
            <Detail label="Current status" value={statusLabels[selected.status]} />
            {selected.reviewedAt && <Detail label="Reviewed" value={formatDate(selected.reviewedAt)} />}
            {selected.status === 'approved' && <Detail label="Account state" value={selected.activatedAt ? 'Activated' : 'Awaiting activation'} />}
          </dl>
          {decisionError && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="alert">{decisionError}</p>}
          {activationToken && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status"><p className="font-black text-emerald-900">Organizer approved.</p><p className="mt-2 text-sm text-emerald-950">Activation credential created successfully.<br />The Organizer activation page will be connected in E12.</p><label className="mt-4 block text-xs font-black text-emerald-900" htmlFor="organizer-activation-token">This activation token is shown once.</label><input className="mt-2 w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs" id="organizer-activation-token" readOnly value={activationToken} /><button className="mt-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white" onClick={() => void navigator.clipboard?.writeText(activationToken)} type="button">Copy activation token</button></div>}
          {selected.status === 'pending' && <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl bg-emerald-500 px-4 font-black disabled:cursor-wait disabled:opacity-50" disabled={isDeciding} onClick={() => void decide('approve')} type="button">{isDeciding ? 'Updating…' : 'Approve'}</button><button className="min-h-12 rounded-xl border border-rose-300 bg-rose-50 px-4 font-black text-rose-800 disabled:cursor-wait disabled:opacity-50" disabled={isDeciding} onClick={() => void decide('reject')} type="button">Reject</button></div>}
        </>}
      </aside>
    </div>
  </AdminShell>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap font-semibold text-slate-800">{value}</dd></div>
}
