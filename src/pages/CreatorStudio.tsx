import { canReviseTemplate, sameTemplateState } from '../features/creator/templateLifecycle'
import { LocalGeographySelector } from '../features/creator/LocalGeographySelector'
import { editMissionStory, missionStoryFields, type TemplateMission } from '../features/creator/mission'
import { ApiError } from '../services/api/client'
import { TemplateReadContext } from '../features/creator/TemplateReadContext'
import { DeleteTemplateDialog } from '../features/creator/DeleteTemplateDialog'
import { CreatorStudioNavigation } from '../features/creator/CreatorStudioNavigation'
import { TemplateCreationChooser } from '../features/creator/TemplateCreationChooser'
import { prefillSignalLandmarks } from '../features/creator/signalLandmarks'
import { readRouteProposal } from '../features/creator/routeResearch'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { organizerFeatures, signalNormalCheckpointNames } from '../data/organizerTemplates'
import { OrganizerHeader } from './OrganizerFlow'
import { CheckpointGameplayEditor, GameplayScoring, gameplayPresentation } from '../features/creator/CheckpointGameplayEditor'
import { createNormalGameplay, hydrateGameplay, serializeGameplay, gameplayValidation, type CheckpointGameplay } from '../features/creator/checkpointGameplay'
import { FinishPointEditor } from '../features/creator/FinishPointEditor'
import { finishPointConfiguration, finishPointValidation, type FinishPoint, type FinishPointDraft } from '../features/creator/finishPoint'
import { RouteEditor } from '../features/creator/RouteEditor'
import { ParticipantPreview } from '../features/creator/ParticipantPreview'
import { WalkingRouteInspection } from '../features/creator/WalkingRouteValidation'
import { buildGeographyConfiguration, createCheckpointDrafts, isGeographyComplete, resizeCheckpointDrafts } from '../features/creator/checkpointGeography'
import { creatorTemplatesApi, type CreatorTemplate, type CreatorTemplateContent, type StarterTemplate } from '../services/api/creatorTemplates'
import { creatorTemplateError, hydratePersistedGeography, normalizeTemplateKey, persistCreatorTemplate, templateContentEqual } from '../features/creator/templatePersistence'

const field = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500'
const checkpointFeatures = new Set(['personal', 'team', 'navigation'])
export const MIN_NORMAL_CHECKPOINTS = 1
export const MAX_NORMAL_CHECKPOINTS = 20
export const SIGNAL_NORMAL_CHECKPOINTS = 6

export function normalCheckpointNames(count: number) {
  return Array.from({ length: count }, (_, index) => signalNormalCheckpointNames[index] ?? `Checkpoint ${index + 1}`)
}

export function clampNormalCheckpointCount(count: number) {
  return Math.min(MAX_NORMAL_CHECKPOINTS, Math.max(MIN_NORMAL_CHECKPOINTS, count))
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader logoutTo="/creator/sign-in" showProfile /><div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">{children}</div></main>
}

function Progress({ done, total }: { done: number; total: number }) {
  const percent = Math.round(done / total * 100)
  return <div className="min-w-44"><div className="flex justify-between text-xs font-bold"><span>{done} of {total} complete</span><span>{percent}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} /></div></div>
}

function CheckpointCountEditor({ count, onChange }: { count: number; onChange: (count: number) => void }) {
  const route = Array.from({ length: count }, (_, index) => String(index + 1).padStart(2, '0')).join(' → ')
  return <div className="mt-5">
    <p className="text-sm text-slate-600">Set the number of route checkpoints before the FinishPoint.</p>
    <div className="mt-5 flex items-center gap-4" aria-label="Number of normal checkpoints">
      <button type="button" aria-label="Remove checkpoint" disabled={count === MIN_NORMAL_CHECKPOINTS} onClick={() => onChange(clampNormalCheckpointCount(count - 1))} className="grid h-12 w-12 place-items-center rounded-xl border border-slate-300 text-xl font-bold disabled:opacity-40">−</button>
      <label className="text-center text-xs font-bold uppercase text-slate-500">Number of checkpoints<input aria-label="Normal checkpoint count" className="mt-1 block h-12 w-24 rounded-xl border border-slate-300 text-center text-xl font-bold" type="number" min={MIN_NORMAL_CHECKPOINTS} max={MAX_NORMAL_CHECKPOINTS} value={count} onChange={event => onChange(clampNormalCheckpointCount(Number(event.target.value) || MIN_NORMAL_CHECKPOINTS))} /></label>
      <button type="button" aria-label="Add checkpoint" disabled={count === MAX_NORMAL_CHECKPOINTS} onClick={() => onChange(clampNormalCheckpointCount(count + 1))} className="grid h-12 w-12 place-items-center rounded-xl border border-slate-300 text-xl font-bold disabled:opacity-40">+</button>
    </div>
    <div className="mt-5 rounded-xl bg-[#031b14] p-5 text-white"><p className="text-xs font-bold uppercase text-emerald-300">Participant preview</p><p className="mt-3 overflow-x-auto whitespace-nowrap text-lg font-bold">{route} → FinishPoint</p><p className="mt-3 text-sm text-slate-200">{count} route {count === 1 ? 'checkpoint' : 'checkpoints'}</p><p className="mt-1 text-sm font-bold text-emerald-300">FinishPoint configured separately in Feature 6</p></div>
    <p className="mt-3 text-xs font-bold text-slate-500">Allowed range: {MIN_NORMAL_CHECKPOINTS}–{MAX_NORMAL_CHECKPOINTS} normal checkpoints.</p>
  </div>
}

function CheckpointEditor({ names, checkpointCount, featureId, gameplay, onChange }: { names: string[]; checkpointCount: number; featureId: string; gameplay: CheckpointGameplay[]; onChange: (value: CheckpointGameplay[]) => void }) {
  const [checkpoint, setCheckpoint] = useState(0)
  const [source, setSource] = useState<'approved' | 'new'>('approved')
  const index = Math.min(checkpoint, checkpointCount - 1)
  const checkpointNames = names
  const gameplayField = featureId === 'personal' ? 'kind' : featureId === 'team' ? 'teamKind' : 'navigationMode'
  const template = gameplayPresentation(gameplayField, gameplay[index]?.[gameplayField])
  return <div className="mt-5">
    <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Checkpoint selector">{checkpointNames.map((name, number) => <button key={name} title={name} type="button" onClick={() => setCheckpoint(number)} className={`grid h-11 min-w-11 place-items-center rounded-full border text-sm font-bold ${index === number ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white'}`}>{number + 1}</button>)}</div>
    <p className="mt-2 text-sm font-bold">{checkpointNames[index]}</p>
    <div className="mt-4 flex rounded-xl bg-slate-100 p-1"><button type="button" aria-pressed={source === 'approved'} onClick={() => setSource('approved')} className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${source === 'approved' ? 'bg-white shadow' : ''}`}>Approved component</button><button type="button" aria-pressed={source === 'new'} onClick={() => setSource('new')} className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${source === 'new' ? 'bg-white shadow' : ''}`}>Create new</button></div>
    {source === 'approved' ? <>
      <CheckpointGameplayEditor fields={[gameplayField]} value={gameplay[index] ?? {}} onChange={value => onChange(Array.from({ length: Math.max(checkpointCount, gameplay.length) }, (_, number) => number === index ? value : gameplay[number] ?? {}))} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Creator note</p><p className="mt-2 text-sm leading-6">{template.note}</p></div><div className="rounded-xl bg-[#031b14] p-4 text-white" aria-label="Approved Participant preview"><div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-300"><span>Tedixhunt</span><span>Participant preview</span></div><p className="mt-4 text-xs font-bold uppercase text-emerald-300">{checkpointNames[index]}</p><p className="mt-2 text-xl font-bold">{template.name}</p><p className="mt-2 text-sm text-slate-200">{template.example}</p></div></div>
    </> : <PrototypeComponentEditor key={`${featureId}-${index}`} isChallenge={featureId !== 'navigation'} checkpointName={checkpointNames[index]} />}
  </div>
}

