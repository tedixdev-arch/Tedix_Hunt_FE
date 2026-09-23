import { FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { changePasswordErrorMessage } from '../features/auth/errors'
import { AdminShell } from './AdminConsole'

export function AdminAccountSecurityPage() {
  const navigate = useNavigate()
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (confirmPassword !== newPassword) {
      setError('New passwords do not match.')
      return
    }

    submitting.current = true
    setIsSubmitting(true)
    setError('')
    try {
      await changePassword({ currentPassword, newPassword })
      navigate('/admin/sign-in', { replace: true })
    } catch (caught) {
      setError(changePasswordErrorMessage(caught))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  const clearError = () => setError('')
  const inputClass = 'mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500'

  return <AdminShell active="account">
    <section className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-3xl font-bold">Account Security</h2>
      <p className="mt-2 text-slate-600">Change your Admin password. You will need to sign in again on all devices.</p>
      <form className="mt-7" onSubmit={submit}>
        <label className="block text-sm font-bold" htmlFor="current-password">Current password</label>
        <input autoComplete="current-password" className={inputClass} id="current-password" onChange={event => { setCurrentPassword(event.target.value); clearError() }} required type="password" value={currentPassword} />
        <label className="mt-5 block text-sm font-bold" htmlFor="new-password">New password</label>
        <input aria-describedby="new-password-help" autoComplete="new-password" className={inputClass} id="new-password" minLength={8} onChange={event => { setNewPassword(event.target.value); clearError() }} required type="password" value={newPassword} />
        <p className="mt-2 text-xs text-slate-500" id="new-password-help">Use at least 8 characters.</p>
        <label className="mt-5 block text-sm font-bold" htmlFor="confirm-password">Confirm new password</label>
        <input autoComplete="new-password" className={inputClass} id="confirm-password" minLength={8} onChange={event => { setConfirmPassword(event.target.value); clearError() }} required type="password" value={confirmPassword} />
        {error && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" role="alert">{error}</p>}
        <button className="mt-6 min-h-14 w-full rounded-xl bg-emerald-500 px-5 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Changing password…' : 'Change password'}</button>
      </form>
    </section>
  </AdminShell>
}
