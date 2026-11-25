import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { OrganizerHuntGeographyInspection } from '../components/OrganizerHuntGeography'
import { ApiError, huntsApi, type HuntLifecycleAction } from '../services/api'
import { huntOperationsApi, type HuntMonitor } from '../services/api/operations'
import { HuntMonitorPanels } from '../features/hunts/HuntMonitorPanels'
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

        <HuntMonitorPanels data={data} busy={busy} run={run} huntId={huntId} />
        <div className="mt-5"><OrganizerHuntGeographyInspection key={huntId} huntId={huntId} /></div>
      </>}
    </div>
  </main>
}

