import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { leaderboardPhysicalInventory, specialPhysicalInventory } from '../data/rewardInventory'

const sidebarPreferenceKey = 'tedixhunt_admin_sidebar_collapsed'

const navigationGroups = [
  {label:'Dashboard',items:[{id:'dashboard',label:'Dashboard',path:'/admin',icon:'home'}]},
  {label:'Operations',items:[
    {id:'hunts',label:'Hunts',path:'/admin/hunts',icon:'map'},
    {id:'alerts',label:'Safety Alerts',path:'/admin/alerts',icon:'alert'},
  ]},
  {label:'Content',items:[
    {id:'templates',label:'Template Reviews',path:'/admin/templates',icon:'document'},
    {id:'rewards',label:'Reward Inventory',path:'/admin/rewards',icon:'gift'},
  ]},
  {label:'People',items:[
    {id:'organizer-applications',label:'Organizer Applications',path:'/admin/organizer-applications',icon:'document'},
    {id:'users',label:'Users & Roles',path:'/admin/users',icon:'users'},
  ]},
  {label:'System',items:[
    {id:'settings',label:'Platform Settings',path:'/admin/settings',icon:'settings'},
    {id:'audit',label:'Audit Log',path:'/admin/audit',icon:'list'},
  ]},
  {label:'Account',items:[{id:'account',label:'Account Security',path:'/admin/account',icon:'lock'}]},
]

function NavigationIcon({name}:{name:string}) {
  const paths:Record<string,ReactNode> = {
    home:<><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
    map:<><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    alert:<><path d="M12 3 2.5 20h19Z"/><path d="M12 9v4M12 17h.01"/></>,
    document:<><path d="M6 3h9l3 3v15H6Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
    gift:<><path d="M3 9h18v4H3ZM5 13v8h14v-8M12 9v12"/><path d="M12 9H8.5a2.5 2.5 0 1 1 2.5-2.5ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5Z"/></>,
    users:<><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3h4v.08a1.7 1.7 0 0 0 1 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H21v4h-.08a1.7 1.7 0 0 0-1.52 1Z"/></>,
    list:<><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  }
  return <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">{paths[name]}</svg>
}

export function AdminShell({active,children}:{active:string;children:ReactNode}) {
  const [collapsed,setCollapsed] = useState(() => {
    const saved = window.localStorage.getItem(sidebarPreferenceKey)
    return saved === null ? window.matchMedia('(max-width: 767px)').matches : saved === 'true'
  })
  useEffect(() => window.localStorage.setItem(sidebarPreferenceKey,String(collapsed)),[collapsed])
  return <main className="flex h-dvh flex-col overflow-hidden bg-slate-100 text-slate-950">
    <OrganizerHeader logoutTo="/admin/sign-in" showProfile/>
    <div className="flex min-h-0 flex-1">
      <aside className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${collapsed?'w-[68px]':'w-60'}`}>
        <nav aria-label="Admin sections" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
          {navigationGroups.map(group=><section className="mb-4" key={group.label} aria-label={group.label}>
            {!collapsed&&<h2 className="mb-1 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{group.label}</h2>}
            <div className="space-y-1">{group.items.map(item=>{
              const isActive=active===item.id
              return <Link aria-current={isActive?'page':undefined} aria-label={collapsed?item.label:undefined} title={collapsed?item.label:undefined} className={`relative flex min-h-11 items-center rounded-lg text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${collapsed?'justify-center px-2':'gap-3 px-3'} ${isActive?'bg-slate-950 text-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-emerald-400':'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`} key={item.id} to={item.path}><NavigationIcon name={item.icon}/>{!collapsed&&<span>{item.label}</span>}</Link>
            })}</div>
          </section>)}
        </nav>
        <div className="border-t border-slate-200 p-2"><button aria-expanded={!collapsed} aria-label={collapsed?'Expand admin sidebar':'Collapse admin sidebar'} title={collapsed?'Expand':'Collapse'} className={`flex min-h-11 w-full items-center rounded-lg text-sm font-black text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-500 ${collapsed?'justify-center':'gap-2 px-3'}`} onClick={()=>setCollapsed(value=>!value)} type="button"><span aria-hidden="true">{collapsed?'›':'‹'}</span>{!collapsed&&<span>Collapse</span>}<span className="sr-only">{collapsed?'Expand':'Collapse'} admin navigation</span></button></div>
      </aside>
      <div className="min-w-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 sm:py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Admin Console</p><h1 className="mt-2 text-4xl font-black tracking-tight">Platform administration</h1></div></div>{children}</div></div>
    </div>
  </main>
}

