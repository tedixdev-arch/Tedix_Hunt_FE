import { FormEvent, ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { useAuth } from '../app/providers/AuthProvider'
import { ApiError } from '../services/api/client'
import { customHuntRequestsApi } from '../services/api/operations'

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500'
const labelClass = 'block text-sm font-bold text-slate-800'

function SetupShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer/hunts/new">← Setup options</Link>
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
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Set up a Hunt</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Choose whether to set the Hunt now or ask the TedixHunt team for something new.</p>
        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Hunt setup options">
          <article className="flex flex-col rounded-2xl border border-emerald-400 bg-white p-6 shadow-sm ring-2 ring-emerald-100"><span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">Recommended</span><h2 className="mt-4 text-2xl font-bold">Set a Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Choose a location and an approved Hunt, then set the details for your event.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400" to="/organizer/hunts/new/setup">Set the Hunt</Link></article>
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Ask for a custom Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Request a Hunt when the available themes and templates do not meet your needs.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold hover:border-emerald-500" to="/organizer/hunts/new/custom-request">Ask for a custom Hunt</Link></article>
        </section>
      </div>
    </main>
  )
}


export function CustomRequestPage() {
  const { user } = useAuth()
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ contactName: user?.name ?? '', contactEmail: user?.email ?? '', organizationName: '', city: '', preferredDate: '', participantCount: '', details: '' })
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value })) })
  async function submit(event: FormEvent) {
    event.preventDefault()
    setSending(true); setError('')
    try {
      await customHuntRequestsApi.submit({
        contactName: form.contactName.trim(), contactEmail: form.contactEmail.trim(), details: form.details.trim(),
        ...(form.organizationName.trim() ? { organizationName: form.organizationName.trim() } : {}),
        ...(form.city.trim() ? { city: form.city.trim() } : {}),
        ...(form.preferredDate ? { preferredDate: form.preferredDate } : {}),
        ...(form.participantCount ? { participantCount: Number(form.participantCount) } : {}),
      })
      setComplete(true)
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 400 ? 'Check the highlighted details and try again.' : caught instanceof ApiError && caught.status === 429 ? 'Too many requests. Please try again later.' : "We couldn't send your request. Please try again.")
    } finally { setSending(false) }
  }
  if (complete) return <SetupShell eyebrow="Custom Request" title="Request received" description="The Tedix team will review your request and reply by email."><SuccessState title="We will be in touch" detail={`We'll reply to ${form.contactEmail.trim()}.`} /></SetupShell>
  return (
    <SetupShell eyebrow="Custom Request" title="Ask for a new hunt" description="Use this only when an approved template cannot meet your needs. Tell us what is different.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={event => void submit(event)}>
        <label className={labelClass}>Your name<input className={inputClass} maxLength={120} required {...field('contactName')} /></label>
        <label className={labelClass}>Email<input className={inputClass} maxLength={254} required type="email" {...field('contactEmail')} /></label>
        <label className={labelClass}>School or organization (optional)<input className={inputClass} maxLength={160} {...field('organizationName')} /></label>
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
