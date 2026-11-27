import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AdminShell } from './AdminConsole'
import { HuntMonitorPanels } from '../features/hunts/HuntMonitorPanels'
import { HuntSnapshotGeographyInspection } from '../components/OrganizerHuntGeography'
import { ApiError } from '../services/api/client'
import type { HuntLifecycleAction } from '../services/api/hunts'
import { huntOperationsApi, type HuntMonitor } from '../services/api/operations'
import { adminHuntsApi, type AdminHuntDetail, type HuntHistoryEvent, type ReadinessIssue } from '../services/api/adminHunts'
import { copyParticipantLink, participantLink } from './participantAccess'

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
export const huntStatusLabel: Record<string, string> = { draft: 'Draft', published: 'Published · not started', active: 'Live', paused: 'Paused', cancelled: 'Cancelled', finished: 'Finished' }
export const huntStatusStyle: Record<string, string> = { active: 'bg-emerald-500 text-white', paused: 'bg-violet-100 text-violet-800', published: 'bg-sky-100 text-sky-800', finished: 'bg-slate-200 text-slate-700', cancelled: 'bg-rose-100 text-rose-800', draft: 'bg-slate-100 text-slate-600' }
const actionLabel: Record<HuntLifecycleAction, string> = { publish: 'Publish', start: 'Start Hunt', pause: 'Pause Hunt', resume: 'Resume Hunt', finish: 'End Hunt', cancel: 'Cancel Hunt' }
const destructive: Partial<Record<HuntLifecycleAction, string>> = {
  finish: 'This ends the Hunt for everyone. Participants keep their scores but can no longer play. This cannot be undone.',
  cancel: 'This cancels the Hunt. Participants can no longer join or play. This cannot be undone.',
}
const eventLabel: Record<string, string> = {
  'hunt.created': 'Hunt created', 'hunt.updated': 'Setup changed', 'hunt.template_selected': 'Template selected', 'hunt.lifecycle': 'Lifecycle',
  'hunt.admin_override': 'Admin override', 'hunt.access_created': 'Access code created', 'hunt.access_regenerated': 'Access code regenerated',
  'hunt.access_disabled': 'Access code disabled', 'hunt.radii_changed': 'Detection radii changed', 'safety.arrival_confirmed': 'Arrival confirmed',
  'safety.help_resolved': 'Help request resolved',
}
const when = (value: string | null | undefined) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const errorCode = (e: unknown) => e instanceof ApiError && e.details && typeof e.details === 'object' && 'error' in e.details ? String((e.details as { error: unknown }).error) : ''

function loadError(e: unknown) {
  if (e instanceof ApiError && e.status === 401) return 'Your session expired. Sign in again as an Admin.'
  if (e instanceof ApiError && e.status === 403) return 'Admin access is required to view this Hunt.'
  if (e instanceof ApiError && e.status === 404) return 'This Hunt does not exist or was removed.'
  return "We couldn't load this Hunt. Please retry."
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-900">{children}</dd></div>
}

