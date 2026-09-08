import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HuntStatus, organizerHunts } from '../data/platformPrototype'

const statusLabels: Record<HuntStatus, string> = {
  ready: 'Ready to start',
  countdown: 'Countdown',
  'in-progress': 'In progress',
  delayed: 'Delayed',
  paused: 'Paused',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

const statusStyles: Record<HuntStatus, string> = {
  ready: 'bg-emerald-100 text-emerald-800',
  countdown: 'bg-sky-100 text-sky-800',
  'in-progress': 'bg-emerald-500 text-white',
  delayed: 'bg-amber-100 text-amber-800',
  paused: 'bg-violet-100 text-violet-800',
  cancelled: 'bg-slate-200 text-slate-600',
  completed: 'bg-teal-100 text-teal-800',
}

function HuntActionMenu({ huntId, status }: { huntId: string; status: HuntStatus }) {
  const actions = [
    { label: 'View details', action: 'details' },
    { label: 'Duplicate hunt', action: 'duplicate' },
    ...(status === 'paused'
      ? [{ label: 'Resume hunt', action: 'resume' }]
      : status !== 'cancelled' && status !== 'completed'
        ? [{ label: 'Pause hunt', action: 'pause' }]
        : []),
    ...(status !== 'cancelled' && status !== 'completed' ? [{ label: 'Cancel hunt', action: 'cancel' }] : []),
  ]

  return (
    <details className="relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-slate-300 px-3 text-sm font-bold hover:border-emerald-500 hover:text-emerald-700">More actions ▾</summary>
      <div className="absolute right-0 top-full z-10 mt-2 min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
        {actions.map((item) => <Link className={`block px-4 py-3 text-sm font-bold hover:bg-slate-50 ${item.action === 'cancel' ? 'text-rose-700' : 'text-slate-700'}`} key={item.action} to={`/organizer/hunts/${huntId}?action=${item.action}`}>{item.label}</Link>)}
      </div>
    </details>
  )
}

export function OrganizerHeader({ showProfile = false }: { showProfile?: boolean }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link className="text-sm font-black uppercase tracking-[0.2em] text-slate-950" to="/">TedixHunt</Link>
        {showProfile ? <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:block">Cluj Youth Centre</span><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">OC</span></div> : <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/">Back to home</Link>}
      </div>
    </header>
  )
}

export function OrganizerSignInPage() {
  return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader/><div className="mx-auto max-w-4xl px-5 py-10 sm:px-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight">How will you organize?</h1><p className="mt-3 max-w-2xl text-slate-600">Choose the access that matches your Hunt. Both use the same clear Set the Hunt flow.</p><div className="mt-8 grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-sm"><span className="text-xs font-black uppercase tracking-wide text-emerald-700">Registered Organizer</span><h2 className="mt-3 text-2xl font-black">For schools and organizations</h2><p className="mt-3 leading-6 text-slate-600">Approved teachers, schools, NGOs and community partners can set every Hunt feature and configure rewards.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-5 font-black" to="/organizer/registered">Sign in</Link><button className="mt-2 min-h-11 w-full text-sm font-black text-emerald-800" type="button">Apply as a Registered Organizer</button></article><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-xs font-black uppercase tracking-wide text-slate-500">Independent Organizer</span><h2 className="mt-3 text-2xl font-black">A private Hunt with friends</h2><p className="mt-3 leading-6 text-slate-600">Confirm your email and use the full Hunt builder with a verified route. Rewards remain unavailable.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl border border-slate-900 px-5 font-black" to="/organizer/independent">Create an Independent Hunt</Link></article></div></div></main>
}

export function RegisteredOrganizerSignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@tedixhunt.demo')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')

  function signIn(event: FormEvent) {
    event.preventDefault()
    if (!email.includes('@') || password.length < 4) {
      setError('Enter your email and password to continue.')
      return
    }
    navigate('/organizer')
  }

  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader />
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in to manage your hunts</h1>
        <p className="mt-4 leading-7 text-slate-600">Set up a hunt, check its status, or respond when participants need help.</p>
        <form className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={signIn}>
          <label className="text-sm font-bold" htmlFor="organizer-email">Email address</label>
          <input id="organizer-email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500" placeholder="organizer@example.com" />
          <label className="mt-5 block text-sm font-bold" htmlFor="organizer-password">Password</label>
          <input id="organizer-password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500" placeholder="Enter password" />
          {error && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" role="alert">{error}</p>}
          <button className="mt-5 min-h-14 w-full rounded-xl bg-emerald-500 px-5 font-black text-slate-950 hover:bg-emerald-400" type="submit">Sign in</button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Navigation prototype only. No credentials are stored.</p>
      </div>
    </main>
  )
}

