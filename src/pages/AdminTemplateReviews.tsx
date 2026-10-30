import { ApiError } from '../services/api/client'
import { useAuth } from '../app/providers/AuthProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HuntMapInspection } from '../components/HuntMapPreview'
import { AdminShell } from './AdminConsole.tsx'
import { adminTemplateReviewsApi, type AdminTemplateReview } from '../services/api/adminTemplateReviews.ts'
import { LocalityProposalReview } from '../features/admin/LocalityProposalReview'
import { RetainedLocalInspection, LocalBindingDetails } from '../features/admin/LocalInspection'
import { PersistedValue } from '../features/admin/PersistedValue'
import { reviewCategories, reviewCategory, reviewError, type ReviewCategory } from '../features/admin/reviewState'

const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
const button = 'min-h-12 rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:opacity-40'

export function AdminTemplateReviewsPage() { return <ReviewWorkspace /> }
export function AdminTemplateReviewDetailPage() { return <ReviewWorkspace /> }

function ReviewWorkspace() {
  const { key = '' } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const category: ReviewCategory = reviewCategories.find(value => value === params.get('category')) ?? 'Universal'
  const [reviews, setReviews] = useState<AdminTemplateReview[] | null>(null)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)
  const onDenied = useCallback(() => { setDenied(true); setReviews(null) }, [])
  const generation = useRef(0)
  const load = useCallback(async () => {
    const request = ++generation.current
    setReviews(null); setError(''); setDenied(false)
    try { const items = await adminTemplateReviewsApi.list(); if (request === generation.current) setReviews(items) }
    catch (cause) { if (request === generation.current) { setError(reviewError(cause)); if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) onDenied() } }
  }, [onDenied])
  useEffect(() => { void load(); return () => { generation.current++ } }, [load])
  if (denied) return <AdminShell active="templates"><p className={panel + ' mt-5'} role="alert">Admin access is required or your session has expired. Sign in again to review.</p><button className={button} onClick={() => void load()}>Retry access</button></AdminShell>
  return <AdminShell active="templates"><h2 className="mt-6 text-2xl font-bold">Template Reviews</h2>
    <p className="mt-2 text-slate-600">Choose a category, select an item, inspect it and decide.</p>
    <nav aria-label="Review categories" className="my-5 flex flex-wrap gap-2">{reviewCategories.map(value => <Link className={button + (category === value ? ' bg-slate-950 text-white' : ' bg-white')} aria-current={category === value ? 'page' : undefined} key={value} to={`/admin/templates?category=${encodeURIComponent(value)}`}>{value}</Link>)}</nav>
    {category === 'Locality proposals' ? <LocalityProposalReview /> : <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><section aria-label="Review queue" className={panel}>
      <h3 className="text-lg font-bold">{category}</h3>
      <button type="button" className={button + ' mt-3'} onClick={() => void load()}>Refresh queue</button>
      {reviews === null && !error && <p className="mt-4" role="status">Loading submitted Templates…</p>}
      {error && <p className="mt-4" role="alert">{error}</p>}
      {reviews && !reviews.some(item => reviewCategory(item) === category) && <p className="mt-4">No items awaiting review in this category.</p>}
      <ul className="mt-3 space-y-2">{reviews?.filter(item => reviewCategory(item) === category).map(item => <li key={item.key}><Link className="block min-h-12 break-words rounded-xl border p-3 focus-visible:outline" aria-current={key === item.key ? 'true' : undefined} to={`/admin/reviews/${encodeURIComponent(item.key)}?category=${encodeURIComponent(category)}`}><strong>{item.content.displayName}</strong><span className="block text-sm">{item.creator.name ?? 'Creator'} · Submitted version {item.version}</span></Link></li>)}</ul>
      {category === 'Local' && <form className="mt-5" onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get('key'); if (typeof value === 'string' && value.trim()) navigate(`/admin/reviews/${encodeURIComponent(value.trim())}?category=Local&view=approved`) }}><label className="block text-sm font-bold" htmlFor="retained-key">Find retained Local approval</label><input id="retained-key" name="key" required className="mt-2 min-h-12 w-full rounded-lg border p-2" placeholder="Template key" /><button className={button + ' mt-2'}>Inspect approval</button></form>}
    </section><div className="min-w-0">{key ? <TemplateInspection key={`${key}:${params.get('view')}`} templateKey={key} onDecision={load} onDenied={onDenied} /> : <section className={panel}>Select an item to inspect its exact submitted version.</section>}</div></div>}
  </AdminShell>
}