/** Reason dialog for Admin lifecycle overrides; Finish and Cancel also show an explicit warning. */
function OverrideDialog({ action, huntName, busy, error, issues, onCancel, onConfirm }: {
  action: HuntLifecycleAction; huntName: string; busy: boolean; error: string; issues: ReadinessIssue[]
  onCancel: () => void; onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { input.current?.focus() }, [])
  const valid = reason.trim().length >= 3
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation" onKeyDown={e => { if (e.key === 'Escape' && !busy) onCancel() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="override-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <h2 id="override-title" className="text-xl font-bold">{actionLabel[action]} as Admin</h2>
      <p className="mt-2 text-sm text-slate-600">“{huntName}”. This is an Admin override: it is recorded in the audit log with your name and reason.</p>
      {destructive[action] && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">{destructive[action]}</p>}
      <label className="mt-4 block text-sm font-bold">Reason (required)
        <textarea ref={input} className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm font-normal" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is an Admin doing this instead of the Organizer?" /></label>
      {error && <div role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-900"><p className="font-semibold">{error}</p>{issues.length > 0 && <ul className="mt-2 list-disc pl-5">{issues.map(i => <li key={i.message}>{i.message}</li>)}</ul>}</div>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold" disabled={busy} onClick={onCancel}>Back</button>
        <button type="button" className={`min-h-11 rounded-lg px-4 text-sm font-bold text-white disabled:opacity-50 ${destructive[action] ? 'bg-rose-700' : 'bg-slate-950'}`} disabled={!valid || busy} onClick={() => onConfirm(reason.trim())}>{busy ? 'Saving…' : `Confirm ${actionLabel[action].toLowerCase()}`}</button>
      </div>
    </div>
  </div>
}

function History({ events, error, onRetry }: { events?: HuntHistoryEvent[]; error: string; onRetry: () => void }) {
  return <section className={`${card} mt-5`} aria-labelledby="history-title">
    <h2 id="history-title" className="text-xl font-bold">Audit history</h2>
    {error ? <p className="mt-3 text-sm text-rose-800" role="alert">{error} <button type="button" className="font-bold underline" onClick={onRetry}>Retry</button></p>
      : !events ? <p className="mt-3 text-sm" role="status">Loading history…</p>
      : events.length === 0 ? <p className="mt-3 text-sm text-slate-600">No recorded actions yet. Actions taken before audit logging was enabled are not shown.</p>
      : <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">When</th><th>Action</th><th>By</th><th>Change</th><th>Reason</th></tr></thead>
        <tbody>{events.map(e => {
          const d = e.details as Record<string, unknown>
          const change = d.previousStatus || d.newStatus ? `${d.previousStatus ? `${String(d.previousStatus)} → ` : '→ '}${String(d.newStatus ?? '')}`
            : e.action === 'hunt.updated' ? Object.entries(d).filter(([k]) => k !== 'transition').map(([k, v]) => `${k}: ${String(v)}`).join(', ') : ''
          return <tr key={e.id} className="border-t border-slate-100 align-top">
            <td className="py-2 whitespace-nowrap">{when(e.occurredAt)}</td>
            <td><span className={`font-bold ${e.action === 'hunt.admin_override' ? 'text-violet-800' : ''}`}>{eventLabel[e.action] ?? e.action}</span><p className="text-xs text-slate-500">{e.summary}</p></td>
            <td>{e.actor.label ?? 'System'}<p className="text-xs text-slate-500">{e.actor.roles.join(', ') || '—'}</p></td>
            <td className="max-w-[240px] break-words">{change || '—'}</td>
            <td className="max-w-[240px] break-words">{typeof d.reason === 'string' ? d.reason : '—'}</td></tr>
        })}</tbody></table></div>}
  </section>
}

/** Admin-only Hunt record and live monitor. Never routes through Organizer pages or APIs that need Organizer roles. */
export function AdminHuntDetailPage() {
  const { huntId = '' } = useParams()
  const location = useLocation()
  const backTo = `/admin/hunts${typeof (location.state as { from?: unknown } | null)?.from === 'string' ? (location.state as { from: string }).from : ''}`
  const [detail, setDetail] = useState<AdminHuntDetail>()
  const [monitor, setMonitor] = useState<HuntMonitor>()
  const [history, setHistory] = useState<HuntHistoryEvent[]>()
  const [error, setError] = useState(''), [historyError, setHistoryError] = useState(''), [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [dialog, setDialog] = useState<HuntLifecycleAction | null>(null)
  const [dialogError, setDialogError] = useState(''), [dialogIssues, setDialogIssues] = useState<ReadinessIssue[]>([])

  const load = useCallback(async () => {
    try {
      const next = await adminHuntsApi.detail(huntId)
      setDetail(next); setError('')
      if (next.status !== 'draft') setMonitor(await huntOperationsApi.monitor(huntId))
    } catch (e) { setError(loadError(e)) }
  }, [huntId])
  const loadHistory = useCallback(() => {
    setHistoryError('')
    adminHuntsApi.history(huntId).then(setHistory).catch(e => setHistoryError(loadError(e)))
  }, [huntId])
  useEffect(() => {
    setDetail(undefined); setMonitor(undefined); setHistory(undefined)
    void load(); loadHistory()
    const timer = window.setInterval(() => void load(), 10000)
    return () => window.clearInterval(timer)
  }, [load, loadHistory])

  async function run(key: string, task: () => Promise<unknown>, success: string) {
    setBusy(key); setNotice('')
    try { await task(); setNotice(success) }
    catch (e) { setNotice(e instanceof ApiError && e.status === 409 ? 'That action is no longer possible. The view has been refreshed.' : e instanceof ApiError && e.status === 403 ? 'Admin access is required for this action.' : "That didn't work. Please try again.") }
    finally { setBusy(''); await load(); loadHistory() }
  }
  async function override(reason: string) {
    if (!dialog) return
    setBusy(dialog); setDialogError(''); setDialogIssues([])
    try {
      await adminHuntsApi.lifecycle(huntId, dialog, reason)
      setNotice(`${actionLabel[dialog]}: done. Recorded in the audit history.`); setDialog(null)
      await load(); loadHistory()
    } catch (e) {
      const code = errorCode(e)
      const details = e instanceof ApiError ? e.details as { message?: string; issues?: ReadinessIssue[] } | undefined : undefined
      if (code === 'hunt_not_ready') { setDialogError('This Hunt cannot be published yet:'); setDialogIssues(details?.issues ?? []) }
      else if (code === 'invalid_transition') { setDialogError(details?.message ?? 'That action is not allowed from the current status.'); await load() }
      else if (code === 'reason_required') setDialogError('Give a reason of 3 to 500 characters.')
      else setDialogError(e instanceof ApiError && e.status === 403 ? 'Admin access is required for this action.' : "That didn't work. Please try again.")
    } finally { setBusy('') }
  }

  const hunt = detail?.hunt
  const code = hunt?.accessCode ?? null
  const link = code ? participantLink(window.location.origin, code) : ''
  const live = !!detail && ['published', 'active', 'paused'].includes(detail.status)
  const snapshot = hunt?.templateSnapshot as (Record<string, unknown> & { mission?: { name?: string; description?: string }; checkpoints?: Array<Record<string, unknown>>; configuration?: { checkpointPositions?: Array<{ checkpointNumber: number; name?: string }> } }) | null | undefined
  const positions = new Map((snapshot?.configuration?.checkpointPositions ?? []).map(p => [p.checkpointNumber, p.name]))
  const regular = (snapshot?.checkpoints ?? []).filter(c => c.role !== 'terminal')

  return <AdminShell active="hunts">
    <Link className="mt-6 inline-block text-sm font-bold text-slate-500 hover:text-slate-900" to={backTo}>← Back to Hunts</Link>
    {!detail && !error && <p className="mt-6" role="status">Loading Hunt…</p>}
    {error && <div className="mt-6 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={() => void load()}>Retry</button></div>}
    {detail && hunt && <>
      <header className={`${card} mt-4`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Admin · Hunt</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${huntStatusStyle[detail.status] ?? ''}`}>{huntStatusLabel[detail.status] ?? detail.status}</span>
            {detail.organization.independent && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Independent</span>}</div>
            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight">{detail.name}</h1>
            <p className="mt-2 text-slate-600">{detail.organization.name}{detail.organizer ? ` · ${detail.organizer.name || detail.organizer.email}` : ''}</p></div>
          <div className="flex flex-wrap gap-2">{detail.allowedActions.map(action => <button key={action} type="button" disabled={!!busy} onClick={() => { setDialogError(''); setDialogIssues([]); setDialog(action) }}
            className={`min-h-12 rounded-xl px-5 font-bold disabled:opacity-50 ${action === 'start' || action === 'resume' || action === 'publish' ? 'bg-emerald-500' : action === 'cancel' || action === 'finish' ? 'border border-rose-300 bg-white text-rose-700' : 'bg-slate-950 text-white'}`}>{actionLabel[action]}</button>)}
            {detail.allowedActions.length === 0 && <p className="text-sm text-slate-500">No lifecycle actions are available for a {detail.status} Hunt.</p>}</div>
        </div>
        {notice && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800" role="status">{notice}</p>}
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Hunt summary">
        {[['Joined', `${detail.participants}${detail.capacity ? ` / ${detail.capacity}` : ''}`], ['Playing now', String(detail.activeParticipants)], ['Completed', String(detail.finished)],
          ['Open help requests', String(detail.helpRequests.open)], ['Resolved help requests', String(detail.helpRequests.resolved)]].map(([label, value]) =>
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></article>)}
      </section>
      {detail.helpRequests.open + detail.helpRequests.resolved > 0 && <p className="mt-2 text-sm"><Link className="font-bold text-emerald-700 underline" to={`/admin/alerts?huntId=${encodeURIComponent(detail.id)}`}>View all safety alerts for this Hunt</Link></p>}

      <section className={`${card} mt-5`} aria-labelledby="details-title">
        <h2 id="details-title" className="text-xl font-bold">Details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Organization">{detail.organization.name}{detail.organization.independent ? ' (Independent)' : ''}</Field>
          <Field label="Organizer">{detail.organizer ? <>{detail.organizer.name || '—'}<br /><a className="text-emerald-700 underline" href={`mailto:${detail.organizer.email ?? ''}`}>{detail.organizer.email}</a></> : '—'}</Field>
          <Field label="Location">{[hunt.city, hunt.region, hunt.country].filter(Boolean).join(', ') || '—'}</Field>
          <Field label="Local contact">{hunt.contactName ?? '—'}</Field>
          <Field label="Scheduled start">{[hunt.startDate, hunt.startTime?.slice(0, 5), hunt.timezone].filter(Boolean).join(' · ') || '—'}</Field>
          <Field label="Duration">{hunt.durationMinutes ? `${hunt.durationMinutes} min` : '—'}</Field>
          <Field label="Capacity">{hunt.capacity ?? '—'}</Field>
          <Field label="Format">{hunt.format ? `${hunt.format}${hunt.teamSize ? ` · teams of ${hunt.teamSize}` : ''}` : '—'}</Field>
          <Field label="Actually started">{when(detail.startedAt)}</Field>
          <Field label={detail.status === 'cancelled' ? 'Cancelled' : 'Actually finished'}>{when(detail.endedAt)}</Field>
          <Field label="Created">{when(detail.createdAt)}</Field>
          <Field label="Last updated">{when(detail.updatedAt)}</Field>
        </dl>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="font-bold">Participant access</h3>
          {code ? <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-500">Hunt code <strong className="font-mono text-slate-900">{code}</strong>{hunt.invitationEnabled === false ? ' · disabled by the Organizer' : ''}</span>
            <button className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold" type="button" onClick={() => { void navigator.clipboard?.writeText(code).then(() => setNotice('Hunt code copied.'), () => setNotice('Copy failed. Select the code and copy it manually.')) }}>Copy code</button>
            <input readOnly aria-label="Participant link" className="min-h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm" value={link} />
            <button className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold" type="button" onClick={async () => setNotice(await copyParticipantLink(link, navigator.clipboard))}>Copy link</button></div>
            : live ? <button className="mt-2 min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold" disabled={!!busy} type="button" onClick={() => void run('access', () => adminHuntsApi.createAccess(huntId), 'Participant link ready.')}>Create participant link</button>
            : <p className="mt-2 text-sm text-slate-600">Participant access is available once the Hunt is published.</p>}
        </div>
      </section>

      {detail.readiness && <section className={`${card} mt-5 ${detail.readiness.ready ? '' : 'border-amber-300'}`} aria-labelledby="readiness-title">
        <h2 id="readiness-title" className="text-xl font-bold">Publishing readiness</h2>
        {detail.readiness.ready ? <p className="mt-2 text-sm text-emerald-800">This draft passes every publishing check.</p>
          : <><p className="mt-2 text-sm text-slate-700">This draft cannot be published until the Organizer fixes:</p>
            <ul className="mt-2 grid gap-1 text-sm">{detail.readiness.issues.map(i => <li key={i.message} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950"><span className="text-xs font-bold uppercase text-amber-800">{i.section}</span> · {i.message}</li>)}</ul></>}
      </section>}

      <section className={`${card} mt-5`} aria-labelledby="template-title">
        <h2 id="template-title" className="text-xl font-bold">Template</h2>
        {!snapshot ? <p className="mt-2 text-sm text-slate-600">{hunt.templateKey ? 'The Template content is hidden because it contains custom exercises.' : 'No Template selected yet.'}</p> : <>
          <dl className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field label="Template">{String(snapshot.displayName ?? detail.templateName ?? '—')}</Field>
            <Field label="Key · version">{hunt.templateKey} · v{hunt.templateVersion}</Field>
            <Field label="Theme">{String(snapshot.theme ?? '—')}</Field>
            {snapshot.mission?.name && <Field label="Mission">{snapshot.mission.name}{snapshot.mission.description ? ` — ${snapshot.mission.description}` : ''}</Field>}
          </dl>
          <h3 className="mt-4 font-bold">Checkpoints ({regular.length})</h3>
          <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{regular.map((c, i) => { const n = Number(c.checkpoint ?? i + 1); return <li key={n} className="rounded-lg bg-slate-50 px-3 py-2"><strong>{n}.</strong> {positions.get(n) ?? `Checkpoint ${n}`}{c.kind ? <span className="text-slate-500"> · {String(c.kind)}</span> : null}</li> })}</ol>
          <HuntSnapshotGeographyInspection key={`${hunt.id}:${hunt.templateVersion}`} hunt={hunt} />
        </>}
      </section>

      {detail.status !== 'draft' && monitor && <div className="mt-5"><HuntMonitorPanels data={monitor} busy={busy} run={run} huntId={huntId} showSummary={false} /></div>}

      <History events={history} error={historyError} onRetry={loadHistory} />
    </>}
    {dialog && detail && <OverrideDialog action={dialog} huntName={detail.name} busy={busy === dialog} error={dialogError} issues={dialogIssues}
      onCancel={() => setDialog(null)} onConfirm={reason => void override(reason)} />}
  </AdminShell>
}
