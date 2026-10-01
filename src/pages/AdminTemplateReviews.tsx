import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminShell } from './AdminConsole.tsx'
import { adminTemplateReviewsApi, type AdminTemplateReview } from '../services/api/index.ts'

const checklist = ['Template information', 'Challenges, answers and hints', 'Fixed checkpoint route', 'Route-safety checks', 'Participant preview', 'Complete Hunt test']

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'The request could not be completed.'
}

export function AdminTemplateReviewsPage() {
  const [reviews, setReviews] = useState<AdminTemplateReview[] | null>(null)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setReviews(null); setError('')
    try { setReviews(await adminTemplateReviewsApi.list()) }
    catch (cause) { setError(message(cause)) }
  }, [])
  useEffect(() => { void load() }, [load])

  return <AdminShell active="templates"><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-2xl font-bold">Template Reviews</h2>
    <p className="mt-2 text-slate-600">Approve Creator templates before they appear in Quick Setup.</p>
    {reviews === null && !error && <p className="mt-5" role="status">Loading submitted Templates…</p>}
    {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4" role="alert"><p>{error}</p><button className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" onClick={() => void load()} type="button">Retry</button></div>}
    {reviews?.length === 0 && <p className="mt-5 rounded-xl bg-slate-50 p-5">No Creator Templates are awaiting review.</p>}
    {!!reviews?.length && <div className="mt-5 divide-y divide-slate-100">{reviews.map(review => <div className="flex min-h-16 items-center justify-between gap-4 py-3" key={review.key}><span><strong>{review.content.displayName}</strong><span className="ml-2 text-sm text-slate-500">{review.creator.name} · Submitted version {review.version}</span></span><Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white" to={`/admin/reviews/${encodeURIComponent(review.key)}`}>Review</Link></div>)}</div>}
  </section></AdminShell>
}

export function AdminTemplateReviewDetailPage() {
  const { key = '' } = useParams()
  const [review, setReview] = useState<AdminTemplateReview | null>(null)
  const [result, setResult] = useState<AdminTemplateReview | null>(null)
  const [checked, setChecked] = useState(new Set<string>())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError(''); setReview(null)
    try { setReview(await adminTemplateReviewsApi.get(key)) }
    catch (cause) { setError(message(cause)) }
    finally { setLoading(false) }
  }, [key])
  useEffect(() => { void load() }, [load])

  const decide = async (action: 'approve' | 'changes') => {
    if (saving || !review) return
    setSaving(true); setError('')
    try {
      const response = action === 'approve'
        ? await adminTemplateReviewsApi.approve(review.key)
        : await adminTemplateReviewsApi.requestChanges(review.key)
      // The server response, never a local projection, is the recorded decision.
      setResult(response)
    } catch (cause) { setError(message(cause)) }
    finally { setSaving(false) }
  }

  if (loading) return <AdminShell active="templates"><p className="mt-8" role="status">Loading submitted Template…</p></AdminShell>
  if (!review) return <AdminShell active="templates"><section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5" role="alert"><h2 className="text-xl font-bold">Template could not be loaded</h2><p className="mt-2">{error}</p><button className="mt-4 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white" onClick={() => void load()} type="button">Retry</button></section></AdminShell>
  if (result) {
    const approved = result.status === 'approved'
    return <AdminShell active="templates"><section className={`mt-6 rounded-2xl border p-7 ${approved ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`} role="status"><div className={`grid h-12 w-12 place-items-center rounded-full text-2xl font-bold text-white ${approved ? 'bg-emerald-500' : 'bg-amber-500'}`}>✓</div><p className="mt-5 text-xs font-semibold uppercase tracking-wide">Decision recorded by backend</p><h2 className="mt-2 text-3xl font-bold">{approved ? 'Template approved' : 'Changes requested'}</h2><p className="mt-3">{result.content.displayName} · submitted version {result.version}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-slate-950 px-5 font-bold text-white" to="/admin/templates">Return to Template Reviews</Link></section></AdminShell>
  }

  // The review API exposes the exact version pinned by submitted_version as version.
  const configuration = review.content.configuration
  const positions = configuration.checkpointPositions ?? []
  const duration = review.content.durationMinutes ?? review.content.duration
  return <AdminShell active="templates"><div className="mt-6"><Link className="text-sm font-bold text-slate-500" to="/admin/templates">← Template Reviews</Link><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-700">Awaiting review</p><h2 className="mt-2 text-3xl font-bold">{review.content.displayName}</h2><p className="mt-2 text-slate-600">{review.creator.name} ({review.creator.email}) · {review.content.theme} · Submitted version {review.version}</p></div>
    {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">{error}</p>}
    <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><div className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-bold">Template summary</h3><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Version under review</dt><dd className="mt-1 font-bold">{review.version}</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="mt-1 font-bold">{duration == null ? '—' : `${String(duration)} minutes`}</dd></div><div><dt className="text-slate-500">Checkpoints</dt><dd className="mt-1 font-bold">{configuration.normalCheckpointCount}</dd></div></dl><p className="mt-5 text-sm text-slate-600">{review.content.mission}</p></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-bold">Fixed route and safety</h3><p className="mt-2 text-sm text-slate-500">Read-only persisted checkpoint geography</p><div className="mt-4 space-y-2">{positions.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm">No checkpoint positions were submitted.</p> : positions.map(position => <div className="grid gap-1 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-[1fr_auto]" key={position.checkpointNumber}><strong>{position.checkpointNumber}. {position.name}</strong><span>{position.latitude}, {position.longitude} · {position.radiusMeters} m radius</span></div>)}</div></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-bold">Content and participant flow</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4 text-sm font-bold">Challenges · {review.content.checkpoints.length}</div><div className="rounded-xl bg-slate-50 p-4 text-sm font-bold">Scoring · Persisted with version {review.version}</div></div></article>
    </div><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-bold">Review checklist</h3><p className="mt-2 text-sm text-slate-500">Check every area before making a decision.</p><div className="mt-4 space-y-2">{checklist.map(item => <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold" key={item}><input checked={checked.has(item)} className="h-5 w-5 accent-emerald-500" onChange={() => setChecked(current => { const next = new Set(current); next.has(item) ? next.delete(item) : next.add(item); return next })} type="checkbox" />{item}</label>)}</div><button className="mt-4 min-h-12 w-full rounded-xl bg-emerald-500 font-bold disabled:cursor-not-allowed disabled:bg-slate-300" disabled={saving || checked.size !== checklist.length} onClick={() => void decide('approve')} type="button">{saving ? 'Recording decision…' : 'Approve template'}</button><button className="mt-2 min-h-12 w-full rounded-xl border border-amber-400 bg-amber-50 font-bold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40" disabled={saving} onClick={() => void decide('changes')} type="button">{saving ? 'Recording decision…' : 'Request changes'}</button></aside></section>
  </AdminShell>
}
