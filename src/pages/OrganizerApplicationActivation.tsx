import { FormEvent, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { organizerActivationErrorMessage } from '../features/auth/organizerActivationErrors'

export function OrganizerApplicationActivationPage() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { activateOrganizerApplication } = useAuth()
  const token = new URLSearchParams(search).get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!token) { setError('This activation link is missing its token.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (confirmPassword !== password) { setError('Passwords do not match.'); return }

    submitting.current = true
    setIsSubmitting(true)
    setError('')
    try {
      await activateOrganizerApplication({ token, password })
      navigate('/organizer', { replace: true })
    } catch (caught) {
      setError(organizerActivationErrorMessage(caught))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return <main className="grid min-h-dvh place-items-center bg-slate-950 px-5 py-10 text-slate-950"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Organizer application activation</p><h1 className="mt-2 text-3xl font-bold">Activate your Organizer account</h1><p className="mt-2 text-sm text-slate-600">Your Organizer application was approved. Create a password to enter your workspace.</p><p className="mt-2 text-sm text-slate-600">Use at least 8 characters.</p>
    {!token ? <><p className="mt-6 rounded-lg bg-amber-50 p-3 font-semibold text-amber-800" role="alert">This activation link is missing its token.</p><div className="mt-5 flex flex-wrap gap-4"><Link className="font-bold underline" to="/organizer/registered">Go to Organizer sign in</Link><Link className="font-bold underline" to="/organizer/apply">Apply as an Organizer</Link></div></> : <form className="mt-6" onSubmit={submit}>
      <label className="block text-sm font-bold" htmlFor="organizer-application-activation-password">New password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="organizer-application-activation-password" minLength={8} onChange={event => { setPassword(event.target.value); setError('') }} required type="password" value={password} />
      <label className="mt-4 block text-sm font-bold" htmlFor="organizer-application-activation-confirm-password">Confirm new password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="organizer-application-activation-confirm-password" minLength={8} onChange={event => { setConfirmPassword(event.target.value); setError('') }} required type="password" value={confirmPassword} />
      {error && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{error}</p>}
      <button className="mt-5 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-bold disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Activating…' : 'Activate Organizer account'}</button>
      <Link className="mt-5 inline-flex font-bold underline" to="/organizer/registered">Go to Organizer sign in</Link>
    </form>}
  </section></main>
}
