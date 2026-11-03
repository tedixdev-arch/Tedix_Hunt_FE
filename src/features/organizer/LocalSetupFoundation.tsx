import { Link } from 'react-router-dom'
import { OrganizerHeader } from '../../pages/OrganizerFlow'

// Unrouted foundation. Connect only after server-side eligible geography exists.
const controlClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500'

export function LocalSetupFoundation() {
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Set up a Local Hunt</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Choose a location and an approved Hunt, then set the details for your event.</p>
        <ol aria-label="Hunt setup progress" className="mt-8 grid gap-3 sm:grid-cols-4">
          {['Location', 'Choose Hunt', 'Configure Event', 'Review'].map((step, index) => (
            <li key={step} aria-current={index === 0 ? 'step' : undefined} className={`rounded-xl border px-4 py-3 text-sm font-bold ${index === 0 ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
              <span className="mr-2">{index + 1}.</span>{step}
            </li>
          ))}
        </ol>
        <section aria-labelledby="local-location-title" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 id="local-location-title" className="text-2xl font-bold">Where will your Hunt take place?</h2>
          <p id="local-location-unavailable" role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Location selection is not available yet. We can’t show which locations have approved Hunts available to organize. Please come back later. You can continue your saved Hunts from My Hunts.</p>
          <fieldset disabled aria-describedby="local-location-unavailable" className="mt-5 grid gap-4 md:grid-cols-3">
            <legend className="sr-only">Hunt location</legend>
            {['Country', 'County / State', 'City'].map(label => <label key={label} className="text-sm font-bold">{label}<select className={`${controlClass} disabled:bg-slate-50 disabled:text-slate-500`} defaultValue=""><option value="">Unavailable</option></select></label>)}
          </fieldset>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><button disabled aria-describedby="local-location-unavailable" className="min-h-12 rounded-xl bg-slate-200 px-6 font-bold text-slate-500" type="button">Continue</button></div>
        </section>
      </div>
    </main>
  )
}

