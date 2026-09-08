import { FormEvent, ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500'
const labelClass = 'block text-sm font-bold text-slate-800'

function SetupShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const setupUrl = searchParams.get('mode') === 'independent' ? '/organizer/hunts/new?mode=independent' : '/organizer/hunts/new'
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to={setupUrl}>← Setup options</Link>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
        {children}
      </div>
    </main>
  )
}

function SuccessState({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6" role="status">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-2xl font-black text-white">✓</div>
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-emerald-950">{detail}</p>
      <Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 font-black hover:bg-emerald-400" to="/organizer">Open My Hunts</Link>
    </section>
  )
}

const challengeTypes = ['Single choice', 'Multiple choice', 'True / False', 'Match three pairs'] as const
type ChallengeDraft = { enabled:boolean; type:typeof challengeTypes[number]; question:string; answers:string[] }
const initialChallenges:ChallengeDraft[]=Array.from({length:7},()=>({enabled:false,type:'Single choice',question:'',answers:['','','']}))

function PersonalChallengeOverrides({drafts,onChange}:{drafts:ChallengeDraft[];onChange:(drafts:ChallengeDraft[])=>void}){
  const [checkpoint,setCheckpoint]=useState(0)
  const draft=drafts[checkpoint]
  const update=(change:Partial<ChallengeDraft>)=>onChange(drafts.map((item,index)=>index===checkpoint?{...item,...change}:item))
  const labels=draft.type==='Match three pairs'?['Pair 1: A = B','Pair 2: A = B','Pair 3: A = B']:draft.type==='True / False'?['Correct answer: True or False']:['Answer 1','Answer 2','Answer 3']
  return <div className="sm:col-span-2"><div className="flex gap-2 overflow-x-auto pb-2">{drafts.map((item,index)=><button className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${checkpoint===index?'bg-slate-950 text-white':item.enabled?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-slate-600'}`} key={index} onClick={()=>setCheckpoint(index)} type="button">Checkpoint {index+1}{item.enabled?' ✓':''}</button>)}</div><div className="mt-3 rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-black">Checkpoint {checkpoint+1} personal challenge</p><p className="mt-1 text-sm text-slate-500">The verified route and team challenge do not change.</p></div><label className="flex shrink-0 items-center gap-2 text-sm font-bold"><input checked={draft.enabled} className="h-5 w-5 accent-emerald-500" onChange={e=>update({enabled:e.target.checked})} type="checkbox"/>Use my own</label></div>{draft.enabled&&<div className="mt-4 grid gap-4"><label className={labelClass}>Challenge format<select className={inputClass} value={draft.type} onChange={e=>update({type:e.target.value as ChallengeDraft['type'],answers:['','','']})}>{challengeTypes.map(type=><option key={type}>{type}</option>)}</select></label><label className={labelClass}>Question<input className={inputClass} maxLength={180} onChange={e=>update({question:e.target.value})} placeholder="Write a short, clear question" value={draft.question}/></label>{labels.map((label,index)=><label className={labelClass} key={label}>{label}<input className={inputClass} maxLength={80} onChange={e=>update({answers:draft.answers.map((answer,itemIndex)=>itemIndex===index?e.target.value:answer)})} placeholder={label} value={draft.answers[index]??''}/></label>)}<div className="rounded-xl bg-emerald-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-wide text-emerald-300">Participant preview</p><h4 className="mt-2 font-black">{draft.question||'Your question appears here'}</h4><div className="mt-3 grid gap-2">{labels.map((_,index)=><span className="rounded-lg border border-white/15 px-3 py-2 text-sm" key={index}>{draft.answers[index]||`Option ${index+1}`}</span>)}</div></div><p className="text-xs leading-5 text-slate-500">Structured text only. No links, uploads or requests for personal information. Participants can report a challenge.</p></div>}</div></div>
}

export function OrganizerSetupChoicePage() {
  const [params]=useSearchParams()
  const independent=params.get('mode')==='independent'
  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Organizer workspace</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Set up a Hunt</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Choose whether to set the Hunt now or ask the TedixHunt team for something new.</p>
        {independent&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Independent Hunt · unofficial activity</strong><p className="mt-1">Your email is confirmed. The route stays fixed and verified.</p></div>}
        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Hunt setup options">
          <article className="flex flex-col rounded-2xl border border-emerald-400 bg-white p-6 shadow-sm ring-2 ring-emerald-100"><span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">Recommended</span><h2 className="mt-4 text-2xl font-black">Set a Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Choose a theme and template, then configure the Hunt in one clear flow.</p><Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-5 font-black hover:bg-emerald-400" to={`/organizer/hunts/new/setup${independent?'?mode=independent':''}`}>Set the Hunt</Link></article>
          <article className={`flex flex-col rounded-2xl border p-6 shadow-sm ${independent?'border-slate-200 bg-slate-100 text-slate-500':'border-slate-200 bg-white'}`}><h2 className="text-2xl font-black">Ask for a custom Hunt</h2><p className="mt-3 flex-1 leading-6 text-slate-600">Request a Hunt when the available themes and templates do not meet your needs.</p>{independent?<div className="mt-6 rounded-xl border border-slate-300 bg-slate-200 p-3 text-center text-sm font-bold">Available to Registered Organizers<br/><Link className="mt-1 inline-block text-emerald-800 underline" to="/organizer/sign-in">Apply or sign in</Link></div>:<Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-black hover:border-emerald-500" to="/organizer/hunts/new/custom-request">Ask for a custom Hunt</Link>}</article>
        </section>
      </div>
    </main>
  )
}

export function QuickSetupPage() {
  const [params]=useSearchParams()
  const independent=params.get('mode')==='independent'
  const steps = ['Hunt details', 'Participants & access', 'Personal challenges', 'Create link & share']
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [template, setTemplate] = useState('Signal: Cluj Napoca')
  const [linkCreated, setLinkCreated] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')
  const [complete, setComplete] = useState(false)
  const [challenges,setChallenges]=useState(initialChallenges)
  const [settings, setSettings] = useState({ name: 'Signal: Cluj Napoca', date: '2026-09-12', time: '10:00', country:'Romania', county:'Cluj', location: 'Cluj Napoca', language:'English', format:'Team Hunters', duration: '90', contact: 'Ana Pop', participants: '24', teamSize: '4', access: 'Invitation-only' })
  const invitationLink = 'https://tedixhunt.app/join/SIGNAL26'
  const progress = Math.round((completed.size / steps.length) * 100)

  function saveStep() {
    if (active === 3 && !linkCreated) return
    const next = new Set([...completed, active])
    setCompleted(next)
    if (active < steps.length - 1) setActive(active + 1)
    else setComplete(true)
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(invitationLink)
    setLinkMessage('Link copied')
  }

  async function shareHunt() {
    const share = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share
    try {
      if (share) { await share.call(navigator, { title: `Join ${settings.name}`, url: invitationLink }); setLinkMessage('Share opened') }
      else await copyLink()
    } catch { setLinkMessage('Share cancelled') }
  }

  if (complete) return <SetupShell eyebrow="Quick Setup" title="Your hunt is ready" description="The selected template and local details have been saved for this prototype."><SuccessState title={`${settings.name} is ready`} detail="You can now find it in My Hunts and start it when the participants arrive." /></SetupShell>
  return (
    <SetupShell eyebrow="Recommended · Quick Setup" title="Launch a proven hunt" description="Choose a complete Competition Template and add only the details needed to run it locally.">
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="template-title">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Block 1</p><h2 className="mt-2 text-2xl font-black" id="template-title">Select Hunt Template</h2><p className="mt-1 text-sm text-slate-500">Choose a complete, tested Hunt. Its experience settings stay locked.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]"><div><label className={labelClass}>Competition template<select className={inputClass} value={template} onChange={event => { setTemplate(event.target.value); setSettings({...settings,name:event.target.value}) }}><option>Signal: Cluj Napoca</option><option>The City Code</option></select></label><p className="mt-3 text-sm leading-6 text-slate-500">The story, route, checkpoints, team challenges, scoring and results are locked to this approved template.</p><div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Creator-verified route</p><p className="mt-1 font-black">Cluj-Napoca centre · 7 fixed checkpoints</p></div><span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">Approved</span></div><div className="relative mt-4 h-40 overflow-hidden rounded-xl border border-emerald-200 bg-[#e7eee8]"><div className="absolute inset-0 opacity-60" style={{backgroundImage:'linear-gradient(25deg, transparent 47%, #b7c7bc 48%, #b7c7bc 51%, transparent 52%)',backgroundSize:'95px 65px'}}/>{[12,25,38,51,64,77,89].map((left,index)=><span className="absolute grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-black text-white shadow" key={left} style={{left:`${left}%`,top:`${index%2?55:28}%`}}>{index+1}</span>)}</div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Route</dt><dd className="font-bold">2.4 km · 35 min walk</dd></div><div><dt className="text-slate-500">Detection radius</dt><dd className="font-bold">30 metres</dd></div><div><dt className="text-slate-500">Safety review</dt><dd className="font-bold">28 Aug 2026</dd></div><div><dt className="text-slate-500">Creator</dt><dd className="font-bold">Tedix Design Team</dd></div></dl>{!independent&&<Link className="mt-4 inline-flex text-sm font-black text-emerald-800 underline" to="/organizer/hunts/new/guided">Need another route? Use Custom Setup</Link>}</div></div><aside className="rounded-xl bg-[#061812] p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">Template preview</p><h3 className="mt-3 text-xl font-black">{template}</h3><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-400">Difficulty</dt><dd className="font-bold">User set</dd></div><div><dt className="text-slate-400">Checkpoints</dt><dd className="font-bold">6 + Final</dd></div><div><dt className="text-slate-400">Format</dt><dd className="font-bold">Single or Team</dd></div><div><dt className="text-slate-400">Duration</dt><dd className="font-bold">90 min</dd></div></dl><p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300">Personal challenges · Team challenges when enabled · Progressive results</p></aside></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[['Story','Restore the Signal'],['Checkpoint order','Creator fixed'],['Scoring','Balanced · fixed'],['Results','Progressive leaderboard'],['Navigation','Verified map'],['Team challenges','Included for Team Hunters'],['Final mission','Restore the transmitter'],['Rewards',independent?'Registered only':'Recognition + partner rewards']].map(([label,value])=><div className="rounded-xl border border-slate-200 bg-slate-100 p-3" key={label}><span className="text-[10px] font-black uppercase tracking-wide text-slate-400">🔒 {label}</span><p className="mt-1 text-sm font-bold text-slate-600">{value}</p></div>)}</div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="quick-general-title">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Block 2</p><h2 className="mt-2 text-2xl font-black" id="quick-general-title">General Setup</h2><p className="mt-1 text-sm text-slate-500">Add only the local details needed to launch this Hunt.</p></div><div className="min-w-48"><div className="flex justify-between text-xs font-bold"><span>{completed.size} of {steps.length} complete</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500" style={{width:`${progress}%`}} /></div></div></div>
        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"><nav className="min-w-0 space-y-2" aria-label="Quick Setup sections">{steps.map((step,index)=><button className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-black ${active===index?'border-emerald-500 bg-emerald-50 text-emerald-900':'border-slate-200 bg-slate-50'}`} key={step} onClick={()=>setActive(index)} type="button"><span>{index+1}. {step}</span>{completed.has(index)&&<span className="text-emerald-600">✓</span>}</button>)}</nav>
          <article className="min-w-0 rounded-xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">General {active+1} of {steps.length}</p><h3 className="mt-2 text-xl font-black">{steps[active]}</h3><div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_240px]"><div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {active===0&&<><label className={`${labelClass} sm:col-span-2`}>Hunt name<input className={inputClass} value={settings.name} onChange={e=>setSettings({...settings,name:e.target.value})}/></label><label className={labelClass}>Country<select className={inputClass} value={settings.country} onChange={e=>setSettings({...settings,country:e.target.value})}><option>Romania</option><option>United Kingdom</option></select></label><label className={labelClass}>County / region<select className={inputClass} value={settings.county} onChange={e=>setSettings({...settings,county:e.target.value})}><option>Cluj</option><option>Bucharest</option></select></label><label className={labelClass}>City<select className={inputClass} value={settings.location} onChange={e=>setSettings({...settings,location:e.target.value})}><option>Cluj Napoca</option></select></label><label className={labelClass}>Language<select className={inputClass} value={settings.language} onChange={e=>setSettings({...settings,language:e.target.value})}><option>English</option><option>Romanian</option></select></label><label className={labelClass}>Hunt date<input className={inputClass} value={settings.date} onChange={e=>setSettings({...settings,date:e.target.value})} type="date"/></label><label className={labelClass}>Start time<input className={inputClass} value={settings.time} onChange={e=>setSettings({...settings,time:e.target.value})} type="time"/></label><div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-bold text-slate-500">Fixed duration</p><p className="mt-2 font-black">{settings.duration} minutes</p></div><label className={labelClass}>Local contact<input className={inputClass} value={settings.contact} onChange={e=>setSettings({...settings,contact:e.target.value})}/></label></>}
            {active===1&&<><label className={labelClass}>Hunt format<select className={inputClass} value={settings.format} onChange={e=>setSettings({...settings,format:e.target.value})}><option>Team Hunters</option><option>Single Hunters</option></select></label><label className={labelClass}>Participants<input className={inputClass} min="1" value={settings.participants} onChange={e=>setSettings({...settings,participants:e.target.value})} type="number"/></label><label className={labelClass}>Team size<input className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} disabled={settings.format==='Single Hunters'} min="2" value={settings.teamSize} onChange={e=>setSettings({...settings,teamSize:e.target.value})} type="number"/></label><label className={labelClass}>Hunt access<select className={inputClass} value={settings.access} onChange={e=>setSettings({...settings,access:e.target.value})}><option>Invitation-only</option><option>Open to everyone</option></select></label><div className={`sm:col-span-2 rounded-xl border p-4 ${settings.format==='Single Hunters'?'border-slate-200 bg-slate-100 text-slate-400':'border-emerald-200 bg-emerald-50 text-emerald-900'}`}><strong>Team challenges</strong><p className="mt-1 text-sm">{settings.format==='Single Hunters'?'Unavailable for Single Hunters. Personal challenges and individual results remain active.':'Included from the approved template.'}</p></div></>}
            {active===2&&<PersonalChallengeOverrides drafts={challenges} onChange={setChallenges}/>}
            {active===3&&<div className="sm:col-span-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Access</p><p className="mt-2 font-black">{settings.access}</p><p className="mt-1 text-sm text-slate-600">Create one link for participants.</p></div>{!linkCreated?<button className="mt-4 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-black" onClick={()=>setLinkCreated(true)} type="button">Create Hunt link</button>:<div className="mt-4 space-y-2"><input aria-label="Hunt invitation link" className="min-h-12 w-full rounded-xl border border-emerald-300 bg-white px-4 text-sm" readOnly value={invitationLink}/><div className="flex gap-2"><button className="min-h-12 flex-1 rounded-xl border border-emerald-400 bg-white px-4 font-black" onClick={copyLink} type="button">Copy link</button><button className="min-h-12 flex-1 rounded-xl bg-slate-950 px-4 font-black text-white" onClick={shareHunt} type="button">Share</button></div>{linkMessage&&<p className="text-sm font-bold text-emerald-700" role="status">✓ {linkMessage}</p>}</div>}</div>}
          </div><aside className="rounded-xl bg-[#061812] p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">Setup preview</p><h4 className="mt-3 font-black">{steps[active]}</h4><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-200">{active===0?`${settings.country} · ${settings.county}\n${settings.location} · ${settings.language}\n${settings.date} · ${settings.time}`:active===1?`${settings.participants} participants\n${settings.format}${settings.format==='Team Hunters'?` · Teams of ${settings.teamSize}`:''}\n${settings.access}`:active===2?`${challenges.filter(item=>item.enabled).length} of 7 custom personal challenges\nVerified route unchanged`:`${settings.name}\n${settings.date} · ${settings.time}\nJoin Hunt`}</p></aside></div><div className="mt-6 flex justify-between border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl border border-slate-300 px-5 font-black disabled:opacity-40" disabled={active===0} onClick={()=>setActive(active-1)} type="button">Previous</button><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black disabled:cursor-not-allowed disabled:bg-slate-300" disabled={active===3&&!linkCreated} onClick={saveStep} type="button">{active===3?'Create Hunt':'Save & continue'}</button></div></article>
        </div>
      </section>
    </SetupShell>
  )
}

