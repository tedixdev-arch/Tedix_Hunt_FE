import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { ApiError, huntAccessApi, sessionStore, type HuntAccessResolution } from '../services/api'
import { enrollmentError, participantEnrollmentApi, recallHunt, rememberHunt } from '../services/api/participantEnrollment'
import { authErrorMessage } from '../features/auth/errors'
import { meetsPasswordPolicy, PASSWORD_POLICY_MESSAGE, PASSWORD_REQUIREMENT_TEXT } from '../features/auth/passwordPolicy'

function ParticipantShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-[#07110f] px-5 py-5 text-white"><div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col"><header className="flex min-h-11 items-center justify-between"><Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link><span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Participants</span></header>{children}</div></main>
}

function expiredGuest() {
  try { return localStorage.getItem('tedix-hunt.expired-guest') === 'true' } catch { return false }
}

type Mode = 'guest' | 'login' | 'register'

export function JoinHuntPage() {
  const navigate = useNavigate()
  const { user, isBootstrapping, createGuestSession, loginParticipant, registerParticipant } = useAuth()
  const { code: linkCode = '' } = useParams()
  const previousSession = useRef(Boolean(sessionStore.getAccessToken()))
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [hunt, setHunt] = useState<HuntAccessResolution | null>(null)
  const [checking, setChecking] = useState(false)
  const [mode, setMode] = useState<Mode>('guest')
  const [code, setCode] = useState(linkCode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    if (!linkCode) return
    let active = true
    setCode(linkCode); setHunt(null); setError(''); setChecking(true)
    huntAccessApi.resolve(linkCode.trim()).then(result => { if (active) setHunt(result) })
      .catch(caught => { if (active) setError(enrollmentError(caught)) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [linkCode])
  const needsAuthentication = !user || requiresSignIn
  const guestBlocked = requiresSignIn || (previousSession.current && !user) || expiredGuest()


  async function join(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!code.trim() && !(user && recallHunt(user.id))) return setError('Enter your Hunt code.')
    if (hunt && needsAuthentication && mode !== 'guest' && !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (hunt && needsAuthentication && mode !== 'guest' && !password) return setError('Password is required.')
    if (hunt && needsAuthentication && mode === 'login' && password.length < 6) return setError('Password must be at least 6 characters.')
    if (hunt && needsAuthentication && mode === 'register' && !name.trim()) return setError('Enter your name.')
    if (hunt && needsAuthentication && mode === 'register' && !meetsPasswordPolicy(password)) return setError(PASSWORD_POLICY_MESSAGE)
    submitting.current = true
    setIsSubmitting(true)
    setError('')
    let authenticating = false
    try {
      const remembered = user && !code.trim() ? recallHunt(user.id) : null
      const resolved = remembered ?? hunt ?? await huntAccessApi.resolve(code.trim())
      if (!remembered && !hunt) { setHunt(resolved as HuntAccessResolution); return }
      let participant = user
      if (needsAuthentication) {
        if (mode === 'guest' && guestBlocked) { setMode('login'); throw new ApiError('expired', 401, 'unauthorized') }
        authenticating = true
        participant = mode === 'guest' ? await createGuestSession(name.trim() ? { name: name.trim() } : {})
          : mode === 'login' ? await loginParticipant({ email: email.trim(), password })
          : await registerParticipant({ email: email.trim(), password, name: name.trim() })
        authenticating = false
        try { localStorage.removeItem('tedix-hunt.expired-guest') } catch { /* Optional storage. */ }
        setRequiresSignIn(false)
      }
      const context = await participantEnrollmentApi.enroll(resolved.huntId, remembered ? undefined : code.trim())
      if (!participant) return
      rememberHunt(participant.id, context.huntId, resolved.name)
      navigate(`/participant/setup?hunt=${encodeURIComponent(context.huntId)}`, { replace: true, state: { context, huntName: resolved.name } })
    } catch (caught) {
      if (!authenticating && caught instanceof ApiError && caught.status === 401) { setRequiresSignIn(true); setMode('login') }
      setError(authenticating ? authErrorMessage(caught, mode === 'register' ? 'register' : mode) : enrollmentError(caught))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return <ParticipantShell><section className="flex flex-1 flex-col justify-center py-8"><h1 className="mt-3 break-words text-4xl font-extrabold tracking-tight">{hunt?.name ?? 'Join a Hunt'}</h1>
    {checking && <p className="mt-4 text-slate-300" role="status">Checking invitation…</p>}
    {guestBlocked && needsAuthentication && <p className="mt-4 text-sm text-amber-200">Your session has expired. Please sign in again. Guest progress requires the original valid credentials.</p>}
    {hunt && needsAuthentication && <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1" aria-label="Participant access type">{(['guest','login','register'] as Mode[]).map(item => <button disabled={isSubmitting || (item === 'guest' && guestBlocked)} key={item} className={`min-h-11 rounded-lg text-xs font-bold capitalize ${mode === item ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`} onClick={() => { setMode(item); setError('') }} type="button">{item === 'login' ? 'Sign in' : item}</button>)}</div>}
    <form className="mt-4 space-y-4" onSubmit={join}>{!linkCode && <label className="block text-sm font-bold" htmlFor="hunt-code">Hunt code<input autoCapitalize="characters" autoComplete="one-time-code" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-center text-lg font-bold uppercase tracking-[0.18em]" id="hunt-code" disabled={isSubmitting} onChange={event => { setCode(event.target.value.toUpperCase()); setHunt(null); setError('') }} value={code}/></label>}
      {hunt && needsAuthentication && (mode === 'guest' || mode === 'register') && <label className="block text-sm font-bold" htmlFor="participant-name">{mode === 'guest' ? 'Name (optional)' : 'Name'}<input autoComplete="name" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-name" onChange={event => setName(event.target.value)} value={name}/></label>}
      {hunt && needsAuthentication && mode !== 'guest' && <><label className="block text-sm font-bold" htmlFor="participant-email">Email address<input autoComplete="email" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-email" onChange={event => setEmail(event.target.value)} type="email" value={email}/></label><label className="block text-sm font-bold" htmlFor="participant-password">Password<input aria-describedby={mode === 'register' ? 'participant-password-help' : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-password" onChange={event => setPassword(event.target.value)} type="password" value={password}/></label>{mode === 'register' && <p className="text-xs text-slate-400" id="participant-password-help">{PASSWORD_REQUIREMENT_TEXT}</p>}</>}
      {error && <p className="rounded-lg bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-200" role="alert">{error}</p>}<button className="min-h-16 w-full rounded-xl bg-emerald-400 px-6 font-bold text-slate-950 disabled:opacity-60" disabled={isSubmitting || isBootstrapping || checking} type="submit">{isSubmitting ? 'Please wait…' : 'Join Hunt'}</button></form><Link className="mt-3 min-h-11 py-3 text-center text-sm font-semibold text-slate-400" to="/">Back to home</Link></section></ParticipantShell>
}
