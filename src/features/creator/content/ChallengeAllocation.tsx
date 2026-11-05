import { useEffect, useId, useRef, useState } from 'react'
import { creatorContentApi, type ApprovedContent, type ApprovedDetail } from '../../../services/api/creatorContent'
import { geographyApi } from '../../../services/api/geography'
import type { CheckpointGameplay } from '../checkpointGameplay'
import { control } from '../exercises/ExerciseRenderer'
import { ChallengeCanvas } from '../exercises/ChallengeCanvas'
import { fromPersistence } from '../exercises/persistenceAdapter'
import { personalTypes, typeName } from '../exercises/catalog'
import { teamMechanics } from '../exercises/teamExamples'
import { MathText } from '../exercises/MathText'
import { discoveryContext, eligibleApproved, isResolvedAllocation, selectAllocation, contentGrade, type AllocationSlot, type ExercisePoolDefaults, type RandomFilters, type LibraryAllocation } from './templateAllocation'
export type { ExercisePoolDefaults } from './templateAllocation'

export function ChallengeAllocation({ value, onChange, mechanic, slot = 'personal', defaults, usedPersonalIds = [], preview, onPreview, onSelect }: {
  mechanic?: string; value: CheckpointGameplay; onChange: (cp: CheckpointGameplay) => void; slot?: AllocationSlot; defaults?: ExercisePoolDefaults;
  usedPersonalIds?: string[]; preview?: ApprovedDetail; onPreview: (detail: ApprovedDetail) => void; onSelect: () => boolean
}) {
  const group = useId(), allocation = value.libraryAllocations?.[slot]
  const mode = allocation?.mode ?? 'random'
  const resolved = isResolvedAllocation(allocation)
  const [filters, setFilters] = useState<RandomFilters>(() => allocation && 'filters' in allocation ? allocation.filters ?? {} : {})
  const [query, setQuery] = useState(''), [refresh, setRefresh] = useState(0)
  const [results, setResults] = useState<{ key: string; items: ApprovedContent[]; after: string | null }>({ key: '', items: [], after: null })
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [choosing, setChoosing] = useState(false)
  const [mapping, setMapping] = useState(defaults?.geography), [mappingBusy, setMappingBusy] = useState(false)
  const generation = useRef(0), selectionRequest = useRef(0), busy = useRef(false)
  const local = defaults?.classification === 'local' ? defaults.location : null
  const localKey = local ? `${local.id}:${local.countryCode}` : ''
  useEffect(() => {
    let active = true
    setMapping(defaults?.geography)
    if (!local || defaults?.geography?.localityId === local.id) { setMappingBusy(false); return }
    setMappingBusy(true)
    // A name narrows catalog search only. Accept solely an explicit locality UUID binding.
    void (async () => {
      let after: string | undefined
      do {
        const page = await geographyApi.cities(local.countryCode, local.name, undefined, after)
        const exact = page.cities.find(city => city.localityId === local.id && city.countryCode === local.countryCode)
        if (!active) return
        if (exact) { setMapping(exact); return }
        after = page.nextAfter ?? undefined
      } while (after)
    })().catch(() => { /* Fail closed to Universal/Country; never infer city identifiers. */ }).finally(() => { if (active) setMappingBusy(false) })
    return () => { active = false }
  }, [localKey, defaults?.geography])
  const context = { ...defaults, geography: mapping }
  const supported = defaults?.classification === 'universal' || defaults?.classification === 'local'
  const ready = supported && ['Mathematics', 'History', 'Science', 'Mixed'].includes(defaults?.category ?? '') && !mappingBusy
  const poolFilters = { ...filters, ...(mechanic ? { type: mechanic } : {}) }
  const search = { ...poolFilters, ...discoveryContext(context), classification: slot, ...(mode === 'specific' && query.trim() ? { q: query.trim() } : {}) }
  const key = JSON.stringify(search)
  const load = async (after: string | undefined, request: number) => {
    if (busy.current) return
    busy.current = true; setLoading(true); setError('')
    try {
      const page = await creatorContentApi.approved(search, after)
      if (request !== generation.current) return
      const items = page.items.filter(item => eligibleApproved(item, slot, context) && (!search.type || item.type === search.type) && (!search.grade || (item.curriculum.grade ?? 'unspecified') === search.grade))
      setResults(old => ({ key, items: after && old.key === key ? [...old.items, ...items.filter(item => !old.items.some(prior => prior.contentId === item.contentId))] : items, after: page.nextAfter }))
    } catch { if (request === generation.current) setError('Approved exercises could not be loaded. Check your connection and retry.') }
    finally { if (request === generation.current) { busy.current = false; setLoading(false) } }
  }
  useEffect(() => {
    const request = ++generation.current
    busy.current = false; setLoading(false); setResults({ key, items: [], after: null }); setError('')
    ++selectionRequest.current; setChoosing(false)
    if (ready) void load(undefined, request)
    return () => { ++generation.current; ++selectionRequest.current }
  }, [key, ready, refresh])
  const choose = (next?: LibraryAllocation) => {
    if (!onSelect()) return false
    ++selectionRequest.current; setChoosing(false)
    onChange(selectAllocation(value, slot, next)); return true
  }
  const changeMode = (next: 'random' | 'specific') => {
    if (allocation?.mode === next) return
    choose(next === 'random' ? { mode: 'random', ...(Object.keys(poolFilters).length ? { filters: poolFilters } : {}) } : { mode: 'specific', contentId: '', revisionId: '' })
  }
  const refine = (next: RandomFilters) => {
    const narrowed = { ...next, ...(mechanic ? { type: mechanic } : {}) }
    if (mode === 'random' && !choose({ mode: 'random', ...(Object.keys(narrowed).length ? { filters: narrowed } : {}) })) return
    setFilters(next)
  }
  const open = async (item: ApprovedContent) => {
    if (slot === 'personal' && usedPersonalIds.includes(item.contentId)) { setError('This Personal exercise is already used at another checkpoint. Choose a different exercise.'); return }
    const request = ++selectionRequest.current
    setChoosing(true); setError('')
    try {
      const exact = await creatorContentApi.approvedRevision(item.contentId, item.revisionId)
      if (request !== selectionRequest.current) return
      if (exact.contentId !== item.contentId || exact.revisionId !== item.revisionId || !eligibleApproved(exact, slot, context) || exact.type !== item.type || exact.exercise.classification !== slot || exact.exercise.type !== exact.type) throw new Error('Invalid revision')
      // Validate renderability before changing the assignment. A failed detail keeps the old choice.
      fromPersistence(exact.exercise)
      if (choose({ mode: 'specific', contentId: exact.contentId, revisionId: exact.revisionId })) onPreview(exact)
    } catch { if (request === selectionRequest.current) setError('This revision is unavailable or no longer eligible. Refresh approved exercises and choose again.') }
    finally { if (request === selectionRequest.current) setChoosing(false) }
  }
  const current = results.key === key && ready
  const frozen = resolved ? value.customExercises?.[slot] : undefined
  const selectedPreview = mode === 'specific' && allocation && 'contentId' in allocation && preview?.contentId === allocation.contentId && preview.revisionId === allocation.revisionId ? preview : undefined
  const exercise = frozen ?? selectedPreview?.exercise
  return <section aria-label="Challenge allocation" className="min-w-0 space-y-3">
    <fieldset disabled={!supported}><legend className="text-sm font-bold">Exercise allocation</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{[['random', 'Random matching exercise'], ['specific', 'Choose specific exercise']].map(([id, label]) => <label key={id} className={`${control} flex min-w-0 items-center gap-2 bg-white`}><input type="radio" name={group} checked={!!allocation && mode === id} onChange={() => changeMode(id as 'random' | 'specific')} />{label}</label>)}</div></fieldset>
    {!supported && <p role="status" className="text-sm">Approved allocation requires a Universal or Local Template. Your saved assignment is preserved.</p>}
    {supported && !ready && <p role="status" className="text-sm">{mappingBusy ? 'Checking the Template locality…' : 'Choose the Template academic category in Hunt Setup.'}</p>}
    {supported && <><details className="rounded-xl border border-slate-200 p-3"><summary className="min-h-11 cursor-pointer text-sm font-bold">Refine exercise pool</summary><div className="space-y-3 pt-2">
      {!mechanic && <label className="block text-sm font-bold">Exercise mechanic<select aria-label="Exercise mechanic" className={`${control} mt-1 w-full bg-white`} value={filters.type ?? ''} onChange={e => refine(e.target.value ? { ...filters, type: e.target.value } : Object.fromEntries(Object.entries(filters).filter(([k]) => k !== 'type')))}><option value="">All mechanics</option>{(slot === 'personal' ? personalTypes.map(([type, label]) => [type, label]) : Object.entries(teamMechanics)).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>}
      {!contentGrade(defaults?.grade) && <label className="block text-sm font-bold">Grade<select aria-label="Allocation grade" className={`${control} mt-1 w-full bg-white`} value={filters.grade ?? ''} onChange={e => refine(e.target.value ? { ...filters, grade: e.target.value } : Object.fromEntries(Object.entries(filters).filter(([k]) => k !== 'grade')))}><option value="">All grades</option>{['5','6','7','8','9','10','11','12','unspecified'].map(grade => <option key={grade} value={grade}>{grade === 'unspecified' ? 'Unspecified' : grade}</option>)}</select></label>}
      <p className="text-xs text-slate-600">{defaults?.category}{contentGrade(defaults?.grade) ? ` · Grade ${defaults?.grade}` : ''} · {local ? `${local.name}, ${local.countryDisplayName}` : 'Universal'} · Uses Template settings.</p>
      {local && !mapping && !mappingBusy && <p className="text-xs text-slate-600">City mapping unavailable. Showing Universal and Country exercises only.</p>}
    </div></details>
    {mode === 'specific' && <label className="block text-sm font-bold">Search approved exercises<input type="search" maxLength={200} aria-label="Search approved exercises" className={`${control} mt-1 w-full`} value={query} onChange={e => setQuery(e.target.value)} /></label>}
    {loading && <p role="status" className="text-sm">Loading approved exercises…</p>}
    {error && <p role="alert" className="text-sm text-red-800">{error} <button type="button" className={control} onClick={() => setRefresh(n => n + 1)}>Retry</button></p>}
    {current && !loading && !error && <p role="status" className="text-sm text-slate-600">{results.items.length ? `${results.items.length}${results.after ? '+' : ''} eligible approved exercises${mode === 'random' ? ' in this pool' : ''}.` : 'No eligible approved exercises. Adjust the pool or Template settings.'}</p>}
    {mode === 'specific' && <ul className="divide-y divide-slate-200">{current && results.items.map(item => {
      const duplicate = slot === 'personal' && usedPersonalIds.includes(item.contentId)
      return <li key={`${item.contentId}:${item.revisionId}`} className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3"><div className="min-w-0 flex-1 basis-40 break-words"><p className="font-semibold"><MathText text={item.title} /></p><p className="text-xs text-slate-600">{typeName(item.type)} · Approved revision {item.version}{duplicate ? ' · Already used at another checkpoint' : ''}</p></div><button type="button" className={control} disabled={choosing || duplicate} aria-label={`Select ${item.title}`} onClick={() => void open(item)}>Select</button></li>
    })}</ul>}
    {current && results.after && <button type="button" className={control} disabled={loading} onClick={() => void load(results.after!, generation.current)}>Load More</button>}
    {choosing && <p role="status" className="text-sm">Loading exact approved revision…</p>}
    <p role="status" aria-label="Library allocation status" className="text-sm font-semibold">{resolved ? `Exercise allocated · Approved revision ${allocation.version}` : allocation?.mode === 'random' ? 'Random pool configured · Save Template to allocate.' : allocation?.mode === 'specific' && 'contentId' in allocation && allocation.contentId ? 'Approved exercise selected · Save Template to allocate.' : 'Choose Random or an approved exercise.'}</p>
    {resolved && mode === 'random' && <p className="text-xs text-slate-600">Changing this pool allocates again on the next save.</p>}
    {resolved && mode === 'random' && <button type="button" className={control} onClick={() => { if (window.confirm('Allocate a new Random exercise on the next Template save? The saved version stays unchanged.')) choose({ mode: 'random', ...('filters' in allocation && allocation.filters ? { filters: allocation.filters } : {}) }) }}>Choose another Random exercise</button>}
    {exercise && <section aria-label="Playable exercise preview" className="min-w-0"><ChallengeCanvas key={`${'contentId' in (allocation ?? {}) ? (allocation as {contentId:string}).contentId : ''}:${exercise.id}`} exercise={fromPersistence(exercise)} /></section>}
    {allocation && <button type="button" className={`${control} text-slate-600`} onClick={() => { if (window.confirm('Remove this challenge from the next saved Template version?')) choose() }}>Remove challenge</button>}
    </>}
  </section>
}
