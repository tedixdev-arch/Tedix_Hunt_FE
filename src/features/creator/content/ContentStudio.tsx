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

export function ContentStudio({ active }: { active: boolean }) {
  const [view, setView] = useState<'create' | 'library'>('create')
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const fresh = (team: boolean): AuthoringDraft => ({ source: 'custom', assignment: 'predefined', custom: authorPrototype(independentExercise(team ? teamExample('scrambled-word') : prototypes[0])) })
  const [drafts, setDrafts] = useState<Record<string, AuthoringDraft>>(() => ({ 'Personal Challenges': fresh(false), 'Team Challenges': fresh(true) }))
  const dirty = Object.values(drafts).some(d => !!d.custom)
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
      {category === 'Navigation Hints' ? <p className="mt-4">Navigation Hints are configured in Templates. Standalone hint authoring is unavailable.</p> : <LibraryAuthoring key={category} team={category === 'Team Challenges'} draft={drafts[category]} onDraftChange={d => setDrafts(old => ({ ...old, [category]: d }))} onDiscard={() => setDrafts(old => ({ ...old, [category]: fresh(category === 'Team Challenges') }))} />}
    </div>}
    {!active && dirty && <span className="sr-only">Session drafts retained</span>}
  </section>
}
