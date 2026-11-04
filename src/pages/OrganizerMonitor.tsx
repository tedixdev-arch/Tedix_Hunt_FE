import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { OrganizerHuntGeographyInspection } from '../components/OrganizerHuntGeography'
import { ApiError, huntsApi, type HuntLifecycleAction } from '../services/api'
import { huntOperationsApi, type HuntMonitor, type MonitorParticipant } from '../services/api/operations'
import { copyParticipantLink, participantLink } from './participantAccess'

const statusLabel: Record<string, string> = { draft: 'Draft', published: 'Published · not started', active: 'Live', paused: 'Paused', cancelled: 'Cancelled', finished: 'Finished' }
const statusStyle: Record<string, string> = { active: 'bg-emerald-500 text-white', paused: 'bg-violet-100 text-violet-800', published: 'bg-sky-100 text-sky-800', finished: 'bg-slate-200 text-slate-700', cancelled: 'bg-rose-100 text-rose-800', draft: 'bg-slate-100 text-slate-600' }
const actionsFor = (status: string): HuntLifecycleAction[] => status === 'published' ? ['start', 'cancel'] : status === 'active' ? ['pause', 'finish'] : status === 'paused' ? ['resume', 'finish', 'cancel'] : []
const actionLabel: Record<HuntLifecycleAction, string> = { publish: 'Publish', start: 'Start Hunt', pause: 'Pause Hunt', resume: 'Resume Hunt', finish: 'End Hunt', cancel: 'Cancel Hunt' }
const confirmText: Partial<Record<HuntLifecycleAction, string>> = {
  finish: 'End the Hunt for everyone? Participants keep their scores but can no longer play.',
  cancel: 'Cancel this Hunt? Participants will no longer be able to play.',
}
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

