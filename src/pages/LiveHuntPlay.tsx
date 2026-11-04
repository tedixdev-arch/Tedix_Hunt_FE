import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gameplayApi, gameplayError, type AnswerResult, type CurrentCheckpoint, type LeaderboardEntry, type PlayState } from '../services/api/gameplay'

/** Live, server-authoritative play. All checking, scoring and progression happen on the API. */
const button = 'min-h-14 w-full rounded-xl bg-emerald-400 px-5 font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400'
const ghost = 'min-h-12 rounded-xl border border-white/20 px-4 font-bold text-white disabled:opacity-40'
const card = 'rounded-2xl border border-white/10 bg-white/5 p-5'

function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const r = (v: number) => v * Math.PI / 180
  const h = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2
  return 2 * 6_371_008.8 * Math.asin(Math.sqrt(Math.min(1, h)))
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('unsupported')); return }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
  })
}

/** Signal-family visuals. Numbers match the immutable Signal challenge content for each kind. */
function ChallengeVisual({ current, value, onChange }: { current: CurrentCheckpoint; value: string; onChange: (v: string) => void }) {
  const kind = current.story?.kind
  const chip = (label: string, selected: boolean, onClick: () => void, key?: string) =>
    <button key={key ?? label} type="button" aria-pressed={selected} onClick={onClick}
      className={`min-h-14 rounded-xl border px-4 text-lg font-bold ${selected ? 'border-emerald-300 bg-emerald-400 text-slate-950' : 'border-white/20 bg-white/5'}`}>{label}</button>
  const input = <input aria-label="Your answer" autoComplete="off" className="mt-4 min-h-14 w-full rounded-xl border border-white/20 bg-slate-950 px-4 text-xl font-bold tracking-wide text-white"
    inputMode={/^(hidden-rule|square|radial|shared-final-key)$/.test(kind ?? '') ? 'numeric' : 'text'} maxLength={60} value={value} onChange={e => onChange(e.target.value)} placeholder="Answer" />
  if (kind === 'find-sabotage' && current.story?.mistakeSegments?.length) {
    return <div role="group" aria-label="Select the incorrect step" className="grid gap-2">{current.story.mistakeSegments.map(s => chip(s.content, value === s.id, () => onChange(s.id), s.id))}</div>
  }
  if (kind === 'identify-signal') return <div className="grid grid-cols-3 gap-2">{['24', '29', '35'].map(v => chip(`${v} MHz`, value === v, () => onChange(v), v))}</div>
  if (kind === 'build-key') {
    return <div><div className="flex gap-2 text-2xl font-bold">{[0, 1, 2].map(i => <span key={i} className="grid h-14 w-14 place-items-center rounded-xl border border-white/20">{value[i] ?? '_'}</span>)}<span className="ml-3 self-center text-base text-slate-300">= 24</span></div>
      <div className="mt-3 grid grid-cols-4 gap-2">{['2', '3', '4', '5'].map(b => <button key={b} type="button" disabled={value.includes(b) || value.length >= 3} onClick={() => onChange(value + b)} className="min-h-14 rounded-xl border border-white/20 text-xl font-bold disabled:opacity-30">{b}</button>)}</div>
      <button type="button" className="mt-2 text-sm underline" disabled={!value} onClick={() => onChange('')}>Clear</button></div>
  }
  const examples: Record<string, ReactNode> = {
    'hidden-rule': <ul className="grid gap-1 font-mono text-lg">{[['23', '6'], ['425', '40'], ['1234', '24'], ['3416', '?']].map(([a, b]) => <li key={a}>{a} → {b}</li>)}</ul>,
    square: <p className="font-mono">Squares (top / left / right / bottom): <b>8 / 12 / ? / 6</b> · 6 / 2 / 3 / 1 · 3 / 2 / 9 / 6</p>,
    radial: <p className="font-mono">Opposite endpoints: 6 ↔ 20 · 17 ↔ 9 · ? ↔ 11</p>,
    'shared-final-key': <p className="font-mono text-lg">2 · 3 · 5 · 7 · 11 · ?</p>,
  }
  return <div>{kind && examples[kind] && <div className="rounded-xl bg-slate-950/60 p-4">{examples[kind]}</div>}{input}</div>
}

