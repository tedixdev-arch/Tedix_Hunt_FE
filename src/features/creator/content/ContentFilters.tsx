import { control } from '../exercises/ExerciseRenderer'
import type { ContentFilters as Filters, ContentRecord } from './catalog'

/** Options come only from associations present in the supplied collection. */
export function ContentFilters({ items, value, onChange }: { items: readonly ContentRecord[]; value: Filters; onChange: (v: Filters) => void }) {
  const associations = items.flatMap(item => item.curriculum)
  const options = (key: 'grade' | 'main' | 'unit' | 'lesson') => [...new Set(associations.filter(c =>
    (value.grade === 'Mix' || key === 'grade' || String(c.grade) === value.grade) &&
    (value.main === 'Mix' || key === 'grade' || key === 'main' || c.main === value.main) &&
    (!value.unit || key !== 'lesson' || c.unitId === value.unit)
  ).map(c => key === 'unit' ? c.unitId : key === 'lesson' ? c.lessonId : String(c[key])).filter((v): v is string => !!v))]
  return <fieldset className="mt-5"><legend className="font-bold">Filter Content</legend>
    <div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Category<select aria-label="Category" className={`${control} mt-1 w-full bg-white`} value={value.domain} onChange={e => onChange({ ...value, domain: e.target.value, grade: 'Mix', main: 'Mix', unit: '', lesson: '' })}><option value="Mix">All categories</option>{associations.some(c => c.domain === 'Math') && <option value="Math">Mathematics</option>}</select></label>
    <label className="text-sm font-bold">Search<input type="search" className={`${control} mt-1 w-full`} value={value.query} onChange={e => onChange({ ...value, query: e.target.value })} /></label></div>
    {value.domain === 'Math' && <details className="mt-3"><summary className="min-h-11 cursor-pointer py-2 font-bold">Curriculum filters</summary><div className="grid gap-3 sm:grid-cols-2">{(['grade', 'main', 'unit', 'lesson'] as const).map((key, index) => <label key={key} className="text-sm font-bold">{['Grade', 'Main', 'Unit', 'Lesson'][index]}<select aria-label={['Grade', 'Main', 'Unit', 'Lesson'][index]} disabled={key === 'main' && value.grade === 'Mix' || key === 'unit' && (value.grade === 'Mix' || value.main === 'Mix') || key === 'lesson' && !value.unit} className={`${control} mt-1 w-full bg-white disabled:opacity-50`} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value, ...(key === 'grade' ? { main: 'Mix', unit: '', lesson: '' } : key === 'main' ? { unit: '', lesson: '' } : key === 'unit' ? { lesson: '' } : {}) })}><option value={key === 'grade' || key === 'main' ? 'Mix' : ''}>All</option>{options(key).map(v => <option key={v}>{v}</option>)}</select></label>)}</div></details>}
  </fieldset>
}
