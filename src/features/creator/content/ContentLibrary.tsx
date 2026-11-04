import { ContentSelection } from './ContentSelection'
import { LibraryAuthoring } from './LibraryAuthoring'
import { useState } from 'react'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'
import { typeName } from '../exercises/catalog'
import { categories, filterContent, initialFilters, starterContent, type ContentCategory, type ContentRecord } from './catalog'

/** Read-only C1 browser; no assignment, editing or persistence side effects. */
export function ContentLibrary({ items = starterContent }: { items?: readonly ContentRecord[] }) {
  const [authoring, setAuthoring] = useState<'personal' | 'team' | null>(null)
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const [filters, setFilters] = useState(initialFilters)
  const [preview, setPreview] = useState<ContentRecord | null>(null)
  const visible = filterContent(items, category, filters)
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Content</h2>
    <p className="mt-2 text-sm text-slate-600">Browse Starter examples and try their playable previews. Library saving and approval are not available yet.</p>
    <div aria-label="Content categories" className="mt-5 flex flex-wrap gap-2">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)} className={`${control} ${category === name ? 'bg-emerald-100 font-bold' : ''}`}>{name}</button>)}</div>
    <ContentSelection filters={filters} onChange={setFilters} />
    {category !== 'Navigation Hints' && <button type="button" className={`${control} mt-4 font-bold`} onClick={() => { if (!authoring || window.confirm('Discard the current unsaved exercise and start another?')) { setAuthoring(null); queueMicrotask(() => setAuthoring(category === 'Team Challenges' ? 'team' : 'personal')) } }}>Create exercise</button>}
    {authoring && <LibraryAuthoring key={authoring} team={authoring === 'team'} onClose={() => setAuthoring(null)} />}
    <h3 className="mt-6 text-lg font-bold">{category}</h3>
    <p role="status" className="mt-1 text-sm text-slate-600">{visible.length} Starter {visible.length === 1 ? 'example' : 'examples'}</p>
    {visible.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-bold text-emerald-800">{item.collection.name} · Protected example</p>
      <h4 className="mt-2 font-bold">{item.exercise.title}</h4><p className="mt-1 text-sm text-slate-600">{typeName(item.mechanic)}</p>
      <p className="mt-2 flex-1 text-sm">{item.exercise.instructions}</p>
      <button type="button" className={`${control} mt-4 w-full font-bold`} aria-label={`Preview ${item.exercise.title}`} onClick={() => setPreview(item)}>Playable preview</button>
    </li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-5">{!items.some(item => item.category === category) ? 'No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.' : 'No Starter examples match these filters. Reset filters to browse unclassified examples.'}</p>}
    {preview && <ExercisePreview key={preview.id} exercise={preview.exercise} onClose={() => setPreview(null)} />}
  </section>
}
