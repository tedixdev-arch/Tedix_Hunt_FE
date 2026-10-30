import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/api/client'
import { geographyApi, type Country, type Locality } from '../../services/api/geography'
import { localityProposalsApi, type LocalityProposal, type LocalityProposalInput } from '../../services/api/localityProposals'

const control = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm'
const empty = { name: '', administrativeContext: '', latitude: '', longitude: '', explanation: '', evidenceReference: '' }
function failure(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.status === 403) return 'Your account cannot access locality proposals.'
    if (error.status === 400) return 'Check the country, name, administrative context, coordinates and independent evidence. Your input is kept.'
    if (error.status === 409) return 'A duplicate or decision conflict was reported. Refresh your proposals and search the registry before trying again. A pending proposal is still unavailable for selection.'
  }
  return 'The request could not be confirmed. Refresh your proposals before trying again to avoid sending a duplicate.'
}
export function proposalValidation(input: LocalityProposalInput): string {
  if (!/^[A-Z]{2}$/.test(input.countryCode)) return 'Choose a country above before sending a proposal.'
  if (!input.name.trim() || input.name.length > 200 || !/[\p{L}\p{N}]/u.test(input.name)) return 'Enter a locality name of 1–200 characters.'
  if (!input.administrativeContext.trim() || input.administrativeContext.length > 200) return 'Enter the county, region or other administrative context (up to 200 characters).'
  if (!Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90 || !Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180) return 'Enter latitude from −90 to 90 and longitude from −180 to 180.'
  if (input.explanation.trim().length < 20 || input.explanation.length > 1000) return 'Explain why the locality is missing in 20–1,000 characters.'
  if (input.evidenceReference.trim().length < 20 || input.evidenceReference.length > 1000 || !/[\p{L}]{3}/u.test(input.evidenceReference)) return 'Provide an independent source URL or retrievable citation in 20–1,000 characters.'
  if (/mapbox/i.test(input.explanation + input.evidenceReference)) return 'Use independent evidence and coordinates that may be stored. Mapbox-derived evidence is not accepted.'
  return ''
}

