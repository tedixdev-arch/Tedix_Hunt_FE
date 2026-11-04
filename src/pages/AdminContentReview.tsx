import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { AdminShell } from './AdminConsole'
import { adminContentReviewApi, reviewCommentValid, reviewError, type ContentDecision, type ContentReviewItem } from '../services/api/adminContentReview'
import { ApiError } from '../services/api/client'
import type { LibraryContent } from '../services/api/creatorContent'
import { ContentReviewPreview } from '../features/creator/content/ContentReviewPreview'
import { control } from '../features/creator/exercises/ExerciseRenderer'
import { typeName } from '../features/creator/exercises/catalog'
import '../features/creator/content/contentStudio.css'
import '../features/creator/exercises/personalChallenge.css'

export function AdminContentReviewPage() {
  const { user } = useAuth()
  return <AdminShell active="content-review"><ContentReviewWorkspace reviewerId={user?.id} /></AdminShell>
}

export function ContentReviewWorkspace({ reviewerId }: { reviewerId?: string }) {
  const [items, setItems] = useState<ContentReviewItem[]>([]), [after, setAfter] = useState<string | null>(null)
  const [record, setRecord] = useState<LibraryContent | null>(null)
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [commentOpen, setCommentOpen] = useState(false), [comment, setComment] = useState('')
  const busy = useRef(false), alive = useRef(false), selectedHeading = useRef<HTMLHeadingElement>(null)
  const queue = async (cursor?: string) => {
    const page = await adminContentReviewApi.list(cursor)
    if (!alive.current) return
    setItems(old => cursor ? [...old, ...page.items.filter(item => !old.some(existing => existing.revisionId === item.revisionId))] : page.items)
    setAfter(page.nextAfter)
  }
  const load = async (cursor?: string) => {
    if (busy.current) return
    busy.current = true; setPending(true); setError('')
    try { await queue(cursor) } catch (error) { if (alive.current) setError(reviewError(error)) }
    finally { busy.current = false; if (alive.current) setPending(false) }
  }
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false } }, [])
  useEffect(() => { if (record) selectedHeading.current?.focus() }, [record?.revisionId])
  const refreshStale = async () => {
    setRecord(null); setComment(''); setCommentOpen(false)
    try { await queue() } catch { if (alive.current) { setItems([]); setAfter(null); setError('Unable to refresh submissions. Please retry. No decision was confirmed.') } }
  }
  const open = async (item: ContentReviewItem) => {
    if (busy.current) return
    busy.current = true; setPending(true); setError(''); setNotice('')
    try {
      const exact = await adminContentReviewApi.detail(item.contentId, item.revisionId)
      if (alive.current) { setRecord(exact); setComment(''); setCommentOpen(false) }
    } catch (error) {
      if (alive.current) {
        setError(reviewError(error))
        if (error instanceof ApiError && [404, 409].includes(error.status ?? 0)) await refreshStale()
      }
    } finally { busy.current = false; if (alive.current) setPending(false) }
  }
  const decide = async (decision: ContentDecision) => {
    if (busy.current || !record) return
    if (record.ownerId === reviewerId) { setError('You cannot review your own exercise. Another Admin must review it.'); return }
    if (decision === 'request-changes' && !reviewCommentValid(comment)) { setError('Add a comment of 3–1000 characters containing a letter or number.'); return }
    const inspected = record
    busy.current = true; setPending(true); setError(''); setNotice('')
    try {
      await adminContentReviewApi.decide(inspected.contentId, inspected.revisionId, decision, comment)
      if (!alive.current) return
      setRecord(null); setComment(''); setCommentOpen(false)
      setItems(old => old.filter(item => item.revisionId !== inspected.revisionId))
      setNotice(decision === 'approve' ? 'Exercise approved.' : 'Changes requested.')
      // Refresh the first page, preserving the confirmed decision if refresh fails.
      try { await queue() } catch { if (alive.current) setError('Decision saved. Unable to refresh the queue. Please retry.') }
    } catch (error) {
      if (alive.current) {
        setError(reviewError(error))
        if (error instanceof ApiError && [404, 409].includes(error.status ?? 0)) await refreshStale()
        // A transport failure has an unknown outcome. Refetch before allowing another decision.
        if (!(error instanceof ApiError) || error.status === null || (error.status ?? 0) >= 500) {
          try { const current = await adminContentReviewApi.detail(inspected.contentId, inspected.revisionId); if (alive.current) setRecord(current) }
          catch { if (alive.current) await refreshStale() }
        }
      }
    } finally { busy.current = false; if (alive.current) setPending(false) }
  }
  const selfReview = !!record && record.ownerId === reviewerId
  return <section aria-label="Content Review" className="content-studio mt-6 min-w-0">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Content Review</h2>{record ? <button type="button" disabled={pending} className={control} onClick={() => { setRecord(null); setError(''); setCommentOpen(false); setComment('') }}>Back to queue</button> : <button type="button" disabled={pending} className={control} onClick={() => void load()}>Refresh</button>}</div>
    {notice && <p role="status" className="mb-4 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mb-4 break-words text-sm text-red-800">{error}</p>}
    {pending && <p role="status" className="mb-3 text-sm">Loading…</p>}
    {record ? <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-6">
      <h3 ref={selectedHeading} tabIndex={-1} className="sr-only">Review submitted exercise</h3>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ContentReviewPreview key={record.revisionId} record={record} />
        <section aria-label="Review decision" className="min-w-0 self-start space-y-3 lg:sticky lg:top-4">
          {selfReview && <p className="text-sm text-slate-600">Another Admin must review your exercise.</p>}
          <button type="button" disabled={pending || selfReview} className={`${control} w-full bg-emerald-600 font-semibold text-white`} onClick={() => void decide('approve')}>Approve</button>
          {!commentOpen ? <button type="button" disabled={pending || selfReview} className={`${control} w-full`} onClick={() => { setCommentOpen(true); setError('') }}>Request Changes</button> : <form className="space-y-3" onSubmit={event => { event.preventDefault(); void decide('request-changes') }}>
            <label className="block text-sm font-medium">Feedback<textarea autoFocus aria-label="Review comment" maxLength={1000} disabled={pending} className={`${control} mt-2 min-h-28 w-full`} value={comment} onChange={event => setComment(event.target.value)} placeholder="What should the Creator change?" /></label>
            <button type="submit" disabled={pending || selfReview} className={`${control} w-full`}>Send Request</button>
            <button type="button" disabled={pending} className={`${control} w-full border-transparent`} onClick={() => { setCommentOpen(false); setComment(''); setError('') }}>Cancel</button>
          </form>}
        </section>
      </div>
    </div> : <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
      <ul className="divide-y divide-slate-200">{items.map(item => <li key={item.revisionId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0 flex-1 basis-48 break-words"><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-600">{item.classification === 'team' ? 'Team' : 'Personal'} · {typeName(item.type)} · {item.category || 'Unclassified'}</p><time className="text-xs text-slate-500" dateTime={item.submittedAt}>{new Date(item.submittedAt).toLocaleString()}</time></div><button type="button" disabled={pending} aria-label={`Review ${item.title}`} className={control} onClick={() => void open(item)}>Review</button></li>)}</ul>
      {!pending && !error && items.length === 0 && <p className="py-4 text-sm text-slate-600">No submissions awaiting review.</p>}
      {after && <button type="button" disabled={pending} className={`${control} mt-4`} onClick={() => void load(after)}>Load more</button>}
    </div>}
  </section>
}