function PrototypeComponentEditor({ isChallenge, checkpointName }: { isChallenge: boolean; checkpointName: string }) {
  const [draft, setDraft] = useState({ name: '', instructions: '', format: 'Single choice · up to 3 options', answer: '', difficulty: 'Easy', options: '', hint: '', solution: '' })
  const change = (key: keyof typeof draft, value: string) => setDraft(current => ({ ...current, [key]: value }))
  return <section className="mt-4 space-y-4" aria-label="Prototype component authoring">
    <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Prototype-only · not yet persistable. These custom fields are for trying ideas; they are not saved or submitted. Saving keeps the configured approved gameplay. Return to Approved component to change saved gameplay.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-bold sm:col-span-2">Component name<input className={field} value={draft.name} onChange={event => change('name', event.target.value)} /></label>
      {isChallenge && <label className="text-sm font-bold sm:col-span-2">Challenge format<select className={field} value={draft.format} onChange={event => change('format', event.target.value)}>{['Single choice · up to 3 options', 'Multiple choice · up to 3 options', 'True / False', 'Match the pairs · up to 3 pairs'].map(format => <option key={format}>{format}</option>)}</select></label>}
      <label className="text-sm font-bold sm:col-span-2">Participant instructions<textarea className={`${field} min-h-20 py-3`} value={draft.instructions} onChange={event => change('instructions', event.target.value)} /></label>
      {isChallenge && <>
        <label className="text-sm font-bold">Correct answer<input className={field} value={draft.answer} onChange={event => change('answer', event.target.value)} /></label>
        <label className="text-sm font-bold">Difficulty<select className={field} value={draft.difficulty} onChange={event => change('difficulty', event.target.value)}>{['Easy', 'Medium', 'Advanced'].map(difficulty => <option key={difficulty}>{difficulty}</option>)}</select></label>
        <label className="text-sm font-bold sm:col-span-2">Options or pairs<textarea className={`${field} min-h-20 py-3`} value={draft.options} onChange={event => change('options', event.target.value)} /></label>
        <label className="text-sm font-bold">Hint<textarea className={`${field} min-h-20 py-3`} value={draft.hint} onChange={event => change('hint', event.target.value)} /></label>
        <label className="text-sm font-bold">Solution<textarea className={`${field} min-h-20 py-3`} value={draft.solution} onChange={event => change('solution', event.target.value)} /></label>
      </>}
    </div>
    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Creator note</p><p className="mt-2 text-sm">Custom authoring is a prototype. Draft fields are temporary and reset when you leave this editor.</p></div><div className="rounded-xl bg-[#031b14] p-4 text-white" aria-label="Prototype Participant preview"><p className="text-xs font-bold uppercase text-emerald-300">Participant preview · prototype-only</p><p className="mt-4 text-xs font-bold uppercase text-emerald-300">{checkpointName}</p><p className="mt-2 text-xl font-bold">{draft.name || 'New component'}</p><p className="mt-2 text-sm text-slate-200">{draft.instructions || 'Try participant instructions here.'}</p></div></div>
  </section>
}

function RewardBoundary() {
  return <div className="mt-5 space-y-4"><div className="rounded-xl border border-violet-200 bg-violet-50 p-5"><p className="text-xs font-bold uppercase text-violet-800">Organizer and Admin responsibility</p><h4 className="mt-2 text-lg font-bold">Prizes are not stored in the Hunt template</h4><p className="mt-2 text-sm leading-6 text-violet-950">Organizers allocate leaderboard and special rewards. Admin manages physical inventory; prize identity stays hidden until final results.</p></div><div className="rounded-xl border border-slate-200 p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase text-emerald-700">Optional reusable definition</p><h4 className="mt-2 text-lg font-bold">Propose a Special Award</h4><p className="mt-1 text-sm text-slate-500">Define a measurable, theme-independent award for Admin approval. This does not allocate a prize.</p></div><span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Admin approval required</span></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Scope<select className={field}><option>Team</option><option>Personal</option></select></label><label className="text-sm font-bold">Metric<select className={field}><option>Challenge accuracy</option><option>Participation consistency</option><option>Improvement from first checkpoint</option><option>Verified contribution rate</option><option>Efficient hint use</option></select></label><label className="text-sm font-bold sm:col-span-2">Award name<input className={field} placeholder="Generic award name" /></label><label className="text-sm font-bold sm:col-span-2">Winning rule and tie-breaker<textarea className={`${field} min-h-20 py-3`} /></label><label className="text-sm font-bold sm:col-span-2">Short description<textarea className={`${field} min-h-20 py-3`} /></label></div><p className="mt-4 text-xs font-bold text-slate-500">Physical-prize eligibility excludes previous physical leaderboard winners. Virtual rewards do not affect eligibility.</p></div></div>
}

