import { FormEvent, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'

type ActivationRole = 'organizer' | 'creator'

const content = {
  organizer: { label: 'Organizer', destination: '/organizer', signIn: '/organizer/registered' },
  creator: { label: 'Creator', destination: '/creator', signIn: '/creator/sign-in' },
} as const

export function ProfessionalActivationPage({ role }: { role: ActivationRole }) {
  const { search } = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const token = new URLSearchParams(search).get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)
  const details = content[role]

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!token) { setError('Invalid activation link.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (confirmPassword !== password) { setError('Passwords do not match.'); return }
    submitting.current = true; setIsSubmitting(true); setError('')
    try {
      if (role === 'organizer') await auth.activateDirectOrganizer({ token, password })
      else await auth.activateCreator({ token, password })
      navigate(details.destination, { replace: true })
    } catch { setError('This activation link is invalid or has expired.') }
    finally { submitting.current = false; setIsSubmitting(false) }
  }

  return <main className="grid min-h-dvh place-items-center bg-slate-950 px-5 py-10 text-slate-950"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{details.label} activation</p><h1 className="mt-2 text-3xl font-bold">Create your password</h1><p className="mt-2 text-sm text-slate-600">Create a password to activate your {details.label} access.</p><p className="mt-2 text-sm text-slate-600">Use at least 8 characters.</p>
    {!token ? <><p className="mt-6 rounded-lg bg-amber-50 p-3 font-semibold text-amber-800" role="alert">Invalid activation link.</p><Link className="mt-5 inline-flex font-bold underline" to={details.signIn}>Go to {details.label} sign in</Link></> : <form className="mt-6" onSubmit={submit}>
      <label className="block text-sm font-bold" htmlFor={`${role}-activation-password`}>New password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id={`${role}-activation-password`} minLength={8} onChange={event => { setPassword(event.target.value); setError('') }} required type="password" value={password} />
      <label className="mt-4 block text-sm font-bold" htmlFor={`${role}-activation-confirm-password`}>Confirm new password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id={`${role}-activation-confirm-password`} minLength={8} onChange={event => { setConfirmPassword(event.target.value); setError('') }} required type="password" value={confirmPassword} />
      {error && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{error}</p>}
      <button className="mt-5 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-bold disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Activating…' : `Activate ${details.label} account`}</button>
    </form>}
  </section></main>
}

export function DirectOrganizerActivationPage() { return <ProfessionalActivationPage role="organizer" /> }
export function CreatorActivationPage() { return <ProfessionalActivationPage role="creator" /> }
