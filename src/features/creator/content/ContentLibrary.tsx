import { ContentPicker } from './ContentPicker'
import { LibraryAuthoring } from './LibraryAuthoring'
import { useState } from 'react'
import { control } from '../exercises/ExerciseRenderer'
import { categories, starterContent, type ContentCategory, type ContentRecord } from './catalog'

/** Protected source browsing and isolated session drafts; no library persistence. */
export function ContentLibrary({ items = starterContent }: { items?: readonly ContentRecord[] }) {
  const [draftSession, setDraftSession] = useState(0)
  const [authoring, setAuthoring] = useState<'personal' | 'team' | null>(null)
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Content</h2>
    <p className="mt-2 text-sm text-slate-600">Browse Starter examples and try their playable previews. Library saving and approval are not available yet.</p>
    <div aria-label="Content categories" className="mt-5 flex flex-wrap gap-2">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => { if (name === category) return; if (authoring && !window.confirm('Discard this unsaved exercise and change content section?')) return; setAuthoring(null); setCategory(name) }} className={`${control} ${category === name ? 'bg-emerald-100 font-bold' : ''}`}>{name}</button>)}</div>
    {category !== 'Navigation Hints' && <button type="button" className={`${control} mt-4 font-bold`} onClick={() => { if (!authoring || window.confirm('Discard the current unsaved exercise and start another?')) { setDraftSession(value => value + 1); setAuthoring(category === 'Team Challenges' ? 'team' : 'personal') } }}>Create exercise</button>}
    {authoring && <LibraryAuthoring key={draftSession} team={authoring === 'team'} onClose={() => setAuthoring(null)} />}
    <ContentPicker key={category} section={category} items={items} />
  </section>
}
