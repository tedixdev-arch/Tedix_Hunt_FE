import { useState } from 'react'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'
import { typeName } from '../exercises/catalog'
import { categories, filterContent, initialFilters, starterContent, type ContentCategory, type ContentRecord } from './catalog'

/** Read-only C1 browser; no assignment, editing or persistence side effects. */
export function ContentLibrary({ items = starterContent }: { items?: readonly ContentRecord[] }) {
  const [category, setCategory] = useState<ContentCategory>('Personal Challenges')
  const [filters, setFilters] = useState(initialFilters)
  const [preview, setPreview] = useState<ContentRecord | null>(null)
  const visible = filterContent(items, category, filters)
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Content</h2>
    <p className="mt-2 text-sm text-slate-600">Browse Starter examples and try their playable previews. These repository examples have not received shared-library approval.</p>
    <div aria-label="Content categories" className="mt-5 flex flex-wrap gap-2">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)} className={`${control} ${category === name ? 'bg-emerald-100 font-bold' : ''}`}>{name}</button>)}</div>
    <fieldset className="mt-5"><legend className="font-bold">Filter content</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {([['domain', 'Domain', ['Mix', 'Math']], ['grade', 'Grade', ['Mix', ...Array.from({ length: 8 }, (_, i) => String(i + 5))]], ['main', 'Main', ['Mix', 'Algebra', 'Geometry']]] as const).map(([key, label, options]) => <label key={key} className="min-w-0 text-sm font-bold">{label}<select aria-label={label} className={`${control} mt-1 w-full bg-white`} value={filters[key]} onChange={event => setFilters({ ...filters, [key]: event.target.value, unit: '', lesson: '' })}>{options.map(option => <option key={option}>{option}</option>)}</select></label>)}
        {(['Unit', 'Lesson'] as const).map(label => <label key={label} className="min-w-0 text-sm font-bold">{label}<select aria-describedby="curriculum-gap" disabled className={`${control} mt-1 w-full bg-slate-100`}><option>Unavailable</option></select></label>)}
        <label className="min-w-0 text-sm font-bold">Search<input type="search" className={`${control} mt-1 w-full`} value={filters.query} onChange={event => setFilters({ ...filters, query: event.target.value })} /></label>
      </div>
      <p id="curriculum-gap" className="mt-3 text-sm text-slate-600">Mix includes all content. Starter examples have no curriculum associations yet; specific curriculum filters exclude them. Unit and Lesson await an integrated curriculum catalog.</p>
      <button type="button" className={`${control} mt-3`} onClick={() => setFilters(initialFilters)}>Reset filters</button>
    </fieldset>
    <h3 className="mt-6 text-lg font-bold">{category}</h3>
    <p role="status" className="mt-1 text-sm text-slate-600">{visible.length} Starter {visible.length === 1 ? 'example' : 'examples'}</p>
    {visible.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-bold text-emerald-800">{item.collection.name} · Unreviewed</p>
      <h4 className="mt-2 font-bold">{item.exercise.title}</h4><p className="mt-1 text-sm text-slate-600">{typeName(item.mechanic)}</p>
      <p className="mt-2 flex-1 text-sm">{item.exercise.instructions}</p>
      <button type="button" className={`${control} mt-4 w-full font-bold`} aria-label={`Preview ${item.exercise.title}`} onClick={() => setPreview(item)}>Playable preview</button>
    </li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-5">{!items.some(item => item.category === category) ? 'No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.' : 'No Starter examples match these filters. Reset filters to browse unclassified examples.'}</p>}
    {preview && <ExercisePreview key={preview.id} exercise={preview.exercise} onClose={() => setPreview(null)} />}
  </section>
}
