import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { useAuth } from '../app/providers/AuthProvider'
import { ApiError } from '../services/api/client'
import { customHuntRequestsApi, type CustomRequestProgress, type OrganizerCustomRequest } from '../services/api/operations'
import { organizationsApi, type Organization } from '../services/api/organizations'

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500'
const labelClass = 'block text-sm font-bold text-slate-800'

function SetupShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const setupUrl = searchParams.get('mode') === 'independent' ? '/organizer/hunts/new?mode=independent' : '/organizer/hunts/new'
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to={setupUrl}>← Setup options</Link>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
        {children}
      </div>
    </main>
  )
}

function SuccessState({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6" role="status">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-2xl font-bold text-white">✓</div>
      <h2 className="mt-4 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-emerald-950">{detail}</p>
      <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400" to="/organizer">Open My Hunts</Link>
    </section>
  )
}

export function OrganizerSetupChoicePage() {
  const [params]=useSearchParams()
  const independent=params.get('mode')==='independent'
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Set up a Hunt</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Choose whether to set the Hunt now or ask the TedixHunt team for something new.</p>
        {independent&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Independent Hunt · unofficial activity</strong><p className="mt-1">Your email is confirmed. The route stays fixed and verified.</p></div>}
        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Hunt setup options">
          <article className="flex flex-col rounded-2xl border border-emerald-400 bg-white p-6 shadow-sm ring-2 ring-emerald-100"><span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">Recommended</span><h2 className="mt-4 text-2xl font-bold">Set a Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Choose a location and an approved Hunt, then set the details for your event.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400" to={`/organizer/hunts/new/setup${independent?'?mode=independent':''}`}>Set the Hunt</Link></article>
          <article className={`flex flex-col rounded-2xl border p-6 shadow-sm ${independent?'border-slate-200 bg-slate-100 text-slate-500':'border-slate-200 bg-white'}`}><h2 className="text-2xl font-bold">Ask for a custom Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Request a Hunt when the available themes and templates do not meet your needs.</p>{independent?<div className="mt-6 rounded-xl border border-slate-300 bg-slate-200 p-3 text-center text-sm font-bold">Available to Registered Organizers<br/><Link className="mt-1 inline-block text-emerald-800 underline" to="/organizer/sign-in">Apply or sign in</Link></div>:<Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold hover:border-emerald-500" to="/organizer/hunts/new/custom-request">Ask for a custom Hunt</Link>}{!independent&&<Link className="mt-3 text-center text-sm font-bold text-emerald-800 underline" to="/organizer/custom-requests">Track my requests</Link>}</article>
        </section>
      </div>
    </main>
  )
}

export function GuidedSetupPage() {
  const [complete, setComplete] = useState(false)
  if (complete) return <SetupShell eyebrow="Guided Customization" title="Your customized hunt is ready" description="Every selected option came from an approved, compatible set."><SuccessState title="Your safe setup is complete" detail="The customized hunt is now available in My Hunts." /></SetupShell>
  return (
    <SetupShell eyebrow="Guided Customization" title="Shape an approved hunt" description="Choose from compatible options. TedixHunt keeps the structure safe and workable.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setComplete(true) }}>
        <label className={labelClass}>Difficulty<select className={inputClass}><option>Easy</option><option>Medium</option><option>Advanced</option></select></label>
        <label className={labelClass}>Story theme<select className={inputClass}><option>Restore the Signal</option><option>City Secrets</option></select></label>
        <label className={labelClass}>Challenge set<select className={inputClass}><option>Signal Relay · Set A</option><option>Signal Relay · Set B</option></select></label>
        <label className={labelClass}>Checkpoint order<select className={inputClass}><option>Recommended route</option><option>Short route</option></select></label>
        <label className={labelClass}>Scoring<select className={inputClass}><option>Balanced team score</option><option>Completion score only</option></select></label>
        <label className={labelClass}>Hints<select className={inputClass}><option>Two hints per challenge</option><option>One hint per challenge</option></select></label>
        <label className={`${labelClass} sm:col-span-2`}>Awards<select className={inputClass}><option>Signal Restorer achievement</option><option>City Explorer achievement</option></select></label>
        <button className="min-h-14 rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400 sm:col-span-2" type="submit">Create customized hunt</button>
      </form>
    </SetupShell>
  )
}

