import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'

type LiveStatus = 'Live' | 'Paused' | 'Completed'
type TeamState = 'On track' | 'Needs attention' | 'Help requested' | 'Finished'

type LiveTeam = {
  name: string
  members: number
  checkpoint: number
  progress: number
  score: number
  lastActivity: string
  state: TeamState
}

const initialTeams: LiveTeam[] = [
  { name: 'Night Shift', members: 4, checkpoint: 4, progress: 58, score: 1_460, lastActivity: 'Now', state: 'On track' },
  { name: 'Signal Seekers', members: 4, checkpoint: 3, progress: 43, score: 1_230, lastActivity: '2 min ago', state: 'Help requested' },
  { name: 'City Sparks', members: 4, checkpoint: 3, progress: 43, score: 1_180, lastActivity: '11 min ago', state: 'Needs attention' },
  { name: 'Code Breakers', members: 4, checkpoint: 5, progress: 72, score: 1_610, lastActivity: '1 min ago', state: 'On track' },
  { name: 'North Star', members: 4, checkpoint: 2, progress: 29, score: 940, lastActivity: '4 min ago', state: 'On track' },
  { name: 'Relay Crew', members: 4, checkpoint: 7, progress: 100, score: 1_920, lastActivity: 'Finished', state: 'Finished' },
]

const checkpointNames = ['Matthias Rex Statue', 'Stone Gate', 'Mirror Passage', 'Clock Tower', 'Signal Alley', 'City Wall', 'FinishPoint']

const stateStyle: Record<TeamState, string> = {
  'On track': 'bg-emerald-100 text-emerald-800',
  'Needs attention': 'bg-amber-100 text-amber-900',
  'Help requested': 'bg-red-100 text-red-800',
  Finished: 'bg-sky-100 text-sky-800',
}

