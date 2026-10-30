import { useCallback, useEffect, useRef, useState } from 'react'
import { adminTemplateReviewsApi, type AdminTemplateReview, type RetainedLocalReview } from '../../services/api/adminTemplateReviews'
import { inspectHuntGeography } from '../../components/huntMapGeography'
import { HuntMapInspection } from '../../components/HuntMapPreview'
import { PersistedValue } from './PersistedValue'
import { reviewError } from './reviewState'
const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
const button = 'min-h-12 rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:opacity-40'

export function LocalBindingDetails({ review }: { review: AdminTemplateReview | RetainedLocalReview }) {
  const saved = review.localitySnapshot, current = review.currentLocality
  const changed = saved && current && (saved.id !== current.id || saved.countryCode !== current.countryCode || saved.latitude !== current.latitude || saved.longitude !== current.longitude)
  const relabeled = saved && current && (saved.name !== current.name || saved.administrativeContext !== current.administrativeContext || saved.countryDisplayName !== current.countryDisplayName)
  const warning = review.content ? inspectHuntGeography(review.content.configuration, 'Saved version').warning : 'The retained approved version cannot be resolved. Its content is unavailable.'
  return <section className={panel} aria-label="Local binding inspection"><h3 className="text-lg font-bold">Saved locality and current registry</h3>
    {(!saved || !review.localityId) && <p role="alert">Historical or unbound locality. No valid locality binding is inferred.</p>}
    {!current && <p role="alert">Current locality is missing or unavailable.</p>}
    {current && !current.active && <p role="alert">Current locality is inactive.</p>}
    {changed && <p role="alert">Locality coordinates, country or identity changed. Approval cannot bypass this geographic conflict.</p>}
    {relabeled && <p>Registry labels changed; the saved snapshot remains unchanged.</p>}
    {warning && <p role="alert">{warning}</p>}
    <div className="mt-3 grid min-w-0 gap-4 sm:grid-cols-2"><details><summary className="cursor-pointer font-bold">Saved locality snapshot</summary><PersistedValue value={saved} /></details><details><summary className="cursor-pointer font-bold">Current registry entry</summary><PersistedValue value={current} /></details></div>
  </section>
}

export function RetainedLocalInspection({ templateKey }: { templateKey: string }) {
  const [approval, setApproval] = useState<RetainedLocalReview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const load = useCallback(async () => {
    const request = ++generation.current
    setApproval(null); setError(''); setLoading(true)
    try { const result = await adminTemplateReviewsApi.approved(templateKey); if (request === generation.current) setApproval(result) }
    catch (cause) { if (request === generation.current) setError(reviewError(cause)) }
    finally { if (request === generation.current) setLoading(false) }
  }, [templateKey])
  useEffect(() => { void load(); return () => { generation.current++ } }, [load])
  return <section className={panel} aria-label="Retained Local approval"><h3 className="text-xl font-bold">Retained Local approval</h3><p className="mt-2">This approval is separate from the candidate under review.</p>
    <button className={button + ' mt-3'} onClick={() => void load()} disabled={loading}>Refresh retained approval</button>
    {loading && <p role="status">Loading retained approval…</p>}{error && <p role="alert">{error}</p>}
    {approval && <div className="mt-4 space-y-4"><p>Candidate version: {approval.candidateVersion ?? 'unavailable'} · {approval.candidateStatus}. Retained version: {approval.version ?? 'unresolved'}.</p>
      <p>Approval record: {approval.localApproval?.authority ?? 'unavailable'}.</p>
      {(!approval.localApproval?.independentEvidence || !approval.localApproval?.localityBound || approval.localApproval.authority !== 'approved') && <p role="alert">Historical, unbound or missing independent approval evidence. This record does not establish eligibility for new Organizer selection.</p>}
      <LocalBindingDetails review={approval} />
      <details className={panel}><summary className="cursor-pointer font-bold">Inspect exact retained content</summary>{approval.content && approval.version != null ? <><HuntMapInspection configuration={approval.content.configuration} sourceLabel={`Retained version ${approval.version}`} /><PersistedValue value={approval.content} /></> : <p role="alert">Retained content is unresolved. No candidate content was substituted.</p>}</details>
      {approval.localSuspension && <section aria-label="Suspension record"><h4 className="font-bold">Suspended for new selection</h4><PersistedValue value={approval.localSuspension} /><p>Excluded from NEW Organizer selection. Existing Hunts are not terminated.</p></section>}
    </div>}
  </section>
}
