import { huntOperationsApi, type HuntMonitor, type MonitorParticipant } from '../../services/api/operations'

/**
 * Live Hunt monitor panels shared by the Organizer monitor and the Admin Hunt detail page.
 * The page owns loading, polling and permissions; `run` performs an action and refreshes.
 */
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

export function ago(value: string | null) {
  if (!value) return '—'
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  return minutes < 1 ? 'Now' : minutes < 60 ? `${minutes} min ago` : new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
export function where(p: MonitorParticipant) {
  if (p.finishedAt) return 'Finished'
  if (!p.current) return '—'
  const label = p.current.kind === 'finish' ? 'FinishPoint' : `Checkpoint ${p.current.ordinal}`
  return `${label} · ${p.current.accessState === 'proximity_verified' ? 'solving' : 'on the way'}`
}

export function HuntMonitorPanels({ data, busy, run, huntId, showSummary = true }: {
  data: HuntMonitor; busy: string; huntId: string
  /** The Admin page renders its own summary with extra counts. */
  showSummary?: boolean
  run: (key: string, task: () => Promise<unknown>, success: string) => Promise<void> | void
}) {
  const hunt = data.hunt
  const openHelp = data.helpRequests.filter(r => r.status === 'open')
  return <>
        {openHelp.length > 0 && <section className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-5" aria-labelledby="help-title">
          <h2 id="help-title" className="text-xl font-bold text-red-900">Participants need help ({openHelp.length})</h2>
          <ul className="mt-3 grid gap-2">{openHelp.map(r => <li key={r.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-bold">{r.kind === 'emergency' ? '🚨 Emergency' : 'Help request'} · {r.displayName} <span className="text-sm font-normal text-slate-500">{ago(r.createdAt)}</span></p>{r.message && <p className="text-sm text-slate-700">{r.message}</p>}</div>
            <button className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={!!busy} type="button" onClick={() => void run(`help:${r.id}`, () => huntOperationsApi.resolveHelp(huntId, r.id), 'Marked as resolved.')}>Mark resolved</button></li>)}</ul>
        </section>}

        {showSummary && <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Live Hunt summary">
          {[['Joined', `${data.totals.participants}${hunt.capacity ? ` / ${hunt.capacity}` : ''}`], ['Playing', String(data.totals.started - data.totals.finished)], ['Finished', String(data.totals.finished)], ['Open help requests', String(data.totals.openHelpRequests)]].map(([label, value]) =>
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></article>)}
        </section>}

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
  </>
}