function TeamInput({ current, value, onChange }: { current: CurrentCheckpoint; value: string; onChange: (v: string) => void }) {
  const team = current.team!
  if (team.teamKind === 'filter-noise') {
    const selected = new Set(value.split('|').filter(Boolean))
    const names = team.publicContributions.map(item => item.split(':')[0].trim().toUpperCase())
    return <div className="grid gap-2">{team.publicContributions.map((item, i) => {
      const name = names[i]
      return <button key={item} type="button" aria-pressed={selected.has(name)} onClick={() => { const next = new Set(selected); if (next.has(name)) next.delete(name); else next.add(name); onChange(names.filter(n => next.has(n)).join('|')) }}
        className={`min-h-14 rounded-xl border px-4 text-left ${selected.has(name) ? 'border-emerald-300 bg-emerald-400 text-slate-950' : 'border-white/20 bg-white/5'}`}>{item}</button>
    })}</div>
  }
  if (team.teamOptions.length) return <div className="grid grid-cols-3 gap-2">{team.teamOptions.map(o => <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`min-h-14 rounded-xl border font-bold ${value === o ? 'border-emerald-300 bg-emerald-400 text-slate-950' : 'border-white/20 bg-white/5'}`}>{o}</button>)}</div>
  return <input aria-label="Team answer" autoComplete="off" autoCapitalize="characters" maxLength={60} className="min-h-14 w-full rounded-xl border border-white/20 bg-slate-950 px-4 text-xl font-bold uppercase tracking-wide text-white" value={value} onChange={e => onChange(e.target.value)} placeholder="Answer" />
}

function Leaderboard({ huntId, onClose }: { huntId: string; onClose: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { gameplayApi.leaderboard(huntId).then(r => setEntries(r.entries)).catch(e => setError(gameplayError(e))) }, [huntId])
  return <div role="dialog" aria-modal="true" aria-labelledby="leaderboard-title" className="fixed inset-0 z-20 flex items-end bg-black/70 sm:items-center sm:justify-center">
    <section className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-slate-900 p-5 sm:max-w-md sm:rounded-3xl">
      <div className="flex items-center justify-between"><h2 id="leaderboard-title" className="text-2xl font-bold">Leaderboard</h2><button className={ghost} onClick={onClose} autoFocus>Close</button></div>
      {error && <p role="alert" className="mt-4 text-amber-200">{error}</p>}
      {!entries && !error && <p role="status" className="mt-4 text-slate-300">Loading…</p>}
      {entries && <ol className="mt-4 grid gap-2">{entries.map(e => <li key={e.rank} className={`flex items-center gap-3 rounded-xl p-3 ${e.isYou ? 'bg-emerald-400/20 ring-1 ring-emerald-300' : 'bg-white/5'}`}>
        <span className="w-8 text-center text-lg font-bold">{e.rank}</span><span className="min-w-0 flex-1 truncate font-bold">{e.displayName}{e.isYou ? ' (you)' : ''}</span>
        <span className="text-sm text-slate-300">{e.checkpointsCompleted}/{e.checkpointsTotal}</span><span className="w-14 text-right font-bold">{e.score}</span></li>)}</ol>}
    </section></div>
}

function HelpDialog({ huntId, safety, onClose }: { huntId: string; safety?: PlayState['safety']; onClose: () => void }) {
  const emergency = safety?.emergencyNumber || '112'
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function send(kind: 'help' | 'emergency') {
    setBusy(true); setStatus('')
    try { await gameplayApi.requestHelp(huntId, kind, message); setStatus(kind === 'emergency' ? `Your Organizer has been alerted. If anyone is in danger, call ${emergency} now.` : 'Your Organizer has been notified.') }
    catch (e) { setStatus(gameplayError(e)) } finally { setBusy(false) }
  }
  return <div role="dialog" aria-modal="true" aria-labelledby="help-title" className="fixed inset-0 z-20 flex items-end bg-black/70 sm:items-center sm:justify-center">
    <section className="w-full rounded-t-3xl bg-slate-900 p-5 sm:max-w-md sm:rounded-3xl">
      <div className="flex items-center justify-between"><h2 id="help-title" className="text-2xl font-bold">Need help?</h2><button className={ghost} onClick={onClose} autoFocus>Close</button></div>
      <p className="mt-3 text-sm text-slate-300">In an emergency, call <a className="font-bold underline" href={`tel:${emergency.replace(/\s/g, '')}`}>{emergency}</a> first.</p>
      {safety?.notice && <p className="mt-2 text-sm text-slate-300">{safety.notice}</p>}
      <label className="mt-4 block text-sm font-bold">Message (optional)<textarea className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3 text-white" maxLength={500} rows={3} value={message} onChange={e => setMessage(e.target.value)} /></label>
      <div className="mt-4 grid gap-2"><button className={button} disabled={busy} onClick={() => void send('help')}>Ask my Organizer for help</button><button className="min-h-14 rounded-xl bg-rose-500 font-bold text-white disabled:opacity-50" disabled={busy} onClick={() => void send('emergency')}>Report an emergency</button></div>
      {status && <p role="status" className="mt-4 text-emerald-200">{status}</p>}
    </section></div>
}