export function CustomRequestPage() {
  const { user } = useAuth()
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ contactName: user?.name ?? '', contactEmail: user?.email ?? '', organizationId: '', organizationName: '', city: '', preferredDate: '', participantCount: '', details: '' })
  // A custom Hunt is exclusive to one organization, so signed-in Organizers pick which one it is for.
  const [organizations, setOrganizations] = useState<Organization[]>([])
  useEffect(() => {
    if (!user) return
    organizationsApi.listAccessible().then(list => {
      const registered = list.filter(o => !o.independent)
      setOrganizations(registered)
      if (registered.length === 1) setForm(current => ({ ...current, organizationId: current.organizationId || registered[0].id }))
    }).catch(() => setOrganizations([]))
  }, [user])
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value })) })
  async function submit(event: FormEvent) {
    event.preventDefault()
    setSending(true); setError('')
    try {
      await customHuntRequestsApi.submit({
        contactName: form.contactName.trim(), contactEmail: form.contactEmail.trim(), details: form.details.trim(),
        ...(form.organizationId ? { organizationId: form.organizationId } : form.organizationName.trim() ? { organizationName: form.organizationName.trim() } : {}),
        ...(form.city.trim() ? { city: form.city.trim() } : {}),
        ...(form.preferredDate ? { preferredDate: form.preferredDate } : {}),
        ...(form.participantCount ? { participantCount: Number(form.participantCount) } : {}),
      })
      setComplete(true)
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 403 ? 'Choose one of your organizations and try again.' : caught instanceof ApiError && caught.status === 400 ? 'Check the highlighted details and try again.' : caught instanceof ApiError && caught.status === 429 ? 'Too many requests. Please try again later.' : "We couldn't send your request. Please try again.")
    } finally { setSending(false) }
  }
  if (complete) return <SetupShell eyebrow="Custom Request" title="Request received" description="The Tedix team will review your request and reply by email."><SuccessState title="We will be in touch" detail={`We'll email ${form.contactEmail.trim()} when it is in work and when your Hunt is ready.`} />{user && <Link className="mt-4 inline-block font-bold text-emerald-800 underline" to="/organizer/custom-requests">Track my requests</Link>}</SetupShell>
  return (
    <SetupShell eyebrow="Custom Request" title="Ask for a new hunt" description="Use this only when an approved template cannot meet your needs. Tell us what is different.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={event => void submit(event)}>
        <label className={labelClass}>Your name<input className={inputClass} maxLength={120} required {...field('contactName')} /></label>
        <label className={labelClass}>Email<input className={inputClass} maxLength={254} required type="email" {...field('contactEmail')} /></label>
        {organizations.length > 0
          ? <label className={labelClass}>Organization<select className={inputClass} required {...field('organizationId')}>{organizations.length > 1 && <option value="">Choose organization</option>}{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">The finished Hunt is available only to this organization.</span></label>
          : <label className={labelClass}>School or organization (optional)<input className={inputClass} maxLength={160} {...field('organizationName')} /></label>}
        <label className={labelClass}>Location<input className={inputClass} maxLength={120} placeholder="City or venue" required {...field('city')} /></label>
        <label className={labelClass}>Preferred date<input className={inputClass} required type="date" {...field('preferredDate')} /></label>
        <label className={labelClass}>Participants<input className={inputClass} min="1" max="100000" placeholder="Expected number" required type="number" {...field('participantCount')} /></label>
        <label className={`${labelClass} sm:col-span-2`}>What do you need?<textarea className={`${inputClass} min-h-32 py-3`} maxLength={4000} placeholder="Purpose, audience, special location, or content that makes this hunt different" required {...field('details')} /></label>
        {error && <p className="text-sm font-semibold text-rose-700 sm:col-span-2" role="alert">{error}</p>}
        <button className="min-h-14 rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400 disabled:opacity-60 sm:col-span-2" disabled={sending} type="submit">{sending ? 'Sending…' : 'Send request'}</button>
      </form>
    </SetupShell>
  )
}

const progressLabel: Record<CustomRequestProgress, string> = { in_work: 'In work', done: 'Done', rejected: 'Rejected', closed: 'Closed' }
const progressStyle: Record<CustomRequestProgress, string> = { in_work: 'bg-amber-100 text-amber-900', done: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800', closed: 'bg-slate-200 text-slate-700' }

/** Organizer tracking: a simple In work / Done / Rejected status plus the note from the Tedix team. */
export function OrganizerCustomRequestsPage() {
  const [requests, setRequests] = useState<OrganizerCustomRequest[]>()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let live = true
    setError('')
    customHuntRequestsApi.mine().then(list => { if (live) setRequests(list) }).catch(() => { if (live) setError("We couldn't load your requests. Please retry.") })
    return () => { live = false }
  }, [attempt])
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Custom Hunts</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><h1 className="text-4xl font-bold tracking-tight">My custom Hunt requests</h1>
          <Link className="flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-4 font-bold hover:border-emerald-500" to="/organizer/hunts/new/custom-request">Ask for a custom Hunt</Link></div>
        {error && <div className="mt-6 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={() => setAttempt(a => a + 1)}>Retry</button></div>}
        {!requests && !error && <p className="mt-6" role="status">Loading…</p>}
        {requests && requests.length === 0 && <p className="mt-6 rounded-2xl bg-white p-5 text-slate-600">You have not asked for a custom Hunt yet.</p>}
        {requests && requests.length > 0 && <ul className="mt-6 grid gap-4">{requests.map(r => <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-bold">{r.city || 'Custom Hunt'}{r.organizationName ? ` · ${r.organizationName}` : ''}</p>
              <p className="mt-1 text-xs text-slate-500">Requested {new Date(r.createdAt).toLocaleDateString()}{r.preferredDate ? ` · preferred ${r.preferredDate}` : ''}{r.participantCount ? ` · ${r.participantCount} participants` : ''}</p></div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${progressStyle[r.progress]}`}>{progressLabel[r.progress]}</span>
          </div>
          <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">{r.details}</p>
          {r.note && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm"><p className="font-bold">Note from the Tedix team</p><p className="mt-1 whitespace-pre-wrap">{r.note}</p></div>}
          {r.progress === 'done' && r.hunt && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
            <p><strong>{r.hunt.displayName ?? 'Your custom Hunt'}</strong> is ready{r.hunt.locality ? ` in ${r.hunt.locality.name}` : ''}. Only your organization can use it.</p>
            <p className="mt-1">Set up a Hunt{r.hunt.locality ? `, choose ${r.hunt.locality.name}` : ''} and pick it from the list to schedule and publish it.</p>
            <Link className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 font-bold hover:bg-emerald-400" to="/organizer/hunts/new/setup">Set up this Hunt</Link></div>}
        </li>)}</ul>}
      </div>
    </main>
  )
}
