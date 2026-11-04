import { useState } from 'react'
import { ContentSelection } from './ContentSelection'
import { filterContent, initialFilters, starterContent, type ContentCategory, type ContentRecord } from './catalog'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'
import { typeName } from '../exercises/catalog'

/** Select individual records for local simulation only; never assigns a library revision. */
export function ContentPicker({ section, items = starterContent, selectedId, onSelect, libraryView = false }: {
  libraryView?: boolean; section: ContentCategory; items?: readonly ContentRecord[]; selectedId?: string; onSelect?: (item: ContentRecord) => void
}) {
  const [filters, setFilters] = useState(initialFilters)
  const [preview, setPreview] = useState<ContentRecord | null>(null)
  const starters = items.filter(item => item.collection.id === 'repository-starters' && item.category === section)
  const available = items.filter(item => item.collection.id !== 'repository-starters' && item.approvalStatus === 'approved')
  const visible = filterContent(libraryView ? available : items, section, filters)
  const cards = (records: readonly ContentRecord[]) => <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map(item => <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4">
      <h4 className="font-bold">{item.exercise.title}</h4><p className="mt-1 text-sm text-slate-600">{typeName(item.mechanic)}</p>
      {item.activityCategory && <p className="mt-2 text-xs text-slate-600">Category: {item.activityCategory}</p>}
      <p className="mt-2 flex-1 break-words text-sm">{item.exercise.instructions}</p>
      <button type="button" className={`${control} mt-4 w-full font-bold`} aria-label={`Preview ${item.exercise.title}`} onClick={() => setPreview(item)}>Playable preview</button>
      {onSelect && <button type="button" className={`${control} mt-2 w-full`} aria-pressed={selectedId === item.id} onClick={() => onSelect(item)}>Try example: {item.exercise.title}</button>}
    </li>)}</ul>
  return <section aria-label="Content exercise picker" className="min-w-0">
    <ContentSelection filters={filters} onChange={setFilters} items={items.filter(item => item.category === section)} />
    {libraryView && <details className="mt-6 rounded-xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer font-bold">Starter ({starters.length} examples)</summary><p className="mt-2 text-sm text-slate-600">Canonical repository examples. Unreviewed and separate from approved library exercises.</p>{starters.length ? cards(starters) : <p>No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.</p>}</details>}
    <h3 className="mt-6 text-lg font-bold">{libraryView ? 'Available Exercises' : section}</h3>
    <p role="status" className="mt-1 text-sm text-slate-600">{visible.length} {libraryView ? 'approved exercises' : `Starter ${visible.length === 1 ? 'example' : 'examples'}`}</p>
    {visible.length ? cards(visible) : <p className="mt-4 rounded-xl bg-slate-50 p-5">{libraryView ? available.length ? 'No approved library exercises match these filters.' : 'No approved exercise feed is connected; Starter examples remain available above.' : !items.some(item => item.category === section) ? 'No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.' : 'No Starter examples match these filters. Reset filters to browse examples.'}</p>}
    {preview && <ExercisePreview key={preview.id} exercise={preview.exercise} onClose={() => setPreview(null)} />}
  </section>
}