function Navigate({ state, onArrived }: { state: PlayState; onArrived: (next: PlayState) => void }) {
  const current = state.current!
  const target = current.navigation.target
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [locationOff, setLocationOff] = useState(!('geolocation' in navigator))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    const id = navigator.geolocation.watchPosition(next => { setPosition(next); setLocationOff(false) }, () => setLocationOff(true), { enableHighAccuracy: true, maximumAge: 5000 })
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  const distance = target && position ? Math.round(distanceMeters(position.coords, target)) : null
  async function arrive(override?: { latitude: number; longitude: number }) {
    setBusy(true); setError('')
    try {
      const fix = override ? null : await currentPosition()
      await gameplayApi.arrive(state.huntId, current.checkpointId, {
        latitude: override?.latitude ?? fix!.coords.latitude, longitude: override?.longitude ?? fix!.coords.longitude,
        accuracyMeters: override ? 3 : Math.round(fix!.coords.accuracy * 10) / 10, observedAt: new Date().toISOString(),
      })
      onArrived(await gameplayApi.state(state.huntId))
    } catch (e) {
      setError(e instanceof GeolocationPositionError ? (e.code === 1 ? 'Location permission is off. Allow location access, or ask your Organizer to confirm your arrival.' : "We couldn't read your location. Try again outdoors.") : e instanceof Error && e.message === 'unsupported' ? 'This device has no location support. Ask your Organizer to confirm your arrival.' : gameplayError(e))
    } finally { setBusy(false) }
  }
  const clue = current.navigation.clue
  const destination = current.ordinal === 1 ? current.navigation.location : clue?.nextLocation ?? current.navigation.location
  return <section className="flex flex-1 flex-col gap-4">
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">{current.kind === 'finish' ? 'FinishPoint' : `Checkpoint ${current.ordinal} of ${state.checkpoints.length}`}</p>
    <h1 className="text-4xl font-extrabold tracking-tight">{destination ?? 'Next checkpoint'}</h1>
    {current.ordinal === 1 && state.safety?.notice && <p className="rounded-xl bg-amber-400/10 p-3 text-sm text-amber-100">{state.safety.notice}</p>}
    {clue?.navigationClue && <div className={card}><p className="text-sm text-slate-300">Story clue{clue.direction ? ` · ${clue.direction}` : ''}{clue.distance ? ` · ${clue.distance}` : ''}</p><p className="mt-2 text-lg">{clue.navigationClue}</p><p className="mt-2 text-xs text-slate-400">Story directions are part of the puzzle. Use the map for real walking routes and stay safe.</p></div>}
    {target ? <div className={card}>
      <p className="text-sm text-slate-300">Distance to checkpoint</p>
      <p className="mt-1 text-3xl font-bold">{distance === null ? (locationOff ? 'Location unavailable' : 'Locating…') : distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}</p>
      <p className="mt-1 text-sm text-slate-400">Get within {target.radiusMeters} m, then check in.</p>
      <a className="mt-3 inline-block font-bold text-emerald-300 underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}&travelmode=walking`}>Open walking route in Maps</a>
    </div> : <p className={`${card} text-amber-100`}>This checkpoint has no GPS position. Ask your Organizer to confirm your arrival.</p>}
    {error && <p role="alert" className="text-amber-200">{error}</p>}
    <div className="mt-auto grid gap-2">
      {target && <button className={button} disabled={busy || state.huntStatus !== 'active'} onClick={() => void arrive()}>{busy ? 'Checking your location…' : "I'm here"}</button>}
      {import.meta.env.DEV && target && <button className={ghost} disabled={busy} onClick={() => void arrive(target)}>Simulate arrival (local development only)</button>}
      <p className="text-center text-xs text-slate-400">Waiting for your Organizer? This screen refreshes automatically.</p>
    </div>
  </section>
}

