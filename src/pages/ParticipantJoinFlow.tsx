import { FormEvent, ReactNode, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { canAccessParticipant } from '../features/auth/access'
import { authErrorMessage } from '../features/auth/errors'

function ParticipantShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-[#07110f] px-5 py-5 text-white"><div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col"><header className="flex min-h-11 items-center justify-between"><Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link><span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Participants</span></header>{children}</div></main>
}

type Mode = 'guest' | 'login' | 'register'

export function JoinHuntPage() {
  const navigate = useNavigate()
  const { user, isBootstrapping, createGuestSession, loginParticipant, registerParticipant } = useAuth()
  const [mode, setMode] = useState<Mode>('guest')
  const [code, setCode] = useState('SIGNAL26')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  if (!isBootstrapping && canAccessParticipant(user)) return <Navigate replace to="/participant/setup" />

  async function join(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (code.trim().length < 4) return setError('Check the Hunt code and try again.')
    if (mode !== 'guest' && !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (mode !== 'guest' && password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'register' && !name.trim()) return setError('Enter your name.')
    submitting.current = true
    setIsSubmitting(true)
    setError('')
    try {
      if (mode === 'guest') await createGuestSession(name.trim() ? { name: name.trim() } : {})
      else if (mode === 'login') await loginParticipant({ email: email.trim(), password })
      else await registerParticipant({ email: email.trim(), password, name: name.trim() })
      navigate('/participant/setup', { replace: true })
    } catch (caught) {
      setError(authErrorMessage(caught, mode === 'register' ? 'register' : mode))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return <ParticipantShell><section className="flex flex-1 flex-col justify-center py-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Join your team</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight">Enter Signal: Cluj Napoca</h1><div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Hunt found</p><p className="mt-1 font-bold">Signal: Cluj Napoca</p><p className="mt-2 text-sm text-slate-400">Start: Matthias Rex Statue, Cluj-Napoca</p></div>
    <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1" aria-label="Participant access type">{(['guest','login','register'] as Mode[]).map(item => <button key={item} className={`min-h-11 rounded-lg text-xs font-bold capitalize ${mode === item ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'}`} onClick={() => { setMode(item); setError('') }} type="button">{item === 'login' ? 'Sign in' : item}</button>)}</div>
    <form className="mt-4 space-y-4" onSubmit={join}><label className="block text-sm font-bold" htmlFor="hunt-code">Hunt code<input autoCapitalize="characters" autoComplete="one-time-code" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-center text-lg font-bold uppercase tracking-[0.18em]" id="hunt-code" onChange={event => setCode(event.target.value.toUpperCase())} value={code}/></label>
      {(mode === 'guest' || mode === 'register') && <label className="block text-sm font-bold" htmlFor="participant-name">{mode === 'guest' ? 'Name (optional)' : 'Name'}<input autoComplete="name" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-name" onChange={event => setName(event.target.value)} value={name}/></label>}
      {mode !== 'guest' && <><label className="block text-sm font-bold" htmlFor="participant-email">Email address<input autoComplete="email" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-email" onChange={event => setEmail(event.target.value)} type="email" value={email}/></label><label className="block text-sm font-bold" htmlFor="participant-password">Password<input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4" id="participant-password" onChange={event => setPassword(event.target.value)} type="password" value={password}/></label></>}
      {error && <p className="rounded-lg bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-200" role="alert">{error}</p>}<button className="min-h-16 w-full rounded-xl bg-emerald-400 px-6 font-bold text-slate-950 disabled:opacity-60" disabled={isSubmitting || isBootstrapping} type="submit">{isSubmitting ? 'Please wait…' : mode === 'guest' ? 'Continue as guest' : mode === 'login' ? 'Sign in & join' : 'Create account & join'}</button></form><Link className="mt-3 min-h-11 py-3 text-center text-sm font-semibold text-slate-400" to="/">Back to home</Link></section></ParticipantShell>
}
