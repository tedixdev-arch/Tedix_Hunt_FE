import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../services/api/client'
import { creatorContentApi, type ApprovedContent, type ApprovedFilters } from '../../../services/api/creatorContent'
import type { GeographicCity } from '../../../services/api/geography'
import { ContentSelection } from './ContentSelection'
import { initialFilters, type ContentFilters } from './catalog'
import { GeographicApplicability } from './GeographicApplicability'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { fromPersistence } from '../exercises/persistenceAdapter'
import { typeName, type Exercise } from '../exercises/catalog'
import { MathText } from '../exercises/MathText'
import { control } from '../exercises/ExerciseRenderer'

export function approvedFilters(classification: 'personal' | 'team', filters: ContentFilters): ApprovedFilters {
  const scope = filters.scope
  return { classification, ...(filters.mechanic ? { type: filters.mechanic } : {}),
    ...(filters.category !== 'All' ? { category: filters.category } : {}),
    ...(filters.category === 'Mathematics' && filters.grade !== 'Mix' ? { grade: filters.grade } : {}),
    ...(filters.query.trim() ? { q: filters.query.trim() } : {}),
    ...(scope?.country ? { countryCode: scope.country,
      ...(scope.city ? { geographicId: scope.city } : scope.region ? { admin1Code: scope.region } : {}) } : {}) }
}
function message(error: unknown) {
  if (error instanceof ApiError) switch (error.status) {
    case 400: return 'These filters or results have expired. Refresh the search to continue.'
    case 401: return 'Sign in again to browse approved exercises, then retry.'
    case 403: return 'A Creator account is required to browse these exercises.'
    case 404: return 'This approved revision is no longer available. Refresh the search.'
  }
  return 'Exercises could not be loaded. Check your connection and retry.'
}
type Results = { key: string; items: ApprovedContent[]; after: string | null }
export function ApprovedExercises({ classification }: { classification: 'personal' | 'team' }) {
  const [filters, setFilters] = useState(initialFilters)
  const [city, setCity] = useState<GeographicCity | null>(null)
  const [results, setResults] = useState<Results>({ key: '', items: [], after: null })
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [refresh, setRefresh] = useState(0)
  const [preview, setPreview] = useState<Exercise | null>(null), [previewing, setPreviewing] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const generation = useRef(0), busy = useRef(false), previewRequest = useRef(0), previewBusy = useRef(false)
  const query = approvedFilters(classification, filters), key = JSON.stringify(query)
  // A failed city lookup must never turn a city selection into a country-wide search.
  const ready = !filters.scope?.city || city?.geographicId === filters.scope.city && city.countryCode === filters.scope.country
  const current = results.key === key && ready
  const load = async (cursor: string | undefined, requestGeneration: number) => {
    if (busy.current) return
    busy.current = true; setLoading(true); setError('')
    try {
      const page = await creatorContentApi.approved(query, cursor)
      if (generation.current !== requestGeneration) return
      setResults(old => ({ key, items: cursor && old.key === key ? [...old.items, ...page.items.filter(item => !old.items.some(prior => prior.contentId === item.contentId))] : page.items, after: page.nextAfter }))
    } catch (error) { if (generation.current === requestGeneration) setError(message(error)) }
    finally { if (generation.current === requestGeneration) { busy.current = false; setLoading(false) } }
  }
  useEffect(() => {
    const requestGeneration = ++generation.current
    busy.current = false; setError(''); setResults({ key, items: [], after: null }); setLoading(false)
    setPreview(null); setPreviewError(''); setPreviewing(false); previewBusy.current = false; ++previewRequest.current
    if (ready) void load(undefined, requestGeneration)
    return () => { ++generation.current; ++previewRequest.current }
  }, [key, ready, refresh])
  const open = async (item: ApprovedContent) => {
    if (previewBusy.current) return
    previewBusy.current = true; setPreviewing(true); setPreviewError('')
    const request = ++previewRequest.current
    try {
      const exact = await creatorContentApi.approvedRevision(item.contentId, item.revisionId)
      if (request !== previewRequest.current) return
      if (exact.contentId !== item.contentId || exact.revisionId !== item.revisionId || exact.status !== 'approved') throw new Error('Revision mismatch')
      setPreview(fromPersistence(exact.exercise))
    } catch (error) { if (request === previewRequest.current) setPreviewError(message(error)) }
    finally { if (request === previewRequest.current) { previewBusy.current = false; setPreviewing(false) } }
  }
  return <section aria-label="Approved Exercises" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Approved Exercises</h2>
    <details className="mt-4 border-y border-slate-200 py-2"><summary className="min-h-11 cursor-pointer py-2 font-medium">Filters</summary>
      <ContentSelection filters={filters} onChange={setFilters} onCityResolved={setCity} discovery={classification} />
    </details>
    {!ready && <p role="status" className="mt-4">Resolving the selected city. If unavailable, retry geography.</p>}
    {loading && <p role="status" className="mt-4">Loading exercises…</p>}
    {error && <p role="alert" className="mt-4">{error} <button type="button" className={control} disabled={loading} onClick={() => setRefresh(n => n + 1)}>Refresh search</button></p>}
    {previewError && <p role="alert" className="mt-4">{previewError} <button type="button" className={control} onClick={() => { setPreviewError(''); setRefresh(n => n + 1) }}>Refresh search</button></p>}
    {previewing && <p role="status">Loading preview…</p>}
    <ul className="mt-3 divide-y divide-slate-200">{current && results.items.map(item => <li key={item.contentId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1 basis-48 break-words"><h3 className="font-semibold"><MathText text={item.title} /></h3><p className="text-sm text-slate-600">{item.classification === 'team' ? 'Team' : 'Personal'} · {typeName(item.type)}{item.category ? ` · ${item.category}` : ''}{item.curriculum.grade ? ` · Grade ${item.curriculum.grade}` : ''} · <GeographicApplicability geography={item.geography} /></p></div>
      <button type="button" className={control} disabled={previewing} aria-label={`Preview ${item.title}`} onClick={() => void open(item)}>Preview</button>
    </li>)}</ul>
    {current && !loading && !error && !results.items.length && <p className="mt-4 text-sm text-slate-600">No approved exercises match. Adjust the filters.</p>}
    {current && results.after && !error && <button type="button" className={`${control} mt-4`} disabled={loading} onClick={() => void load(results.after!, generation.current)}>Load More</button>}
    {preview && <ExercisePreview readOnly exercise={preview} onClose={() => setPreview(null)} />}
  </section>
}