function TemplateInspection({ templateKey, onDecision, onDenied }: { templateKey: string; onDecision: () => Promise<void>; onDenied: () => void }) {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const retainedOnly = params.get('view') === 'approved'
  const decisionLock = useRef(false)
  const [review, setReview] = useState<AdminTemplateReview | null>(null)
  const [result, setResult] = useState<AdminTemplateReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const load = useCallback(async () => {
    const request = ++generation.current
    setLoading(true); setError(''); setReview(null); setResult(null)
    try { const item = await adminTemplateReviewsApi.get(templateKey); if (request === generation.current) setReview(item) }
    catch (cause) { if (request === generation.current) { setError(reviewError(cause)); if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) onDenied() } }
    finally { if (request === generation.current) setLoading(false) }
  }, [templateKey, onDenied])
  useEffect(() => { if (!retainedOnly) void load(); else setLoading(false); return () => { generation.current++ } }, [load, retainedOnly])
  const decide = async (action: 'approve' | 'changes') => {
    if (decisionLock.current || saving || !review || result || review.status !== 'submitted') return
    if (action === 'approve' && (!user || review.creator.id === user.id)) return
    decisionLock.current = true
    setSaving(true); setError('')
    const request = generation.current
    try {
      const version = review.category ? review.version : undefined
      const response = action === 'approve' ? await adminTemplateReviewsApi.approve(review.key, version) : await adminTemplateReviewsApi.requestChanges(review.key, version)
      if (request !== generation.current) return
      setResult(response); await onDecision()
    } catch (cause) {
      if (request !== generation.current) return
      if (cause instanceof ApiError && cause.status === 409) {
        await load(); await onDecision()
        setError('This submission changed or was already reviewed. Inspection has been refreshed. Inspect it again and make a new explicit decision.')
      } else {
        if (cause instanceof ApiError && [401, 403, 404].includes(cause.status ?? 0)) setReview(null)
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) onDenied()
        setError(reviewError(cause))
      }
    } finally { decisionLock.current = false; setSaving(false) }
  }

  if (loading) return <p role="status">Loading submitted Template…</p>
  return <div className="min-w-0 space-y-4">
    {error && <p className={panel + ' text-red-900'} role="alert">{error}</p>}
    {!retainedOnly && <button className={button} type="button" disabled={saving} onClick={() => void load()}>Refresh inspection</button>}
    {review && <><header className={panel}><p>{reviewCategory(review)} · {result?.status ?? review.status}</p><h3 className="mt-2 break-words text-2xl font-bold">{review.content.displayName}</h3><p className="mt-2 break-words">{review.creator.name} ({review.creator.email}) · Submitted version {review.version}</p></header>
      <section className={panel} aria-label="Template decision"><h3 className="text-xl font-bold">Decision</h3>
        {result ? <p role="status">{result.status === 'approved' ? 'Template approved' : result.status === 'changes_requested' ? 'Changes requested' : 'Decision response received; refresh inspection'} · version {result.version}</p> : <div className="mt-3 flex flex-wrap gap-3"><button className={button + ' bg-emerald-100'} disabled={saving || !user || review.creator.id === user.id || review.status !== 'submitted'} onClick={() => void decide('approve')}>Approve template</button><button className={button} disabled={saving || review.status !== 'submitted'} onClick={() => void decide('changes')}>Request changes</button></div>}
      {review.creator.id === user?.id && <p className="mt-3">You cannot approve your own Template, including when you also have a Creator role.</p>}
      </section>{review.category === 'local' && <LocalBindingDetails review={review} />}<SubmittedContent review={review} /></>}
    {(retainedOnly || review?.category === 'local' || (!review && !loading)) && <RetainedLocalInspection key={`${templateKey}:${result?.version}:${result?.status}`} templateKey={templateKey} onDenied={onDenied} />}
  </div>
}
export function SubmittedContent({ review }: { review: AdminTemplateReview }) {
  const configuration = review.content.configuration
  const duration = configuration.durationMinutes
  const additionalContent = Object.fromEntries(Object.entries(review.content).filter(([field]) => !['key', 'version', 'displayName', 'theme', 'mission', 'configuration', 'checkpoints', 'scoring'].includes(field)))
  return <><section className={panel}><h3 className="text-xl font-bold">Template summary</h3><p>Version under review: {review.version} · {duration == null ? 'Duration not submitted' : `${duration} minutes`} · {configuration.normalCheckpointCount} checkpoints</p><PersistedValue value={review.content.mission} /></section>
    {review.category !== 'universal' && <details className={panel}><summary className="cursor-pointer font-bold">Saved geography</summary><HuntMapInspection configuration={configuration} /><PersistedValue value={{ checkpointPositions: configuration.checkpointPositions, finishPoint: configuration.finishPoint }} /></details>}
    <details className={panel}><summary className="cursor-pointer font-bold">Checkpoints, answers and hints</summary><div className="mt-3 space-y-3">{review.content.checkpoints.map((checkpoint, index) => <section key={index}><h4 className="font-bold">{checkpoint && typeof checkpoint === 'object' && (checkpoint as Record<string, unknown>).role === 'terminal' ? 'FinishPoint' : `Checkpoint ${index + 1}`}</h4><PersistedValue value={checkpoint} /></section>)}</div></details>
    <details className={panel}><summary className="cursor-pointer font-bold">Scoring</summary><PersistedValue value={review.content.scoring} /></details>
    <details className={panel}><summary className="cursor-pointer font-bold">Other saved settings</summary><PersistedValue value={review.category === 'universal' ? Object.fromEntries(Object.entries(configuration).filter(([field]) => !['checkpointPositions', 'finishPoint'].includes(field))) : configuration} /><PersistedValue value={additionalContent} /></details></>
}
