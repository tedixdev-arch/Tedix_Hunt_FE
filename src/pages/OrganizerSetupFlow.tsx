import { FormEvent, ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'

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
          <article className="flex flex-col rounded-2xl border border-emerald-400 bg-white p-6 shadow-sm ring-2 ring-emerald-100"><span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">Recommended</span><h2 className="mt-4 text-2xl font-bold">Set a Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Choose a theme and template, then configure the Hunt in one clear flow.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400" to={`/organizer/hunts/new/setup${independent?'?mode=independent':''}`}>Set the Hunt</Link></article>
          <article className={`flex flex-col rounded-2xl border p-6 shadow-sm ${independent?'border-slate-200 bg-slate-100 text-slate-500':'border-slate-200 bg-white'}`}><h2 className="text-2xl font-bold">Ask for a custom Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Request a Hunt when the available themes and templates do not meet your needs.</p>{independent?<div className="mt-6 rounded-xl border border-slate-300 bg-slate-200 p-3 text-center text-sm font-bold">Available to Registered Organizers<br/><Link className="mt-1 inline-block text-emerald-800 underline" to="/organizer/sign-in">Apply or sign in</Link></div>:<Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold hover:border-emerald-500" to="/organizer/hunts/new/custom-request">Ask for a custom Hunt</Link>}</article>
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
  const [complete, setComplete] = useState(false)
  if (complete) return <SetupShell eyebrow="Custom Request" title="Request received" description="The request is now ready for Admin review and Creator assignment."><SuccessState title="We will keep you updated" detail="Status: Received. You can follow the request from My Hunts." /></SetupShell>
  return (
    <SetupShell eyebrow="Custom Request" title="Ask for a new hunt" description="Use this only when an approved template cannot meet your needs. Tell us what is different.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={(event: FormEvent) => { event.preventDefault(); setComplete(true) }}>
        <label className={labelClass}>Preferred date<input className={inputClass} required type="date" /></label>
        <label className={labelClass}>Location<input className={inputClass} placeholder="City or venue" required /></label>
        <label className={labelClass}>Participants<input className={inputClass} min="4" placeholder="Expected number" required type="number" /></label>
        <label className={labelClass}>Local contact<input className={inputClass} placeholder="Name and phone or email" required /></label>
        <label className={`${labelClass} sm:col-span-2`}>What do you need?<textarea className={`${inputClass} min-h-32 py-3`} placeholder="Purpose, audience, special location, or content that makes this hunt different" required /></label>
        <button className="min-h-14 rounded-xl bg-emerald-500 px-5 font-bold hover:bg-emerald-400 sm:col-span-2" type="submit">Send request</button>
      </form>
    </SetupShell>
  )
}
