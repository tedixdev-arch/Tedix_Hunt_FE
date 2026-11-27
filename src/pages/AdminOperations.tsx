import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { AdminShell } from './AdminConsole'
import { adminOperationsApi, type AdminAlert, type AdminDashboard, type CustomHuntRequest, type CustomRequestStatus } from '../services/api/operations'
import { adminHuntQuery, adminHuntsApi, type AdminHuntFilterOptions, type AdminHuntFilters, type AdminHuntPage } from '../services/api/adminHunts'
import { adminUsersApi, type ProfessionalUser } from '../services/api/adminUsers'
import { ApiError } from '../services/api/client'

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const statusStyle: Record<string, string> = { active: 'bg-emerald-100 text-emerald-800', paused: 'bg-violet-100 text-violet-800', published: 'bg-sky-100 text-sky-800', finished: 'bg-slate-200 text-slate-700', cancelled: 'bg-rose-100 text-rose-800', draft: 'bg-slate-100 text-slate-600' }

/** Loads once and on demand; every page shows honest loading, error and empty states. */
function useLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const reload = useCallback(() => { setError(''); load().then(setData).catch(() => setError("We couldn't load this data. Please retry.")) }, [load])
  useEffect(reload, [reload])
  return { data, error, reload }
}
function State({ error, loading, onRetry }: { error: string; loading: boolean; onRetry: () => void }) {
  if (error) return <div className="mt-6 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={onRetry}>Retry</button></div>
  return loading ? <p className="mt-6" role="status">Loading…</p> : null
}
const when = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export function AdminDashboardPage() {
  const load = useCallback(() => adminOperationsApi.dashboard(), [])
  const { data, error, reload } = useLoad<AdminDashboard>(load)
  const tiles: Array<[string, number | undefined, string?]> = [
    ['Live Hunts', data?.liveHunts, '/admin/hunts'], ['All Hunts', data?.hunts, '/admin/hunts'], ['Participants', data?.participants],
    ['Finished runs', data?.finishedParticipants], ['Active accounts', data?.users, '/admin/users'], ['Approved Templates', data?.approvedTemplates, '/admin/templates'],
  ]
  const actions: Array<[string, number | undefined, string]> = [
    ['Open safety alerts', data?.openAlerts, '/admin/alerts'], ['Templates waiting for review', data?.templatesInReview, '/admin/templates'],
    ['Organizer applications', data?.pendingOrganizerApplications, '/admin/organizer-applications'], ['Creator applications', data?.pendingCreatorApplications, '/admin/creator-applications'],
    ['Custom Hunt requests', data?.openCustomRequests, '/admin/custom-requests'],
  ]
  return <AdminShell active="dashboard">
    <State error={error} loading={!data} onRetry={reload} />
    {data && <>
      <section className="mt-6" aria-labelledby="needs-action"><h2 id="needs-action" className="text-xl font-bold">Needs action</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{actions.map(([label, value, path]) => <Link key={label} to={path} className={`rounded-xl border p-4 ${value ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}><p className="text-sm font-bold text-slate-600">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></Link>)}</div></section>
      <section className="mt-6" aria-labelledby="platform"><h2 id="platform" className="text-xl font-bold">Platform</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">{tiles.map(([label, value, path]) => { const body = <><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></>; return path ? <Link key={label} to={path} className="rounded-xl border border-slate-200 bg-white p-4">{body}</Link> : <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">{body}</div> })}</div></section>
    </>}
  </AdminShell>
}

const FILTER_KEYS = ['q', 'status', 'organizationId', 'organizerId', 'city', 'country', 'startFrom', 'startTo', 'createdFrom', 'createdTo', 'sort', 'order'] as const
const PAGE_SIZES = [10, 25, 50, 100]
const input = 'min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal'

/** Admin Hunt list. Filters, sorting and paging live in the URL so Back from a Hunt returns to the same view. */
export function AdminHuntsPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const filters: AdminHuntFilters = Object.fromEntries(FILTER_KEYS.map(k => [k, params.get(k) ?? undefined]).filter(([, v]) => v)) as AdminHuntFilters
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSize = PAGE_SIZES.includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 25
  const queryKey = adminHuntQuery(filters, { page, pageSize })
  const [data, setData] = useState<AdminHuntPage>()
  const [error, setError] = useState('')
  const [search, setSearch] = useState(filters.q ?? '')
  const [options, setOptions] = useState<AdminHuntFilterOptions>({ organizations: [], organizers: [] })
  const [exporting, setExporting] = useState(false), [exportNotice, setExportNotice] = useState('')
  const [showFilters, setShowFilters] = useState(() => FILTER_KEYS.some(k => !['q', 'status', 'sort', 'order'].includes(k) && params.get(k)))
  const sequence = useRef(0)
  const update = (changes: Record<string, string | undefined>, resetPage = true) => setParams(current => {
    const next = new URLSearchParams(current)
    for (const [k, v] of Object.entries(changes)) { if (v) next.set(k, v); else next.delete(k) }
    if (resetPage) next.delete('page')
    return next
  }, { replace: true })
  const load = useCallback(async (quiet = false) => {
    const mine = ++sequence.current
    try {
      const result = await adminHuntsApi.list(filters, page, pageSize)
      if (mine === sequence.current) { setData(result); setError('') }
    } catch (e) {
      if (mine !== sequence.current) return
      if (!quiet) setData(undefined)
      setError(e instanceof ApiError && e.status === 400 ? 'Some filters are invalid. Clear them and try again.' : e instanceof ApiError && e.status === 403 ? 'Admin access is required.' : "We couldn't load Hunts. Please retry.")
    }
  // queryKey captures filters, page and pageSize.
  }, [queryKey])
  useEffect(() => { void load() }, [load])
  // Live counts refresh quietly every 15 s without touching the user's filters, scroll or page.
  useEffect(() => { const timer = window.setInterval(() => void load(true), 15000); return () => window.clearInterval(timer) }, [load])
  useEffect(() => { adminHuntsApi.filterOptions().then(setOptions).catch(() => undefined) }, [])
  useEffect(() => { setSearch(filters.q ?? '') }, [filters.q])
  useEffect(() => { const t = window.setTimeout(() => { if ((filters.q ?? '') !== search.trim()) update({ q: search.trim() || undefined }) }, 400); return () => window.clearTimeout(t) }, [search])

  async function exportCsv() {
    setExporting(true); setExportNotice('')
    try {
      const out = await adminHuntsApi.export(filters)
      const url = URL.createObjectURL(new Blob([out.csv], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a'); a.href = url; a.download = out.filename; document.body.append(a); a.click(); a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setExportNotice(`Exported ${out.rows} Hunt${out.rows === 1 ? '' : 's'}${out.truncated ? ' (limit reached: narrow the filters to export the rest)' : ''}.`)
    } catch { setExportNotice("Export failed. Please retry.") }
    finally { setExporting(false) }
  }
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const from = location.search
  const sortBy = (sort: NonNullable<AdminHuntFilters['sort']>) => update({ sort, order: filters.sort === sort || (!filters.sort && sort === 'created') ? (filters.order === 'asc' ? 'desc' : 'asc') : sort === 'name' ? 'asc' : 'desc' })
  const sortMark = (sort: string) => (filters.sort ?? 'created') === sort ? ((filters.order ?? 'desc') === 'asc' ? ' ▲' : ' ▼') : ''
  const activeFilterCount = FILTER_KEYS.filter(k => !['sort', 'order'].includes(k) && params.get(k)).length

  return <AdminShell active="hunts"><section className={`${card} mt-6`}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-2xl font-bold">Hunts</h2><p className="mt-1 text-slate-600">Every Hunt on the platform. Counts refresh every 15 seconds.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50" disabled={exporting} onClick={() => void exportCsv()}>{exporting ? 'Exporting…' : 'Export CSV'}</button>
      </div>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <label className="text-sm font-bold">Search<input aria-label="Search Hunts" className={`${input} mt-1`} placeholder="Hunt, organization, organizer, city or country" value={search} maxLength={120} onChange={e => setSearch(e.target.value)} /></label>
      <label className="text-sm font-bold">Status<select aria-label="Status" className={`${input} mt-1`} value={filters.status ?? ''} onChange={e => update({ status: e.target.value || undefined })}><option value="">All</option>{['draft', 'published', 'active', 'paused', 'finished', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}</select></label>
      <div className="flex items-end gap-2"><button type="button" aria-expanded={showFilters} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold" onClick={() => setShowFilters(v => !v)}>More filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
        {activeFilterCount > 0 && <button type="button" className="min-h-10 px-2 text-sm font-bold text-slate-600 underline" onClick={() => { setSearch(''); setParams(new URLSearchParams(), { replace: true }) }}>Clear</button>}</div>
    </div>
    {showFilters && <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-bold">Organization<select aria-label="Organization" className={`${input} mt-1`} value={filters.organizationId ?? ''} onChange={e => update({ organizationId: e.target.value || undefined })}><option value="">All</option>{options.organizations.map(o => <option key={o.id} value={o.id}>{o.name}{o.independent ? ' (Independent)' : ''}</option>)}</select></label>
      <label className="text-xs font-bold">Organizer<select aria-label="Organizer" className={`${input} mt-1`} value={filters.organizerId ?? ''} onChange={e => update({ organizerId: e.target.value || undefined })}><option value="">All</option>{options.organizers.map(o => <option key={o.id} value={o.id}>{o.name ? `${o.name} (${o.email})` : o.email}</option>)}</select></label>
      <label className="text-xs font-bold">City<input key={filters.city ?? ''} aria-label="City" className={`${input} mt-1`} defaultValue={filters.city ?? ''} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} onBlur={e => update({ city: e.target.value.trim() || undefined })} /></label>
      <label className="text-xs font-bold">Country<input key={filters.country ?? ''} aria-label="Country" className={`${input} mt-1`} defaultValue={filters.country ?? ''} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} onBlur={e => update({ country: e.target.value.trim() || undefined })} /></label>
      <label className="text-xs font-bold">Start from<input aria-label="Start from" type="date" className={`${input} mt-1`} value={filters.startFrom ?? ''} onChange={e => update({ startFrom: e.target.value || undefined })} /></label>
      <label className="text-xs font-bold">Start to<input aria-label="Start to" type="date" className={`${input} mt-1`} value={filters.startTo ?? ''} onChange={e => update({ startTo: e.target.value || undefined })} /></label>
      <label className="text-xs font-bold">Created from<input aria-label="Created from" type="date" className={`${input} mt-1`} value={filters.createdFrom ?? ''} onChange={e => update({ createdFrom: e.target.value || undefined })} /></label>
      <label className="text-xs font-bold">Created to<input aria-label="Created to" type="date" className={`${input} mt-1`} value={filters.createdTo ?? ''} onChange={e => update({ createdTo: e.target.value || undefined })} /></label>
    </div>}
    {exportNotice && <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{exportNotice}</p>}
    {error && <div className="mt-6 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={() => void load()}>Retry</button></div>}
    {!data && !error && <p className="mt-6" role="status">Loading…</p>}
    {data && (data.total === 0 ? <p className="mt-5 text-slate-600">No Hunts match these filters.</p> : <>
      <p className="mt-4 text-sm text-slate-600" aria-live="polite">{data.total} Hunt{data.total === 1 ? '' : 's'} · showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.total, data.page * data.pageSize)}</p>
      <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr>
        <th className="py-2"><button type="button" className="uppercase" onClick={() => sortBy('name')}>Hunt{sortMark('name')}</button></th><th>Organization</th><th>Organizer</th><th>Country</th>
        <th><button type="button" className="uppercase" onClick={() => sortBy('status')}>Status{sortMark('status')}</button></th>
        <th><button type="button" className="uppercase" onClick={() => sortBy('created')}>Created{sortMark('created')}</button></th>
        <th><button type="button" className="uppercase" onClick={() => sortBy('start')}>Start{sortMark('start')}</button></th>
        <th>Duration</th><th>Players</th><th>Active</th><th>Completed</th><th>Alerts</th><th /></tr></thead>
        <tbody>{data.hunts.map(h => <tr key={h.id} className="border-t border-slate-100 align-top">
          <td className="py-3"><Link className="font-bold hover:underline" to={`/admin/hunts/${h.id}`} state={{ from }}>{h.name}</Link><p className="text-xs text-slate-500">{[h.templateName, h.city].filter(Boolean).join(' · ') || '—'}</p></td>
          <td>{h.organization.name}{h.organization.independent && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Independent</span>}</td>
          <td>{h.organizer ? <>{h.organizer.name || '—'}<p className="text-xs text-slate-500">{h.organizer.email}</p></> : '—'}</td>
          <td>{h.country ?? '—'}</td>
          <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[h.status] ?? ''}`}>{h.status}</span></td>
          <td className="whitespace-nowrap">{new Date(h.createdAt).toLocaleDateString()}</td>
          <td className="whitespace-nowrap">{h.startDate ? `${h.startDate} ${h.startTime?.slice(0, 5) ?? ''}` : '—'}</td>
          <td>{h.durationMinutes ? `${h.durationMinutes} min` : '—'}</td>
          <td>{h.participants}{h.capacity ? ` / ${h.capacity}` : ''}</td>
          <td>{h.activeParticipants}</td><td>{h.finished}</td>
          <td>{h.openAlerts ? <Link className="font-bold text-red-700 underline" to={`/admin/alerts?huntId=${h.id}`}>{h.openAlerts} open</Link> : '—'}</td>
          <td className="text-right whitespace-nowrap"><Link className="font-bold text-emerald-700 underline" to={`/admin/hunts/${h.id}`} state={{ from }}>{['active', 'paused', 'published'].includes(h.status) ? 'Monitor' : 'View'}</Link></td></tr>)}</tbody></table></div>
      <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
        <label className="text-sm">Rows per page<select aria-label="Rows per page" className="ml-2 min-h-10 rounded-lg border border-slate-300 px-2" value={pageSize} onChange={e => update({ pageSize: e.target.value })}>{PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <div className="flex items-center gap-2">
          <button type="button" className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold disabled:opacity-40" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, false)}>Previous</button>
          <span className="text-sm">Page {data.page} of {totalPages}</span>
          <button type="button" className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold disabled:opacity-40" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) }, false)}>Next</button>
        </div>
      </nav></>)}
  </section></AdminShell>
}

