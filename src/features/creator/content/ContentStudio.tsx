import { useBlocker } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ContentLibrary } from './ContentLibrary'
import { categories, type ContentCategory } from './catalog'
import { LibraryAuthoring } from './LibraryAuthoring'
import { independentExercise, prototypes } from '../exercises/catalog'
import { authorPrototype } from '../exercises/persistenceAdapter'
import { teamExample } from '../exercises/teamExamples'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { creatorContentApi, contentCategories, contentError, type LibraryContent } from '../../../services/api/creatorContent'
import { libraryEditor, type LibraryMetadata } from './libraryAdapter'
import { mathematicsLevels } from './curriculum'
import { ContentGeography, universalScope, type ContentScope } from './ContentGeography'
import './contentStudio.css'
import { control } from '../exercises/ExerciseRenderer'

// Compare authored content, including retained mechanic variants, rather than editor-view metadata.
function draftContent(draft: AuthoringDraft) {
  const variants = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
  return JSON.stringify({ type: draft.custom?.type, empty: !!draft.emptySelection, variants }, (_key, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value)
}
function freshSession(team: boolean) {
  const draft: AuthoringDraft = { source: 'custom', assignment: 'predefined', custom: authorPrototype(independentExercise(team ? teamExample('scrambled-word') : prototypes[0])) }
  const metadata: LibraryMetadata = { category: '', grade: '', scope: { ...universalScope } as ContentScope }
  return { draft, metadata, baseline: sessionContent(draft, metadata), record: undefined as LibraryContent | undefined, savedVariants: {} as Record<string, string> }
}

function sessionContent(draft: AuthoringDraft, metadata: LibraryMetadata) { return draftContent(draft) + JSON.stringify(metadata) }

export function ContentStudio({ active }: { active: boolean }) {
  const [view, setView] = useState<'create' | 'library'>('create')
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const [sessions, setSessions] = useState<Record<string, ReturnType<typeof freshSession>>>(() => ({ 'Personal Challenges': freshSession(false), 'Team Challenges': freshSession(true) }))
  const dirty = Object.values(sessions).some(s => sessionContent(s.draft, s.metadata) !== s.baseline || Object.values(s.draft.customByType ?? {}).some(exercise => exercise.type !== s.draft.custom?.type && s.savedVariants[exercise.type] !== draftContent({ source: 'custom', assignment: 'predefined', custom: exercise })))
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)
  const updateMetadata = (patch: Partial<LibraryMetadata>) => setSessions(old => ({ ...old, [category]: { ...old[category], metadata: { ...old[category].metadata, ...patch } } }))
  const openDraft = async (id: string, reload = false) => {
    if (loading) return
    if ((reload || dirty) && !window.confirm('Replace the local draft with the saved version? Unsaved edits will be lost.')) return
    setLoading(true); setLoadError('')
    try {
      const record = await creatorContentApi.get(id)
      const { draft, metadata } = libraryEditor(record)
      const section = record.exercise.classification === 'team' ? 'Team Challenges' : 'Personal Challenges'
      setSessions(old => ({ ...old, [section]: { draft, metadata, record, baseline: sessionContent(draft, metadata), savedVariants: { [record.exercise.type]: draftContent(draft) } } }))
      setCategory(section); setView('create')
    } catch (error) { setLoadError(contentError(error)) } finally { setLoading(false) }
  }
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (dirty || saving) && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Leave Content? Unsaved session drafts will be lost.')) blocker.proceed()
    else blocker.reset()
  }, [blocker])
  useEffect(() => {
    if (!dirty && !saving) return
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', unload)
    return () => { window.removeEventListener('beforeunload', unload) }
  }, [dirty, saving])
  return <section aria-label="Content" className="content-studio mt-6 min-w-0">
    {loadError && <p role="alert">{loadError}</p>}
    {loading && <p role="status">Loading exercise…</p>}
    <div aria-label="Content workflows" className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">{(['create', 'library'] as const).map(key => <button key={key} disabled={saving || loading} type="button" aria-pressed={view === key} className={`${control} font-medium ${view === key ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`} onClick={() => setView(key)}>{key === 'create' ? 'Create Content' : 'Library'}</button>)}</div>
    <div className={view === 'create' ? 'mx-auto mt-6 max-w-[720px]' : 'mt-6'}>
    {view === 'create' && <h2 className="mb-6 text-2xl font-semibold tracking-tight">Create Content</h2>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">Content type<select disabled={saving || loading} aria-label="Content type" className={`${control} mt-2 w-full bg-white`} value={category} onChange={e => setCategory(e.target.value as ContentCategory)}>{categories.map((name, i) => <option key={name} value={name}>{['Personal Challenge', 'Team Challenge', 'Navigation Hint'][i]}</option>)}</select></label>
      {view === 'create' && category !== 'Navigation Hints' && <label className="block text-sm font-medium">Category<select disabled={saving || loading} aria-label="Exercise category" className={`${control} mt-2 w-full bg-white`} value={sessions[category].metadata.category} onChange={e => updateMetadata({ category: e.target.value, grade: '', curriculum: undefined })}><option value="">Unclassified draft</option>{contentCategories.map(name => <option key={name} value={name}>{name}</option>)}</select></label>}
    </div>
    {view === 'library' ? <ContentLibrary category={category} focusId={sessions[category]?.record?.contentId} onEdit={id => void openDraft(id)} /> : <div className="mt-6 min-w-0">
      {category === 'Navigation Hints' ? <p>Navigation Hints are configured in Templates.</p> : <>
        <fieldset disabled={saving || loading}><details className="mb-6 border-y border-slate-200"><summary className="min-h-12 cursor-pointer py-3 text-sm font-medium">Classification &amp; Location</summary>
          {sessions[category].metadata.category === 'Mathematics' && <div className="grid gap-4 pb-4 sm:grid-cols-2">{mathematicsLevels.map(level => <label key={level.key} className="text-sm">{level.label}<select aria-label={level.label} disabled={level.key !== 'grade'} value={level.key === 'grade' ? sessions[category].metadata.grade : ''} onChange={e => updateMetadata({ grade: e.target.value, curriculum: undefined })} className={`${control} mt-1 w-full`}><option value="">{level.key === 'grade' ? 'Unspecified' : 'Unavailable'}</option>{level.key === 'grade' && ['5','6','7','8','9','10','11','12'].map(grade => <option key={grade}>{grade}</option>)}</select></label>)}</div>}
          <ContentGeography value={sessions[category].metadata.scope} onChange={scope => updateMetadata({ scope })} />
        </details></fieldset>
        <fieldset disabled={loading}><LibraryAuthoring key={category} team={category === 'Team Challenges'} draft={sessions[category].draft} metadata={sessions[category].metadata} record={sessions[category].record}
          onDraftChange={draft => setSessions(old => ({ ...old, [category]: { ...old[category], draft } }))}
          onDiscard={() => setSessions(old => ({ ...old, [category]: freshSession(category === 'Team Challenges') }))}
          onBusy={setSaving} onSaved={(record, persisted = true) => setSessions(old => ({ ...old, [category]: { ...old[category], record, savedVariants: persisted && old[category].draft.custom ? { ...old[category].savedVariants, [old[category].draft.custom!.type]: draftContent({ source: 'custom', assignment: 'predefined', custom: old[category].draft.custom }) } : old[category].savedVariants, baseline: persisted ? sessionContent(old[category].draft, old[category].metadata) : old[category].baseline } }))}
          onViewLibrary={() => setView('library')} onReload={() => { const id = sessions[category].record?.contentId; if (id) void openDraft(id, true) }} /></fieldset>
      </>}
    </div>}
    </div>
    {!active && dirty && <span className="sr-only">Session drafts retained</span>}
  </section>
}
