import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { huntsApi, type HuntLifecycleAction, type HuntListItem, type HuntStatus } from '../services/api'
import { canContinueSetup, huntSummary, lifecycleActions, mergeLifecycleResult, statusLabels } from './organizerHunts'

const statusStyles: Record<HuntStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-500 text-white',
  paused: 'bg-violet-100 text-violet-800',
  cancelled: 'bg-slate-200 text-slate-600',
  finished: 'bg-teal-100 text-teal-800',
}

const actionLabels: Record<HuntLifecycleAction, string> = {
  publish: 'Publish', start: 'Start', pause: 'Pause', resume: 'Resume', cancel: 'Cancel', finish: 'Finish',
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Updated recently' : `Updated ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)}`
}

export function OrganizerHeader({ showProfile = false }: { showProfile?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = async () => { await logout(); navigate('/creator/sign-in', { replace: true }) }
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link className="text-sm font-black uppercase tracking-[0.2em] text-slate-950" to="/">TedixHunt</Link>
        {showProfile ? <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:block">{user?.name ?? 'Cluj Youth Centre'}</span>{user ? <button className="min-h-10 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100" onClick={() => void signOut()} type="button">Log out</button> : <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">OC</span>}</div> : <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/">Back to home</Link>}
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
  const [hunts, setHunts] = useState<HuntListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [pendingHuntIds, setPendingHuntIds] = useState<Set<string>>(() => new Set())
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})
  const pendingRef = useRef(new Set<string>())

  const loadHunts = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      setHunts(await huntsApi.listHunts())
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void loadHunts() }, [loadHunts])

  async function runAction(hunt: HuntListItem, action: HuntLifecycleAction) {
    if (pendingRef.current.has(hunt.id)) return
    pendingRef.current.add(hunt.id)
    setPendingHuntIds(new Set(pendingRef.current))
    setActionErrors((errors) => { const next = { ...errors }; delete next[hunt.id]; return next })
    try {
      const updated = await huntsApi[action](hunt.id)
      setHunts((current) => current.map((item) => item.id === hunt.id ? mergeLifecycleResult(item, updated) : item))
    } catch {
      setActionErrors((errors) => ({ ...errors, [hunt.id]: 'We couldn\'t update this Hunt. Please try again.' }))
    } finally {
      pendingRef.current.delete(hunt.id)
      setPendingHuntIds(new Set(pendingRef.current))
    }
  }

  const summary = huntSummary(hunts)

  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="gap-6 sm:flex sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p><h1 className="mt-2 text-4xl font-black tracking-tight">My Hunts</h1><p className="mt-3 text-slate-600">See what needs attention and take the next action.</p></div>
          <Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-6 font-black text-slate-950 shadow-sm hover:bg-emerald-400 sm:mt-0" to="/organizer/hunts/new">+ Set up a hunt</Link>
        </div>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:max-w-lg" aria-label="Hunt summary">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><span className="text-sm text-slate-500">Active now</span><strong className="mt-1 block text-3xl">{summary.active}</strong></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="text-sm text-amber-800">Needs attention</span><strong className="mt-1 block text-3xl text-amber-900">{summary.needsAttention}</strong></div>
        </section>

        <section className="mt-8" aria-labelledby="hunt-list-title">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black" id="hunt-list-title">All hunts</h2><span className="text-sm text-slate-500">{isLoading ? 'Loading…' : `${hunts.length} ${hunts.length === 1 ? 'hunt' : 'hunts'}`}</span></div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {isLoading && <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600" role="status">Loading your Hunts…</div>}
            {!isLoading && loadError && <div className="rounded-xl border border-rose-200 bg-white p-6"><p className="font-bold text-slate-800" role="alert">We couldn't load your Hunts.</p><button className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold hover:border-emerald-500 hover:text-emerald-700" onClick={() => void loadHunts()} type="button">Retry</button></div>}
            {!isLoading && !loadError && hunts.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-6"><p className="font-black text-slate-800">No Hunts yet.</p><p className="mt-1 text-sm text-slate-500">Set up a Hunt when you're ready to get started.</p></div>}
            {!isLoading && !loadError && hunts.map((hunt) => (
              <article className={`rounded-xl border bg-white p-4 shadow-sm ${hunt.status === 'active' ? 'border-emerald-400' : hunt.status === 'paused' ? 'border-amber-300' : 'border-slate-200'}`} key={hunt.id}>
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-black">{hunt.name}</h3><p className="mt-1 text-sm text-slate-500">{formatUpdatedAt(hunt.updatedAt)}</p></div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[hunt.status]}`}>{statusLabels[hunt.status]}</span>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  {actionErrors[hunt.id] && <p className="mb-3 text-sm font-semibold text-rose-700" role="alert">{actionErrors[hunt.id]}</p>}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {canContinueSetup(hunt) && <Link className="min-h-11 rounded-lg border border-emerald-500 px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50" to={`/organizer/hunts/${hunt.id}/setup`}>Continue setup</Link>}
                    <Link className="min-h-11 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700" to={`/organizer/hunts/${hunt.id}`}>View details →</Link>
                    {lifecycleActions(hunt).map((action) => <button className={`min-h-11 rounded-lg border px-4 text-sm font-bold disabled:cursor-wait disabled:opacity-50 ${action === 'cancel' ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'}`} disabled={pendingHuntIds.has(hunt.id)} key={action} onClick={() => void runAction(hunt, action)} type="button">{pendingHuntIds.has(hunt.id) ? 'Updating…' : actionLabels[action]}</button>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
