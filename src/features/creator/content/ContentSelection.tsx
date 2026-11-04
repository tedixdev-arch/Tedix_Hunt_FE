import { categoryFilters, templateCategories } from './classification'
import { ContentGeography, universalScope } from './ContentGeography'
import { control } from '../exercises/ExerciseRenderer'
import { initialFilters, type ContentFilters } from './catalog'
/** Shared browser conventions for library and Template Predefined. No assignment operation. */
export function ContentSelection({ filters, onChange }: { filters: ContentFilters; onChange: (v: ContentFilters) => void }) {
  const scope = filters.scope ?? universalScope
  const setScope = (scope: typeof universalScope) => onChange({ ...filters, scope })
  return <fieldset className="mt-4 min-w-0"><legend className="font-bold">Filter content</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label>Category<select aria-label="Content category" className={`${control} w-full bg-white`} value={filters.category} onChange={e => onChange({ ...initialFilters, query: filters.query, scope, category: e.target.value })}><option value="All">All</option>{templateCategories.map(c => <option key={c}>{c}</option>)}</select></label><label>Search<input type="search" className={`${control} w-full`} value={filters.query} onChange={e => onChange({ ...filters, query: e.target.value })} /></label></div>
    {filters.category !== 'All' && <p className="mt-2 text-sm text-slate-600">No classified Starter records{categoryFilters[filters.category]?.length ? ' or Grade → Main → Unit → Lesson catalog' : ''} available yet.</p>}
    <ContentGeography value={scope} onChange={setScope} />
    {(scope.country || scope.region || scope.city) && <p role="status" className="mt-2 text-sm">No Starter geographic associations are available yet. Reset geography to Universal to browse examples.</p>}
    <button type="button" className={`${control} mt-3`} onClick={() => { onChange(initialFilters) }}>Reset filters</button>
  </fieldset>
}
