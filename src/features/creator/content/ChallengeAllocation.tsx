import { useId, useState } from 'react'
import { templateCategories } from './classification'
import { filterContent, initialFilters, starterContent, type ContentFilters, type ContentRecord } from './catalog'
import { ContentGeography, universalScope } from './ContentGeography'
import { changeCurriculum, curriculumOptions, mathematicsLevels } from './curriculum'
import { control, ExerciseRenderer } from '../exercises/ExerciseRenderer'
import type { GeographicCity, LocalitySnapshot } from '../../../services/api/geography'

export interface ExercisePoolDefaults { category?: string; location?: LocalitySnapshot | null; geography?: Pick<GeographicCity, 'localityId' | 'countryCode' | 'geographicId' | 'admin1Code' | 'regionStatus'> | null }
/** Session-only browsing and simulation; never allocates or persists a library record. */
export function ChallengeAllocation({ items = starterContent, mechanic = '', defaults }: {
  items?: readonly ContentRecord[]; mechanic?: string; defaults?: ExercisePoolDefaults
}) {
  const radioGroup = useId()
  const [mode, setMode] = useState('random'), [expanded, setExpanded] = useState(false)
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null)
  const category = categoryChoice ?? (templateCategories.some(c => c === defaults?.category) ? defaults!.category! : 'starter-preset')
  const [filters, setFilters] = useState<ContentFilters>(initialFilters)
  const [locationChoice, setLocationChoice] = useState<string | null>(null)
  const locationMode = locationChoice ?? (defaults?.location ? 'template' : 'universal')
  const location = defaults?.location, geography = defaults?.geography
  // Locality UUIDs and geographic city IDs are different namespaces. Only reuse
  // a catalog mapping captured for this exact Template locality; never search by label.
  const templateScope = location && geography?.localityId === location.id && geography.countryCode === location.countryCode
    && geography.regionStatus === 'resolved' && geography.geographicId && geography.admin1Code
    ? { country: geography.countryCode, region: geography.admin1Code, city: geography.geographicId } : null
  const scope = locationMode === 'template' ? templateScope : locationMode === 'choose' ? filters.scope ?? universalScope : universalScope
  const poolFilters = { ...filters, category: category === 'starter-preset' ? 'All' : category, scope: scope ?? universalScope }
  const personal = items.filter(item => item.category === 'Personal Challenges' && (!mechanic || item.mechanic === mechanic))
  const approved = personal.filter(item => item.approvalStatus === 'approved' && item.revision.kind === 'backend' && item.collection.id !== 'repository-starters')
  const eligible = scope ? filterContent(approved, 'Personal Challenges', { ...poolFilters, query: '' }).filter(item => category !== 'starter-preset' || item.collection.id === 'repository-starters') : []
  const visible = filterContent(eligible, 'Personal Challenges', poolFilters)
  const [selectedId, setSelectedId] = useState(''), [preview, setPreview] = useState(false)
  const selected = eligible.find(item => item.id === selectedId)
  // Deterministic representative preview, never a simulated random allocation.
  const demonstration = personal.find(item => item.collection.id === 'repository-starters')
  const previewItem = mode === 'specific' ? selected : eligible[0] ?? demonstration
  const starterDemo = mode === 'random' && !eligible.length && !!demonstration
  const reset = () => { setSelectedId(''); setPreview(false) }
  return <section aria-label="Challenge allocation" className="min-w-0 space-y-3">
    <fieldset><legend className="text-sm font-bold">Exercise allocation</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{[['random', 'Random matching exercise'], ['specific', 'Choose specific exercise']].map(([value, label]) => <label key={value} className={`${control} flex items-center gap-2 bg-white`}><input type="radio" name={radioGroup} value={value} checked={mode === value} onChange={() => { setMode(value); reset() }} />{label}</label>)}</div>
    </fieldset>
    <div className="rounded-xl border border-slate-200">
      <button type="button" aria-expanded={expanded} className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-bold" onClick={() => setExpanded(!expanded)}>Refine exercise pool<span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
      {expanded && <div className="min-w-0 space-y-3 border-t border-slate-200 p-3">
        <label className="block text-sm font-bold">Category<select aria-label="Allocation category" className={`${control} mt-1 w-full bg-white`} value={category} onChange={e => { setCategoryChoice(e.target.value); setFilters({ ...initialFilters, scope: filters.scope }); reset() }}><option value="starter-preset">Starter</option>{templateCategories.map(c => <option key={c}>{c}</option>)}</select></label>
        {category === 'starter-preset' && <p className="text-xs text-slate-600">Starter is a protected example collection.</p>}
        <label className="block text-sm font-bold">Geographic applicability<select aria-label="Geographic applicability" className={`${control} mt-1 w-full bg-white`} value={locationMode} onChange={e => { setLocationChoice(e.target.value); reset() }}>
          {location && <option value="template">Template location: {location.name}, {location.countryDisplayName}</option>}<option value="universal">Universal</option><option value="choose">Choose another location</option>
        </select></label>
        {locationMode === 'template' && <p className="text-xs text-slate-600">Uses {location?.name}, {location?.countryDisplayName} from the Template automatically.{!scope && ' The Template locality is known, but its geographic city mapping is unavailable. Approved previews cannot match this location until that mapping is available. Choose Universal to browse without a geographic restriction.'}</p>}
        {locationMode === 'choose' && <ContentGeography value={filters.scope ?? universalScope} onChange={scope => { setFilters({ ...filters, scope }); reset() }} />}
        {category === 'Mathematics' && <fieldset><legend className="text-sm font-bold">Grade → Main → Unit → Lesson</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{mathematicsLevels.map(level => {
          const options = curriculumOptions(personal, poolFilters, level.key)
          return <label key={level.key} className="min-w-0 text-sm">{level.label}<select aria-label={level.label} disabled={!options.length} className={`${control} mt-1 w-full bg-white disabled:bg-slate-100`} value={filters[level.key]} onChange={e => { setFilters(changeCurriculum(filters, level.key, e.target.value)); reset() }}><option value={level.all}>{options.length ? 'All' : 'Unavailable'}</option>{options.map(value => <option key={value}>{value}</option>)}</select></label>
        })}</div><p className="mt-2 text-xs text-slate-600">Unavailable levels await curriculum data or a parent selection.</p></fieldset>}
      </div>}
    </div>
    {mode === 'specific' && <div className="space-y-2">
      <label className="block text-sm font-bold">Search approved exercises<input type="search" aria-label="Search approved exercises" className={`${control} mt-1 w-full`} value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })} placeholder="Title or instructions" /></label>
      <label className="block text-sm font-bold">Approved exercise<select aria-label="Approved exercise" className={`${control} mt-1 w-full bg-white`} disabled={!visible.length && !selected} value={selectedId} onChange={e => { setSelectedId(e.target.value); setPreview(false) }}><option value="">Choose an exercise</option>{(selected && !visible.includes(selected) ? [selected, ...visible] : visible).map(item => <option key={item.id} value={item.id}>{item.exercise.title}</option>)}</select></label>
      {!visible.length && <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm">{!approved.length ? 'No approved exercise records are available. The library feed is not connected; no exercise can be selected yet.' : 'No approved exercises match this pool and search.'}</p>}
    </div>}
    {mode === 'random' && !eligible.length && <p className="text-sm text-slate-600">No eligible approved exercise is available to preview.</p>}
    {previewItem && <div className="min-w-0 rounded-xl bg-slate-50 p-3">
      <button type="button" aria-expanded={preview} className={`${control} w-full bg-white text-left font-bold`} onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : starterDemo ? 'Preview Starter demonstration' : mode === 'random' ? 'Preview eligible approved exercise' : 'Preview selected exercise'}</button>
      {preview && <section aria-label="Playable exercise preview" className="mt-3 min-w-0 space-y-3"><p className="text-xs font-bold text-slate-600">{starterDemo ? 'Starter demonstration · May not match your pool. No exercise has been allocated.' : 'Read-only simulation · This exercise has not been allocated.'}</p><ExerciseRenderer key={`${mode}:${previewItem.id}:${mechanic}`} exercise={previewItem.exercise} /></section>}
    </div>}
    <p role="note" className="text-xs text-slate-600">Exercise assignment is unavailable for publication until backend support is available. These choices are session-only; your current assignment is preserved.</p>
  </section>
}