function Challenge({ state, onResult }: { state: PlayState; onResult: (result: AnswerResult) => void }) {
  const current = state.current!
  const story = current.story!
  const teamStage = state.stage === 'team'
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { setValue(''); setFeedback('') }, [current.checkpointId, state.stage])
  async function submit() {
    setBusy(true); setFeedback('')
    try {
      const key = story.answerKeys[0] ?? 'x'
      const result = teamStage ? await gameplayApi.answerTeam(state.huntId, current.checkpointId, value)
        : await gameplayApi.answerPersonal(state.huntId, current.checkpointId, { [key]: value })
      if (!result.correct) setFeedback('Not quite. Check your reasoning and try again.')
      onResult(result)
    } catch (e) { setFeedback(gameplayError(e)) } finally { setBusy(false) }
  }
  return <section className="flex flex-1 flex-col gap-4">
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">{teamStage ? 'Team challenge' : 'Private challenge'} · {current.kind === 'finish' ? 'FinishPoint' : `Checkpoint ${current.ordinal}`}</p>
    {!teamStage ? <>
      {story.storyObjective && <h1 className="text-3xl font-extrabold tracking-tight">{story.storyObjective}</h1>}
      {story.storyProblem && <p className="text-slate-300">{story.storyProblem}</p>}
      <div className={card}><h2 className="text-xl font-bold">{story.title}</h2><p className="mt-2">{story.prompt}</p><div className="mt-4"><ChallengeVisual current={current} value={value} onChange={setValue} /></div></div>
    </> : <>
      {current.personalReveal?.personalContribution && <div className="rounded-2xl bg-emerald-400/15 p-4"><p className="text-sm text-emerald-200">You earned</p><p className="text-2xl font-bold">{current.personalReveal.personalContribution}</p></div>}
      <div className={card}><h2 className="text-xl font-bold">{current.team?.teamPrompt}</h2>
        {current.team?.teamRule && <p className="mt-2 rounded-lg bg-slate-950/60 p-2 font-mono">{current.team.teamRule}</p>}
        {current.team?.teamKind !== 'filter-noise' && <ul className="mt-3 grid gap-1 text-slate-200">{current.team?.publicContributions.map(c => <li key={c}>{c}</li>)}</ul>}
        {current.team?.teamDisplay && current.team.teamKind === 'clue-synthesis' && <p className="mt-3 font-mono text-2xl tracking-[0.3em]">{current.team.teamDisplay}</p>}
        {current.team?.teamInstruction && <p className="mt-3 text-sm text-slate-300">{current.team.teamInstruction}</p>}
        <div className="mt-4"><TeamInput current={current} value={value} onChange={setValue} /></div></div>
    </>}
    {feedback && <p role="alert" className="text-amber-200">{feedback}</p>}
    <button className={`${button} mt-auto`} disabled={busy || !value.trim() || state.huntStatus !== 'active'} onClick={() => void submit()}>{busy ? 'Checking…' : 'Submit answer'}</button>
  </section>
}

