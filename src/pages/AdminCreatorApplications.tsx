import { useCallback, useEffect, useRef, useState } from 'react'
import { creatorDecisionErrorMessage } from '../features/auth/creatorApplicationErrors'
import { creatorApplicationsApi, notifyCreatorApplicationsPendingChanged, type CreatorApplication, type CreatorApplicationStatus } from '../services/api'
import { AdminShell } from './AdminConsole'

type Filter = CreatorApplicationStatus | 'all'
const filters: Filter[] = ['pending', 'approved', 'rejected', 'all']
const labels: Record<CreatorApplicationStatus, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
const formatDate = (value: string) => new Date(value).toLocaleString()

function StatusBadge({ status }: { status: CreatorApplicationStatus }) {
  const color = status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{labels[status]}</span>
}

export function AdminCreatorApplicationsPage() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [applications, setApplications] = useState<CreatorApplication[]>([])
  const [selected, setSelected] = useState<CreatorApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isDeciding, setIsDeciding] = useState(false)
  const deciding = useRef(false)

  const load = useCallback(async (nextFilter: Filter) => {
    setLoading(true); setError('')
    try {
      const result = await creatorApplicationsApi.list(nextFilter === 'all' ? undefined : nextFilter)
      setApplications(result); setSelected(current => current && result.some(item => item.id === current.id) ? result.find(item => item.id === current.id)! : result[0] ?? null)
    } catch { setError('Unable to load Creator applications. Please try again.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(filter) }, [filter, load])

  async function decide(action: 'approve' | 'reject') {
    if (!selected || selected.status !== 'pending' || deciding.current) return
    if (action === 'reject' && !window.confirm('Reject this Creator application?')) return
    deciding.current = true; setIsDeciding(true); setError(''); setMessage('')
    try {
      const result = action === 'approve' ? await creatorApplicationsApi.approve(selected.id) : await creatorApplicationsApi.reject(selected.id)
      setSelected(result.application)
      notifyCreatorApplicationsPendingChanged()
      await load(filter)
      setSelected(result.application)
      setMessage(action === 'approve' ? 'Creator approved. They can now sign in using the credentials established during application.' : 'Creator application rejected. Creator access was not granted.')
    } catch (caught) {
      const nextError = creatorDecisionErrorMessage(caught); setError(nextError)
      if (nextError.includes('Refreshing')) await load(filter)
    } finally { deciding.current = false; setIsDeciding(false) }
  }

  return <AdminShell active="creator-applications"><div className="mt-6"><h2 className="text-3xl font-bold">Creator Applications</h2><p className="mt-2 text-slate-600">Review requests for Creator Studio access.</p><div aria-label="Application status filters" className="mt-5 flex flex-wrap gap-2">{filters.map(item => <button aria-pressed={filter === item} className={`min-h-10 rounded-lg px-4 text-sm font-bold ${filter === item ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`} key={item} onClick={() => { setFilter(item); setMessage(''); setError('') }} type="button">{item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>
    {error && <p className="mt-5 rounded-xl bg-amber-50 p-4 font-semibold text-amber-900" role="alert">{error}</p>}
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]"><section aria-label="Creator application list" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">{loading && <p className="p-4 text-sm text-slate-500">Loading Creator applications…</p>}{!loading && applications.length === 0 && <p className="p-4 text-slate-600">No {filter === 'all' ? '' : `${filter} `}Creator applications.</p>}{applications.map(application => <button aria-pressed={selected?.id === application.id} className={`grid w-full gap-3 rounded-xl p-4 text-left sm:grid-cols-[1fr_auto] ${selected?.id === application.id ? 'bg-emerald-50 ring-2 ring-emerald-400' : 'hover:bg-slate-50'}`} key={application.id} onClick={() => { setSelected(application); setMessage(''); setError('') }} type="button"><div><h3 className="font-bold">{application.name}</h3><p className="mt-1 text-sm text-slate-500">{application.email}</p><p className="mt-2 text-xs text-slate-400">Submitted {formatDate(application.createdAt)}</p></div><StatusBadge status={application.status} /></button>)}</section>
      <aside aria-label="Application details" className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{!selected ? <p className="text-slate-500">Select an application to view its details.</p> : <><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Applicant</p><h3 className="mt-1 text-2xl font-bold">{selected.name}</h3></div><StatusBadge status={selected.status} /></div><dl className="mt-5 space-y-4 text-sm"><Detail label="Email" value={selected.email} /><Detail label="Submitted" value={formatDate(selected.createdAt)} /><Detail label="Current status" value={labels[selected.status]} />{selected.reviewedAt && <Detail label="Reviewed" value={formatDate(selected.reviewedAt)} />}</dl>{message && <p className={`mt-5 rounded-xl border p-4 font-bold ${selected.status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} role="status">{message}</p>}{selected.status === 'pending' && <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl bg-emerald-500 px-4 font-bold disabled:opacity-50" disabled={isDeciding} onClick={() => void decide('approve')} type="button">{isDeciding ? 'Updating…' : 'Approve'}</button><button className="min-h-12 rounded-xl border border-rose-300 bg-rose-50 px-4 font-bold text-rose-800 disabled:opacity-50" disabled={isDeciding} onClick={() => void decide('reject')} type="button">Reject</button></div>}</>}</aside></div>
  </AdminShell>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{value}</dd></div>
}
