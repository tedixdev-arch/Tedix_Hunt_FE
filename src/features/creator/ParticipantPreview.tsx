import { missionStoryFields } from './mission'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PrimaryButton } from '../../components/PrimaryButton'
import { StepContainer } from '../../components/StepContainer'
import { TedixMap } from '../../components/TedixMap'
import type { CreatorTemplateContent } from '../../services/api/creatorTemplates'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { initialPreviewProgress, previewActivities, projectPreview, transitionPreview, type PreviewActivity } from './participantPreview'

const secondary = 'min-h-12 rounded-xl border border-slate-300 px-4 text-sm font-bold'
const title = (field: PreviewActivity | 'navigationMode', value: unknown) => typeof value === 'string' ? gameplayPresentation(field, value).name : 'Unsupported saved value'
const labels: Record<PreviewActivity, string> = { kind: 'Personal Challenge', teamKind: 'Team Challenge' }

/** Dedicated Creator simulation. Receives a snapshot and has no persistence/runtime dependencies. */
export function ParticipantPreview({ content, onExit }: { content: CreatorTemplateContent; onExit: () => void }) {
  const journey = useMemo(() => projectPreview(content), [content])
  const [progress, setProgress] = useState(initialPreviewProgress)
  const [activity, setActivity] = useState<PreviewActivity>()
  const panel = useRef<HTMLElement>(null)
  const exit = useRef<HTMLButtonElement>(null)
  const interaction = useRef<HTMLElement>(null)
  const current = journey.checkpoints[progress.index]
  const position = current.position
  const activities = previewActivities(current)
  const resolved = activities.every(field => progress.resolved.includes(field))
  const active = progress.phase !== 'ready'
  const warnings = active ? journey.warnings : [...journey.warnings, ...journey.checkpoints.flatMap(checkpoint => checkpoint.warnings)]
  const normalPosition = current.role === 'normal' && position && 'checkpointNumber' in position ? position : undefined
  const points = useMemo(() => normalPosition ? [{ ...normalPosition, selected: true }] : [], [normalPosition])
  const send = (action: Parameters<typeof transitionPreview>[1]) => setProgress(state => transitionPreview(state, action, journey))
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    exit.current?.focus()
    return () => previousFocus?.focus()
  }, [])

  useEffect(() => {
    if (!activity) return
    const previousFocus = document.activeElement as HTMLElement | null
    interaction.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    return () => previousFocus?.focus()
  }, [activity])

  return <main ref={panel} role="dialog" aria-modal="true" aria-labelledby="participant-preview-title" className="h-dvh overflow-y-auto bg-white text-slate-900" onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); if (activity) setActivity(undefined); else onExit() }
    if (event.key === 'Tab') {
      const buttons = [...(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }}>
    <StepContainer className="py-4">
      <header className="flex items-center justify-between gap-3"><button ref={exit} type="button" className={secondary} onClick={onExit}>← Exit preview</button><button type="button" className={secondary} onClick={() => { send({ type: 'restart' }); setActivity(undefined) }}>Restart preview</button></header>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-brand-600">Tedixhunt · Creator simulation</p>
      <h1 id="participant-preview-title" className="mt-2 text-2xl font-bold">Participant Preview</h1>
      <p className="mt-2 font-bold">{content.displayName}</p>
      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Simulation only. Arrival and activities are manual. No answers, scores, XP, rewards or Hunt progress are recorded.</p>
      <p className="mt-3 text-sm text-slate-600">Visibility approximation: Template visibility rules are not implemented yet. Only the current checkpoint’s details are shown; future locations and activities remain hidden. This does not establish backend visibility rules.</p>
      {warnings.length > 0 && <aside aria-label="Draft preview warnings" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><ul className="list-disc pl-4">{warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></aside>}
      {!active && <section className="mt-5">{missionStoryFields(content.mission).map(([key, text]) => <p key={key} className="mt-2 text-sm"><strong>{key}: </strong>{text}</p>)}{typeof content.configuration.briefing === 'string' && <p className="mt-2 text-sm">{content.configuration.briefing}</p>}<div className="mt-5"><PrimaryButton type="button" onClick={() => send({ type: 'start' })}>Start preview</PrimaryButton></div></section>}
      {active && <>
        <p role="status" aria-live="polite" className="mt-5 text-sm font-bold">{progress.phase === 'complete' ? 'Simulated Hunt complete' : `${current.label} · ${progress.index + 1} of ${journey.checkpoints.length} stops · ${progress.phase === 'arrived' ? 'Simulated arrival' : 'Simulated navigation'}`}</p>
        <ol aria-label="Journey progress" className="mt-3 flex flex-wrap gap-2 text-xs">{journey.checkpoints.map((checkpoint, index) => <li key={checkpoint.label} aria-current={index === progress.index ? 'step' : undefined} className="rounded-lg bg-slate-100 px-2 py-2">{checkpoint.label}: {index < progress.index || progress.phase === 'complete' ? 'resolved' : index === progress.index ? 'current' : 'locked'}</li>)}</ol>
        <h2 className="mt-4 text-xl font-bold">{current.label}{position ? ` · ${position.name}` : ''}</h2>
        {current.warnings.length > 0 && <aside aria-label="Current checkpoint warnings" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><ul className="list-disc pl-4">{current.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></aside>}
        <div className="mt-4 h-80 overflow-hidden rounded-2xl bg-brand-50"><TedixMap initialLatitude={position?.latitude ?? 0} initialLongitude={position?.longitude ?? 0} initialZoom={position ? 16 : 1} cameraTarget={position} checkpoints={points} finishPoint={current.role === 'terminal' ? position : undefined} /></div>
        {position ? <p className="mt-3 text-sm">Destination: {position.latitude}, {position.longitude} · Discovery radius: {position.radiusMeters} m</p> : <p className="mt-3 text-sm">No valid destination to show. The map is a neutral overview until configured geography becomes available.</p>}
        {current.gameplay.navigationMode !== undefined && <section aria-label="Configured navigation" className="mt-4 rounded-xl bg-brand-50 p-4 text-sm"><h3 className="font-bold">Navigation: {title('navigationMode', current.gameplay.navigationMode)}</h3><p className="mt-2">Saved mode: {String(current.gameplay.navigationMode)}. Navigation is simulated; bearings, distances and clues are not generated. Saved navigationMode describes departure from this checkpoint.</p></section>}
        {progress.phase === 'navigation' && <div className="mt-5"><PrimaryButton type="button" onClick={() => send({ type: 'arrive' })}>Simulate arrival</PrimaryButton></div>}
        {progress.phase === 'arrived' && <section className="mt-5 space-y-3" aria-label="Checkpoint activities">
          {activities.length === 0 && <p className="text-sm">No Personal or Team Challenge configured.</p>}
          {activities.map(field => <article key={field} className="rounded-xl border border-slate-200 p-4"><h3 className="font-bold">{labels[field]} · {title(field, current.gameplay[field])}</h3><p className="mt-2 text-sm">{progress.resolved.includes(field) ? 'Simulated activity resolved' : 'Awaiting manual simulation'}</p><button type="button" className={`${secondary} mt-3`} onClick={() => setActivity(field)}>Inspect {labels[field]}</button></article>)}
          <PrimaryButton type="button" disabled={!resolved} onClick={() => send({ type: 'continue' })}>{current.role === 'terminal' ? 'Simulate Hunt completion' : 'Continue to next checkpoint'}</PrimaryButton>
        </section>}
        {progress.phase === 'complete' && <p className="mt-5 rounded-xl bg-brand-50 p-5 font-bold">Simulated Hunt completion. All configured checkpoint activities were manually resolved. No real completion or rewards were triggered.</p>}
        {activity && <section ref={interaction} role="region" aria-label={`${labels[activity]} simulation`} className="mt-5 rounded-2xl bg-brand-600 p-5 text-white">
          <h3 className="text-lg font-bold">{labels[activity]} · Simulated interaction</h3>
          <p className="mt-3 text-sm">A Participant renderer for arbitrary saved gameplay is not available. This is the actual checkpoint configuration; no question content or answers have been added.</p>
          <p className="mt-3 text-sm">Fictional puzzle navigation is story metadata, not real walking guidance. Use persisted geographic destinations and the walking route inspection for geography.</p>
          <pre aria-label="Saved checkpoint configuration" className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white/10 p-3 text-xs">{JSON.stringify(current.gameplay, null, 2)}</pre>
          <button type="button" disabled={progress.resolved.includes(activity)} className={`${secondary} mt-4 disabled:opacity-50`} onClick={() => { send({ type: 'resolve', activity }); setActivity(undefined) }}>Simulate {labels[activity]} completion</button>
          <button type="button" className={`${secondary} mt-3 w-full`} onClick={() => setActivity(undefined)}>Back to checkpoint</button>
        </section>}
      </>}
    </StepContainer>
  </main>
}
