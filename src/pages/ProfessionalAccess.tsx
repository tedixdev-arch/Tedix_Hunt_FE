import { FormEvent, ReactNode, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { canAccessAdmin, canAccessCreator, canAccessOrganizer, canAccessParticipant } from '../features/auth/access'
import { authErrorMessage } from '../features/auth/errors'

function AccessShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-slate-950 px-5 py-10 text-white"><div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center"><Link className="mb-8 text-sm font-bold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>{children}</div></main>
}

type WorkspaceName = 'Participant' | 'Organizer' | 'Creator' | 'Admin'

export function workspaceFromPath(pathname?: string): WorkspaceName | undefined {
  if (pathname?.startsWith('/admin')) return 'Admin'
  if (pathname?.startsWith('/creator')) return 'Creator'
  if (pathname?.startsWith('/organizer')) return 'Organizer'
  return undefined
}

export function WorkspaceSelectorPage() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: unknown } | null)?.from
  const currentWorkspace = workspaceFromPath(typeof from === 'string' ? from : undefined)
  const workspaces = [
    { label: 'Participant' as const, description: 'Join and play Hunts', signedOutTo: '/join', signedInTo: '/join', available: canAccessParticipant(user) },
    { label: 'Organizer' as const, description: 'Create and manage Hunts', signedOutTo: '/organizer/sign-in', signedInTo: '/organizer', available: canAccessOrganizer(user) },
    { label: 'Creator' as const, description: 'Build reusable Hunt templates', signedOutTo: '/creator/sign-in', signedInTo: '/creator', available: canAccessCreator(user) },
    { label: 'Admin' as const, description: 'Manage the TedixHunt platform', signedOutTo: '/admin/sign-in', signedInTo: '/admin', available: canAccessAdmin(user) },
  ]

  return <AccessShell><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">TedixHunt workspaces</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Choose your workspace</h1><nav aria-label="Workspace options" className="mt-8 grid gap-3">{workspaces.map(workspace => {
    const isAvailable = !isAuthenticated || workspace.available
    const content = <><span><span className="block font-bold">{workspace.label}</span><span className="mt-1 block text-sm font-normal text-slate-300">{workspace.description}</span>{!isAvailable && <span className="mt-2 block text-xs font-semibold text-slate-400">Not available for this account</span>}</span><span className="flex shrink-0 flex-col items-end gap-2">{currentWorkspace === workspace.label && <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-semibold text-emerald-200">Current</span>}{isAvailable && <span aria-hidden="true" className="text-emerald-300">→</span>}</span></>
    return isAvailable
      ? <Link className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 transition hover:border-emerald-300 hover:bg-white/[0.08]" key={workspace.label} to={isAuthenticated ? workspace.signedInTo : workspace.signedOutTo}>{content}</Link>
      : <div aria-disabled="true" className="flex min-h-20 cursor-not-allowed items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-slate-400" key={workspace.label}>{content}</div>
  })}</nav></AccessShell>
}

/** @deprecated Use WorkspaceSelectorPage at /workspaces. */
export const ProfessionalAccessPage = WorkspaceSelectorPage

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
