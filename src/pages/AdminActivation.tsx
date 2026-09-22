import { FormEvent, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'

export function AdminActivationPage() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { activateAdmin } = useAuth()
  const token = new URLSearchParams(search).get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!token) { setError('Invalid activation link.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (confirmPassword !== password) { setError('Passwords do not match.'); return }
    submitting.current = true
    setIsSubmitting(true)
    setError('')
    try {
      await activateAdmin({ token, password })
      navigate('/admin', { replace: true })
    } catch {
      setError('This activation link is invalid or has expired.')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return <main className="grid min-h-dvh place-items-center bg-slate-950 px-5 py-10 text-slate-950"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Admin activation</p><h1 className="mt-2 text-3xl font-black">Create your password</h1><p className="mt-2 text-sm text-slate-600">Use at least 8 characters to activate your Admin account.</p>
    {!token ? <><p className="mt-6 rounded-lg bg-amber-50 p-3 font-semibold text-amber-800" role="alert">Invalid activation link.</p><Link className="mt-5 inline-flex font-black underline" to="/admin/sign-in">Go to Admin sign in</Link></> : <form className="mt-6" onSubmit={submit}>
      <label className="block text-sm font-bold" htmlFor="activation-password">New password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="activation-password" minLength={8} onChange={event => { setPassword(event.target.value); setError('') }} required type="password" value={password} />
      <label className="mt-4 block text-sm font-bold" htmlFor="activation-confirm-password">Confirm new password</label><input autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3" id="activation-confirm-password" minLength={8} onChange={event => { setConfirmPassword(event.target.value); setError('') }} required type="password" value={confirmPassword} />
      {error && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="alert">{error}</p>}
      <button className="mt-5 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-black disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Activating…' : 'Activate Admin account'}</button>
    </form>}
  </section></main>
}
