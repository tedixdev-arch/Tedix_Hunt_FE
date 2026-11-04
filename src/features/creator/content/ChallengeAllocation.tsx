import { useId, useState } from 'react'
import { templateCategories } from './classification'
import { initialFilters, starterContent, type ContentFilters, type ContentRecord } from './catalog'
import { ContentGeography, universalScope } from './ContentGeography'
import { changeCurriculum, curriculumOptions, mathematicsLevels } from './curriculum'
import { control } from '../exercises/ExerciseRenderer'

/** Session-only allocation preview. No assignment or persistence contract exists yet. */
export function ChallengeAllocation({ items = starterContent }: { items?: readonly ContentRecord[] }) {
  const radioGroup = useId()
  const [mode, setMode] = useState('random')
  // Starter is a protected collection preset, never an academic category identity.
  const [collection, setCollection] = useState(true)
  const [filters, setFilters] = useState<ContentFilters>({ ...initialFilters, scope: universalScope })
  const personal = items.filter(item => item.category === 'Personal Challenges' && (!collection || item.collection.id === 'repository-starters'))
  return <section aria-label="Challenge allocation" className="min-w-0 space-y-3">
    <fieldset><legend className="text-sm font-bold">Allocate challenge</legend>
      <div className="mt-2 flex flex-wrap gap-2">{[['random', 'Random from Library'], ['filters', 'Use filters']].map(([value, label]) => <label key={value} className={`${control} flex items-center gap-2 bg-white`}><input type="radio" name={radioGroup} value={value} checked={mode === value} onChange={() => setMode(value)} />{label}</label>)}</div>
    </fieldset>
    {mode === 'filters' && <div className="min-w-0">
      <label className="block text-sm font-bold">Category<select aria-label="Allocation category" className={`${control} mt-1 w-full bg-white`} value={collection ? 'starter-preset' : filters.category} onChange={e => {
        setCollection(e.target.value === 'starter-preset')
        setFilters({ ...initialFilters, scope: filters.scope, category: e.target.value === 'starter-preset' ? 'All' : e.target.value })
      }}><option value="starter-preset">Starter</option>{templateCategories.map(category => <option key={category}>{category}</option>)}</select></label>
      <ContentGeography value={filters.scope ?? universalScope} onChange={scope => setFilters({ ...filters, scope })} />
      {!collection && filters.category === 'Mathematics' && <div className="mt-3 grid gap-3 sm:grid-cols-2">{mathematicsLevels.map(level => {
        const options = curriculumOptions(personal, filters, level.key)
        return options.length ? <label key={level.key} className="min-w-0 text-sm">{level.label}<select aria-label={level.label} className={`${control} mt-1 w-full bg-white`} value={filters[level.key]} onChange={e => setFilters(changeCurriculum(filters, level.key, e.target.value))}><option value={level.all}>All</option>{options.map(value => <option key={value}>{value}</option>)}</select></label> : null
      })}</div>}
    </div>}
    <p role="note" className="text-sm text-slate-600">Allocation preview only. Random and filtered allocation are unavailable for publication until library assignment is supported. No challenge is selected or saved; your current assignment is preserved.</p>
  </section>
}
