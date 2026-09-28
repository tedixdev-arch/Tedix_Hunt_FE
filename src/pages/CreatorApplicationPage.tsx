import { FormEvent, type ReactNode, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { creatorApplicationErrorMessage } from '../features/auth/creatorApplicationErrors'
import { PASSWORD_REQUIREMENT_TEXT } from '../features/auth/passwordPolicy'
import { creatorApplicationsApi } from '../services/api'
import { toCreatorApplicationInput, validateCreatorApplication, type CreatorApplicationFormErrors, type CreatorApplicationFormValues } from './creatorApplicationForm'

const initialValues: CreatorApplicationFormValues = { name: '', email: '', password: '', confirmPassword: '' }
const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500'

export function CreatorApplicationPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<CreatorApplicationFormErrors>({})
  const [formError, setFormError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  function update(field: keyof CreatorApplicationFormValues, value: string) {
    setValues(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateCreatorApplication(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    submitting.current = true
    setIsSubmitting(true)
    setFormError('')
    try {
      await creatorApplicationsApi.create(toCreatorApplicationInput(values))
      setSubmittedEmail(values.email.trim())
      setValues(initialValues)
    } catch (error) {
      setFormError(creatorApplicationErrorMessage(error))
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return <main className="min-h-dvh bg-slate-100 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8"><Link className="font-bold" to="/">TedixHunt</Link></div></header><div className="mx-auto max-w-xl px-5 py-10 sm:px-8">
    {submittedEmail ? <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8"><div aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-800">✓</div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Application received</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Application submitted</h1><p className="mt-4 text-lg font-bold">Status: Pending</p><p className="mt-3 leading-7 text-slate-600">An Admin must approve your Creator application before Creator access becomes available. Once approved, sign in normally using the credentials you established here.</p><p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">We received the application for <strong className="text-slate-900">{submittedEmail}</strong>.</p><Link className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 font-bold" to="/creator/sign-in">Back to Creator sign in</Link></section> : <><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Creator Studio</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Apply to become a Creator</h1><p className="mt-4 leading-7 text-slate-600">Create your sign-in credentials and submit your application for Admin review.</p><form className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate onSubmit={submit}><Field id="creator-application-name" label="Name" error={errors.name}><input autoComplete="name" className={inputClass} id="creator-application-name" value={values.name} onChange={event => update('name', event.target.value)} /></Field><Field id="creator-application-email" label="Email" error={errors.email}><input autoComplete="email" className={inputClass} id="creator-application-email" type="email" value={values.email} onChange={event => update('email', event.target.value)} /></Field><Field id="creator-application-password" label="Password" error={errors.password}><input aria-describedby="creator-password-help" autoComplete="new-password" className={inputClass} id="creator-application-password" type="password" value={values.password} onChange={event => update('password', event.target.value)} /><p className="mt-1.5 text-xs text-slate-500" id="creator-password-help">{PASSWORD_REQUIREMENT_TEXT}</p></Field><Field id="creator-application-confirm-password" label="Confirm password" error={errors.confirmPassword}><input autoComplete="new-password" className={inputClass} id="creator-application-confirm-password" type="password" value={values.confirmPassword} onChange={event => update('confirmPassword', event.target.value)} /></Field>{formError && <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" role="alert">{formError}</p>}<button className="mt-6 min-h-14 w-full rounded-xl bg-emerald-500 px-5 font-bold disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Submitting…' : 'Submit application'}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">Submitting an application does not grant Creator access until Admin approval.</p></form></>}
  </div></main>
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return <div className="mt-5"><label className="text-sm font-bold" htmlFor={id}>{label}</label>{children}{error && <p className="mt-1.5 text-sm font-semibold text-rose-700" role="alert">{error}</p>}</div>
}
