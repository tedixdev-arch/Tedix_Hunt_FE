import type { GeographicCity } from '../../../services/api/geography'
import { changeCurriculum, curriculumOptions, mathematicsLevels } from './curriculum'
import { templateCategories } from './classification'
import { ContentGeography, universalScope } from './ContentGeography'
import { control } from '../exercises/ExerciseRenderer'
import { initialFilters, starterContent, type ContentRecord, type ContentFilters } from './catalog'
/** Shared browser conventions for library and Template Predefined. No assignment operation. */
export function ContentSelection({ filters, onChange, items = starterContent, draftGrades = [], onCityResolved }: { filters: ContentFilters; onChange: (v: ContentFilters) => void; draftGrades?: string[]; onCityResolved?: (city: GeographicCity | null) => void; items?: readonly ContentRecord[] }) {
  const scope = filters.scope ?? universalScope
  const setScope = (scope: typeof universalScope) => onChange({ ...filters, scope })
  return <><ContentGeography onCityResolved={onCityResolved} value={scope} onChange={setScope} /><fieldset className="mt-4 min-w-0"><legend className="font-bold">Filter Content</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label>Category<select aria-label="Content category" className={`${control} w-full bg-white`} value={filters.category} onChange={e => onChange({ ...initialFilters, query: filters.query, scope, category: e.target.value })}><option value="All">All</option>{templateCategories.map(c => <option key={c}>{c}</option>)}</select></label><label>Search<input type="search" className={`${control} w-full`} value={filters.query} onChange={e => onChange({ ...filters, query: e.target.value })} /></label></div>
    {filters.category === 'Mathematics' && <details className="mt-4 min-w-0"><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold">Mathematics curriculum</summary>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{mathematicsLevels.map(level => {
        const options = [...new Set([...curriculumOptions(items, filters, level.key), ...(level.key === 'grade' ? draftGrades : [])])].sort((a, b) => Number(a) - Number(b))
        return <label key={level.key} className="min-w-0 text-sm">{level.label}<select aria-label={level.label} className={`${control} mt-1 w-full bg-white`} value={filters[level.key]} disabled={!options.length} onChange={e => onChange(changeCurriculum(filters, level.key, e.target.value))}><option value={level.all}>{options.length ? 'All' : 'Unavailable'}</option>{options.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      })}</div><p id="math-curriculum-help" className="mt-2 text-sm text-slate-600">Grade → Main → Unit → Lesson. Only supplied curriculum associations are selectable; unavailable levels await the curriculum catalog.</p>
    </details>}
    {(scope.country || scope.region || scope.city) && <p role="status" className="mt-2 text-sm">Geographic scope applies to available records with supplied applicability metadata.</p>}
    <button type="button" className={`${control} mt-3`} onClick={() => { onChange(initialFilters) }}>Reset filters</button>
  </fieldset></>
}
