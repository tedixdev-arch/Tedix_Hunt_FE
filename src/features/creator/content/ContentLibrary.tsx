import { useEffect, useRef, useState } from 'react'
import { ContentPicker } from './ContentPicker'
import { starterContent, type ContentCategory, type ContentRecord, type ContentFilters } from './catalog'
import { creatorContentApi, contentError, type LibraryContent } from '../../../services/api/creatorContent'
import { fromPersistence } from '../exercises/persistenceAdapter'
import { typeName, type Exercise } from '../exercises/catalog'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { control } from '../exercises/ExerciseRenderer'

/** Own draft heads and protected examples are independent collections. */
export function ContentLibrary({ items = starterContent, category = 'Personal Challenges', onEdit, focusId }: { items?: readonly ContentRecord[]; category?: ContentCategory; onEdit?: (id: string) => void; focusId?: string }) {
  const [records, setRecords] = useState<LibraryContent[]>([]), [after, setAfter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [preview, setPreview] = useState<Exercise | null>(null)
  const alive = useRef(false), busy = useRef(false)
  const load = async (cursor?: string) => {
    if (busy.current) return
    busy.current = true; setLoading(true); setError('')
    try {
      const page = await creatorContentApi.list(cursor)
      if (!cursor && focusId && !page.items.some(r => r.contentId === focusId)) {
        const focused = await creatorContentApi.get(focusId)
        if (focused.status === 'draft') page.items.unshift(focused)
      }
      if (alive.current) { setRecords(old => cursor ? [...old, ...page.items.filter(r => !old.some(o => o.contentId === r.contentId))] : page.items); setAfter(page.nextAfter) }
    } catch (e) { if (alive.current) setError(contentError(e)) }
    finally { busy.current = false; if (alive.current) setLoading(false) }
  }
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false } }, [])
  const visible = (r: LibraryContent, f: ContentFilters) => {
    const g = r.geography, scope = f.scope
    return (r.exercise.classification === 'personal' ? 'Personal Challenges' : 'Team Challenges') === category &&
      (f.category === 'All' || f.category === r.category) && (f.grade === 'Mix' || f.grade === r.curriculum.grade) && f.main === 'Mix' && !f.unit && !f.lesson &&
      `${r.exercise.title} ${r.exercise.instructions} ${r.exercise.type} ${r.category ?? ''}`.toLowerCase().includes(f.query.trim().toLowerCase()) &&
      (!scope?.country || g.scope === 'universal' || g.countryCode === scope.country) &&
      (!scope?.region || g.scope === 'universal' || g.scope === 'country' || g.scope === 'region' && g.admin1Code === scope.region || g.scope === 'city' && !!scope.city && g.geographicId === scope.city) &&
      (!scope?.city || g.scope !== 'city' || g.geographicId === scope.city)
  }
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">Library</h2>
    <ContentPicker key={category} section={category} items={items} libraryView draftGrades={records.filter(r => r.category === 'Mathematics').flatMap(r => r.curriculum.grade ? [r.curriculum.grade] : [])} renderDrafts={filters => <section aria-label="My drafts" className="mt-6">
      <h3 className="text-lg font-bold">My drafts</h3>
      {loading && <p role="status">Loading drafts…</p>}
      {error && <p role="alert">{error} <button type="button" disabled={loading} className={control} onClick={() => void load(after ?? undefined)}>Retry</button></p>}
      <ul className="mt-3 divide-y divide-slate-200">{records.filter(r => visible(r, filters)).map(r => <li key={r.contentId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3">
        <div className="min-w-0 flex-1 basis-48 break-words"><h4 className="font-semibold">{r.exercise.title}</h4><p className="text-sm text-slate-600">{typeName(r.exercise.type)}{r.category ? ` · ${r.category}` : ''}{r.curriculum.grade ? ` · Grade ${r.curriculum.grade}` : ''} · Draft</p><time className="text-xs text-slate-500" dateTime={r.updatedAt}>{new Date(r.updatedAt).toLocaleString()}</time></div>
        <div className="flex flex-wrap gap-2"><button type="button" className={control} onClick={() => onEdit?.(r.contentId)} aria-label={`Edit ${r.exercise.title}`}>Edit</button><button type="button" className={control} aria-label={`Preview draft ${r.exercise.title}`} onClick={async () => { try { const exact = await creatorContentApi.revision(r.contentId, r.revisionId); if (alive.current) setPreview(fromPersistence(exact.exercise)) } catch (e) { if (alive.current) setError(contentError(e)) } }}>Preview</button></div>
      </li>)}</ul>
      {!loading && !error && !records.some(r => visible(r, filters)) && <p className="mt-2 text-sm text-slate-600">No saved drafts match. Create an exercise or adjust the filters.</p>}
      {after && <button type="button" className={`${control} mt-3`} disabled={loading} onClick={() => void load(after)}>Load more drafts</button>}
    </section>} />
    {preview && <ExercisePreview exercise={preview} onClose={() => setPreview(null)} />}
  </section>
}
