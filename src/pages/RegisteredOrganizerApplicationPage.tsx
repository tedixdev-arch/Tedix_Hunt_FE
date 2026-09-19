import { FormEvent, type ReactNode, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { ApiError, organizerApplicationsApi, type OrganizationType } from '../services/api'
import { toOrganizerApplicationInput, validateOrganizerApplication, type ApplicationFormErrors, type ApplicationFormValues } from './organizerApplicationForm'

const initialValues: ApplicationFormValues = { name: '', email: '', organizationName: '', organizationType: '', reason: '', phone: '' }
const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500'

export function RegisteredOrganizerApplicationPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<ApplicationFormErrors>({})
  const [formError, setFormError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)

  function update<K extends keyof ApplicationFormValues>(field: K, value: ApplicationFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateOrganizerApplication(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return
    submitting.current = true
    setIsSubmitting(true)
    try {
      const email = values.email.trim()
      await organizerApplicationsApi.create(toOrganizerApplicationInput(values))
      setSubmittedEmail(email)
    } catch (caught) {
      setFormError(caught instanceof ApiError && caught.status === 400
        ? 'Please check the application details and try again.'
        : "We couldn't submit your application. Please try again.")
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  if (submittedEmail) return (
    <main className="min-h-dvh bg-slate-100 text-slate-950">
      <OrganizerHeader />
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl items-center px-5 py-10 sm:px-8">
        <section className="w-full rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-800" aria-hidden="true">✓</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Application received</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Application submitted</h1>
          <p className="mt-4 leading-7 text-slate-600">Your application is pending review. Organizer access is granted only after approval.</p>
          <p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">We received the application for <strong className="text-slate-900">{submittedEmail}</strong>.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-5 font-black" to="/organizer/sign-in">Back to Organizer access</Link>
            <Link className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 px-5 font-black" to="/">Go to home</Link>
          </div>
        </section>
      </div>
    </main>
  )

  return (
    <main className="min-h-dvh bg-slate-100 text-slate-950">
      <OrganizerHeader />
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Registered Organizer</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Apply as a Registered Organizer</h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-600">Tell us about you and the organization you represent. Applications are reviewed before Organizer access is granted.</p>
        <form className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate onSubmit={submit}>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Field id="application-name" label="Name" error={errors.name}><input id="application-name" autoComplete="name" className={inputClass} value={values.name} onChange={(event) => update('name', event.target.value)} /></Field>
            <Field id="application-email" label="Email" error={errors.email}><input id="application-email" autoComplete="email" className={inputClass} type="email" value={values.email} onChange={(event) => update('email', event.target.value)} /></Field>
          </div>
          <Field id="application-organization-name" label="Organization name" error={errors.organizationName}><input id="application-organization-name" className={inputClass} value={values.organizationName} onChange={(event) => update('organizationName', event.target.value)} /></Field>
          <Field id="application-organization-type" label="Organization type" error={errors.organizationType}><select id="application-organization-type" className={`${inputClass} bg-white`} value={values.organizationType} onChange={(event) => update('organizationType', event.target.value as OrganizationType | '')}><option value="">Select a type</option><option value="school">School</option><option value="ngo">NGO</option><option value="community">Community</option><option value="other">Other</option></select></Field>
          <Field id="application-reason" label="Why do you want to organize Tedix Hunts?" error={errors.reason}><textarea id="application-reason" className={`${inputClass} min-h-28 py-3`} value={values.reason} onChange={(event) => update('reason', event.target.value)} /></Field>
          <Field id="application-phone" label="Phone" optional><input id="application-phone" autoComplete="tel" className={inputClass} type="tel" value={values.phone} onChange={(event) => update('phone', event.target.value)} /></Field>
          {formError && <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" role="alert">{formError}</p>}
          <button className="mt-6 min-h-14 w-full rounded-xl bg-emerald-500 px-5 font-black hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Submitting…' : 'Submit application'}</button>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">Submitting an application does not create an account or grant Organizer access.</p>
        </form>
      </div>
    </main>
  )
}

function Field({ id, label, error, optional = false, children }: { id: string; label: string; error?: string; optional?: boolean; children: ReactNode }) {
  return <div className="mt-5"><label className="text-sm font-bold" htmlFor={id}>{label}{optional && <span className="ml-2 font-normal text-slate-500">Optional</span>}</label>{children}{error && <p className="mt-1.5 text-sm font-semibold text-rose-700" role="alert">{error}</p>}</div>
}