export function OrganizerMonitorPage() {
  const { huntId } = useParams()
  const [searchParams] = useSearchParams()
  const independent = searchParams.get('mode') === 'independent'
  const [status, setStatus] = useState<LiveStatus>('Live')
  const [alertResolved, setAlertResolved] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(initialTeams[1])
  const [messageSent, setMessageSent] = useState(false)
  const completed = initialTeams.filter(team => team.state === 'Finished').length
  const attention = initialTeams.filter(team => team.state === 'Needs attention' || team.state === 'Help requested').length

  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-9">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer">← My Hunts</Link>

        <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{independent ? 'Independent Organizer' : 'Registered Organizer'}</p><span className={`rounded-full px-3 py-1 text-xs font-black ${status === 'Live' ? 'bg-emerald-500 text-white' : status === 'Paused' ? 'bg-violet-100 text-violet-800' : 'bg-slate-200 text-slate-700'}`}>{status}</span></div><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Monitor Hunt</h1><p className="mt-2 text-slate-600">Signal: Cluj Napoca · Today, 10:00 · 42 minutes elapsed</p><p className="mt-1 text-xs text-slate-400">Hunt ID: {huntId}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row"><button className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-black" onClick={()=>setMessageSent(true)} type="button">Message everyone</button><button className={`min-h-12 rounded-xl px-6 font-black ${status === 'Paused' ? 'bg-emerald-500' : 'bg-slate-950 text-white'}`} onClick={()=>setStatus(current=>current==='Live'?'Paused':'Live')} type="button">{status === 'Paused' ? 'Resume Hunt' : 'Pause Hunt'}</button></div>
          </div>
          {messageSent && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800" role="status">✓ Update sent to all active participants.</p>}
        </header>

        {!alertResolved && <section className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-sm" aria-labelledby="urgent-alert-title"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Urgent · Help request</p><h2 className="mt-2 text-xl font-black" id="urgent-alert-title">Signal Seekers · Checkpoint 3</h2><p className="mt-2 text-sm text-red-950">Mirror Passage · requested 2 minutes ago · last location available</p></div><div className="flex flex-col gap-2 sm:flex-row"><button className="min-h-11 rounded-xl border border-red-300 bg-white px-4 text-sm font-black text-red-800" type="button">Contact team</button><button className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-black text-white" onClick={()=>setAlertResolved(true)} type="button">Mark resolved</button></div></div></section>}
        {alertResolved && <section className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm"><strong className="text-emerald-900">No active safety alerts</strong><button className="font-black text-emerald-800" onClick={()=>setAlertResolved(false)} type="button">View prototype alert</button></section>}

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Live Hunt summary">
          {[['Active teams','5'],['Finished',`${completed} / ${initialTeams.length}`],['Needs attention',String(attention)],['Estimated finish','11:28']].map(([label,value],index)=><article className={`rounded-xl border p-4 ${index===2?'border-amber-200 bg-amber-50':'border-slate-200 bg-white'}`} key={label}><p className={`text-sm font-bold ${index===2?'text-amber-800':'text-slate-500'}`}>{label}</p><strong className="mt-1 block text-2xl">{value}</strong></article>)}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="route-title">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Verified live route</p><h2 className="mt-1 text-xl font-black" id="route-title">Teams across 7 checkpoints</h2></div><span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">30 m detection radius</span></div>
            <div className="relative mt-5 min-h-[360px] overflow-hidden rounded-xl border border-slate-300 bg-[#e7eee8] sm:min-h-[430px]" aria-label="Simulated live route map"><div className="absolute inset-0 opacity-70" style={{backgroundImage:'linear-gradient(25deg, transparent 47%, #b7c7bc 48%, #b7c7bc 51%, transparent 52%), linear-gradient(105deg, transparent 47%, #c7d2ca 48%, #c7d2ca 51%, transparent 52%)',backgroundSize:'120px 85px, 160px 110px'}}/><div className="absolute left-[10%] right-[10%] top-1/2 border-t-4 border-dashed border-emerald-700/40"/>{checkpointNames.map((name,index)=>{const left=10+(index*13.3);const teamCount=initialTeams.filter(team=>team.checkpoint===index+1).length;return <button className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center" key={name} onClick={()=>{const team=initialTeams.find(item=>item.checkpoint===index+1);if(team)setSelectedTeam(team)}} style={{left:`${left}%`}} type="button"><span className={`mx-auto grid h-10 w-10 place-items-center rounded-full border-2 border-white text-sm font-black text-white shadow ${teamCount?'bg-emerald-600':'bg-slate-500'}`}>{index+1}</span><small className="mt-2 hidden max-w-24 rounded bg-white/90 px-2 py-1 font-bold shadow sm:block">{name}</small>{teamCount>0&&<b className="mt-1 block rounded-full bg-slate-950 px-2 py-1 text-[10px] text-white">{teamCount} team{teamCount>1?'s':''}</b>}</button>})}</div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500"><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-emerald-600"/>Team present</span><span><i className="mr-1 inline-block h-3 w-3 rounded-full bg-slate-500"/>No team</span><span>Creator-verified checkpoints cannot be moved live</span></div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-amber-700">Needs attention</p><h2 className="mt-2 text-xl font-black">Act on exceptions</h2><div className="mt-4 space-y-2">{initialTeams.filter(team=>team.state==='Needs attention'||team.state==='Help requested').map(team=><button className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-amber-400" key={team.name} onClick={()=>setSelectedTeam(team)} type="button"><div className="flex items-center justify-between gap-2"><strong>{team.name}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-black ${stateStyle[team.state]}`}>{team.state}</span></div><p className="mt-1 text-xs text-slate-500">Checkpoint {team.checkpoint} · {team.lastActivity}</p></button>)}</div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="selected-team-title"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Selected team</p><h2 className="mt-2 text-xl font-black" id="selected-team-title">{selectedTeam.name}</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Progress</span><strong className="mt-1 block">{selectedTeam.progress}%</strong></div><div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Score</span><strong className="mt-1 block">{selectedTeam.score.toLocaleString()}</strong></div><div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Checkpoint</span><strong className="mt-1 block">{selectedTeam.checkpoint} of 7</strong></div><div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Members</span><strong className="mt-1 block">{selectedTeam.members} online</strong></div></div><p className="mt-4 text-xs text-slate-500">Private answers remain hidden during the Hunt.</p><button className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 text-sm font-black" type="button">Contact team</button></section>
          </aside>
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="teams-title"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Live progress</p><h2 className="mt-1 text-xl font-black" id="teams-title">All teams</h2></div><span className="text-sm text-slate-500">{initialTeams.length} teams</span></div><div className="mt-4 space-y-2">{initialTeams.map(team=><button className="grid w-full gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-400 sm:grid-cols-[1.2fr_1fr_100px_120px] sm:items-center" key={team.name} onClick={()=>setSelectedTeam(team)} type="button"><div><strong>{team.name}</strong><p className="mt-1 text-xs text-slate-500">{team.members} members · last activity {team.lastActivity}</p></div><div><div className="flex justify-between text-xs font-bold"><span>Checkpoint {team.checkpoint}</span><span>{team.progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><i className="block h-full bg-emerald-500" style={{width:`${team.progress}%`}}/></div></div><strong>{team.score.toLocaleString()} pts</strong><span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${stateStyle[team.state]}`}>{team.state}</span></button>)}</div></section>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer font-black">Live leaderboard</summary><p className="mt-2 text-sm text-slate-500">Current standings follow the Hunt’s Results Display setting.</p><ol className="mt-4 space-y-2">{[...initialTeams].sort((a,b)=>b.score-a.score).map((team,index)=><li className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm" key={team.name}><span><b className="mr-3">{index+1}</b>{team.name}</span><strong>{team.score.toLocaleString()}</strong></li>)}</ol>{independent&&<p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs font-bold text-slate-500">Rewards are unavailable for Independent Hunts.</p>}</details>
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer font-black">Activity history</summary><ol className="mt-4 space-y-3 text-sm">{['10:42 · Signal Seekers requested Organizer help','10:40 · Code Breakers unlocked Checkpoint 5','10:37 · City Sparks became inactive','10:31 · Relay Crew completed FinishPoint','10:00 · Hunt started'].map(event=><li className="border-l-2 border-emerald-300 pl-3" key={event}>{event}</li>)}</ol></details>
        </div>

        <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black">Hunt controls</h2><p className="mt-1 text-sm text-slate-500">Use ending controls only when the activity is finished or cannot continue safely.</p></div><button className="min-h-11 rounded-xl border border-red-300 bg-white px-5 text-sm font-black text-red-700" onClick={()=>setStatus('Completed')} type="button">End Hunt</button></section>
      </div>
    </main>
  )
}