export function LiveHuntPlayPage() {
  const { huntId = '' } = useParams()
  const [state, setState] = useState<PlayState | null>(null)
  const [error, setError] = useState('')
  const [celebration, setCelebration] = useState<{ title: string; text?: string; points?: number } | null>(null)
  const [panel, setPanel] = useState<'leaderboard' | 'help' | null>(null)
  const stateRef = useRef(state); stateRef.current = state
  const load = useCallback(async () => {
    try { setState(await gameplayApi.state(huntId)); setError('') } catch (e) { setError(gameplayError(e)) }
  }, [huntId])
  useEffect(() => { void load() }, [load])
  // Poll while waiting on the Organizer (start/resume or manual check-in); stop once playing or finished.
  useEffect(() => {
    const timer = window.setInterval(() => { const s = stateRef.current; if (!s || s.stage === 'waiting' || s.stage === 'navigate') void load() }, 10000)
    return () => window.clearInterval(timer)
  }, [load])
  function onResult(result: AnswerResult) {
    const gained = result.state.score - (state?.score ?? result.state.score)
    if (result.correct) {
      setCelebration(result.stage === 'personal' && !result.checkpointCompleted
        ? { title: 'Correct!', text: result.reveal?.successText, points: gained }
        : { title: result.state.stage === 'finished' ? 'Mission complete!' : 'Checkpoint complete!', text: result.reveal?.storySuccess ?? result.reveal?.successText, points: gained })
    }
    setState(result.state)
  }
  if (!state) return <main className="grid min-h-dvh place-items-center bg-[#07110f] px-5 text-center text-white"><div>{error ? <><p role="alert" className="text-amber-200">{error}</p><button className={`${button} mt-5`} onClick={() => void load()}>Try again</button><Link className="mt-3 block text-slate-300 underline" to="/join">Back to join</Link></> : <p role="status">Loading your Hunt…</p>}</div></main>
  const completed = state.checkpoints.filter(c => c.completed).length
  return <main className="min-h-dvh bg-[#07110f] text-white"><div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-6 pt-4">
    <header className="flex items-center gap-2">
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{state.huntName}</p><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${(completed / Math.max(1, state.checkpoints.length)) * 100}%` }} /></div></div>
      <button className="min-h-11 rounded-xl bg-white/10 px-3 text-sm font-bold" onClick={() => setPanel('leaderboard')} aria-label={`Score ${state.score}. Open leaderboard`}>★ {state.score}</button>
      <button className="min-h-11 rounded-xl bg-rose-500/80 px-3 text-sm font-bold" onClick={() => setPanel('help')}>Help</button>
    </header>
    {error && <p role="alert" className="mt-3 rounded-xl bg-amber-400/10 p-3 text-amber-200">{error}</p>}
    <div className="mt-6 flex flex-1 flex-col">
      {celebration ? <section className="flex flex-1 flex-col justify-center gap-4 text-center" role="status">
        <p className="text-5xl font-extrabold text-emerald-300">{celebration.title}</p>
        {!!celebration.points && <p className="text-2xl font-bold">{celebration.points > 0 ? '+' : ''}{celebration.points} points</p>}
        {celebration.text && <p className="text-lg text-slate-200">{celebration.text}</p>}
        <button className={`${button} mt-6`} onClick={() => setCelebration(null)} autoFocus>Continue</button>
      </section>
      : state.stage === 'waiting' ? <section className="flex flex-1 flex-col justify-center gap-3"><h1 className="text-4xl font-extrabold">{state.mission.name ?? state.mission.displayName}</h1>{state.mission.briefing && <p className="text-slate-300">{state.mission.briefing}</p>}<p className={card} role="status">{state.huntStatus === 'paused' ? 'The Organizer paused the Hunt. Your progress is saved.' : "The Hunt hasn't started yet. Stay with your Organizer. This screen updates automatically."}</p></section>
      : state.stage === 'navigate' ? <Navigate state={state} onArrived={setState} />
      : state.stage === 'finished' ? <section className="flex flex-1 flex-col gap-4"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Mission complete</p><h1 className="text-4xl font-extrabold">{state.mission.signal ?? state.mission.displayName}</h1><p className="text-3xl font-bold">{state.score} points</p>
          <ol className="grid gap-2">{state.history.map(h => <li key={h.checkpointId} className={card}><p className="text-xs uppercase tracking-wider text-slate-400">{h.kind === 'finish' ? 'FinishPoint' : `Checkpoint ${h.ordinal}`} · {h.location}</p><p className="mt-1 font-bold">{h.storyObjective}</p>{h.teamAnswer && <p className="mt-1 font-mono text-emerald-300">{h.teamAnswer}</p>}</li>)}</ol>
          <button className={button} onClick={() => setPanel('leaderboard')}>See the leaderboard</button></section>
      : state.current?.playable ? <Challenge state={state} onResult={onResult} />
      : <p className={card} role="alert">This checkpoint's challenge can't be played in the app yet. Contact your Organizer.</p>}
    </div>
    {panel === 'leaderboard' && <Leaderboard huntId={state.huntId} onClose={() => setPanel(null)} />}
    {panel === 'help' && <HelpDialog huntId={state.huntId} safety={state.safety} onClose={() => setPanel(null)} />}
  </div></main>
}
