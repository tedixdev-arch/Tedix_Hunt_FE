import { useBlocker } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ContentLibrary } from './ContentLibrary'
import { categories, type ContentCategory } from './catalog'
import { LibraryAuthoring } from './LibraryAuthoring'
import { independentExercise, prototypes } from '../exercises/catalog'
import { authorPrototype } from '../exercises/persistenceAdapter'
import { teamExample } from '../exercises/teamExamples'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { templateCategories, categoryFilters } from './classification'
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
  return { draft, baseline: draftContent(draft), subject: '', scope: { ...universalScope } as ContentScope }
}

export function ContentStudio({ active }: { active: boolean }) {
  const [view, setView] = useState<'create' | 'library'>('create')
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const [sessions, setSessions] = useState<Record<string, ReturnType<typeof freshSession>>>(() => ({ 'Personal Challenges': freshSession(false), 'Team Challenges': freshSession(true) }))
  const dirty = Object.values(sessions).some(({ draft, baseline }) => draftContent(draft) !== baseline) || Object.values(sessions).some(s => !!s.subject || !!s.scope.country)
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
  return <section aria-label="Content" className="content-studio mt-6 min-w-0">
    <div aria-label="Content workflows" className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">{(['create', 'library'] as const).map(key => <button key={key} type="button" aria-pressed={view === key} className={`${control} font-medium ${view === key ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`} onClick={() => setView(key)}>{key === 'create' ? 'Create Content' : 'Library'}</button>)}</div>
    <div className={view === 'create' ? 'mx-auto mt-6 max-w-[720px]' : 'mt-6'}>
    {view === 'create' && <h2 className="mb-6 text-2xl font-semibold tracking-tight">Create Content</h2>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">Content type<select aria-label="Content type" className={`${control} mt-2 w-full bg-white`} value={category} onChange={e => setCategory(e.target.value as ContentCategory)}>{categories.map((name, i) => <option key={name} value={name}>{['Personal Challenge', 'Team Challenge', 'Navigation Hint'][i]}</option>)}</select></label>
      {view === 'create' && category !== 'Navigation Hints' && <label className="block text-sm font-medium">Category<select aria-label="Exercise category" className={`${control} mt-2 w-full bg-white`} value={sessions[category].subject} onChange={e => setSessions(old => ({ ...old, [category]: { ...old[category], subject: e.target.value } }))}><option value="">Unclassified draft</option>{[...new Set([...templateCategories, ...Object.keys(categoryFilters)])].map(name => <option key={name} value={name}>{name}</option>)}</select></label>}
    </div>
    {view === 'library' ? <ContentLibrary category={category} /> : <div className="mt-6 min-w-0">
      {category === 'Navigation Hints' ? <p>Navigation Hints are configured in Templates.</p> : <>
        <details className="mb-6 border-y border-slate-200"><summary className="min-h-12 cursor-pointer py-3 text-sm font-medium">Classification &amp; Location</summary>
          {sessions[category].subject === 'Mathematics' && <div className="grid gap-4 pb-4 sm:grid-cols-2">{mathematicsLevels.map(level => <label key={level.key} className="text-sm">{level.label}<select aria-label={level.label} disabled className={`${control} mt-1 w-full`}><option value="">Unavailable</option></select></label>)}</div>}
          <ContentGeography value={sessions[category].scope} onChange={scope => setSessions(old => ({ ...old, [category]: { ...old[category], scope } }))} />
        </details>
        <LibraryAuthoring key={category} team={category === 'Team Challenges'} draft={sessions[category].draft} metadata={{ category: sessions[category].subject, scope: sessions[category].scope }} onDraftChange={draft => setSessions(old => ({ ...old, [category]: { ...old[category], draft } }))} onDiscard={() => setSessions(old => ({ ...old, [category]: freshSession(category === 'Team Challenges') }))} />
      </>}
    </div>}
    </div>
    {!active && dirty && <span className="sr-only">Session drafts retained</span>}
  </section>
}
