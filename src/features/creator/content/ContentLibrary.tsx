import { useEffect, useState } from 'react'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'
import { typeName } from '../exercises/catalog'
import { filterContent, initialFilters, starterContent, type ContentCategory, type ContentRecord } from './catalog'
import { ContentFilters } from './ContentFilters'

export function ContentLibrary({ items = starterContent, category = 'Personal Challenges' }: { items?: readonly ContentRecord[]; category?: ContentCategory }) {
  const [filters, setFilters] = useState(initialFilters)
  useEffect(() => { setFilters(initialFilters) }, [category])
  const [preview, setPreview] = useState<ContentRecord | null>(null)
  const [location, setLocation] = useState({ country: '', region: '', city: '' })
  const available = items.filter(i => i.collection.id !== 'repository-starters' && i.approvalStatus === 'approved')
  const locations = available.flatMap(i => i.location ? [i.location] : [])
  const located = available.filter(i => (!location.country || i.location?.country === location.country) && (!location.region || i.location?.region === location.region) && (!location.city || i.location?.city === location.city))
  const visible = filterContent(located, category, filters)
  const starters = items.filter(i => i.collection.id === 'repository-starters' && i.category === category)
  const cards = (records: readonly ContentRecord[]) => <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map(item => <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4"><h4 className="font-bold">{item.exercise.title}</h4><p className="mt-1 text-sm text-slate-600">{typeName(item.mechanic)}</p><p className="mt-2 flex-1 text-sm">{item.exercise.instructions}</p><button type="button" className={`${control} mt-4 w-full font-bold`} aria-label={`Preview ${item.exercise.title}`} onClick={() => setPreview(item)}>Playable preview</button></li>)}</ul>
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Library</h2>
    <fieldset className="mt-5"><legend className="font-bold">Choose Location</legend><div className="mt-2 grid gap-3 sm:grid-cols-3">{(['country', 'region', 'city'] as const).map((key, index) => <label key={key} className="min-w-0 text-sm font-bold">{['Country', 'County/Region', 'City'][index]}<select aria-label={['Country', 'County/Region', 'City'][index]} value={location[key]} className={`${control} mt-1 w-full bg-white`} onChange={e => setLocation({ ...location, [key]: e.target.value, ...(key === 'country' ? { region: '', city: '' } : key === 'region' ? { city: '' } : {}) })}><option value="">Universal</option>{[...new Set(locations.filter(l => (!location.country || key === 'country' || l.country === location.country) && (!location.region || key !== 'city' || l.region === location.region)).map(l => l[key]).filter(Boolean))].map(v => <option key={v}>{v}</option>)}</select></label>)}</div></fieldset>
    <ContentFilters items={located.filter(i => i.category === category)} value={filters} onChange={setFilters} />
    <button type="button" className={`${control} mt-3`} onClick={() => { setFilters(initialFilters); setLocation({ country: '', region: '', city: '' }) }}>Reset filters</button>
    <details key={category} className="mt-6 rounded-xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer font-bold">Starter ({starters.length} examples)</summary><p className="mt-2 text-sm text-slate-600">Canonical repository examples. Unreviewed and separate from approved library exercises.</p>{starters.length ? cards(starters) : <p>No standalone Starter records are available for this category. Navigation settings in Templates are not reusable hint content.</p>}</details>
    <h3 className="mt-6 text-lg font-bold">Available Exercises</h3><p role="status" className="mt-1 text-sm text-slate-600">{visible.length} approved exercises</p>
    {visible.length ? cards(visible) : <p className="mt-4 rounded-xl bg-slate-50 p-5">{available.length ? 'No approved library exercises match these filters.' : 'No approved exercise feed is connected; Starter examples remain available above.'}</p>}
    {preview && <ExercisePreview key={preview.id} exercise={preview.exercise} onClose={() => setPreview(null)} />}
  </section>
}