export function AdminDashboardPage() {
  return <AdminShell active="dashboard"><section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-amber-800">Next action</p><h2 className="mt-2 text-2xl font-black">Review Signal: Cluj Napoca</h2><p className="mt-2 text-sm text-amber-950">Submitted by Tedix Design Team · route safety included</p></div><Link className="flex min-h-12 items-center rounded-xl bg-slate-950 px-5 font-black text-white" to="/admin/reviews/template-1">Review next template</Link></div></section><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Templates waiting','1','Review'],['Changes requested','1','Creator action'],['Active safety alerts','1','Needs attention'],['Locked Hunts','0','No action']].map(([label,count,note],index)=><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className={`mt-2 text-3xl font-black ${index===2?'text-red-700':''}`}>{count}</p><p className="mt-1 text-xs font-bold text-slate-400">{note}</p></article>)}</section><section className="mt-5 grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-red-700">Safety alert</p><h2 className="mt-2 text-xl font-black">Team 4 · Checkpoint 3</h2><p className="mt-2 text-sm text-slate-600">Signal: Cluj Napoca · Panic Button · Organizer responding</p><Link className="mt-4 inline-flex text-sm font-black text-red-700 underline" to="/admin/alerts">View alert</Link></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Recent important action</p><h2 className="mt-2 text-xl font-black">Global detection radius updated</h2><p className="mt-2 text-sm text-slate-600">30 metres · Admin Maria · Today, 09:24</p><Link className="mt-4 inline-flex text-sm font-black text-slate-700 underline" to="/admin/audit">Open audit log</Link></article></section></AdminShell>
}

type InventoryAllocation = { pool:string; prize:string; units:number }
const prizeLots=['Mystery Tech Kit · Lot A','Explorer Pack · Lot B','City Challenge Set · Lot C','Partner Gift Pack · Lot D']