export function CreatorStudioPage() {
  const navigate = useNavigate()
  const [choosing, setChoosing] = useState(false)
  const creating = useRef(false)
  const [creatingStarter, setCreatingStarter] = useState(false)
  const [starterError, setStarterError] = useState('')
  const createStarter = async (starter: StarterTemplate) => {
    if (creating.current) return
    creating.current = true; setCreatingStarter(true); setStarterError('')
    try {
      const draft = await creatorTemplatesApi.createStarterDraft(starter)
      navigate(`/create?template=${encodeURIComponent(draft.key)}`)
    } catch (reason) { setStarterError(creatorTemplateError(reason, 'starter')) }
    finally { creating.current = false; setCreatingStarter(false) }
  }
  const [templates, setTemplates] = useState<CreatorTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const loadSequence = useRef(0)
  const load = async () => {
    const sequence = ++loadSequence.current
    setLoading(true); setError('')
    try {
      const records = await creatorTemplatesApi.list()
      if (sequence === loadSequence.current) setTemplates(records)
    } catch (reason) {
      if (sequence === loadSequence.current) {
        if (reason instanceof ApiError && [401, 403, 404].includes(reason.status ?? 0)) setTemplates([])
        setError(creatorTemplateError(reason, 'load'))
      }
    } finally { if (sequence === loadSequence.current) setLoading(false) }
  }
  const [deleteTarget, setDeleteTarget] = useState<CreatorTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deletingRequest = useRef(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)
  const templatesHeading = useRef<HTMLHeadingElement>(null)
  const restoreDeleteFocus = () => {
    if (deleteTrigger.current?.isConnected && !deleteTrigger.current.disabled) deleteTrigger.current.focus()
    else templatesHeading.current?.focus()
  }
  const confirmDelete = async () => {
    if (!deleteTarget || deletingRequest.current) return
    deletingRequest.current = true; setDeleting(true); setDeleteError('')
    try {
      await creatorTemplatesApi.delete(deleteTarget.key)
    } catch (reason) {
      setDeleteError(creatorTemplateError(reason, 'delete'))
      deletingRequest.current = false; setDeleting(false)
      return
    }
    // Only a confirmed DELETE can initiate a refresh; never remove cards locally.
    setDeleteTarget(null)
    await load()
    deletingRequest.current = false; setDeleting(false)
    // The deleted trigger may have disappeared after the authoritative list refresh.
    if (!deleteTrigger.current?.isConnected && (document.activeElement === document.body || document.activeElement === templatesHeading.current)) templatesHeading.current?.focus()
  }
  useEffect(() => { void load(); return () => { ++loadSequence.current } }, [])
  const statuses = [['Drafts', 'draft'], ['Changes requested', 'changes_requested'], ['Submitted', 'submitted'], ['Approved', 'approved']] as const
  return <Shell><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Creator Studio</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-bold">Competition Templates</h1><p className="mt-3 max-w-2xl text-slate-600">Create complete, safe Hunts that Organizers can adapt in Set the Hunt.</p></div></div>
    <CreatorStudioNavigation />
    {choosing && <TemplateCreationChooser creating={creatingStarter} error={starterError} onScratch={() => { if (!creating.current) navigate('/create') }} onStarter={createStarter} onClose={() => setChoosing(false)} onCheckTemplates={() => { setChoosing(false); load() }} />}
    {!choosing && creatingStarter && <p role="status" className="mt-3 text-sm font-bold text-emerald-800">Creating Signal Cluj draft…</p>}
    {!choosing && starterError && <p role="alert" className="mt-3 text-sm text-red-800">{starterError}</p>}
    {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{error}<button type="button" className="ml-3 underline" onClick={load}>Retry</button></div>}
    <h2 id="my-templates" ref={templatesHeading} tabIndex={-1} className="mt-8 text-2xl font-bold">My Templates</h2>
    <div className="mt-4 flex flex-wrap items-center gap-3"><span className="text-sm font-bold text-slate-600">Legacy creation</span><button type="button" aria-haspopup="dialog" onClick={() => setChoosing(true)} className="flex min-h-12 items-center rounded-xl bg-emerald-500 px-5 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">Create Template</button></div>
    <p className="mt-4 text-sm text-slate-600">The existing Create Template action opens legacy, unclassified creation and the starter catalog. It does not create a Universal or Local Template.</p>
    {deleteTarget && <DeleteTemplateDialog name={deleteTarget.content.displayName} deleting={deleting} error={deleteError} onCancel={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} restoreFocus={restoreDeleteFocus} />}
    {!deleteTarget && deleteError && <p role="alert" className="mt-4 text-sm text-red-900">{deleteError} <button type="button" onClick={() => { setDeleteError(''); void load() }} className="min-h-12 px-3 font-bold underline">Refresh My Templates</button></p>}
    <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Template queues">{statuses.map(([name, status]) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={name}><p className="text-sm font-bold text-slate-500">{name}</p><p className="mt-2 text-3xl font-bold">{templates.filter(item => item.status === status).length}</p></article>)}</section>
    <section className="mt-8 space-y-4" aria-label="Creator Templates" aria-busy={loading}>
      {loading && templates.length === 0 ? <p className="rounded-2xl bg-white p-5">Loading Creator Templates…</p>
        : templates.length === 0 && error ? null : templates.length === 0 ? <p className="rounded-2xl bg-white p-5 text-slate-600">No persisted Creator Templates yet.</p>
        : templates.map(item => {
          const editable = item.status === 'draft' || item.status === 'changes_requested'
          return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.key}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 break-words">
                <h2 className="mt-2 text-xl font-bold">{item.content.displayName}</h2>
                <TemplateReadContext template={item} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link className="min-h-12 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2" to={`/create?template=${encodeURIComponent(item.key)}`}>{canReviseTemplate(item) ? 'Revise' : editable ? 'Edit template' : 'View template'}</Link>
                {editable && <button type="button" aria-haspopup="dialog" disabled={deleting} onClick={event => {
                  deleteTrigger.current = event.currentTarget
                  setDeleteError(''); setDeleteTarget(item)
                }} className="min-h-12 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 disabled:opacity-50">Delete</button>}
              </div>
            </div>
          </article>
        })}
    </section></Shell>
}