export function IndependentOrganizerPage() {
  const navigate = useNavigate()
  const [email,setEmail]=useState('student@example.com')
  const [confirmed,setConfirmed]=useState(false)
  const [accepted,setAccepted]=useState(false)
  return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader/><div className="mx-auto max-w-md px-5 py-10"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Independent Hunt</p><h1 className="mt-3 text-4xl font-black tracking-tight">Confirm your email</h1><p className="mt-3 leading-6 text-slate-600">Create a private Hunt for friends using a Creator-verified route.</p><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><label className="text-sm font-bold">Email address<input className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4" onChange={e=>{setEmail(e.target.value);setConfirmed(false)}} type="email" value={email}/></label><button className="mt-4 min-h-12 w-full rounded-xl border border-emerald-500 font-black text-emerald-800" disabled={!email.includes('@')} onClick={()=>setConfirmed(true)} type="button">{confirmed?'✓ Email confirmed':'Send confirmation code'}</button><div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Independent activity</strong><p className="mt-1">Independent Hunts are private, unofficial activities. The Organizer and participants are responsible for following local rules, staying safe and using the verified route as intended.</p></div><label className="mt-4 flex items-start gap-3 text-sm leading-6"><input checked={accepted} className="mt-1 h-5 w-5 accent-emerald-500" onChange={e=>setAccepted(e.target.checked)} type="checkbox"/><span>I understand that this is an independent activity and I am responsible for organizing it safely.</span></label><button className="mt-5 min-h-14 w-full rounded-xl bg-emerald-500 font-black disabled:bg-slate-300" disabled={!confirmed||!accepted} onClick={()=>navigate('/organizer/hunts/new?mode=independent')} type="button">Set the Hunt</button></section></div></main>
}

export function OrganizerHuntsPage() {
  const activeCount = organizerHunts.filter((hunt) => hunt.status === 'in-progress').length
  const needsAttention = organizerHunts.filter((hunt) => ['delayed', 'paused'].includes(hunt.status)).length

  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="gap-6 sm:flex sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p><h1 className="mt-2 text-4xl font-black tracking-tight">My Hunts</h1><p className="mt-3 text-slate-600">See what needs attention and take the next action.</p></div>
          <Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-6 font-black text-slate-950 shadow-sm hover:bg-emerald-400 sm:mt-0" to="/organizer/hunts/new">+ Set up a hunt</Link>
        </div>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:max-w-lg" aria-label="Hunt summary">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><span className="text-sm text-slate-500">Active now</span><strong className="mt-1 block text-3xl">{activeCount}</strong></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="text-sm text-amber-800">Needs attention</span><strong className="mt-1 block text-3xl text-amber-900">{needsAttention}</strong></div>
        </section>

        <section className="mt-8" aria-labelledby="hunt-list-title">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black" id="hunt-list-title">All hunts</h2><span className="text-sm text-slate-500">{organizerHunts.length} hunts</span></div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {organizerHunts.map((hunt) => (
              <article className={`rounded-xl border bg-white p-4 shadow-sm ${hunt.status === 'in-progress' ? 'border-emerald-400' : hunt.status === 'delayed' || hunt.status === 'paused' ? 'border-amber-300' : 'border-slate-200'}`} key={hunt.id}>
                <div className="flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2"><h3 className="font-black">{hunt.name}</h3><Link aria-label={`Edit ${hunt.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" title={`Edit ${hunt.name}`} to={`/organizer/hunts/${hunt.id}?action=edit`}><svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="2"/></svg></Link></div><p className="mt-1 text-sm text-slate-500">Signal: Cluj Napoca · Cluj Napoca</p></div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[hunt.status]}`}>{statusLabels[hunt.status]}</span>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-400">12 Sep · 10:00</span><div className="mt-3 flex flex-wrap items-center justify-end gap-2"><Link className="min-h-11 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700" to={`/organizer/hunts/${hunt.id}`}>{hunt.primaryAction} →</Link><HuntActionMenu huntId={hunt.id} status={hunt.status} /></div></div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
