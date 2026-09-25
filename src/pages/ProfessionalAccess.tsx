import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { canAccessAdmin, canAccessCreator, canAccessOrganizer } from '../features/auth/access'
import { authErrorMessage } from '../features/auth/errors'
import { contextualWorkspaceChoices } from '../features/auth/workspaceContexts'
import { huntContextsApi, type HuntContext } from '../services/api'

function AccessShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-slate-950 px-5 py-10 text-white"><div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center"><Link className="mb-8 text-sm font-bold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>{children}</div></main>
}

type WorkspaceName = 'Organizer' | 'Creator' | 'Admin'

export function workspaceFromPath(pathname?: string): WorkspaceName | undefined {
  if (pathname?.startsWith('/admin')) return 'Admin'
  if (pathname?.startsWith('/creator')) return 'Creator'
  if (pathname?.startsWith('/organizer')) return 'Organizer'
  return undefined
}

const professionalWorkspaces = [
  { label: 'Organizer' as const, description: 'Create and manage Hunts', signInTo: '/organizer/sign-in', workspaceTo: '/organizer' },
  { label: 'Creator' as const, description: 'Build reusable Hunt templates', signInTo: '/creator/sign-in', workspaceTo: '/creator' },
  { label: 'Admin' as const, description: 'Manage the TedixHunt platform', signInTo: '/admin/sign-in', workspaceTo: '/admin' },
]

export function LoginWorkspacePage() {
  return <AccessShell><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">TedixHunt workspaces</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Choose your workspace</h1><nav aria-label="Professional sign-in options" className="mt-8 grid gap-3">{professionalWorkspaces.map(workspace => <Link className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 transition hover:border-emerald-300 hover:bg-white/[0.08]" key={workspace.label} to={workspace.signInTo}><span><span className="block font-bold">{workspace.label}</span><span className="mt-1 block text-sm font-normal text-slate-300">{workspace.description}</span></span><span aria-hidden="true" className="text-emerald-300">→</span></Link>)}</nav></AccessShell>
}

export function WorkspaceSelectorPage() {
  const { user, isBootstrapping } = useAuth()
  const location = useLocation()
  const [huntContexts, setHuntContexts] = useState<HuntContext[]>([])
  const [contextsLoading, setContextsLoading] = useState(false)
  const [contextsError, setContextsError] = useState(false)
  const requestId = useRef(0)
  const from = (location.state as { from?: unknown } | null)?.from
  const currentWorkspace = workspaceFromPath(typeof from === 'string' ? from : undefined)
  const loadHuntContexts = useCallback(async () => {
    if (!user) return
    const currentRequest = ++requestId.current
    setContextsLoading(true)
    setContextsError(false)
    try {
      const contexts = await huntContextsApi.list()
      if (requestId.current === currentRequest) setHuntContexts(contexts)
    } catch {
      if (requestId.current === currentRequest) setContextsError(true)
    } finally {
      if (requestId.current === currentRequest) setContextsLoading(false)
    }
  }, [user])
  useEffect(() => {
    setHuntContexts([])
    if (user) void loadHuntContexts()
    return () => { requestId.current += 1 }
  }, [user, loadHuntContexts])
  if (isBootstrapping) return <main className="grid min-h-dvh place-items-center bg-slate-950 text-white">Loading…</main>
  if (!user) return <Navigate replace to="/login-workspace" />
  const workspaces = professionalWorkspaces.filter(workspace => ({
    Organizer: canAccessOrganizer,
    Creator: canAccessCreator,
    Admin: canAccessAdmin,
  })[workspace.label](user))

  const contextualWorkspaces = contextualWorkspaceChoices(huntContexts)

  return <AccessShell><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">TedixHunt workspaces</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Switch workspace</h1><section aria-labelledby="global-workspaces-heading" className="mt-8"><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400" id="global-workspaces-heading">Global workspaces</h2><nav aria-label="Global workspaces" className="mt-3 grid gap-3">{workspaces.map(workspace => <Link className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 transition hover:border-emerald-300 hover:bg-white/[0.08]" key={workspace.label} to={workspace.workspaceTo}><span><span className="block font-bold">{workspace.label}</span><span className="mt-1 block text-sm font-normal text-slate-300">{workspace.description}</span></span><span className="flex shrink-0 flex-col items-end gap-2">{currentWorkspace === workspace.label && <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-semibold text-emerald-200">Current</span>}<span aria-hidden="true" className="text-emerald-300">→</span></span></Link>)}</nav></section><section aria-labelledby="hunt-workspaces-heading" className="mt-8"><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400" id="hunt-workspaces-heading">Your Hunts</h2>{contextsLoading && <p className="mt-3 text-sm text-slate-300" role="status">Loading Hunt contexts…</p>}{contextsError && <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3"><p className="text-sm text-amber-100" role="alert">We couldn't load your Hunt contexts.</p><button className="min-h-10 rounded-lg border border-amber-200/30 px-3 text-sm font-bold text-amber-100 hover:border-amber-200" onClick={() => void loadHuntContexts()} type="button">Retry</button></div>}{!contextsLoading && !contextsError && contextualWorkspaces.length === 0 && <p className="mt-3 text-sm text-slate-300">No Hunt contexts are available yet.</p>}<div aria-label="Hunt contexts" className="mt-3 grid gap-3">{contextualWorkspaces.map(({ role, context }) => <div className="flex min-h-24 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-slate-300" key={`${context.huntId}-${role}`}><span><span className="block font-bold text-white">{role}</span><span className="mt-1 block text-sm font-semibold">{context.huntName}</span><span className="mt-1 block text-xs capitalize text-slate-400">{context.huntStatus}</span></span><span className="max-w-24 text-right text-xs font-semibold text-slate-400">Runtime coming next</span></div>)}</div></section></AccessShell>
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
