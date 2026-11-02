import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { enrollmentError, participantEnrollmentApi, recallHunt, type ParticipantHuntContext } from '../services/api/participantEnrollment'

export function ParticipantReadinessPage() {
  const { user } = useAuth()
  const [search] = useSearchParams()
  const location = useLocation()
  const remembered = user ? recallHunt(user.id) : null
  const huntId = search.get('hunt') ?? remembered?.huntId
  const name = remembered && remembered.huntId === huntId ? remembered.name : location.state?.huntName ?? 'Your Hunt'
  const [context, setContext] = useState<ParticipantHuntContext | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setContext(null); setError('')
    if (!huntId) return
    participantEnrollmentApi.context(huntId).then(result => { if (active) setContext(result) })
      .catch(caught => { if (active) setError(enrollmentError(caught)) })
    return () => { active = false }
  }, [huntId, user?.id, attempt])
  return <main className="min-h-dvh bg-[#07110f] px-5 py-5 text-white"><div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col">
    <header className="flex min-h-11 items-center"><Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link></header>
    <section className="flex flex-1 flex-col justify-center py-6"><h1 className="break-words text-4xl font-extrabold tracking-tight">{name}</h1>
      {!huntId && <Link className="mt-6 min-h-14 rounded-xl bg-emerald-400 p-4 text-center font-bold text-slate-950" to="/join">Join Hunt</Link>}
      {huntId && !context && !error && <p className="mt-5 text-slate-300" role="status">Loading your Hunt…</p>}
      {error && <><p className="mt-5 text-amber-200" role="alert">{error}</p><button className="mt-5 min-h-14 rounded-xl bg-emerald-400 p-4 font-bold text-slate-950" onClick={() => setAttempt(value => value + 1)}>Try again</button><Link className="min-h-11 py-3 text-center text-slate-300" to="/join">Back to join</Link></>}
      {context && <><p className="mt-5 text-xl font-bold text-emerald-300">You're in!</p><p className="mt-3 text-slate-300">{context.huntStatus === 'paused' ? 'Your Hunt is paused. Your place is saved.' : 'Your place is saved. Your Organizer will help you get started.'}</p><p className="mt-3 text-sm text-slate-400">Playing this Hunt in the app is not available yet.</p></>}
    </section></div></main>
}
