import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OrganizerHeader } from '../../pages/OrganizerFlow'
import { RewardsEditor } from '../../pages/CustomHuntEditor'
import { HuntMapInspection } from '../../components/HuntMapPreview'
import { ApiError, huntOptionsApi, huntRewardsApi, huntsApi, organizationsApi, type Hunt, type HuntOptions, type HuntRewards, type Organization } from '../../services/api'
import { organizerLocalApi, type Country, type Region, type City, type LocalHunt, type LocalPreview, type Selection } from '../../services/api/organizerLocal'
import { participantLink, copyParticipantLink, shareParticipantLink } from '../../pages/participantAccess'
import { parseHuntNotReady } from '../../pages/huntReview'

const controlClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-emerald-500'
const primary = 'min-h-12 rounded-xl bg-emerald-500 px-6 font-bold hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-500'
const secondary = 'min-h-12 rounded-xl border border-slate-300 px-4 font-bold'
function message(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session expired. Sign in again to continue.'
    if (error.status === 403) return 'You do not have Organizer access to this action.'
    if (error.status === 404 || error.status === 409) return 'This Hunt or location is no longer available. Refresh the choices and select a Hunt again.'
    if (error.status === 429) return 'Too many requests. Please try again shortly.'
    const issues = parseHuntNotReady(error.details)
    if (issues?.length) return issues.map(item => item.message).join('. ')
  }
  return 'We couldn’t complete this step. Your saved draft is available in My Hunts. Please retry.'
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-bold">{label}{children}</label> }

/** Server-filtered, cursor-paged choices. Each filter change owns a fresh request lifetime. */
function useChoices<T>(kind: 'countries' | 'regions' | 'cities' | 'templates', filters: Record<string, string>, enabled = true) {
  const key = JSON.stringify(filters)
  const [state, setState] = useState<{ key: string; items: T[]; nextCursor: string | null; loading: boolean; error: string }>({ key, items: [], nextCursor: null, loading: enabled, error: '' })
  const [attempt, setAttempt] = useState(0)
  const lifetime = useRef(0)
  const busy = useRef(false)
  useEffect(() => {
    const generation = ++lifetime.current
    busy.current = enabled
    setState({ key, items: [], nextCursor: null, loading: enabled, error: '' })
    if (enabled) organizerLocalApi.page<T>(kind, JSON.parse(key)).then(page => {
      if (generation === lifetime.current) setState({ key, ...page, loading: false, error: '' })
    }).catch(error => { if (generation === lifetime.current) setState({ key, items: [], nextCursor: null, loading: false, error: message(error) }) })
      .finally(() => { if (generation === lifetime.current) busy.current = false })
    return () => { ++lifetime.current }
  }, [kind, key, enabled, attempt])
  async function more() {
    if (busy.current || !state.nextCursor || state.key !== key) return
    busy.current = true
    const generation = lifetime.current
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      const page = await organizerLocalApi.page<T>(kind, JSON.parse(key), state.nextCursor)
      if (generation === lifetime.current) setState(current => ({ ...current, items: [...current.items, ...page.items], nextCursor: page.nextCursor, loading: false }))
    } catch (error) { if (generation === lifetime.current) setState(current => ({ ...current, loading: false, error: message(error) })) }
    finally { if (generation === lifetime.current) busy.current = false }
  }
  return { ...(state.key === key ? state : { items: [], nextCursor: null, loading: enabled, error: '' }), more, retry: () => setAttempt(value => value + 1) }
}
function ChoiceState({ choices, empty }: { choices: ReturnType<typeof useChoices>; empty: string }) {
  return <>{choices.loading && <p role="status">Loading choices…</p>}{choices.error ? <div><p role="alert" className="text-rose-700">{choices.error}</p><button className={secondary} onClick={choices.retry} type="button">Retry choices</button></div> : !choices.loading && !choices.items.length && <p role="status">{empty}</p>}{choices.nextCursor && <button className={secondary} disabled={choices.loading} onClick={() => void choices.more()} type="button">Show more</button>}</>
}