function ago(value: string | null) {
  if (!value) return '—'
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  return minutes < 1 ? 'Now' : minutes < 60 ? `${minutes} min ago` : new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function where(p: MonitorParticipant) {
  if (p.finishedAt) return 'Finished'
  if (!p.current) return '—'
  const label = p.current.kind === 'finish' ? 'FinishPoint' : `Checkpoint ${p.current.ordinal}`
  return `${label} · ${p.current.accessState === 'proximity_verified' ? 'solving' : 'on the way'}`
}

export function OrganizerMonitorPage() {
  const { huntId = '' } = useParams()
  const [data, setData] = useState<HuntMonitor | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const load = useCallback(async () => {
    try { setData(await huntOperationsApi.monitor(huntId)); setError('') }
    catch (e) { setError(e instanceof ApiError && e.status === 403 ? 'You do not have access to monitor this Hunt.' : "We couldn't load live data. Retrying automatically.") }
  }, [huntId])
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 10000); return () => window.clearInterval(timer) }, [load])
  useEffect(() => { huntsApi.getHunt(huntId).then(h => setAccessCode(h.accessCode)).catch(() => {}) }, [huntId])

  async function run(key: string, task: () => Promise<unknown>, success: string) {
    setBusy(key); setNotice('')
    try { await task(); setNotice(success); await load() }
    catch (e) { setNotice(e instanceof ApiError && e.status === 409 ? 'That action is no longer possible. The view has been refreshed.' : "That didn't work. Please try again."); await load() }
    finally { setBusy('') }
  }
  function lifecycle(action: HuntLifecycleAction) {
    if (confirmText[action] && !window.confirm(confirmText[action])) return
    void run(action, () => huntsApi[action as Exclude<HuntLifecycleAction, 'publish'>](huntId), `${actionLabel[action]}: done.`)
  }
  async function createLink() {
    await run('access', async () => { const access = await huntsApi.createOrGetAccess(huntId); setAccessCode(access.code) }, 'Participant link ready.')
  }

  const hunt = data?.hunt
  const link = accessCode ? participantLink(window.location.origin, accessCode) : ''
  const openHelp = data?.helpRequests.filter(r => r.status === 'open') ?? []
  return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
    <OrganizerHeader showProfile />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-9">
      <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
      {!data && !error && <p className="mt-6" role="status">Loading live Hunt…</p>}
      {error && <p className="mt-6 rounded-xl bg-rose-50 p-4 font-semibold text-rose-800" role="alert">{error}</p>}
      {hunt && <>
        <header className={`${card} mt-5`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Monitor Hunt</p><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[hunt.status] ?? ''}`}>{statusLabel[hunt.status] ?? hunt.status}</span></div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{hunt.name}</h1>
              <p className="mt-2 text-slate-600">{[hunt.startDate, hunt.startTime?.slice(0, 5), hunt.timezone].filter(Boolean).join(' · ')}{hunt.durationMinutes ? ` · ${hunt.durationMinutes} min` : ''}</p></div>
            <div className="flex flex-wrap gap-2">{actionsFor(hunt.status).map(action => <button key={action} type="button" disabled={!!busy} onClick={() => lifecycle(action)}
              className={`min-h-12 rounded-xl px-5 font-bold disabled:opacity-50 ${action === 'start' || action === 'resume' ? 'bg-emerald-500' : action === 'cancel' || action === 'finish' ? 'border border-rose-300 bg-white text-rose-700' : 'bg-slate-950 text-white'}`}>{busy === action ? 'Updating…' : actionLabel[action]}</button>)}</div>
          </div>
          {['published', 'active', 'paused'].includes(hunt.status) && <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
            {link ? <><span className="text-sm text-slate-500">Hunt code <strong className="font-mono text-slate-900">{accessCode}</strong></span><input readOnly aria-label="Participant link" className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm" value={link} /><button className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold" type="button" onClick={async () => setNotice(await copyParticipantLink(link, navigator.clipboard))}>Copy link</button></>
              : <button className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold" disabled={!!busy} type="button" onClick={() => void createLink()}>Create participant link</button>}
          </div>}
          {notice && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800" role="status">{notice}</p>}
        </header>

        {openHelp.length > 0 && <section className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-5" aria-labelledby="help-title">
          <h2 id="help-title" className="text-xl font-bold text-red-900">Participants need help ({openHelp.length})</h2>
          <ul className="mt-3 grid gap-2">{openHelp.map(r => <li key={r.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-bold">{r.kind === 'emergency' ? '🚨 Emergency' : 'Help request'} · {r.displayName} <span className="text-sm font-normal text-slate-500">{ago(r.createdAt)}</span></p>{r.message && <p className="text-sm text-slate-700">{r.message}</p>}</div>
            <button className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={!!busy} type="button" onClick={() => void run(`help:${r.id}`, () => huntOperationsApi.resolveHelp(huntId, r.id), 'Marked as resolved.')}>Mark resolved</button></li>)}</ul>
        </section>}

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Live Hunt summary">
          {[['Joined', `${data.totals.participants}${hunt.capacity ? ` / ${hunt.capacity}` : ''}`], ['Playing', String(data.totals.started - data.totals.finished)], ['Finished', String(data.totals.finished)], ['Open help requests', String(data.totals.openHelpRequests)]].map(([label, value]) =>
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></article>)}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className={card} aria-labelledby="participants-title">
            <div className="flex items-center justify-between"><h2 id="participants-title" className="text-xl font-bold">Participants</h2><span className="text-sm text-slate-500">Updates every 10 s</span></div>
            {data.participants.length === 0 ? <p className="mt-4 text-slate-600">No one has joined yet. Share the participant link to invite players.</p> :
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">#</th><th>Name</th><th>Progress</th><th>Now</th><th>Score</th><th>Last activity</th><th /></tr></thead>
                <tbody>{data.participants.map(p => <tr key={p.participantId} className="border-t border-slate-100">
                  <td className="py-3 font-bold">{p.rank}</td><td className="font-bold">{p.displayName}</td>
                  <td>{p.checkpointsCompleted} / {p.checkpointsTotal}</td><td>{where(p)}</td><td className="font-bold">{p.score}</td><td>{ago(p.lastActivityAt ?? p.joinedAt)}</td>
                  <td className="text-right">{hunt.status === 'active' && data.settings?.organizerCheckInEnabled !== false && p.current?.accessState === 'eligible_for_proximity' && !p.finishedAt &&
                    <button className="min-h-10 rounded-lg border border-emerald-500 px-3 text-xs font-bold text-emerald-800 disabled:opacity-50" disabled={!!busy} type="button" title="Use when GPS is unavailable and you can see the participant at the checkpoint"
                      onClick={() => { if (window.confirm(`Confirm ${p.displayName} is at ${p.current!.kind === 'finish' ? 'the FinishPoint' : `checkpoint ${p.current!.ordinal}`}?`)) void run(`checkin:${p.participantId}`, () => huntOperationsApi.checkIn(huntId, p.participantId, p.current!.checkpointId), `Arrival confirmed for ${p.displayName}.`) }}>Confirm arrival</button>}</td>
                </tr>)}</tbody></table></div>}
          </section>
          <aside className="space-y-5">
            <section className={card}><h2 className="text-xl font-bold">Leaderboard</h2>{data.participants.length === 0 ? <p className="mt-3 text-sm text-slate-500">Scores appear once participants play.</p> : <ol className="mt-3 space-y-2">{data.participants.slice(0, 10).map(p => <li key={p.participantId} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2"><span className="w-6 text-center font-bold">{p.rank}</span><span className="flex-1 truncate">{p.displayName}</span><strong>{p.score}</strong></li>)}</ol>}</section>
            <section className={card}><h2 className="text-xl font-bold">Recent activity</h2>{data.activity.length === 0 ? <p className="mt-3 text-sm text-slate-500">No answers submitted yet.</p> : <ol className="mt-3 space-y-2 text-sm">{data.activity.map((a, i) => <li key={i}><span className="text-slate-500">{new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> · {a.displayName} {a.correct ? 'solved' : 'tried'} the {a.stage} challenge at checkpoint {a.ordinal}</li>)}</ol>}
              {data.helpRequests.some(r => r.status === 'resolved') && <p className="mt-3 text-xs text-slate-500">{data.helpRequests.filter(r => r.status === 'resolved').length} help request(s) resolved.</p>}</section>
          </aside>
        </div>
        <div className="mt-5"><OrganizerHuntGeographyInspection key={huntId} huntId={huntId} /></div>
      </>}
    </div>
  </main>
}

