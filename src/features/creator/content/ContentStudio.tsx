import { useBlocker } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ContentLibrary } from './ContentLibrary'
import { categories, type ContentCategory } from './catalog'
import { LibraryAuthoring } from './LibraryAuthoring'
import { independentExercise, prototypes } from '../exercises/catalog'
import { authorPrototype } from '../exercises/persistenceAdapter'
import { teamExample } from '../exercises/teamExamples'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
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
  return { draft, baseline: draftContent(draft) }
}

export function ContentStudio({ active }: { active: boolean }) {
  const [view, setView] = useState<'create' | 'library'>('create')
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const [sessions, setSessions] = useState<Record<string, ReturnType<typeof freshSession>>>(() => ({ 'Personal Challenges': freshSession(false), 'Team Challenges': freshSession(true) }))
  const dirty = Object.values(sessions).some(({ draft, baseline }) => draftContent(draft) !== baseline)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Leave Content? Unsaved session drafts will be lost.')) blocker.proceed()
    else blocker.reset()
  }, [blocker])
  useEffect(() => {
    if (!dirty) return
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', unload)
    return () => { window.removeEventListener('beforeunload', unload) }
  }, [dirty])
  return <section aria-label="Content" className="mt-6 min-w-0">
    <h2 className="text-2xl font-bold">Content</h2>
    <div aria-label="Content workflows" className="mt-4 flex flex-wrap gap-2">{(['create', 'library'] as const).map(key => <button key={key} type="button" aria-pressed={view === key} className={`${control} font-bold ${view === key ? 'bg-emerald-100 border-emerald-700' : 'bg-white'}`} onClick={() => setView(key)}>{key === 'create' ? 'Create Content' : 'Library'}</button>)}</div>
    <div aria-label="Content categories" className="mt-4 flex flex-wrap gap-2">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} className={`${control} ${category === name ? 'bg-emerald-100 font-bold' : 'bg-white'}`} onClick={() => setCategory(name)}>{name}</button>)}</div>
    {view === 'library' ? <ContentLibrary category={category} /> : <div className="mt-5 min-w-0 rounded-2xl border bg-white p-4 sm:p-6">
      <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm font-bold">Unsaved session drafts only. Content is not saved to a library. Switching sections keeps drafts in this session; leaving or reloading loses them.</p>
      {category === 'Navigation Hints' ? <p className="mt-4">Navigation Hints are configured in Templates. Standalone hint authoring is unavailable.</p> : <LibraryAuthoring key={category} team={category === 'Team Challenges'} draft={sessions[category].draft} onDraftChange={draft => setSessions(old => ({ ...old, [category]: { ...old[category], draft } }))} onDiscard={() => setSessions(old => ({ ...old, [category]: freshSession(category === 'Team Challenges') }))} />}
    </div>}
    {!active && dirty && <span className="sr-only">Session drafts retained</span>}
  </section>
}