export function LocalSetupFoundation({ initialHunt, onDraftCreated }: { initialHunt?: Hunt; onDraftCreated?: (id: string) => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(initialHunt ? 2 : 0)
  const [country, setCountry] = useState<Country>()
  const [region, setRegion] = useState<Region>()
  const [city, setCity] = useState<City>()
  const [selected, setSelected] = useState<LocalHunt>()
  const [preview, setPreview] = useState<LocalPreview>()
  const [previewError, setPreviewError] = useState('')
  const [hunt, setHunt] = useState(initialHunt)
  const huntRef = useRef(initialHunt)
  const [options, setOptions] = useState<HuntOptions>()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationId, setOrganizationId] = useState(initialHunt?.organizationId ?? '')
  const [setupError, setSetupError] = useState('')
  const [setupAttempt, setSetupAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const actionLock = useRef(false)
  const [error, setError] = useState('')
  const [rewards, setRewards] = useState<HuntRewards>()
  const onRewards = useCallback((value: HuntRewards) => setRewards(value), [])
  const [accessCode, setAccessCode] = useState(initialHunt?.accessCode ?? '')
  const [linkMessage, setLinkMessage] = useState('')
  const [event, setEvent] = useState({ name: initialHunt?.name ?? '', startDate: initialHunt?.startDate ?? '', startTime: initialHunt?.startTime?.slice(0, 5) ?? '10:00', timezone: initialHunt?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, capacity: initialHunt?.capacity ?? 24, durationMinutes: initialHunt?.durationMinutes ?? 120, contactName: initialHunt?.contactName ?? '' })
  const countries = useChoices<Country>('countries', {})
  const regions = useChoices<Region>('regions', { countryCode: country?.countryCode ?? '' }, !!country)
  const cities = useChoices<City>('cities', { countryCode: country?.countryCode ?? '', regionId: region?.regionId ?? '' }, !!country && !!region)
  const templates = useChoices<LocalHunt>('templates', { countryCode: country?.countryCode ?? '', localityId: city?.localityId ?? '' }, !!country && !!city)
  useEffect(() => {
    let active = true
    setSetupError(''); setOptions(undefined)
    Promise.all([huntOptionsApi.listHuntOptions(), organizationsApi.listAccessible()]).then(([metadata, orgs]) => {
      if (!active) return
      setOptions(metadata); setOrganizations(orgs); setOrganizationId(current => current || orgs[0]?.id || '')
    }).catch(cause => { if (active) setSetupError(message(cause)) })
    return () => { active = false }
  }, [setupAttempt])
  const selection: Selection | undefined = selected && country && city ? { templateId: selected.templateId, version: selected.version, countryCode: country.countryCode, localityId: city.localityId }
    : hunt?.templateId && hunt.templateVersion && hunt.templateLocalityId && hunt.templateLocalitySnapshot ? { templateId: hunt.templateId, version: hunt.templateVersion, countryCode: hunt.templateLocalitySnapshot.countryCode, localityId: hunt.templateLocalityId } : undefined
  const selectionKey = JSON.stringify(selection)
  useEffect(() => {
    setPreview(undefined); setPreviewError('')
    if (!selected || !selection) return
    const controller = new AbortController()
    organizerLocalApi.preview(selection, controller.signal).then(result => {
      if (controller.signal.aborted) return
      if (result.templateId !== selection.templateId || result.version !== selection.version || result.localityId !== selection.localityId || !result.configuration) throw new Error('Invalid preview')
      setPreview(result)
    }).catch(cause => { if (!controller.signal.aborted) setPreviewError(message(cause)) })
    return () => controller.abort()
  }, [selectionKey, selected])
  function updateHunt(value: Hunt) { huntRef.current = value; setHunt(value) }
  async function run(action: () => Promise<void>) {
    if (actionLock.current) return
    actionLock.current = true; setBusy(true); setError('')
    try { await action() } catch (cause) { setError(message(cause)) }
    finally { actionLock.current = false; setBusy(false) }
  }
  const supported = !!options && options.formats.some(item => item.key === 'team') && options.teamSizes.includes(4) && options.accessModes.some(item => item.key === 'invitation_only') && options.difficulties.some(item => item.key === 'easy') && options.checkpointOrders.some(item => item.key === 'recommended')
  async function useHunt() {
    if (!selection || !preview || !supported || !organizationId) return
    await run(async () => {
      let current = huntRef.current
      if (!current) {
        current = await huntsApi.createDraft({ organizationId, name: event.name.trim() || selected!.displayName })
        updateHunt(current)
        onDraftCreated?.(current.id)
        // Persist the draft URL even if a later selection request fails.
        navigate(`/organizer/hunts/${current.id}/setup?setup=local`, { replace: true })
      }
      current = await organizerLocalApi.select(current.id, selection)
      updateHunt(current)
      setEvent(value => ({ ...value, name: value.name || current.name }))
      setStep(2)
    })
  }
  async function review() {
    if (!hunt || !supported) return
    await run(async () => {
      const updated = await huntsApi.updateDraft(hunt.id, { ...event, name: event.name.trim(), country: country?.displayName ?? hunt.country, region: region?.label ?? hunt.region, city: city?.name ?? hunt.city, format: 'team', teamSize: 4, accessMode: 'invitation_only', difficulty: 'easy', checkpointOrder: 'recommended' })
      updateHunt(updated)
      const [latest, savedRewards] = await Promise.all([huntsApi.getHunt(hunt.id), huntRewardsApi.list(hunt.id)])
      updateHunt(latest); setRewards(savedRewards); setStep(3)
    })
  }
  async function create() {
    if (!hunt || !selection) return
    await run(async () => {
      // C7 selection performs locked eligibility revalidation and keeps event settings.
      try { updateHunt(await organizerLocalApi.select(hunt.id, selection)) }
      catch (cause) {
        if (cause instanceof ApiError && (cause.status === 404 || cause.status === 409)) {
          setSelected(undefined); setPreview(undefined); templates.retry(); setStep(city ? 1 : 0)
        }
        throw cause
      }
      const published = await huntsApi.publish(hunt.id)
      if (published.id !== hunt.id || published.status !== 'published') throw new Error('Unexpected publish response')
      updateHunt(published)
      // Access creation may be retried independently after successful publishing.
      const access = await huntsApi.createOrGetAccess(published.id)
      if (access.huntId !== published.id || !access.code) throw new Error('Unexpected access response')
      setAccessCode(access.code)
    })
  }
  const published = hunt && hunt.status !== 'draft'
  const link = accessCode ? participantLink(window.location.origin, accessCode) : ''
  const changeLocation = () => { setError(''); setStep(city ? 1 : 0) }
  return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader showProfile /><div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
    <Link className="text-sm font-bold text-slate-500" to="/organizer">← My Hunts</Link>
    <h1 className="mt-6 text-4xl font-bold tracking-tight">{published ? 'Your Hunt is created' : 'Set up an adventure'}</h1>
    {!published && <ol aria-label="Hunt setup progress" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{['Location', 'Choose Hunt', 'Configure Event', 'Review & Create'].map((label, index) => <li aria-current={step === index ? 'step' : undefined} key={label} className={`rounded-xl border p-3 text-sm font-bold ${step === index ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>{index + 1}. {label}</li>)}</ol>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-rose-800">{error}</p>}
    {setupError && !published && <div className="mt-5"><p role="alert">{setupError}</p><button className={secondary} type="button" onClick={() => setSetupAttempt(value => value + 1)}>Retry event options</button></div>}
    <section aria-busy={busy} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {published ? <><p role="status">{hunt.name} has been created.</p>{link ? <><Field label="Participant link"><input className={controlClass} readOnly value={link} /></Field><p className="mt-3">Hunt code: <strong>{accessCode}</strong></p><div className="mt-5 flex gap-3"><button className={secondary} type="button" onClick={async () => setLinkMessage(await copyParticipantLink(link, navigator.clipboard))}>Copy link</button><button className={primary} type="button" onClick={async () => setLinkMessage(await shareParticipantLink(link, hunt.name, navigator.share?.bind(navigator), navigator.clipboard))}>Share</button></div>{linkMessage && <p role="status">{linkMessage}</p>}</> : <button className={`${primary} mt-5`} disabled={busy} type="button" onClick={() => void run(async () => { const access = await huntsApi.createOrGetAccess(hunt.id); if (access.huntId !== hunt.id || !access.code) throw new Error('Invalid access'); setAccessCode(access.code) })}>{busy ? 'Creating link…' : 'Create sharing link'}</button>}</> : <>
      <fieldset disabled={busy} className="min-w-0">
      {step === 0 && <><h2 className="text-2xl font-bold">Where will your Hunt take place?</h2><p className="mt-2 text-slate-600">Choose a city with an approved Local Hunt.</p><div className="mt-5 grid gap-5 md:grid-cols-3">
        <div><Field label="Country"><select className={controlClass} value={country?.countryCode ?? ''} onChange={e => { setCountry(countries.items.find(item => item.countryCode === e.target.value)); setRegion(undefined); setCity(undefined); setSelected(undefined) }}><option value="">Choose country</option>{countries.items.map(item => <option key={item.countryCode} value={item.countryCode}>{item.displayName}</option>)}</select></Field><ChoiceState choices={countries} empty="No locations with available Hunts right now." /></div>
        <div><Field label="County / State"><select className={controlClass} disabled={!country} value={region?.regionId ?? ''} onChange={e => { setRegion(regions.items.find(item => item.regionId === e.target.value)); setCity(undefined); setSelected(undefined) }}><option value="">Choose county / state</option>{regions.items.map(item => <option key={item.regionId} value={item.regionId}>{item.label}</option>)}</select></Field>{country && <ChoiceState choices={regions} empty="No regions with available Hunts. Choose another country." />}</div>
        <div><Field label="City"><select className={controlClass} disabled={!region} value={city?.localityId ?? ''} onChange={e => { const next = cities.items.find(item => item.localityId === e.target.value); setCity(next); setSelected(undefined); if (next) { setError(''); setStep(1) } }}><option value="">Choose city</option>{cities.items.map(item => <option key={item.localityId} value={item.localityId}>{item.name}</option>)}</select></Field>{region && <ChoiceState choices={cities} empty="No cities with available Hunts. Choose another county / state." />}</div>
      </div>{city && <button className={`${primary} mt-6`} type="button" onClick={() => setStep(1)}>Choose Hunt</button>}</>}
      {step === 1 && <><h2 className="text-2xl font-bold">Choose your adventure</h2><p className="mt-2 text-slate-600">{city?.name} · Approved routes, ready to explore.</p>{city?.attribution && <p className="mt-2 text-xs text-slate-500">{city.attribution}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2">{templates.items.map(item => <label key={`${item.templateId}:${item.version}`} className={`cursor-pointer rounded-xl border p-5 ${selected?.templateId === item.templateId && selected.version === item.version ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><input type="radio" name="local-hunt" checked={selected?.templateId === item.templateId && selected.version === item.version} onChange={() => { setSelected(item); setError('') }} /><strong className="ml-3">{item.displayName}</strong><p className="mt-2 text-sm text-slate-600">{item.theme}</p></label>)}</div><ChoiceState choices={templates} empty="No approved Hunts are available here now. Choose another location." />
        {selected && <div className="mt-5">{previewError ? <><p role="alert">{previewError}</p><button className={secondary} type="button" onClick={() => { setSelected(undefined); templates.retry() }}>Refresh Hunts</button></> : !preview ? <p role="status">Loading Hunt preview…</p> : <HuntMapInspection configuration={preview.configuration} sourceLabel="Approved Hunt" />}</div>}
        {!hunt && organizations.length > 1 && <Field label="Organizing for"><select className={controlClass} value={organizationId} onChange={e => setOrganizationId(e.target.value)}>{organizations.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>}
        {!setupError && (!options ? <p role="status">Loading event options…</p> : !supported ? <p role="alert">The supported event options are unavailable. Please retry later.</p> : !organizationId && <p role="alert">No accessible organization is available for this Hunt.</p>)}
        <div className="mt-6 flex justify-between gap-3"><button className={secondary} type="button" onClick={() => setStep(0)}>Back</button><button className={primary} type="button" disabled={!preview || !!previewError || !supported || !organizationId} onClick={() => void useHunt()}>{busy ? 'Saving…' : 'Use this Hunt'}</button></div>
      </>}
      {step === 2 && hunt && <><h2 className="text-2xl font-bold">Make it your event</h2><form id="event-settings" className="mt-5 grid gap-5 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void review() }}>
        <Field label="Event name"><input className={controlClass} required maxLength={200} value={event.name} onChange={e => setEvent({ ...event, name: e.target.value })} /></Field>
        <Field label="Local contact"><input className={controlClass} required value={event.contactName} onChange={e => setEvent({ ...event, contactName: e.target.value })} /></Field>
        <Field label="Date"><input className={controlClass} required type="date" value={event.startDate} onChange={e => setEvent({ ...event, startDate: e.target.value })} /></Field>
        <Field label="Start time"><input className={controlClass} required type="time" value={event.startTime} onChange={e => setEvent({ ...event, startTime: e.target.value })} /></Field>
        <Field label="Participants"><input className={controlClass} required type="number" min={1} max={2147483647} value={event.capacity} onChange={e => setEvent({ ...event, capacity: Number(e.target.value) })} /></Field>
        <div className="rounded-xl bg-slate-50 p-4"><strong>Teams of 4</strong><p className="mt-2 text-sm">Invitation only. Share a private link after creating your Hunt.</p></div>
        <details className="sm:col-span-2"><summary className="cursor-pointer py-3 font-bold">More options</summary><div className="grid gap-5 sm:grid-cols-2"><Field label="Duration (minutes)"><input className={controlClass} required type="number" min={1} max={2147483647} value={event.durationMinutes} onChange={e => setEvent({ ...event, durationMinutes: Number(e.target.value) })} /></Field><Field label="Time zone"><input className={controlClass} required value={event.timezone} onChange={e => setEvent({ ...event, timezone: e.target.value })} /></Field></div></details>
      </form><details className="mt-5"><summary className="cursor-pointer py-3 font-bold">Rewards (optional)</summary><p className="text-sm text-slate-600">Save each allocation to include it in your event.</p><RewardsEditor huntId={hunt.id} huntStatus={hunt.status} teamSize={4} onLoaded={onRewards} /></details>
      <div className="mt-6 flex justify-between gap-3"><button className={secondary} type="button" onClick={changeLocation}>Back</button><button className={primary} form="event-settings" type="submit" disabled={!supported}>{busy ? 'Saving…' : 'Review event'}</button></div></>}
      {step === 3 && hunt && <><h2 className="text-2xl font-bold">Ready for an adventure?</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{Object.entries({ Event: hunt.name, Location: [hunt.city, hunt.region, hunt.country].filter(Boolean).join(', '), Hunt: hunt.templateSnapshot?.displayName, Schedule: `${hunt.startDate} · ${hunt.startTime?.slice(0, 5)} (${hunt.timezone})`, Participants: `${hunt.capacity} · Teams of ${hunt.teamSize}`, Access: 'Invitation only', Rewards: rewards ? `${rewards.leaderboard.length} leaderboard rewards · ${rewards.specialAwards.length} special awards` : 'No rewards' }).map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}</dl><div className="mt-6 flex justify-between gap-3"><button className={secondary} type="button" onClick={() => setStep(2)}>Back</button><button className={primary} type="button" disabled={!selection} onClick={() => void create()}>{busy ? 'Creating…' : 'Create Hunt'}</button></div></>}
      </fieldset>{busy && <p role="status" className="mt-4">Saving your adventure…</p>}
    </>}
    </section>
  </div></main>
}