export function CreatorTemplateEditorPage() {
  const [searchParams] = useSearchParams()
  const templateKey = searchParams.get('template')
  const newLocal = !templateKey && searchParams.get('category') === 'local'
  const newUniversal = !templateKey && searchParams.get('category') === 'universal'
  const blankNew = newUniversal || newLocal
  const steps = ['Template details', 'Use requirements', 'Mission template & story', 'Template status']
  const [step, setStep] = useState(0), [stepDone, setStepDone] = useState<Set<number>>(new Set())
  const [featureIndex, setFeatureIndex] = useState(0), [featureDone, setFeatureDone] = useState<Set<string>>(new Set())
  const [checkpointCount, setCheckpointCount] = useState(SIGNAL_NORMAL_CHECKPOINTS)
  // Geographic drafts are Creator Template authority; unpositioned checkpoints deliberately have no coordinates.
  const [checkpointDrafts, setCheckpointDrafts] = useState(() => createCheckpointDrafts(SIGNAL_NORMAL_CHECKPOINTS, normalCheckpointNames(SIGNAL_NORMAL_CHECKPOINTS)))
  const [gameplayEdited, setGameplayEdited] = useState(false)
  const [normalGameplay, setNormalGameplay] = useState<CheckpointGameplay[]>(() => createNormalGameplay(SIGNAL_NORMAL_CHECKPOINTS))
  const [terminalGameplay, setTerminalGameplay] = useState<CheckpointGameplay | undefined>({ role: 'terminal' })
  // A name-only research prefill is local context; authoring FinishPoint still uses existing validation.
  const [finishPointEdited, setFinishPointEdited] = useState(false)
  const [finishPointDraft, setFinishPointDraft] = useState<FinishPointDraft | undefined>(undefined)
  const [verifiedPositions, setVerifiedPositions] = useState<Set<number>>(new Set())
  const [routeSafety, setRouteSafety] = useState<Set<string>>(new Set())
  const [templateConfiguration, setTemplateConfiguration] = useState(() => blankNew ? { normalCheckpointCount: SIGNAL_NORMAL_CHECKPOINTS, checkpointPositions: [] } : buildGeographyConfiguration(SIGNAL_NORMAL_CHECKPOINTS, checkpointDrafts))
  const [selections, setSelections] = useState<Record<string, number>>({}), [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [routeSafe, setRouteSafe] = useState(false), [previewed, setPreviewed] = useState(false), [tested, setTested] = useState(false)
  const previewTrigger = useRef<HTMLButtonElement>(null)
  const [previewContent, setPreviewContent] = useState<CreatorTemplateContent | null>(null)
  const [localityChange, setLocalityChange] = useState<string | null | undefined>(undefined)
  const [persisted, setPersisted] = useState<CreatorTemplate | null>(null)
  const [arrivalNotes, setArrivalNotes] = useState<Record<number, string>>({})
  const [stableKey, setStableKey] = useState<string | null>(templateKey)
  const [loadingTemplate, setLoadingTemplate] = useState(Boolean(templateKey))
  const readSequence = useRef(0)
  const [reload, setReload] = useState(0)
  const [conflict, setConflict] = useState(false)
  const mutationLock = useRef(false)
  const [uncertain, setUncertain] = useState(false)
  const [saving, setSaving] = useState(false), [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState(''), [submitError, setSubmitError] = useState(''), [loadError, setLoadError] = useState('')
  const [mission, setMission] = useState<TemplateMission>({ name: blankNew ? '' : 'Restore the Signal' })
  const [details, setDetails] = useState({ name: blankNew ? '' : 'Signal: Cluj Napoca', summary: blankNew ? '' : 'Restore six linked relay points, trace the signal to its source and restart the final transmitter together.', category: 'Mathematics', age: '12–16', duration: '90', language: 'English', participants: '16–40', teamSize: '4', format: 'Team Hunters', environment: blankNew ? '' : 'Outdoor · walkable city centre', equipment: 'One phone per team', difficulty: 'Organizer sets', theme: blankNew ? 'Mixed' : 'Smart Theme (Signal)', briefing: blankNew ? '' : 'Restore six linked relay points and unlock the route to the City Wall FinishPoint.' })
  const universal = persisted ? persisted.category === 'universal' : newUniversal
  const local = persisted ? persisted.category === 'local' : newLocal
  const classified = universal || local
  const features = universal ? organizerFeatures.filter(item => item.id !== 'positions') : organizerFeatures
  const feature = features[Math.min(featureIndex, features.length - 1)], template = feature.templates[selections[feature.id] ?? 0]
  const routeResearch = useMemo(() => {
    const research = persisted?.content.routeResearch
    const proposal = readRouteProposal(research)
    if (!proposal || !Object.keys(arrivalNotes).length) return research
    return {
      ...(research as Record<string, unknown>),
      proposal: { ...proposal, candidates: proposal.candidates.map(candidate => ({
        ...candidate,
        arrivalArea: arrivalNotes[candidate.role === 'terminal' ? 0 : candidate.checkpoint!] ?? candidate.arrivalArea,
      })) },
    }
  }, [arrivalNotes, persisted])
  const creatorTemplateContent = useMemo<CreatorTemplateContent>(() => ({
    ...persisted?.content,
    ...(routeResearch !== undefined ? { routeResearch } : {}),
    key: stableKey ?? normalizeTemplateKey(details.name),
    version: persisted?.version ?? 1,
    displayName: details.name,
    theme: details.theme,
    mission,
    configuration: { ...finishPointConfiguration(templateConfiguration, finishPointDraft, finishPointEdited), ...(!finishPointEdited && finishPointDraft && persisted?.content.configuration.finishPoint ? { finishPoint: finishPointDraft as FinishPoint } : {}), summary: details.summary, category: details.category, ageRange: details.age, durationMinutes: Number(details.duration), language: details.language, participants: details.participants, teamSize: details.teamSize, format: details.format, environment: details.environment, equipment: details.equipment, difficulty: details.difficulty, briefing: details.briefing },
    scoring: { ...(persisted?.content.scoring ?? { model: 'platform' }), ...(Object.keys(selections).length ? { selections } : {}) },
    checkpoints: persisted && !gameplayEdited && ((templateConfiguration.normalCheckpointCount === undefined && templateConfiguration.checkpointPositions === undefined) || persisted.content.checkpoints.every(entry => !!entry && typeof entry === 'object' && ['normal', 'terminal'].includes((entry as CheckpointGameplay).role ?? ''))) && checkpointCount === persisted.content.checkpoints.filter(entry => (entry as CheckpointGameplay).role !== 'terminal').length ? persisted.content.checkpoints : serializeGameplay(normalGameplay, checkpointCount, terminalGameplay, persisted?.content.checkpoints),
  }), [routeResearch, checkpointCount, checkpointDrafts, gameplayEdited, normalGameplay, terminalGameplay, finishPointDraft, finishPointEdited, details, mission, persisted, selections, stableKey, templateConfiguration])
  if (classified && persisted) {
    const saved = persisted.content.configuration
    for (const key of Object.keys(creatorTemplateContent.configuration)) {
      const value = creatorTemplateContent.configuration[key]
      if (!(key in saved) && (value === '' || value === 0 || value === undefined)) delete creatorTemplateContent.configuration[key]
    }
  }
  const legacy = templateConfiguration.normalCheckpointCount === undefined && templateConfiguration.checkpointPositions === undefined
  const allInfo = stepDone.size === steps.length, allFeatures = featureDone.size === features.length
  const checks = useMemo(() => [['Template Setup complete', allInfo], ['Nine Hunt Features complete', allFeatures], ['Route reviewed this session', routeSafe], ['Participant journey previewed', previewed], ['Validation passed', tested]] as const, [allInfo, allFeatures, routeSafe, previewed, tested])
  const finishError = finishPointValidation(creatorTemplateContent.configuration, !universal) || gameplayValidation(creatorTemplateContent, true)
  const ready = universal ? !finishError : !finishError && checks.every(([, value]) => value) && (legacy || creatorTemplateContent.configuration.normalCheckpointCount === checkpointCount)
  useEffect(() => setRouteSafe(legacy || isGeographyComplete(checkpointDrafts, verifiedPositions, routeSafety.size, 6)), [checkpointDrafts, verifiedPositions, routeSafety, legacy])
  const hydrateRecord = (record: CreatorTemplate) => {
      // Persisted content hydrates every working field; Signal defaults are only for a new Template.
      const content = record.content, configuration = content.configuration
      const invalidGameplay = gameplayValidation(content)
      if (invalidGameplay) { setLoadError(invalidGameplay); return }
      setGameplayEdited(false)
      setPersisted(record); setLocalityChange(undefined); setStableKey(record.key)
      setMission(content.mission)
      setDetails(current => ({ ...current, name: content.displayName, theme: content.theme,
        summary: String(configuration.summary ?? ''), category: String(configuration.category ?? ''), age: String(configuration.ageRange ?? ''), duration: String(configuration.durationMinutes ?? ''), language: String(configuration.language ?? ''), participants: String(configuration.participants ?? ''), teamSize: String(configuration.teamSize ?? ''), format: String(configuration.format ?? ''), environment: String(configuration.environment ?? ''), equipment: String(configuration.equipment ?? ''), difficulty: String(configuration.difficulty ?? ''), briefing: String(configuration.briefing ?? '') }))
      const gameplay = hydrateGameplay(content)
      setNormalGameplay(gameplay.normal); setTerminalGameplay(gameplay.terminal)
      // Prefill only the local geographic working copy, never the approved starter content.
      setCheckpointCount(configuration.normalCheckpointCount ?? content.checkpoints.filter(entry => (entry as CheckpointGameplay).role !== 'terminal').length); setTemplateConfiguration(configuration)
      const geography = hydratePersistedGeography(configuration)
      const prefilled = prefillSignalLandmarks(content.displayName, readRouteProposal(content.routeResearch), geography.checkpointDrafts, configuration.finishPoint ? { ...configuration.finishPoint } : undefined, signalNormalCheckpointNames)
      setCheckpointDrafts(record.category ? geography.checkpointDrafts : prefilled.drafts)
      setFinishPointDraft(record.category ? configuration.finishPoint : prefilled.finish)
      setFinishPointEdited(false)
      setVerifiedPositions(geography.verifiedPositions)
      setRouteSafety(geography.routeSafety)
      const restoredSelections = (content.scoring.selections && typeof content.scoring.selections === 'object') ? content.scoring.selections as Record<string, number> : {}
      setSelections(restoredSelections)
      setStepDone(new Set(steps.map((_, index) => index)))
      setFeatureDone(new Set((record.category === 'universal' ? organizerFeatures.filter(item => item.id !== 'positions') : organizerFeatures).filter(item => item.id !== 'positions' || (configuration.normalCheckpointCount === undefined && configuration.checkpointPositions === undefined)).map(item => item.id)))
    setConflict(false); setUncertain(false)
  }
  useEffect(() => {
    const sequence = ++readSequence.current
    if (!templateKey) return () => { ++readSequence.current }
    setLoadingTemplate(true); setLoadError(''); setPersisted(null)
    creatorTemplatesApi.get(templateKey).then(record => {
      if (sequence !== readSequence.current) return
      hydrateRecord(record)
    }).catch(reason => { if (sequence === readSequence.current) setLoadError(creatorTemplateError(reason, 'load')) }).finally(() => { if (sequence === readSequence.current) setLoadingTemplate(false) })
    return () => { ++readSequence.current }
  }, [templateKey, reload])
  const saveStep = () => { setStepDone(current => new Set([...current, step])); if (step < steps.length - 1) setStep(step + 1); setTested(false) }
  const persistWorkingTemplate = async (completedFeatures: Set<string>, draftOnly = false) => {
    if (mutationLock.current || conflict || uncertain || saving || (!universal && !draftOnly && (stepDone.size !== steps.length || completedFeatures.size !== features.length || !routeSafe))) return
    const validation = finishPointValidation(creatorTemplateContent.configuration) || gameplayValidation(creatorTemplateContent)
    if (validation) { setSaveError(validation); return }
    const sequence = readSequence.current
    mutationLock.current = true
    setSaving(true); setSaveError('')
    try {
      if (classified && persisted) {
        const latest = await creatorTemplatesApi.get(persisted.key)
        if (sequence !== readSequence.current) return
        if (!sameTemplateState(latest, persisted)) { setConflict(true); setSaveError('This Template changed on the server. Your edits are kept. Reopen the latest saved version before saving again.'); return }
        if (latest.status !== 'draft' && !canReviseTemplate(latest)) { setConflict(true); setSaveError('This version is submitted and cannot be edited. Reopen its current state.'); return }
      }
      // Immutable versions are created only on an explicit save or completion action, never per keystroke.
      const saved = await persistCreatorTemplate(creatorTemplatesApi, creatorTemplateContent, persisted, universal ? 'universal' : local ? 'local' : undefined, local ? localityChange : undefined)
      if (sequence !== readSequence.current) return
      // Backend status, key, version and content are authoritative after every persistence response.
      if (classified) hydrateRecord(saved)
      else { setPersisted(saved); setStableKey(saved.key); setMission(saved.content.mission); setDetails(current => ({ ...current, name: saved.content.displayName })) }
      document.getElementById('creator-review')?.scrollIntoView({ behavior: 'smooth' })
    } catch (reason) {
      if (sequence !== readSequence.current) return
      if (classified && !persisted && (!(reason instanceof ApiError) || reason.status === null || reason.status >= 500)) { setUncertain(true); setSaveError('Creation could not be confirmed. Check My Templates and reopen the saved draft before creating another. Your input is kept here.') }
      else {
        if (local && reason instanceof ApiError && reason.details && typeof reason.details === 'object' && 'error' in reason.details && ['locality_not_found', 'locality_unavailable', 'invalid_input'].includes(String(reason.details.error))) { setSaveError('The selected locality could not be saved. Refresh the registry and select an active locality, keep the saved locality, or clear it. Your saved version is unchanged.'); }
        else if (classified && persisted && (!(reason instanceof ApiError) || reason.status === null || reason.status === 409 || reason.status >= 500)) {
          setConflict(true); setSaveError('The saved version could not be confirmed or has changed. Reopen the latest saved version before saving again.')
        } else setSaveError(creatorTemplateError(reason, 'save'))
      }
    } finally { mutationLock.current = false; setSaving(false) }
  }
  const saveFeature = () => {
    if (feature.id === 'positions' && !routeSafe) return
    const completed = new Set([...featureDone, feature.id]); setFeatureDone(completed)
    if (featureIndex < features.length - 1) setFeatureIndex(featureIndex + 1)
    else void persistWorkingTemplate(completed)
    setTested(false)
  }
  const submit = async () => {
    if (!persisted || mutationLock.current || saving || submitting || (classified && (localityChange !== undefined || conflict || persisted.status !== 'draft' || !templateContentEqual(creatorTemplateContent, persisted.content)))) return
    const validation = finishPointValidation(persisted.content.configuration, !universal) || gameplayValidation(persisted.content, true)
    if (validation) { setSubmitError(validation); return }
    const sequence = readSequence.current
    mutationLock.current = true
    setSubmitting(true); setSubmitError('')
    try {
      if (classified) {
        const latest = await creatorTemplatesApi.get(persisted.key)
        if (sequence !== readSequence.current) return
        if (latest.status !== 'draft' || !sameTemplateState(latest, persisted)) { setConflict(true); setSubmitError('The saved version changed or has already been submitted. Reopen its current state before submitting.'); return }
      }
      // Persistence and submission are distinct; only the exact latest persisted version is submitted.
      const result = await creatorTemplatesApi.submit(persisted.key, persisted.version)
      if (sequence === readSequence.current) setPersisted(result)
    } catch (reason) {
      if (sequence !== readSequence.current) return
      if (classified && (!(reason instanceof ApiError) || reason.status === null || reason.status === 409 || reason.status >= 500)) setConflict(true)
      setSubmitError(universal && reason instanceof ApiError && reason.status === 400 ? 'The saved Universal content was rejected. Check supported activities, checkpoint numbering and FinishPoint gameplay; save corrections before retrying.' : creatorTemplateError(reason, 'submit'))
    } finally { mutationLock.current = false; setSubmitting(false) }
  }
  if (loadingTemplate) return <Shell><p>Loading persisted Creator Template…</p></Shell>
  if (loadError) return <Shell><div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 font-bold text-red-900">{loadError}<Link className="ml-3 underline" to="/creator">Return to Creator Studio</Link></div></Shell>
  if (persisted && persisted.status !== 'draft' && !canReviseTemplate(persisted)) return <Shell><Link className="text-sm font-bold text-slate-500" to="/creator">← Creator Studio</Link><section className={`mt-8 rounded-2xl border p-7 ${persisted.status === 'submitted' ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}><p className="text-xs font-bold uppercase">{persisted.status === 'submitted' ? `Version ${persisted.version} submitted for Admin review` : persisted.status === 'approved' ? `Version ${persisted.version} approved` : 'Changes requested'}</p><h1 className="mt-2 text-3xl font-bold">{persisted.content.displayName}</h1><TemplateReadContext template={persisted} />{local && <LocalGeographySelector savedId={persisted.localityId} snapshot={persisted.localitySnapshot} value={undefined} onChange={() => {}} disabled />}<p className="mt-3">{persisted.status === 'changes_requested' ? 'Admin requested changes. This Template cannot be revised in its current state.' : 'This Template is read-only in its current backend status.'}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-emerald-500 px-5 font-bold" to="/creator">Return to Creator Studio</Link></section></Shell>
  return <><div hidden={!!previewContent}><Shell><Link className="text-sm font-bold text-slate-500" to="/creator">← Creator Studio</Link><div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{universal ? 'Universal Template' : local ? 'Local Template' : 'Template Builder'} · {persisted?.status === 'approved' ? 'Approved · New edits need review' : persisted?.status === 'changes_requested' ? 'Changes requested' : 'Draft'} · Version {persisted?.version ?? 1}</p><h1 className="mt-2 text-4xl font-bold">Build a reusable Hunt</h1><p className="mt-3 max-w-3xl text-slate-600">{universal ? 'Create reusable stories and challenges without a fixed country, locality or route.' : local ? 'Configure your Local draft, then save. Review its real locations and route before independent Admin approval.' : 'Create the complete participant experience and review its fixed route. Organizers receive these defaults in Set the Hunt.'}</p></div>
    {persisted && classified && <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><TemplateReadContext template={persisted} />{canReviseTemplate(persisted) && <p className="mt-3 text-sm">Save your revision as a new draft, then submit it for a separate Admin decision. Previous approval stays with the reviewed version.</p>}</div>}
    {!universal && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">This geographic draft requires geographic placement, pedestrian route inspection, crossing and accessibility review, and local physical verification. Safety checkboxes and point confirmations are temporary session reminders; they are not saved proof of field verification.</p>}
    <fieldset disabled={saving || submitting} className="min-w-0 border-0 p-0"><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-emerald-700">Block 1</p><h2 className="mt-2 text-2xl font-bold">Template Setup</h2><p className="mt-1 text-sm text-slate-500">Event date, local contact and participant access remain Organizer settings.</p></div><Progress done={stepDone.size} total={steps.length} /></div><div className="mt-6 grid gap-5 lg:grid-cols-[250px_1fr]"><nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2">{steps.map((name, index) => <button key={name} type="button" onClick={() => setStep(index)} className={`flex min-h-12 min-w-56 items-center justify-between rounded-xl border px-4 text-left text-sm font-bold lg:w-full ${step === index ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><span>{index + 1}. {name}</span>{stepDone.has(index) && <span className="text-emerald-600">✓</span>}</button>)}</nav><article className="min-w-0 rounded-xl border border-slate-200 p-5"><p className="text-xs font-bold uppercase text-emerald-700">Setup {step + 1} of {steps.length}</p><h3 className="mt-2 text-xl font-bold">{steps[step]}</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">
      {step === 0 && <><label className="text-sm font-bold sm:col-span-2">Template name<input className={field} value={details.name} onChange={e => setDetails({ ...details, name: e.target.value })} /></label><label className="text-sm font-bold sm:col-span-2">Short description<textarea className={`${field} min-h-24 py-3`} value={details.summary} onChange={e => setDetails({ ...details, summary: e.target.value })} /></label><label className="text-sm font-bold">Category<select className={field} value={details.category} onChange={e => setDetails({ ...details, category: e.target.value })}><option>Mathematics</option><option>History</option><option>Science</option><option>Mixed</option></select></label><label className="text-sm font-bold">Age range<input className={field} value={details.age} onChange={e => setDetails({ ...details, age: e.target.value })} /></label><label className="text-sm font-bold">Duration (minutes)<input className={field} type="number" value={details.duration} onChange={e => setDetails({ ...details, duration: e.target.value })} /></label><label className="text-sm font-bold">Language<select className={field} value={details.language} onChange={e => setDetails({ ...details, language: e.target.value })}><option>English</option><option>Romanian</option><option>Hungarian</option></select></label><label className="text-sm font-bold sm:col-span-2">Difficulty<select className={field} value={details.difficulty} onChange={e => setDetails({ ...details, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Advanced</option><option>Organizer sets</option></select></label></>}
      {step === 1 && <><label className="text-sm font-bold">Participant range<input className={field} value={details.participants} onChange={e => setDetails({ ...details, participants: e.target.value })} /></label><label className="text-sm font-bold">Team-size range<input className={field} value={details.teamSize} onChange={e => setDetails({ ...details, teamSize: e.target.value })} /></label><label className="text-sm font-bold sm:col-span-2">Supported format<select className={field} value={details.format} onChange={e => setDetails({ ...details, format: e.target.value })}><option>Team Hunters</option><option>Single Hunters</option><option>Single and Team Hunters</option></select></label><label className="text-sm font-bold sm:col-span-2">Environment and accessibility<input className={field} value={details.environment} onChange={e => setDetails({ ...details, environment: e.target.value })} /></label><label className="text-sm font-bold sm:col-span-2">Required equipment<input className={field} value={details.equipment} onChange={e => setDetails({ ...details, equipment: e.target.value })} /></label><div className="rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2"><strong>Platform scoring</strong><p className="mt-1 text-slate-500">Creators define answers and measurable events. All Hunts use Tedixhunt’s common scoring rules.</p></div></>}
      {step === 2 && <><label className="text-sm font-bold">Hunt theme<select className={field} value={details.theme} onChange={e => setDetails({ ...details, theme: e.target.value })}>{!['Smart Theme (Signal)', 'City Secrets Theme', 'Ho Ho Theme (Christmas)', 'Scary Theme (Halloween)'].includes(details.theme) && <option>{details.theme}</option>}<option>Smart Theme (Signal)</option><option>City Secrets Theme</option><option>Ho Ho Theme (Christmas)</option><option>Scary Theme (Halloween)</option></select></label>{missionStoryFields(mission).map(([key, text]) => <label key={key} className="text-sm font-bold sm:col-span-2">Mission {key}<textarea className={`${field} min-h-20 py-3`} value={text} onChange={e => setMission(current => editMissionStory(current, key, e.target.value))} /></label>)}<label className="text-sm font-bold sm:col-span-2">Hunt mission<textarea className={`${field} min-h-24 py-3`} value={details.summary} onChange={e => setDetails({ ...details, summary: e.target.value })} /></label><label className="text-sm font-bold sm:col-span-2">Participant briefing<textarea className={`${field} min-h-24 py-3`} value={details.briefing} onChange={e => setDetails({ ...details, briefing: e.target.value })} /></label><div className="rounded-xl bg-[#031b14] p-5 text-white sm:col-span-2"><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Mission preview</p><h4 className="mt-3 text-2xl font-bold">{missionStoryFields(mission).find(([key]) => key === 'name')?.[1] ?? ''}</h4><p className="mt-2 text-sm text-slate-200">{missionStoryFields(mission).find(([key]) => key === 'briefing')?.[1] ?? details.briefing}</p></div></>}
      {step === 3 && <div className="sm:col-span-2"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-800">Current status</p><p className="mt-2 text-xl font-bold">{persisted?.status === 'approved' ? 'Approved · New edits need review' : persisted?.status === 'changes_requested' ? 'Changes requested' : 'Draft'} · Version {persisted?.version ?? 1}</p><p className="mt-2 text-sm">Editable until submitted for Admin review.</p></div><div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm"><div className="rounded-xl bg-slate-50 p-4"><strong>Submitted</strong><p className="mt-1 text-slate-500">Version locked</p></div><div className="rounded-xl bg-slate-50 p-4"><strong>Changes requested</strong><p className="mt-1 text-slate-500">{classified ? 'Save a new draft, then submit it for review' : 'Revision unavailable for this legacy Template'}</p></div><div className="rounded-xl bg-slate-50 p-4"><strong>Approved</strong><p className="mt-1 text-slate-500">{universal ? 'Independent review publishes the approved version to the Universal Library' : local ? 'Requires independent Local review; Organizer availability remains gated' : 'Available in Set the Hunt'}</p></div></div></div>}
    </div><div className={feature.id === 'positions' ? 'mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5' : 'mt-6 flex justify-between border-t border-slate-100 pt-5'}><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold disabled:opacity-40">Previous</button><button type="button" onClick={saveStep} className="min-h-12 rounded-xl bg-emerald-500 px-6 font-bold">{step === steps.length - 1 ? 'Complete Template Setup' : universal ? 'Continue' : 'Save & continue'}</button></div></article></div></section>
    {local && <LocalGeographySelector savedId={persisted?.localityId} snapshot={persisted?.localitySnapshot} value={localityChange} onChange={setLocalityChange} disabled={saving || submitting} />}
    <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-emerald-700">Block 2</p><h2 className="mt-2 text-2xl font-bold">Hunt Features</h2><p className="mt-1 text-sm text-slate-500">Build the approved defaults checkpoint by checkpoint.</p></div><Progress done={featureDone.size} total={features.length} /></div>{saveError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">{saveError} {universal ? 'Your working content is kept. Review the message before saving again.' : 'Your working content is still here; use Complete Hunt Features to retry.'}</div>}<div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]"><nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2">{features.map((item, index) => <button key={item.id} type="button" onClick={() => { setFeatureIndex(index); setMode('existing') }} className={`flex min-h-12 min-w-60 items-center justify-between rounded-xl border bg-white px-4 text-left text-sm font-bold lg:w-full ${featureIndex === index ? 'border-emerald-500 bg-emerald-50' : ''}`}><span><span className="mr-2 text-slate-400">{index + 1}.</span>{item.name}</span>{featureDone.has(item.id) && <span className="text-emerald-600">✓</span>}</button>)}</nav><article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-emerald-700">Feature {featureIndex + 1} of {features.length}</p><h3 className="mt-2 text-2xl font-bold">{feature.name}</h3>{feature.id === 'count' ? <CheckpointCountEditor count={checkpointCount} onChange={count => { const drafts = resizeCheckpointDrafts(checkpointDrafts, count, normalCheckpointNames(count)); setCheckpointCount(count); setGameplayEdited(true); setCheckpointDrafts(drafts); setNormalGameplay(current => Array.from({ length: count }, (_, index) => current[index] ?? {})); setTemplateConfiguration(current => ({ ...current, ...buildGeographyConfiguration(count, drafts) })); setVerifiedPositions(new Set()); setFeatureDone(current => { const next = new Set(current); next.delete('positions'); return next }); setRouteSafe(false); setTested(false) }} /> : checkpointFeatures.has(feature.id) ? <CheckpointEditor names={checkpointDrafts.map(point => point.name)} checkpointCount={checkpointCount} featureId={feature.id} gameplay={normalGameplay} onChange={value => { setNormalGameplay(value); setGameplayEdited(true); setTested(false) }} /> : feature.id === 'positions' ? <RouteEditor drafts={checkpointDrafts} onArrivalNotesChange={(number, notes) => { setArrivalNotes(current => ({ ...current, [number]: notes })); setTested(false) }} templateName={creatorTemplateContent.displayName} finishDraft={finishPointDraft} onFinishChange={point => { setFinishPointEdited(true); setFinishPointDraft(point); setTested(false) }} savedConfiguration={persisted?.content.configuration} proposal={readRouteProposal(creatorTemplateContent.routeResearch)} verified={verifiedPositions} safety={routeSafety} onDraftsChange={setCheckpointDrafts} onVerifiedChange={setVerifiedPositions} onSafetyChange={setRouteSafety} onConfigurationChange={configuration => setTemplateConfiguration(current => ({ ...current, ...configuration }))} /> : feature.id === 'rewards' ? <RewardBoundary /> : feature.id === 'final' ? <>{!universal && <FinishPointEditor proposal={readRouteProposal(creatorTemplateContent.routeResearch)} draft={finishPointDraft} onChange={point => { setFinishPointEdited(true); setFinishPointDraft(point); setTested(false) }} />}{!terminalGameplay && <button type="button" className="mt-4 min-h-12 rounded-xl border border-slate-300 px-4 font-bold" onClick={() => { setTerminalGameplay({ role: 'terminal' }); setGameplayEdited(true); setTested(false) }}>Configure FinishPoint gameplay</button>}<CheckpointGameplayEditor value={terminalGameplay ?? {}} onChange={value => { setTerminalGameplay({ ...value, role: 'terminal' }); setGameplayEdited(true); setTested(false) }} /><GameplayScoring scoring={creatorTemplateContent.scoring} /><p className="mt-4 text-sm text-slate-500">FinishPoint uses the same checkpoint activities with a terminal role. Personal and Team Challenges are optional.</p></> : <><div className="mt-5 flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setMode('existing')} className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${mode === 'existing' ? 'bg-white shadow' : ''}`}>Use Signal default</button><button type="button" onClick={() => setMode('new')} className={`min-h-10 flex-1 rounded-lg text-sm font-bold ${mode === 'new' ? 'bg-white shadow' : ''}`}>Create new</button></div>{mode === 'existing' ? <label className="mt-5 block text-sm font-bold">Approved component<select className={field} value={selections[feature.id] ?? 0} onChange={e => setSelections({ ...selections, [feature.id]: Number(e.target.value) })}>{feature.templates.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}</select></label> : <div className="mt-5 grid gap-4"><label className="text-sm font-bold">Component name<input className={field} placeholder={`New ${feature.name}`} /></label><label className="text-sm font-bold">Participant behavior<textarea className={`${field} min-h-24 py-3`} /></label></div>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Creator note</p><p className="mt-2 text-sm">{template.note}</p></div><div className="rounded-xl bg-[#031b14] p-4 text-white"><p className="text-xs font-bold uppercase text-emerald-300">Participant preview</p><p className="mt-3 text-lg font-bold">{mode === 'existing' ? template.name : `New ${feature.name}`}</p><p className="mt-2 text-sm text-slate-200">{template.example}</p></div></div></>}<div className={feature.id === 'positions' ? 'mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5' : 'mt-6 flex justify-between border-t border-slate-100 pt-5'}><button type="button" disabled={featureIndex === 0} onClick={() => setFeatureIndex(featureIndex - 1)} className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold disabled:opacity-40">Previous</button><button type="button" disabled={saving || (feature.id === 'positions' && !routeSafe)} onClick={saveFeature} className="min-h-12 rounded-xl bg-emerald-500 px-6 font-bold disabled:bg-slate-300">{saving ? 'Saving Template…' : feature.id === 'positions' && !routeSafe ? 'Confirm positions and review reminders first' : featureIndex === features.length - 1 ? 'Complete Hunt Features' : universal ? 'Continue' : 'Save & continue'}</button></div></article></div></section>
    </fieldset>
    <button type="button" disabled={saving || submitting || uncertain || conflict} onClick={() => void persistWorkingTemplate(featureDone, true)} className="mt-6 min-h-12 rounded-xl border border-emerald-500 px-5 font-bold">{saving ? 'Saving Template…' : 'Save draft'}</button>
    {conflict && <button type="button" onClick={() => { if (templateKey) setReload(value => value + 1); else if (persisted) { setLoadingTemplate(true); creatorTemplatesApi.get(persisted.key).then(hydrateRecord).catch(reason => setLoadError(creatorTemplateError(reason, 'load'))).finally(() => setLoadingTemplate(false)) } setSaveError('') }} className="ml-3 min-h-12 rounded-xl border px-4 font-bold">Reopen saved version (discard edits)</button>}
    {uncertain && <Link to="/creator" className="ml-3 inline-flex min-h-12 items-center font-bold underline">Check My Templates</Link>}
    <section id="creator-review" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-emerald-700">Block 3</p><h2 className="mt-2 text-2xl font-bold">Review & Submit</h2><p className="mt-1 text-sm text-slate-500">Validate the complete participant journey before asking Admin to approve this version.</p>{!universal && <WalkingRouteInspection configuration={creatorTemplateContent.configuration} />}<div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{(universal ? [['Latest version saved', !!persisted && templateContentEqual(creatorTemplateContent, persisted.content)], ['Gameplay valid', !finishError]] as const : checks).map(([label, done]) => <div key={label} className={`rounded-xl border p-3 text-sm font-bold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-500'}`}><span className="mr-2">{done ? '✓' : '○'}</span>{label}</div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><button ref={previewTrigger} type="button" onClick={() => { setPreviewContent(structuredClone(creatorTemplateContent)); setPreviewed(true); setTested(false) }} className={`min-h-14 rounded-xl border px-4 font-bold ${previewed ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white'}`}>{previewed ? '✓ Journey previewed' : 'Preview full journey'}</button><button type="button" disabled={universal ? !!finishError : !allInfo || !allFeatures || !routeSafe || !previewed || !!finishError} onClick={() => setTested(true)} className={`min-h-14 rounded-xl px-4 font-bold disabled:bg-slate-300 ${tested ? 'border border-emerald-400 bg-emerald-50 text-emerald-900' : 'bg-slate-950 text-white'}`}>{tested ? '✓ Validation passed' : 'Run template validation'}</button><button type="button" disabled={!ready || !persisted || saving || submitting || conflict || localityChange !== undefined || (classified && persisted.status !== 'draft') || !templateContentEqual(creatorTemplateContent, persisted.content)} onClick={submit} className="min-h-14 rounded-xl bg-emerald-500 px-4 font-bold disabled:bg-slate-300">{submitting ? 'Submitting…' : 'Submit version to Admin'}</button></div>{finishError && <p role="status" className="mt-4 text-sm font-bold text-amber-800">{finishError}</p>}{submitError && <p role="alert" className="mt-4 text-sm font-bold text-red-700">{submitError}</p>}{(!ready || !persisted || (persisted && !templateContentEqual(creatorTemplateContent, persisted.content))) && <p className="mt-4 text-sm font-bold text-slate-500">{universal ? 'Save your changes before submitting the exact saved version. Approval is a separate Admin decision.' : 'Complete and save every readiness item before submitting the latest persisted version.'}</p>}</section>
  </Shell></div>{previewContent && <ParticipantPreview content={previewContent} onExit={() => { setPreviewContent(null); queueMicrotask(() => previewTrigger.current?.focus()) }} />}</>
}