export function GuidedSetupPage() {
  const [complete, setComplete] = useState(false)
  if (complete) return <SetupShell eyebrow="Guided Customization" title="Your customized hunt is ready" description="Every selected option came from an approved, compatible set."><SuccessState title="Your safe setup is complete" detail="The customized hunt is now available in My Hunts." /></SetupShell>
  return (
    <SetupShell eyebrow="Guided Customization" title="Shape an approved hunt" description="Choose from compatible options. TedixHunt keeps the structure safe and workable.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setComplete(true) }}>
        <label className={labelClass}>Difficulty<select className={inputClass}><option>Easy</option><option>Medium</option><option>Advanced</option></select></label>
        <label className={labelClass}>Story theme<select className={inputClass}><option>Restore the Signal</option><option>City Secrets</option></select></label>
        <label className={labelClass}>Challenge set<select className={inputClass}><option>Signal Relay · Set A</option><option>Signal Relay · Set B</option></select></label>
        <label className={labelClass}>Checkpoint order<select className={inputClass}><option>Recommended route</option><option>Short route</option></select></label>
        <label className={labelClass}>Scoring<select className={inputClass}><option>Balanced team score</option><option>Completion score only</option></select></label>
        <label className={labelClass}>Hints<select className={inputClass}><option>Two hints per challenge</option><option>One hint per challenge</option></select></label>
        <label className={`${labelClass} sm:col-span-2`}>Awards<select className={inputClass}><option>Signal Restorer achievement</option><option>City Explorer achievement</option></select></label>
        <button className="min-h-14 rounded-xl bg-emerald-500 px-5 font-black hover:bg-emerald-400 sm:col-span-2" type="submit">Create customized hunt</button>
      </form>
    </SetupShell>
  )
}

