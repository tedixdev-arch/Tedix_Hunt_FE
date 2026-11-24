import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../services/api/client'
import type { CreatorTemplate } from '../../services/api/creatorTemplates'
import { creatorCustomRequestsApi, type CreatorCustomRequest } from '../../services/api/operations'

const statusLabel: Record<string, string> = {
  assigned: 'To build', in_progress: 'Building', completed: 'Approved · delivered', rejected: 'Cancelled', closed: 'Closed', new: 'New', in_review: 'In review',
}
const templateLabel: Record<string, string> = { draft: 'Draft', submitted: 'Submitted for Admin review', changes_requested: 'Changes requested', approved: 'Approved' }
const linkErrors: Record<string, string> = {
  template_not_local: 'Only Local templates can be used for a custom Hunt.', template_already_linked: 'That template is already used for another request.',
  template_already_approved: 'Approved templates cannot be reused. Create a new Local template.', request_already_linked: 'This request already has a template.',
  request_not_assignable: 'This request is no longer open.',
}
export const linkErrorMessage = (reason: unknown) => {
  const code = reason instanceof ApiError && reason.details && typeof reason.details === 'object' && 'error' in reason.details ? String(reason.details.error) : ''
  return linkErrors[code] ?? "We couldn't link the template. Please retry."
}

/**
 * Custom Hunt briefs the Admin assigned to this Creator. Building one opens a new Local template that is linked to
 * the brief on first save; an existing unapproved Local draft can also be linked. Admin approval delivers it.
 */
export function CreatorCustomRequests({ templates }: { templates: CreatorTemplate[] }) {
  const [requests, setRequests] = useState<CreatorCustomRequest[]>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [choice, setChoice] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')
  const [linkError, setLinkError] = useState<Record<string, string>>({})
  useEffect(() => {
    let live = true
    creatorCustomRequestsApi.list().then(list => { if (live) { setRequests(list); setError('') } })
      .catch(() => { if (live) setError("We couldn't load your custom Hunt requests.") })
    return () => { live = false }
  }, [attempt])
  if (!requests && !error) return null
  if (requests && requests.length === 0) return null
  const linkedKeys = new Set((requests ?? []).flatMap(r => r.template ? [r.template.key] : []))
  const linkable = templates.filter(t => t.category === 'local' && t.status !== 'approved' && t.localApprovedVersion == null && !linkedKeys.has(t.key))
  async function link(id: string) {
    const key = choice[id]
    if (!key) return
    setBusy(id); setLinkError(e => ({ ...e, [id]: '' }))
    try { await creatorCustomRequestsApi.linkTemplate(id, key); setAttempt(a => a + 1) }
    catch (reason) { setLinkError(e => ({ ...e, [id]: linkErrorMessage(reason) })) }
    finally { setBusy('') }
  }
  return <section className="mt-8" aria-labelledby="custom-requests-heading">
    <h2 id="custom-requests-heading" className="text-2xl font-bold">Custom Hunt requests</h2>
    <p className="mt-1 text-slate-600">Organizers asked for these Hunts and an Admin assigned them to you. Build a Local template for the brief and submit it for review; once approved it is delivered only to that organization.</p>
    {/* Secondary panel: a load failure is reported quietly so it never competes with the Template list alert. */}
    {error && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{error} <button type="button" className="ml-2 font-bold underline" onClick={() => setAttempt(a => a + 1)}>Retry</button></p>}
    <ul className="mt-4 space-y-4">{(requests ?? []).map(r => {
      const open = r.status === 'assigned' || r.status === 'in_progress'
      return <li key={r.id} className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm" aria-label={`Custom request${r.organizationName ? ` from ${r.organizationName}` : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-bold">{r.organizationName ?? 'Organization'}{r.city ? ` · ${r.city}` : ''}</p>
            <p className="mt-1 text-xs text-slate-500">{r.preferredDate ? `Preferred ${r.preferredDate}` : 'No preferred date'}{r.participantCount ? ` · ${r.participantCount} participants` : ''}</p></div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">{statusLabel[r.status] ?? r.status}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm">{r.details}</p>
        {r.template
          ? <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span>Template: <strong>{r.template.displayName ?? r.template.key}</strong> · {templateLabel[r.template.status] ?? r.template.status}</span>
            <Link className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-bold" to={`/create?template=${encodeURIComponent(r.template.key)}`}>Open template</Link></div>
          : open && <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 font-bold hover:bg-emerald-400" to={`/create?category=local&customRequest=${encodeURIComponent(r.id)}`}>Build template for this request</Link>
            {linkable.length > 0 && <><span className="text-sm text-slate-500">or</span>
              <select aria-label="Existing Local draft" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" value={choice[r.id] ?? ''} onChange={e => setChoice(c => ({ ...c, [r.id]: e.target.value }))}>
                <option value="">Use an existing Local draft</option>{linkable.map(t => <option key={t.key} value={t.key}>{t.content.displayName || t.key}</option>)}</select>
              <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold disabled:opacity-50" disabled={busy === r.id || !choice[r.id]} onClick={() => void link(r.id)}>Link</button></>}
          </div>}
        {linkError[r.id] && <p role="alert" className="mt-2 text-sm font-semibold text-red-800">{linkError[r.id]}</p>}
      </li>
    })}</ul>
  </section>
}