/** Kept inside the existing geography section; proposals never become registry records here. */
export function LocalityProposals({ country, countries, onRegistryPlace }: { country: string; countries: Country[]; onRegistryPlace: (place: Locality) => void }) {
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(empty)
  const [proposals, setProposals] = useState<LocalityProposal[]>([])
  const [loading, setLoading] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [uncertain, setUncertain] = useState(false)
  const lock = useRef(false), sequence = useRef(0)
  const load = async () => {
    const request = ++sequence.current
    setLoading(true); setError('')
    try {
      const result = await localityProposalsApi.mine()
      if (request === sequence.current) { setProposals(result.proposals); setUncertain(false) }
    } catch (reason) { if (request === sequence.current) { setProposals([]); setError(failure(reason)) } }
    finally { if (request === sequence.current) setLoading(false) }
  }
  useEffect(() => { if (open) void load(); return () => { ++sequence.current } }, [open])
  const send = async () => {
    if (lock.current || uncertain || loading) return
    const input = { ...draft, countryCode: country, latitude: draft.latitude.trim() ? Number(draft.latitude) : NaN, longitude: draft.longitude.trim() ? Number(draft.longitude) : NaN }
    const invalid = proposalValidation(input)
    if (invalid) { setError(invalid); return }
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const result = await localityProposalsApi.submit(input)
      setProposals(current => [result, ...current.filter(item => item.id !== result.id)])
      setDraft(empty); setNotice('Proposal sent for independent review. It cannot be selected while pending.')
    } catch (reason) {
      setError(failure(reason))
      if (!(reason instanceof ApiError) || reason.status === null || reason.status >= 500) setUncertain(true)
      if (reason instanceof ApiError && [401, 403].includes(reason.status ?? 0)) setProposals([])
    } finally { lock.current = false; setBusy(false) }
  }
  const findApproved = async (proposal: LocalityProposal) => {
    if (!proposal.localityId || proposal.status !== 'approved' || lock.current) return
    lock.current = true; setBusy(true); setError('')
    try {
      const place = await geographyApi.get(proposal.localityId)
      if (place.id !== proposal.localityId || place.countryCode !== proposal.countryCode || !place.active) throw new Error('Unavailable')
      onRegistryPlace(place)
      setNotice('Approved locality found in the active registry. Save your draft to use it.')
    } catch { setError('The approved locality is not currently available in the active registry. Refresh the registry before selecting it.') }
    finally { lock.current = false; setBusy(false) }
  }
  return <div className="mt-4 min-w-0 border-t border-slate-200 pt-4">
    <button type="button" aria-expanded={open} aria-controls="locality-proposals" className="min-h-12 text-left text-sm font-bold underline" onClick={() => setOpen(value => !value)}>Can't find your locality?</button>
    {open && <div id="locality-proposals" className="min-w-0 space-y-4">
      <h3 className="font-bold">Propose a missing locality</h3>
      <p className="text-sm text-slate-600">Use independently sourced coordinates and evidence with permission to store them. Do not copy temporary provider results. An Admin reviews the proposal separately.</p>
      <p className="text-sm font-bold">Country: {countries.find(item => item.code === country)?.displayName ?? 'Choose country above'}</p>
      <fieldset disabled={busy || loading} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Locality name<input className={control} maxLength={200} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
        <label className="text-sm font-bold">Administrative context<input className={control} maxLength={200} placeholder="County or region" value={draft.administrativeContext} onChange={e => setDraft({ ...draft, administrativeContext: e.target.value })} /></label>
        <label className="text-sm font-bold">Latitude<input className={control} type="number" step="any" min={-90} max={90} value={draft.latitude} onChange={e => setDraft({ ...draft, latitude: e.target.value })} /></label>
        <label className="text-sm font-bold">Longitude<input className={control} type="number" step="any" min={-180} max={180} value={draft.longitude} onChange={e => setDraft({ ...draft, longitude: e.target.value })} /></label>
        <label className="text-sm font-bold sm:col-span-2">Why is this locality missing?<textarea className={control} maxLength={1000} value={draft.explanation} onChange={e => setDraft({ ...draft, explanation: e.target.value })} /></label>
        <label className="text-sm font-bold sm:col-span-2">Independent supporting evidence<textarea className={control} maxLength={1000} placeholder="Source URL or citation, edition and entry/page supporting the place and coordinates" value={draft.evidenceReference} onChange={e => setDraft({ ...draft, evidenceReference: e.target.value })} /></label>
      </fieldset>
      <button type="button" disabled={busy || loading || uncertain || !country} className="min-h-12 rounded-xl bg-emerald-500 px-4 font-bold disabled:opacity-50" onClick={() => void send()}>{busy ? 'Checking…' : 'Send locality proposal'}</button>
      {error && <p role="alert" className="break-words text-sm text-red-800">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-900">{notice}</p>}
      <div className="flex flex-wrap items-center gap-3"><h3 className="font-bold">My locality proposals</h3><button type="button" disabled={busy || loading} className="min-h-12 px-3 text-sm font-bold underline" onClick={() => void load()}>Refresh proposals</button></div>
      {loading ? <p role="status">Loading your proposals…</p> : proposals.length === 0 && <p className="text-sm">No proposals to show.</p>}
      {proposals.map(proposal => <article key={proposal.id} className="min-w-0 break-words rounded-xl border border-slate-200 p-3 text-sm">
        <h4 className="font-bold">{proposal.name} · {proposal.administrativeContext} · {proposal.countryCode}</h4>
        <p>{proposal.latitude}, {proposal.longitude}</p><p className="mt-2 font-bold">{proposal.status === 'pending' ? 'Pending review — not selectable' : proposal.status === 'approved' ? 'Approved' : 'Rejected'}</p>
        {proposal.decisionReason && <p className="mt-2">Decision: {proposal.decisionReason}</p>}
        {proposal.status === 'approved' && proposal.localityId && <button type="button" disabled={busy} className="min-h-12 font-bold underline" onClick={() => void findApproved(proposal)}>Find approved locality in registry</button>}
      </article>)}
    </div>}
  </div>
}