export function CustomRequestPage() {
  const [complete, setComplete] = useState(false)
  if (complete) return <SetupShell eyebrow="Custom Request" title="Request received" description="The request is now ready for Admin review and Creator assignment."><SuccessState title="We will keep you updated" detail="Status: Received. You can follow the request from My Hunts." /></SetupShell>
  return (
    <SetupShell eyebrow="Custom Request" title="Ask for a new hunt" description="Use this only when an approved template cannot meet your needs. Tell us what is different.">
      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" onSubmit={(event: FormEvent) => { event.preventDefault(); setComplete(true) }}>
        <label className={labelClass}>Preferred date<input className={inputClass} required type="date" /></label>
        <label className={labelClass}>Location<input className={inputClass} placeholder="City or venue" required /></label>
        <label className={labelClass}>Participants<input className={inputClass} min="4" placeholder="Expected number" required type="number" /></label>
        <label className={labelClass}>Local contact<input className={inputClass} placeholder="Name and phone or email" required /></label>
        <label className={`${labelClass} sm:col-span-2`}>What do you need?<textarea className={`${inputClass} min-h-32 py-3`} placeholder="Purpose, audience, special location, or content that makes this hunt different" required /></label>
        <button className="min-h-14 rounded-xl bg-emerald-500 px-5 font-black hover:bg-emerald-400 sm:col-span-2" type="submit">Send request</button>
      </form>
    </SetupShell>
  )
}
