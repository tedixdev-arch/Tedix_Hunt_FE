import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../app/providers/AuthProvider'
import { adminLocalityProposalsApi } from '../../services/api/adminLocalityProposals'
import { geographyApi, type GeographicCity, type Locality } from '../../services/api/geography'
import type { LocalityProposal } from '../../services/api/localityProposals'
import { ApiError } from '../../services/api/client'
import { PersistedValue } from './PersistedValue'
import { reviewError } from './reviewState'
const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
const button = 'min-h-12 rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:opacity-40'

export function LocalityProposalReview() {
  const { user } = useAuth()
  const [items, setItems] = useState<LocalityProposal[] | null>(null)
  const [selected, setSelected] = useState<LocalityProposal | null>(null)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [matches, setMatches] = useState<Locality[] | null>(null)
  const [matchError, setMatchError] = useState('')
  const [catalog, setCatalog] = useState<GeographicCity[] | null>(null)
  const lock = useRef(false), generation = useRef(0)
  const load = useCallback(async () => {
    const request = ++generation.current
    setItems(null); setSelected(null); setReason(''); setError(''); setBlocked(false)
    try { const proposals = await adminLocalityProposalsApi.list(); if (request === generation.current) setItems(proposals) }
    catch (cause) { if (request === generation.current) setError(reviewError(cause)) }
  }, [])
  useEffect(() => { void load(); return () => { generation.current++ } }, [load])
  useEffect(() => {
    let active = true; setMatches(null); setMatchError(''); setCatalog(null)
    if (selected) void geographyApi.search(selected.countryCode, selected.name).then(response => { if (active) setMatches(response.localities) }).catch(() => { if (active) setMatchError('Possible duplicates could not be checked. Inspect the registry independently or retry.') })
    // Proposals are only for places missing from the GeoNames list; show same-name list cities for the Admin.
    if (selected && selected.name.trim().length >= 2) void Promise.resolve().then(() => geographyApi.cities(selected.countryCode, selected.name, selected.admin1Code ?? undefined))
      .then(page => { if (active) setCatalog(page.cities) }).catch(() => { if (active) setCatalog(null) })
    return () => { active = false }
  }, [selected])
  async function decide(decision: 'approved' | 'rejected') {
    if (lock.current || !selected || selected.status !== 'pending' || !user || selected.creatorUserId === user.id || reason.trim().length < 10 || reason.length > 1000 || blocked) return
    lock.current = true; setSaving(true); setError('')
    const original = selected
    try {
      const pending = await adminLocalityProposalsApi.list()
      const current = pending.find(item => item.id === original.id)
      setItems(pending)
      if (!current || JSON.stringify(current) !== JSON.stringify(original)) {
        setSelected(current ?? null); setReason(''); setError('This proposal changed or was already decided. Inspect the refreshed queue before making a new decision.'); return
      }
      const result = await adminLocalityProposalsApi.decide(original.id, decision, reason.trim())
      setSelected(result); setItems(pending.filter(item => item.id !== result.id)); setReason('')
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        try {
          const pending = await adminLocalityProposalsApi.list()
          setItems(pending); setSelected(pending.find(item => item.id === original.id) ?? null); setReason('')
          const code = (cause.details as { error?: string } | undefined)?.error ?? cause.message
          setError(code === 'locality_duplicate_conflict' ? 'A duplicate locality conflicts with approval. The proposal remains pending. Inspect the possible matches; no records were merged.'
            : code === 'catalog_city_exists' ? 'This place is already in the GeoNames city list for this region, so it must not be created from a proposal. Reject the proposal: Creators and Organizers can choose the listed city directly. The proposal remains pending.'
            : 'This proposal changed or was already decided. Inspect the refreshed queue and make a new explicit decision.')
        } catch (refreshError) { setSelected(null); setItems(null); setBlocked(true); setError(reviewError(refreshError)) }
      } else {
        setBlocked(true)
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) { setSelected(null); setItems(null) }
        setError(reviewError(cause))
      }
    } finally { lock.current = false; setSaving(false) }
  }
  return <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><section className={panel} aria-label="Locality proposal queue"><h3 className="text-lg font-bold">Locality proposals</h3><button className={button + ' mt-3'} disabled={saving} onClick={() => void load()}>Refresh proposals</button>
    {!items && !error && <p role="status">Loading locality proposals…</p>}{items?.length === 0 && <p className="mt-4">No locality proposals are awaiting review.</p>}
    <ul className="mt-3 space-y-2">{items?.map(item => <li key={item.id}><button className={button + ' w-full break-words text-left'} aria-pressed={selected?.id === item.id} disabled={saving} onClick={() => { setSelected(item); setReason(''); setError(''); setBlocked(false) }}>{item.name}<span className="block text-sm">{item.countryCode}{item.regionDisplayName ? ` · ${item.regionDisplayName}` : ''} · {item.administrativeContext}</span></button></li>)}</ul>
  </section><div className="min-w-0 space-y-4">{error && <p className={panel + ' text-red-900'} role="alert">{error}</p>}
    {!selected ? <section className={panel}>Select a proposal to inspect its independent evidence.</section> : <><section className={panel}><h3 className="break-words text-2xl font-bold">{selected.name}</h3><p>{selected.status} · {selected.countryCode}{selected.regionDisplayName ? ` · ${selected.regionDisplayName}` : ''} · {selected.administrativeContext}</p><p>Coordinates: {selected.latitude}, {selected.longitude}</p><h4 className="mt-4 font-bold">Why this locality is needed</h4><p className="whitespace-pre-wrap break-words">{selected.explanation}</p><h4 className="mt-4 font-bold">Independent evidence</h4><p className="whitespace-pre-wrap break-words">{selected.evidenceReference}</p><p className="mt-3 text-sm">Verify the place, coordinates, source rights and administrative context. Provider results alone cannot establish a locality.</p></section>
      <section className={panel} aria-label="Locality decision"><h3 className="text-xl font-bold">Locality decision</h3><p>This decision is independent of any Template review.</p>
        {selected.status !== 'pending' ? <div role="status"><p>Proposal {selected.status}.</p><p className="break-words">{selected.decisionReason}</p>{selected.localityId && <p className="break-words">Approved locality reference: {selected.localityId}</p>}</div> : <><label htmlFor="proposal-reason" className="mt-3 block font-bold">Reason for decision</label><textarea id="proposal-reason" className="mt-2 min-h-24 w-full rounded-lg border p-3" required minLength={10} maxLength={1000} value={reason} disabled={saving} onChange={event => setReason(event.target.value)} /><p className="text-sm">10–1,000 characters; {reason.length} entered.</p>
          {selected.creatorUserId === user?.id && <p>You cannot review your own locality proposal.</p>}
          <div className="mt-3 flex flex-wrap gap-3">{(['approved', 'rejected'] as const).map(decision => <button className={button} key={decision} disabled={saving || blocked || !user || selected.creatorUserId === user.id || reason.trim().length < 10 || reason.length > 1000} onClick={() => void decide(decision)}>{saving ? 'Recording decision…' : decision === 'approved' ? 'Approve locality' : 'Reject proposal'}</button>)}</div></>}
      </section>
      {catalog && catalog.length > 0 && <section className={panel + ' border-amber-300 bg-amber-50'} aria-label="Already in the city list"><h3 className="font-bold">Already in the GeoNames city list</h3><p className="mt-2 text-sm">Proposals are only for places missing from the list. These listed cities share the name; if one is this place, reject the proposal; the listed city can be chosen directly.</p><ul className="mt-2 list-disc pl-5 text-sm">{catalog.map(city => <li key={city.geographicId ?? city.localityId ?? city.name}>{city.name} · {city.regionDisplayName ?? 'Region not specified'} · {city.administrativeContext} ({city.registrationState === 'registered' ? 'registered' : 'not registered'})</li>)}</ul></section>}
      <details className={panel} open><summary className="cursor-pointer font-bold">Possible duplicate localities</summary><p className="mt-2">Matches are for human inspection. No duplicate is merged automatically.</p>{!matches && !matchError && <p role="status">Checking the registry…</p>}{matchError && <p role="alert">{matchError}</p>}{matches && (matches.length ? <PersistedValue value={matches} /> : <p>No matching registry entries returned. This does not prove uniqueness.</p>)}</details>
      <details className={panel}><summary className="cursor-pointer font-bold">Submission and decision record</summary><PersistedValue value={{ creator: selected.creatorUserId, submittedAt: selected.createdAt, reviewer: selected.reviewerUserId, decidedAt: selected.decidedAt }} /></details>
    </>}
  </div></div>
}
