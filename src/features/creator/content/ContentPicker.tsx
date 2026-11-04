import { useState } from 'react'
import { ContentSelection } from './ContentSelection'
import { filterContent, initialFilters, starterContent, type ContentCategory, type ContentRecord } from './catalog'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'
import { typeName } from '../exercises/catalog'

/** Select individual records for local simulation only; never assigns a library revision. */
export function ContentPicker({ section, items = starterContent, selectedId, onSelect }: {
  section: ContentCategory; items?: readonly ContentRecord[]; selectedId?: string; onSelect?: (item: ContentRecord) => void
}) {
  const [filters, setFilters] = useState(initialFilters)
  const [preview, setPreview] = useState<ContentRecord | null>(null)
  const visible = filterContent(items, section, filters)
  return <section aria-label="Content exercise picker" className="min-w-0">
    <ContentSelection filters={filters} onChange={setFilters} items={items.filter(item => item.category === section)} />
    <h3 className="mt-6 text-lg font-bold">{section}</h3>
    <p role="status" className="mt-1 text-sm text-slate-600">{visible.length} Starter {visible.length === 1 ? 'example' : 'examples'}</p>
    {visible.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-bold text-emerald-800">{item.collection.name} · Protected example</p>
      <h4 className="mt-2 font-bold">{item.exercise.title}</h4><p className="mt-1 text-sm text-slate-600">{typeName(item.mechanic)}</p>
      <dl className="mt-2 text-xs text-slate-600"><dt className="inline font-bold">Category: </dt><dd className="inline">{item.activityCategory ?? item.curriculum[0]?.category ?? 'Unclassified'}</dd><dt className="mt-1 font-bold">Geographic applicability</dt><dd>{item.geography ? [item.geography.country, item.geography.region, item.geography.city].filter(Boolean).join(' / ') || 'Universal' : 'Unclassified'}</dd></dl>
      <p className="mt-2 flex-1 break-words text-sm">{item.exercise.instructions}</p>
      <button type="button" className={`${control} mt-4 w-full font-bold`} aria-label={`Preview ${item.exercise.title}`} onClick={() => setPreview(item)}>Playable preview</button>
      {onSelect && <button type="button" className={`${control} mt-2 w-full`} aria-pressed={selectedId === item.id} onClick={() => onSelect(item)}>Try example: {item.exercise.title}</button>}
    </li>)}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-5">{!items.some(item => item.category === section) ? 'No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.' : 'No Starter examples match these filters. Reset filters to browse unclassified examples.'}</p>}
    {preview && <ExercisePreview key={preview.id} exercise={preview.exercise} onClose={() => setPreview(null)} />}
  </section>
}
