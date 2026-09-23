import { FormEvent, ReactNode, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { authErrorMessage } from '../features/auth/errors'

function AccessShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-slate-950 px-5 py-10 text-white"><div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center"><Link className="mb-8 text-sm font-bold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>{children}</div></main>
}

export function ProfessionalAccessPage() {
  const accessLinks = [
    { label: 'Organizer', to: '/organizer/sign-in' },
    { label: 'Creator', to: '/creator/sign-in' },
    { label: 'Admin', to: '/admin/sign-in' },
  ]

  return <AccessShell><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Professional access</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Choose your workspace</h1><nav aria-label="Professional sign-in options" className="mt-8 grid gap-3">{accessLinks.map(link => <Link className="flex min-h-14 items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] px-5 font-bold transition hover:border-emerald-300 hover:bg-white/[0.08]" key={link.to} to={link.to}><span>{link.label}</span><span aria-hidden="true" className="text-emerald-300">→</span></Link>)}</nav></AccessShell>
}

export function ProfessionalSignInPage({ type }: { type: 'creator' | 'admin' }) {
  const navigate=useNavigate()
  const { loginAdmin, loginCreator } = useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [isSubmitting,setIsSubmitting]=useState(false)
  const submitting=useRef(false)
  const creator=type==='creator'
  async function submit(event:FormEvent){event.preventDefault();if(submitting.current)return;if(!email.includes('@')||password.length<6){setError('Enter a valid email and password.');return}submitting.current=true;setIsSubmitting(true);setError('');try{const login=creator?loginCreator:loginAdmin;await login({email:email.trim(),password});navigate(creator?'/creator':'/admin',{replace:true})}catch(caught){setError(authErrorMessage(caught,'login'))}finally{submitting.current=false;setIsSubmitting(false)}}
  return <AccessShell><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{creator?'Creator Studio':'Platform Administration'}</p><h1 className="mt-3 text-4xl font-bold tracking-tight">{creator?'Sign in to create templates':'Admin sign in'}</h1><p className="mt-4 leading-7 text-slate-300">{creator?'Create, test and submit Competition Templates.':'Review templates, safety alerts and platform settings.'}</p><form className="mt-7 rounded-2xl border border-white/10 bg-white/[0.05] p-5" onSubmit={submit}><label className="text-sm font-bold" htmlFor={`${type}-email`}>Email address</label><input autoComplete="email" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 outline-none focus:border-emerald-300" id={`${type}-email`} onChange={event=>{setEmail(event.target.value);setError('')}} type="email" value={email}/><label className="mt-5 block text-sm font-bold" htmlFor={`${type}-password`}>Password</label><input autoComplete="current-password" className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 outline-none focus:border-emerald-300" id={`${type}-password`} onChange={event=>{setPassword(event.target.value);setError('')}} type="password" value={password}/>{error&&<p className="mt-4 rounded-lg bg-amber-300/10 px-3 py-2 text-sm font-bold text-amber-200" role="alert">{error}</p>}<button className="mt-5 min-h-14 w-full rounded-xl bg-emerald-400 px-5 font-bold text-slate-950 disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting?'Please wait…':creator?'Open Creator Studio':'Open Admin Console'}</button></form></AccessShell>
}