export function AdminAlertsPage() {
  const [params] = useSearchParams()
  const huntId = params.get('huntId') ?? undefined
  const load = useCallback(() => adminOperationsApi.alerts(huntId).then(r => r.alerts), [huntId])
  const { data, error, reload } = useLoad<AdminAlert[]>(load)
  const [busy, setBusy] = useState('')
  useEffect(() => { const timer = window.setInterval(reload, 15000); return () => window.clearInterval(timer) }, [reload])
  async function resolve(alert: AdminAlert) { setBusy(alert.id); try { await adminOperationsApi.resolveAlert(alert) } finally { setBusy(''); reload() } }
  return <AdminShell active="alerts"><section className={`${card} mt-6`}>
    {huntId && <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to={`/admin/hunts/${encodeURIComponent(huntId)}`}>← Back to Hunt</Link>}
    <h2 className="text-2xl font-bold">Safety Alerts{huntId && data?.[0] ? ` · ${data[0].huntName}` : ''}</h2><p className="mt-1 text-slate-600">{huntId ? 'All help and emergency requests for this Hunt, open first.' : 'Help and emergency requests sent by Participants from the app. Organizers see the same requests in their Hunt monitor.'}{huntId && <> <Link className="font-bold text-emerald-700 underline" to="/admin/alerts">Show all Hunts</Link></>}</p>
    <State error={error} loading={!data} onRetry={reload} />
    {data && (data.length === 0 ? <p className="mt-5 text-slate-600">{huntId ? 'No alerts have been raised for this Hunt.' : 'No alerts have been raised.'}</p> :
      <ul className="mt-5 divide-y divide-slate-100">{data.map(a => <li key={a.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-bold">{a.kind === 'emergency' ? '🚨 Emergency' : 'Help request'} · {a.displayName} · <Link className="underline" to={`/admin/hunts/${a.huntId}`}>{a.huntName}</Link></p>
          {a.message && <p className="text-sm text-slate-700">{a.message}</p>}<p className="text-xs text-slate-500">{when(a.createdAt)}{a.resolvedAt ? ` · resolved ${when(a.resolvedAt)}` : ''}</p></div>
        {a.status === 'open' ? <button className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={busy === a.id} type="button" onClick={() => void resolve(a)}>Mark resolved</button> : <span className="text-sm font-semibold text-emerald-700">Resolved</span>}
      </li>)}</ul>)}
  </section></AdminShell>
}

export const requestLabels: Record<CustomRequestStatus, string> = {
  new: 'New', in_review: 'In review', assigned: 'Assigned to Creator', in_progress: 'Creator building', completed: 'Done', rejected: 'Rejected', closed: 'Closed',
}
const requestStyle: Record<CustomRequestStatus, string> = {
  new: 'bg-sky-100 text-sky-800', in_review: 'bg-violet-100 text-violet-800', assigned: 'bg-amber-100 text-amber-900', in_progress: 'bg-amber-100 text-amber-900',
  completed: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800', closed: 'bg-slate-200 text-slate-700',
}
const templateLabels: Record<string, string> = { draft: 'draft', submitted: 'submitted for review', changes_requested: 'changes requested', approved: 'approved' }
const requestErrors: Record<string, string> = {
  organization_required: 'This request is not linked to an organization, so the finished Hunt could not be made exclusive. Ask the Organizer to resubmit while signed in.',
  request_finalized: 'This request is already finished.', request_assigned: 'Assigned requests can only be closed or rejected.',
  template_in_progress: 'Another Creator already linked a template to this request.', creator_not_found: 'That Creator is not active.',
}
const open = (status: CustomRequestStatus) => ['new', 'in_review', 'assigned', 'in_progress'].includes(status)

/** Admin side of the custom Hunt workflow: review, assign a Creator, track the template, reject with a note. */
export function AdminCustomRequestsPage() {
  const load = useCallback(() => adminOperationsApi.customRequests().then(r => r.requests), [])
  const { data, error, reload } = useLoad<CustomHuntRequest[]>(load)
  const [creators, setCreators] = useState<ProfessionalUser[]>([])
  useEffect(() => { adminUsersApi.listUsers('creator').then(list => setCreators(list.filter(u => !u.isBlocked && u.status !== 'blocked' && u.activationState !== 'pending'))).catch(() => setCreators([])) }, [])
  const [drafts, setDrafts] = useState<Record<string, { adminNote?: string; organizerNote?: string; creator?: string; rejecting?: boolean }>>({})
  const [busy, setBusy] = useState('')
  const [failure, setFailure] = useState<Record<string, string>>({})
  const draft = (id: string) => drafts[id] ?? {}
  const edit = (id: string, change: Partial<{ adminNote: string; organizerNote: string; creator: string; rejecting: boolean }>) => setDrafts(d => ({ ...d, [id]: { ...d[id], ...change } }))
  async function act(id: string, work: () => Promise<unknown>, reset?: Array<'adminNote' | 'organizerNote' | 'creator' | 'rejecting'>) {
    setBusy(id); setFailure(f => ({ ...f, [id]: '' }))
    try {
      await work()
      if (reset) setDrafts(d => { const next = { ...d[id] }; reset.forEach(k => delete next[k]); return { ...d, [id]: next } })
      reload()
    } catch (caught) {
      const code = caught instanceof ApiError && caught.details && typeof caught.details === 'object' && 'error' in caught.details ? String(caught.details.error) : ''
      setFailure(f => ({ ...f, [id]: requestErrors[code] ?? "We couldn't save this change. Please retry." }))
    } finally { setBusy('') }
  }
  const field = 'min-h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm'
  const button = 'min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50'
  return <AdminShell active="custom-requests"><section className={`${card} mt-6`}>
    <h2 className="text-2xl font-bold">Custom Hunt requests</h2>
    <p className="mt-1 text-slate-600">Review a request, assign it to a Creator, then approve the template they build in Template review. Approval makes the Hunt available only to the requesting organization and emails the Organizer.</p>
    <State error={error} loading={!data} onRetry={reload} />
    {data && (data.length === 0 ? <p className="mt-5 text-slate-600">No requests yet.</p> :
      <ul className="mt-5 grid gap-4">{data.map(r => {
        const d = draft(r.id), locked = busy === r.id
        const adminNote = d.adminNote ?? r.adminNote ?? '', organizerNote = d.organizerNote ?? r.organizerNote ?? ''
        const creator = d.creator ?? r.assignedCreator?.id ?? ''
        return <li key={r.id} className="rounded-xl border border-slate-200 p-4" aria-label={`Request from ${r.contactName}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-bold">{r.contactName}{r.organizationName ? ` · ${r.organizationName}` : ''}</p>
              <a className="text-sm text-emerald-700 underline" href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
              <p className="mt-1 text-xs text-slate-500">{when(r.createdAt)}{r.city ? ` · ${r.city}` : ''}{r.preferredDate ? ` · preferred ${r.preferredDate}` : ''}{r.participantCount ? ` · ${r.participantCount} participants` : ''}</p>
              {!r.organizationId && <p className="mt-1 text-xs font-semibold text-amber-800">No organization linked — this request cannot be assigned.</p>}</div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${requestStyle[r.status]}`}>{requestLabels[r.status]}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm">{r.details}</p>

          {(r.assignedCreator || r.template) && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            {r.assignedCreator && <p>Creator: <strong>{r.assignedCreator.name || r.assignedCreator.email}</strong>{r.assignedCreator.name ? ` (${r.assignedCreator.email})` : ''}</p>}
            {r.template ? <p className="mt-1">Template: <strong>{r.template.displayName ?? r.template.key}</strong> · {templateLabels[r.template.status] ?? r.template.status}
              {r.template.status === 'submitted' && <> · <Link className="font-bold text-emerald-700 underline" to={`/admin/reviews/${encodeURIComponent(r.template.key)}`}>Review and approve</Link></>}</p>
              : r.assignedCreator && <p className="mt-1 text-slate-600">Waiting for the Creator to link a template.</p>}
          </div>}

          {open(r.status) && <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2 text-sm font-bold">Creator
              <select aria-label="Assign Creator" className={field} disabled={locked || !r.organizationId} value={creator} onChange={e => edit(r.id, { creator: e.target.value })}>
                <option value="">Choose a Creator</option>{creators.map(c => <option key={c.id} value={c.id}>{c.name || c.email}{c.name && c.email ? ` (${c.email})` : ''}</option>)}
              </select></label>
            <button className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50" type="button"
              disabled={locked || !creator || creator === r.assignedCreator?.id || !r.organizationId}
              onClick={() => void act(r.id, () => adminOperationsApi.assignCustomRequest(r.id, creator), ['creator'])}>{r.assignedCreator ? 'Reassign' : 'Assign'}</button>
            {r.status === 'new' && <button className={button} type="button" disabled={locked} onClick={() => void act(r.id, () => adminOperationsApi.updateCustomRequest(r.id, { status: 'in_review' }))}>Mark in review</button>}
          </div>}

          <div className="mt-3 grid gap-2">
            <div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Note for the Organizer" className={field} maxLength={2000} placeholder="Note for the Organizer (shown on their request)" value={organizerNote} onChange={e => edit(r.id, { organizerNote: e.target.value })} />
              <button className={button} disabled={locked || organizerNote === (r.organizerNote ?? '')} type="button" onClick={() => void act(r.id, () => adminOperationsApi.updateCustomRequest(r.id, { organizerNote }), ['organizerNote'])}>Save note</button></div>
            <div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Internal note" className={field} maxLength={2000} placeholder="Internal note (Admins only)" value={adminNote} onChange={e => edit(r.id, { adminNote: e.target.value })} />
              <button className={button} disabled={locked || adminNote === (r.adminNote ?? '')} type="button" onClick={() => void act(r.id, () => adminOperationsApi.updateCustomRequest(r.id, { adminNote }), ['adminNote'])}>Save internal note</button></div>
          </div>

          {open(r.status) && (d.rejecting
            ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-sm font-bold text-rose-900">Reject this request? The Organizer is emailed with the note above.</p>
              <div className="mt-2 flex flex-wrap gap-2"><button className="min-h-10 rounded-lg bg-rose-700 px-4 text-sm font-bold text-white disabled:opacity-50" type="button" disabled={locked || !organizerNote.trim()}
                onClick={() => void act(r.id, () => adminOperationsApi.rejectCustomRequest(r.id, organizerNote.trim()), ['organizerNote', 'rejecting'])}>Reject and notify</button>
                <button className={button} type="button" onClick={() => edit(r.id, { rejecting: false })}>Cancel</button></div>
              {!organizerNote.trim() && <p className="mt-2 text-xs text-rose-900">Write a note for the Organizer first.</p>}</div>
            : <button className="mt-3 min-h-10 text-sm font-bold text-rose-700 underline" type="button" disabled={locked} onClick={() => edit(r.id, { rejecting: true })}>Reject request…</button>)}
          {failure[r.id] && <p role="alert" className="mt-2 text-sm font-semibold text-rose-700">{failure[r.id]}</p>}
        </li>
      })}</ul>)}
  </section></AdminShell>
}
