import { useEffect, useRef, useState } from 'react'
import { ContentPicker } from './ContentPicker'
import { starterContent, type ContentCategory, type ContentRecord, type ContentFilters } from './catalog'
import { creatorContentApi, contentError, type LibraryContent } from '../../../services/api/creatorContent'
import { fromPersistence } from '../exercises/persistenceAdapter'
import { typeName, type Exercise } from '../exercises/catalog'
import { ExercisePreview } from '../exercises/ExercisePreview'
import { libraryGeographyMatches } from './libraryAdapter'
import type { GeographicCity } from '../../../services/api/geography'
import { ContentFeedback, contentStatus } from './ContentReviewPreview'
import { control } from '../exercises/ExerciseRenderer'

/** Own current heads and protected examples are independent collections. */
export function ContentLibrary({ items = starterContent, category = 'Personal Challenges', onEdit, onRevise, focusId }: { items?: readonly ContentRecord[]; category?: ContentCategory; onEdit?: (id: string) => void | Promise<void>; onRevise?: (id: string, revision: string) => void | Promise<void>; focusId?: string }) {
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
        page.items.unshift(focused)
      }
      if (alive.current) { setRecords(old => cursor ? [...old, ...page.items.filter(r => !old.some(o => o.contentId === r.contentId))] : page.items); setAfter(page.nextAfter) }
    } catch (e) { if (alive.current) setError(contentError(e)) }
    finally { busy.current = false; if (alive.current) setLoading(false) }
  }
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false } }, [])
  const action = async (callback: () => void | Promise<void>) => {
    if (busy.current) return
    busy.current = true; setLoading(true); setError('')
    try { await callback() } catch (error) { if (alive.current) setError(contentError(error)) }
    finally { busy.current = false; if (alive.current) setLoading(false) }
  }
  const visible = (r: LibraryContent, f: ContentFilters, city: GeographicCity | null) => {
    return (r.exercise.classification === 'personal' ? 'Personal Challenges' : 'Team Challenges') === category &&
      (f.category === 'All' || f.category === r.category) && (f.grade === 'Mix' || f.grade === r.curriculum.grade) && f.main === 'Mix' && !f.unit && !f.lesson &&
      `${r.exercise.title} ${r.exercise.instructions} ${r.exercise.type} ${r.category ?? ''}`.toLowerCase().includes(f.query.trim().toLowerCase()) &&
      libraryGeographyMatches(r.geography, f.scope, city)
  }
  return <section aria-label="Content Library" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 className="text-2xl font-bold">My Content</h2>
    <ContentPicker key={category} section={category} items={items} libraryView compactFilters draftGrades={records.filter(r => r.category === 'Mathematics').flatMap(r => r.curriculum.grade ? [r.curriculum.grade] : [])} renderDrafts={(filters, city) => <section aria-label="My Content" className="mt-6">
      <h3 className="sr-only">Saved exercises</h3>
      {loading && <p role="status">Loading content…</p>}
      {error && <p role="alert">{error} <button type="button" disabled={loading} className={control} onClick={() => void load(after ?? undefined)}>Retry</button></p>}
      <ul className="mt-3 divide-y divide-slate-200">{records.filter(r => visible(r, filters, city)).map(r => <li key={r.contentId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3">
        <div className="min-w-0 flex-1 basis-48 break-words"><h4 className="font-semibold">{r.exercise.title}</h4><p className="text-sm text-slate-600">{typeName(r.exercise.type)}{r.category ? ` · ${r.category}` : ''}{r.curriculum.grade ? ` · Grade ${r.curriculum.grade}` : ''} · {contentStatus[r.status]}</p><time className="text-xs text-slate-500" dateTime={r.reviewEvents?.at(-1)?.decidedAt ?? r.updatedAt}>{new Date(r.reviewEvents?.at(-1)?.decidedAt ?? r.updatedAt).toLocaleString()}</time></div>
        <ContentFeedback record={r} />
        <div className="flex flex-wrap gap-2"><button type="button" disabled={loading} className={`${control} border-emerald-600 text-emerald-900`} onClick={() => { void action(() => r.status === 'changes_requested' && onRevise ? onRevise(r.contentId, r.revisionId) : onEdit?.(r.contentId)) }} aria-label={`${r.status === 'draft' ? 'Edit' : r.status === 'changes_requested' ? 'Revise' : 'View'} ${r.exercise.title}`}>{r.status === 'draft' ? 'Edit' : r.status === 'changes_requested' ? 'Revise' : 'View'}</button>
          {r.status === 'approved' && onRevise && <button type="button" disabled={loading} className={control} onClick={() => void action(() => onRevise(r.contentId, r.revisionId))}>Create New Revision</button>}
          <button type="button" disabled={loading} className={control} aria-label={`Preview ${r.status === 'draft' ? 'draft ' : ''}${r.exercise.title}`} onClick={() => void action(async () => { const exact = await creatorContentApi.revision(r.contentId, r.revisionId); if (alive.current) setPreview(fromPersistence(exact.exercise)) })}>Preview</button></div>
      </li>)}</ul>
      {!loading && !error && !records.some(r => visible(r, filters, city)) && <p className="mt-2 text-sm text-slate-600">No saved content matches. Create an exercise or adjust the filters.</p>}
      {after && <button type="button" className={`${control} mt-3`} disabled={loading} onClick={() => void load(after)}>Load more content</button>}
    </section>} />
    {preview && <ExercisePreview exercise={preview} onClose={() => setPreview(null)} />}
  </section>
}