export function AdminRewardInventoryPage() {
  const [allocations,setAllocations]=useState<InventoryAllocation[]>([
    ...Object.entries(leaderboardPhysicalInventory).map(([pool,units],index)=>({pool,units,prize:prizeLots[index%prizeLots.length]})),
    {pool:'Team Special Awards',units:specialPhysicalInventory.Team,prize:'Team Discovery Pack · Lot S1'},
    {pool:'Personal Special Awards',units:specialPhysicalInventory.Personal,prize:'Individual Explorer Pack · Lot S2'},
  ])
  const update=(pool:string,change:Partial<InventoryAllocation>)=>setAllocations(current=>current.map(item=>item.pool===pool?{...item,...change}:item))
  return <AdminShell active="rewards"><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-black">Physical Reward Inventory</h2><p className="mt-2 max-w-2xl text-slate-600">Assign hidden prize lots and unit quantities to leaderboard places and Special Award pools.</p></div><span className="rounded-full bg-violet-100 px-3 py-2 text-xs font-black text-violet-800">Admin only · prize identities hidden elsewhere</span></div><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-black">Leaderboard allocation</h3><p className="mt-1 text-sm text-slate-500">The Organizer sees only required units, available units and availability status.</p><div className="mt-5 space-y-3">{allocations.slice(0,5).map(item=><article className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[120px_1fr_130px] sm:items-end" key={item.pool}><div><span className="text-xs font-black uppercase tracking-wide text-emerald-700">Leaderboard</span><h4 className="mt-1 text-lg font-black">{item.pool}</h4></div><label className="text-xs font-black">Hidden prize lot<select className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" value={item.prize} onChange={e=>update(item.pool,{prize:e.target.value})}>{prizeLots.map(lot=><option key={lot}>{lot}</option>)}</select></label><label className="text-xs font-black">Available units<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" min="0" type="number" value={item.units} onChange={e=>update(item.pool,{units:Number(e.target.value)})}/></label></article>)}</div></section><aside className="h-fit rounded-2xl border border-violet-200 bg-violet-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-violet-800">Secrecy rule</p><h3 className="mt-2 text-xl font-black text-violet-950">Prize details stay here</h3><p className="mt-3 text-sm leading-6 text-violet-900">Organizers and participants never see the product, image, brand or value before final results. They see only anonymous availability.</p></aside></div><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-black">Special Award pools</h3><p className="mt-1 text-sm text-slate-500">These units are separate from inventory reserved for leaderboard places.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{allocations.slice(5).map(item=><article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={item.pool}><h4 className="font-black">{item.pool}</h4><label className="mt-4 block text-xs font-black">Hidden prize lot<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" value={item.prize} onChange={e=>update(item.pool,{prize:e.target.value})}/></label><label className="mt-3 block text-xs font-black">Available units<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3" min="0" type="number" value={item.units} onChange={e=>update(item.pool,{units:Number(e.target.value)})}/></label></article>)}</div></section><div className="mt-5 flex justify-end"><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black" type="button">Save inventory allocation</button></div></AdminShell>
}

export function AdminTemplateReviewPage() {
  const reviewItems=['Template information','Challenges, answers and hints','Fixed checkpoint route','Route-safety checks','Participant preview','Complete Hunt test']
  const [checked,setChecked]=useState<Set<string>>(new Set())
  const [decision,setDecision]=useState<'approved'|'changes'|null>(null)
  const [notes,setNotes]=useState('')
  if(decision)return <AdminShell active="templates"><section className={`mt-6 rounded-2xl border p-7 ${decision==='approved'?'border-emerald-300 bg-emerald-50':'border-amber-300 bg-amber-50'}`} role="status"><div className={`grid h-12 w-12 place-items-center rounded-full text-2xl font-black text-white ${decision==='approved'?'bg-emerald-500':'bg-amber-500'}`}>✓</div><p className="mt-5 text-xs font-black uppercase tracking-wide">Decision recorded</p><h2 className="mt-2 text-3xl font-black">{decision==='approved'?'Template approved':'Changes requested'}</h2><p className="mt-3">{decision==='approved'?'Signal: Cluj Napoca is now available to Organizers in Quick Setup.':'The template is unlocked for the Creator with your review notes.'}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-slate-950 px-5 font-black text-white" to="/admin">Return to Dashboard</Link></section></AdminShell>
  return <AdminShell active="templates"><div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><Link className="text-sm font-bold text-slate-500" to="/admin">← Dashboard</Link><p className="mt-5 text-xs font-black uppercase tracking-wide text-amber-700">Awaiting review</p><h2 className="mt-2 text-3xl font-black">Signal: Cluj Napoca</h2><p className="mt-2 text-slate-600">Tedix Design Team · Mathematics · Ages 12–16 · Version 1.0</p></div><div className="flex gap-2"><button className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black" type="button">Edit template</button><button className="min-h-11 rounded-xl border border-red-300 bg-red-50 px-4 text-sm font-black text-red-800" type="button">Lock</button></div></div><section className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><div className="space-y-4"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-black">Template summary</h3><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Format</dt><dd className="mt-1 font-black">Team Hunt</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="mt-1 font-black">90 minutes</dd></div><div><dt className="text-slate-500">Checkpoints</dt><dd className="mt-1 font-black">6 + Final</dd></div></dl></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xl font-black">Fixed route and safety</h3><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Creator verified</span></div><div className="relative mt-4 h-64 overflow-hidden rounded-xl border border-slate-300 bg-[#e7eee8]"><div className="absolute inset-0 opacity-65" style={{backgroundImage:'linear-gradient(25deg, transparent 47%, #b7c7bc 48%, #b7c7bc 51%, transparent 52%)',backgroundSize:'100px 70px'}}/>{[10,23,36,49,62,75,88].map((left,index)=><span className="absolute grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-emerald-500 text-xs font-black text-white shadow" key={left} style={{left:`${left}%`,top:`${index%2?58:27}%`}}>{index+1}</span>)}</div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Route</dt><dd className="font-black">2.4 km</dd></div><div><dt className="text-slate-500">Radius</dt><dd className="font-black">30 m</dd></div><div><dt className="text-slate-500">Safety checks</dt><dd className="font-black">6 of 6</dd></div></dl></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-black">Content and participant flow</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{['Personal challenges · 6','Team challenges · 6','Hints and solutions · Complete','Results and rewards · Complete'].map(item=><div className="rounded-xl bg-slate-50 p-4 text-sm font-bold" key={item}>{item}</div>)}</div><button className="mt-4 min-h-12 w-full rounded-xl border border-slate-300 bg-white font-black" type="button">Preview complete participant journey</button></article></div><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xl font-black">Review checklist</h3><p className="mt-2 text-sm text-slate-500">Check every area before making a decision.</p><div className="mt-4 space-y-2">{reviewItems.map(item=><label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold" key={item}><input checked={checked.has(item)} className="h-5 w-5 accent-emerald-500" onChange={()=>{const next=new Set(checked);next.has(item)?next.delete(item):next.add(item);setChecked(next)}} type="checkbox"/>{item}</label>)}</div><label className="mt-4 block text-sm font-bold">Review notes<textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500" onChange={e=>setNotes(e.target.value)} placeholder="Required when requesting changes" value={notes}/></label><button className="mt-4 min-h-12 w-full rounded-xl bg-emerald-500 font-black disabled:cursor-not-allowed disabled:bg-slate-300" disabled={checked.size!==reviewItems.length} onClick={()=>setDecision('approved')} type="button">Approve template</button><button className="mt-2 min-h-12 w-full rounded-xl border border-amber-400 bg-amber-50 font-black text-amber-900 disabled:cursor-not-allowed disabled:opacity-40" disabled={!notes.trim()} onClick={()=>setDecision('changes')} type="button">Request changes</button><button className="mt-2 min-h-11 w-full text-sm font-black text-red-700" type="button">Reject template</button></aside></section></AdminShell>
}

const content:Record<string,{title:string;description:string;items:string[]}>= {
  templates:{title:'Template Reviews',description:'Approve Creator templates before they appear in Quick Setup.',items:['Signal: Cluj Napoca · Awaiting review','City Code · Changes requested','Historic Centre · Approved']},
  hunts:{title:'Hunts',description:'Organizer Hunts are approved by default. Intervene only when needed.',items:['Signal: Cluj Napoca · In progress','School Quest · Countdown','River Route · Paused']},
  alerts:{title:'Safety Alerts',description:'Organizers respond first. Admins monitor and handle escalations.',items:['Team 4 · Checkpoint 3 · Organizer responding','Signal lost · Resolved']},
  users:{title:'Users & Roles',description:'Manage professional roles and exceptional student support cases.',items:['Organizers · 18 active','Creators · 6 active','Partners · 12 active']},
  settings:{title:'Platform Settings',description:'Global rules only—not settings for individual Hunts.',items:['Scoring rules','Default detection radius · 30 m','Safety requirements','Notifications']},
  audit:{title:'Audit Log',description:'Every important administrative action is recorded.',items:['Template submitted · 10:32','Detection radius changed · 09:24','Safety alert resolved · Yesterday']},
}

export function AdminSectionPage({section}:{section:keyof typeof content}) { const data=content[section]; return <AdminShell active={section}><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-2xl font-black">{data.title}</h2><p className="mt-2 text-slate-600">{data.description}</p><div className="mt-5 divide-y divide-slate-100">{data.items.map((item,index)=><div className="flex min-h-16 items-center justify-between gap-4 py-3" key={item}><span className="font-bold">{item}</span>{section==='templates'&&index===0?<Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white" to="/admin/reviews/template-1">Review</Link>:<button className="text-sm font-black text-slate-500" type="button">View</button>}</div>)}</div></section></AdminShell> }
