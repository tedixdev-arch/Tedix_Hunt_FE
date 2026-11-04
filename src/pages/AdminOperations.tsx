import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminShell } from './AdminConsole'
import { adminOperationsApi, type AdminAlert, type AdminDashboard, type AdminHunt, type CustomHuntRequest, type CustomRequestStatus } from '../services/api/operations'

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

export function AdminHuntsPage() {
  const [status, setStatus] = useState('')
  const load = useCallback(() => adminOperationsApi.hunts(status || undefined).then(r => r.hunts), [status])
  const { data, error, reload } = useLoad<AdminHunt[]>(load)
  return <AdminShell active="hunts"><section className={`${card} mt-6`}>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Hunts</h2><p className="mt-1 text-slate-600">Every Hunt on the platform. Open a Hunt to see its live monitor.</p></div>
      <label className="text-sm font-bold">Status<select className="ml-2 min-h-11 rounded-lg border border-slate-300 px-3" value={status} onChange={e => setStatus(e.target.value)}><option value="">All</option>{['draft', 'published', 'active', 'paused', 'finished', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}</select></label></div>
    <State error={error} loading={!data} onRetry={reload} />
    {data && (data.length === 0 ? <p className="mt-5 text-slate-600">No Hunts match this filter.</p> :
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">Hunt</th><th>Organization</th><th>Status</th><th>When</th><th>Players</th><th>Alerts</th><th /></tr></thead>
        <tbody>{data.map(h => <tr key={h.id} className="border-t border-slate-100">
          <td className="py-3"><p className="font-bold">{h.name}</p><p className="text-xs text-slate-500">{[h.templateName, h.city].filter(Boolean).join(' · ')}</p></td>
          <td>{h.organization.name}{h.organization.independent && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Independent</span>}</td>
          <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[h.status] ?? ''}`}>{h.status}</span></td>
          <td>{h.startDate ? `${h.startDate} ${h.startTime?.slice(0, 5) ?? ''}` : '—'}</td>
          <td>{h.participants}{h.capacity ? ` / ${h.capacity}` : ''}{h.finished ? ` · ${h.finished} finished` : ''}</td>
          <td>{h.openAlerts ? <span className="font-bold text-red-700">{h.openAlerts} open</span> : '—'}</td>
          <td className="text-right">{h.status !== 'draft' && <Link className="font-bold text-emerald-700 underline" to={`/organizer/hunts/${h.id}`}>Monitor</Link>}</td></tr>)}</tbody></table></div>)}
  </section></AdminShell>
}

export function AdminAlertsPage() {
  const load = useCallback(() => adminOperationsApi.alerts().then(r => r.alerts), [])
  const { data, error, reload } = useLoad<AdminAlert[]>(load)
  const [busy, setBusy] = useState('')
  useEffect(() => { const timer = window.setInterval(reload, 15000); return () => window.clearInterval(timer) }, [reload])
  async function resolve(alert: AdminAlert) { setBusy(alert.id); try { await adminOperationsApi.resolveAlert(alert) } finally { setBusy(''); reload() } }
  return <AdminShell active="alerts"><section className={`${card} mt-6`}>
    <h2 className="text-2xl font-bold">Safety Alerts</h2><p className="mt-1 text-slate-600">Help and emergency requests sent by Participants from the app. Organizers see the same requests in their Hunt monitor.</p>
    <State error={error} loading={!data} onRetry={reload} />
    {data && (data.length === 0 ? <p className="mt-5 text-slate-600">No alerts have been raised.</p> :
      <ul className="mt-5 divide-y divide-slate-100">{data.map(a => <li key={a.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-bold">{a.kind === 'emergency' ? '🚨 Emergency' : 'Help request'} · {a.displayName} · <Link className="underline" to={`/organizer/hunts/${a.huntId}`}>{a.huntName}</Link></p>
          {a.message && <p className="text-sm text-slate-700">{a.message}</p>}<p className="text-xs text-slate-500">{when(a.createdAt)}{a.resolvedAt ? ` · resolved ${when(a.resolvedAt)}` : ''}</p></div>
        {a.status === 'open' ? <button className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={busy === a.id} type="button" onClick={() => void resolve(a)}>Mark resolved</button> : <span className="text-sm font-semibold text-emerald-700">Resolved</span>}
      </li>)}</ul>)}
  </section></AdminShell>
}

const requestLabels: Record<CustomRequestStatus, string> = { new: 'New', in_review: 'In review', closed: 'Closed' }
export function AdminCustomRequestsPage() {
  const load = useCallback(() => adminOperationsApi.customRequests().then(r => r.requests), [])
  const { data, error, reload } = useLoad<CustomHuntRequest[]>(load)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')
  async function update(id: string, change: { status?: CustomRequestStatus; adminNote?: string | null }) {
    setBusy(id); try { await adminOperationsApi.updateCustomRequest(id, change) } finally { setBusy(''); reload() }
  }
  return <AdminShell active="custom-requests"><section className={`${card} mt-6`}>
    <h2 className="text-2xl font-bold">Custom Hunt requests</h2><p className="mt-1 text-slate-600">Requests submitted through “Ask for a custom Hunt”. Reply to the contact by email; email is not sent from the platform yet.</p>
    <State error={error} loading={!data} onRetry={reload} />
    {data && (data.length === 0 ? <p className="mt-5 text-slate-600">No requests yet.</p> :
      <ul className="mt-5 grid gap-4">{data.map(r => <li key={r.id} className="rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{r.contactName}{r.organizationName ? ` · ${r.organizationName}` : ''}</p><a className="text-sm text-emerald-700 underline" href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a>
          <p className="mt-1 text-xs text-slate-500">{when(r.createdAt)}{r.city ? ` · ${r.city}` : ''}{r.preferredDate ? ` · preferred ${r.preferredDate}` : ''}{r.participantCount ? ` · ${r.participantCount} participants` : ''}</p></div>
          <label className="text-sm font-bold">Status<select className="ml-2 min-h-10 rounded-lg border border-slate-300 px-2" disabled={busy === r.id} value={r.status} onChange={e => void update(r.id, { status: e.target.value as CustomRequestStatus })}>{Object.entries(requestLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div>
        <p className="mt-3 whitespace-pre-wrap text-sm">{r.details}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input aria-label="Internal note" className="min-h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm" maxLength={2000} placeholder="Internal note" value={notes[r.id] ?? r.adminNote ?? ''} onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))} />
          <button className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50" disabled={busy === r.id || (notes[r.id] ?? r.adminNote ?? '') === (r.adminNote ?? '')} type="button" onClick={() => void update(r.id, { adminNote: notes[r.id] ?? '' })}>Save note</button></div>
      </li>)}</ul>)}
  </section></AdminShell>
}
