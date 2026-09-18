import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { organizerFeatures, signalCheckpointNames, type OrganizerTemplate } from '../data/organizerTemplates'
import { leaderboardPhysicalInventory, specialPhysicalInventory, virtualRewardCategories } from '../data/rewardInventory'
import { OrganizerHeader } from './OrganizerFlow'
import { ApiError, huntsApi, organizationsApi, type Hunt, type Organization } from '../services/api'
import { capacityInput, huntDetailsInput, newHuntDefaults, settingsFromHunt, type GeneralSetupSettings } from './generalSetup'

const controlClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500'

const initialCheckpointPositions = [
  { id: 1, name: 'Matthias Rex Statue', x: 18, y: 70 },
  { id: 2, name: 'Stone Gate', x: 30, y: 48 },
  { id: 3, name: 'Clock Tower', x: 43, y: 62 },
  { id: 4, name: 'Fountain Court', x: 55, y: 35 },
  { id: 5, name: 'Lantern Lane', x: 67, y: 52 },
  { id: 6, name: 'North Passage', x: 78, y: 27 },
  { id: 7, name: 'City Wall · FinishPoint', x: 87, y: 42 },
]

function CheckpointMapEditor({ onVerifiedChange }: { onVerifiedChange: (count: number) => void }) {
  const [positions, setPositions] = useState(initialCheckpointPositions)
  const [selected, setSelected] = useState(1)
  const [verified, setVerified] = useState<Set<number>>(new Set())
  const checked = verified.size

  function toggleVerified(id: number) {
    const next = new Set(verified)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setVerified(next)
    onVerifiedChange(next.size)
  }

  function moveSelected(event: MouseEvent<HTMLDivElement>) {
    if (verified.has(selected)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(8, Math.min(92, ((event.clientY - bounds.top) / bounds.height) * 100))
    setPositions(current => current.map(point => point.id === selected ? {...point, x, y} : point))
  }

  return (
    <section className="mt-6 border-t border-slate-100 pt-6" aria-labelledby="checkpoint-map-title">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-black" id="checkpoint-map-title">Check every checkpoint on the map</h3><p className="mt-1 text-sm text-slate-500">Select a pin, click the map to fix its position, then verify it. Participants will be marked in range within 30 metres.</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${checked === 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{checked} of 7 verified</span></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <div aria-label="Checkpoint location map" className="relative min-h-[360px] cursor-crosshair overflow-hidden rounded-2xl border border-slate-300 bg-[#e7eee8]" onClick={moveSelected} role="application">
          <div className="absolute inset-0 opacity-70" style={{backgroundImage:'linear-gradient(22deg, transparent 46%, #b7c7bc 47%, #b7c7bc 50%, transparent 51%), linear-gradient(90deg, transparent 47%, #cad8ce 48%, #cad8ce 51%, transparent 52%)',backgroundSize:'150px 110px'}} />
          <div className="absolute left-[8%] top-[15%] h-[70%] w-[84%] rotate-[-5deg] rounded-[45%] border-[10px] border-sky-200/80" />
          <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-600 shadow">Map simulation · Click to move selected pin</div>
          {positions.map(point => <button aria-label={`Checkpoint ${point.id}: ${point.name}${verified.has(point.id) ? ', verified' : ''}`} className={`absolute grid h-10 w-10 -translate-x-1/2 -translate-y-full place-items-center rounded-full border-4 text-sm font-black shadow-lg transition ${verified.has(point.id) ? 'border-white bg-emerald-500 text-white' : selected === point.id ? 'border-emerald-200 bg-slate-950 text-white ring-4 ring-emerald-400/40' : 'border-white bg-amber-400 text-slate-950'}`} key={point.id} onClick={event => { event.stopPropagation(); setSelected(point.id) }} style={{left:`${point.x}%`,top:`${point.y}%`}} type="button">{verified.has(point.id) ? '✓' : point.id}</button>)}
        </div>
        <div className="space-y-2" aria-label="Checkpoint verification list">{positions.map(point => <div className={`rounded-xl border p-3 ${selected === point.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`} key={point.id}><button className="w-full text-left" onClick={() => setSelected(point.id)} type="button"><span className="text-xs font-black uppercase tracking-wide text-slate-400">Checkpoint {point.id}</span><strong className="mt-1 block text-sm">{point.name}</strong></button><button className={`mt-3 min-h-10 w-full rounded-lg text-xs font-black ${verified.has(point.id) ? 'border border-slate-300 bg-white text-slate-700' : 'bg-emerald-500 text-slate-950'}`} onClick={() => toggleVerified(point.id)} type="button">{verified.has(point.id) ? 'Fix position again' : 'Position is correct'}</button></div>)}</div>
      </div>
    </section>
  )
}

function StudentPreview({ featureId, name, example }: { featureId: string; name: string; example: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#061812] text-white shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em]"><span>TedixHunt</span><span className="text-emerald-300">Preview</span></div>
      <div className="p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">{featureId.replace('-', ' ')}</p><h3 className="mt-2 text-xl font-black">{name}</h3><p className="mt-3 text-sm leading-6 text-slate-200">{example}</p><div className="mt-5 rounded-lg bg-emerald-400 px-3 py-2 text-center text-xs font-black text-slate-950">Student view</div></div>
    </div>
  )
}

const generalSteps = ['Hunt details', 'Participants & access', 'Experience defaults', 'Mission template & story']
const templatesByTheme: Record<string,string[]> = {
  'Smart Theme (Signal)': ['Signal: Cluj Napoca'],
  'City Secrets Theme': ['Signal: Cluj Napoca'],
  'Ho Ho Theme (Christmas)': ['Signal: Cluj Napoca'],
  'Scary Theme (Halloween)': ['Signal: Cluj Napoca'],
}

function GeneralSetup({ independent, initialSettings, organizations, selectedOrganizationId, onOrganizationChange, onComplete, onFormatChange, onTeamSizeChange, onSave }: {
  independent: boolean; initialSettings: GeneralSetupSettings; organizations: Organization[]; selectedOrganizationId: string;
  onOrganizationChange: (id: string) => void; onComplete: () => void; onFormatChange: (format: string) => void;
  onTeamSizeChange: (size: number) => void; onSave: (section: number, settings: GeneralSetupSettings) => Promise<GeneralSetupSettings>;
}) {
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const savingRef = useRef(false)
  const progress = Math.round((completed.size / generalSteps.length) * 100)

  useEffect(() => { setSettings(initialSettings) }, [initialSettings])

  async function saveGeneral() {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    try {
      const synchronized = await onSave(active, settings)
      setSettings(synchronized)
      const next = new Set([...completed, active])
      setCompleted(next)
      if (active < generalSteps.length - 1) setActive(active + 1)
      if (next.size === generalSteps.length) { setCollapsed(true); onComplete() }
    } catch (error) {
      setSaveError(error instanceof Error && error.message ? error.message : 'We couldn\'t save this section. Please try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  if (collapsed) return (
    <section className="mt-7 rounded-2xl border border-emerald-300 bg-white p-5 shadow-sm" aria-labelledby="general-title">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">General Setup ✓</p><h2 className="mt-2 text-xl font-black" id="general-title">{settings.name}</h2><p className="mt-2 text-sm text-slate-600">{settings.date} · {settings.time} · {settings.location} · {settings.duration} minutes</p><p className="mt-1 text-sm text-slate-600">{settings.participants} participants · {settings.format === 'Team Hunters' ? `Teams of ${settings.teamSize}` : 'Single Hunters'} · {settings.access}</p></div>
        <button aria-label="Edit General Setup" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-700" onClick={() => setCollapsed(false)} title="Edit General Setup" type="button">✎</button>
      </div>
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Mission</p><p className="mt-2 font-black">{settings.theme}</p><p className="mt-1 text-sm text-emerald-950">{settings.mission}</p></div>
    </section>
  )

  const setupPreview = active === 0 ? `${settings.country} · ${settings.county}\n${settings.location} · ${settings.language}\n${settings.date} · ${settings.time}` : active === 1 ? `${settings.participants} participants\n${settings.format === 'Team Hunters' ? `Teams of ${settings.teamSize}` : 'Single Hunters'} · ${settings.access}` : active === 2 ? `${settings.difficulty}\n${settings.checkpointOrder}` : `${settings.theme}\n${settings.mission}`

  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="general-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Block 1</p><h2 className="mt-2 text-2xl font-black" id="general-title">General Setup</h2><p className="mt-1 text-sm text-slate-500">Define the event before building its participant experience.</p></div>
        <div className="min-w-48"><div className="flex justify-between text-xs font-bold"><span>{completed.size} of 4 complete</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div></div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-2" aria-label="General Setup sections">{generalSteps.map((step, index) => <button className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-black ${active === index ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50'}`} key={step} onClick={() => { setActive(index); setSaveError('') }} type="button"><span>{index + 1}. {step}</span>{completed.has(index) && <span className="text-emerald-600">✓</span>}</button>)}</nav>
        <article className="rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">General {active + 1} of 4</p><h3 className="mt-2 text-xl font-black">{generalSteps[active]}</h3>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_240px]"><div className="grid gap-4 sm:grid-cols-2">
            {active === 0 && <>{!independent && organizations.length > 1 && <label className="text-sm font-bold sm:col-span-2">Organization<select className={controlClass} value={selectedOrganizationId} onChange={event => onOrganizationChange(event.target.value)}>{organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>}<label className="text-sm font-bold sm:col-span-2">Hunt name<input className={controlClass} value={settings.name} onChange={e => setSettings({...settings,name:e.target.value})} /></label>{[['country','Country',['Romania','United Kingdom']],['county','County / region',['Cluj','Bucharest']],['location','City',['Cluj Napoca']],['language','Language',['English','Romanian']]].map(([key,label,options])=><label className="text-sm font-bold" key={key as string}>{label as string}<select className={controlClass} value={settings[key as keyof typeof settings]} onChange={e=>setSettings({...settings,[key as string]:e.target.value})}>{(options as string[]).map(option=><option key={option}>{option}</option>)}{settings[key as keyof typeof settings] && !(options as string[]).includes(settings[key as keyof typeof settings]) && <option>{settings[key as keyof typeof settings]}</option>}</select></label>)}<label className="text-sm font-bold">Hunt date<input className={controlClass} value={settings.date} onChange={e => setSettings({...settings,date:e.target.value})} type="date" /></label><label className="text-sm font-bold">Start time<input className={controlClass} value={settings.time} onChange={e => setSettings({...settings,time:e.target.value})} type="time" /></label><label className="text-sm font-bold">Duration (minutes)<input className={controlClass} value={settings.duration} onChange={e => setSettings({...settings,duration:e.target.value})} min="1" type="number" /></label><label className="text-sm font-bold">Local contact<input className={controlClass} value={settings.contact} onChange={e => setSettings({...settings,contact:e.target.value})} /></label></>}
            {active === 1 && <><label className="text-sm font-bold">Hunt format<select className={controlClass} value={settings.format} onChange={e=>{setSettings({...settings,format:e.target.value});onFormatChange(e.target.value)}}><option>Team Hunters</option><option>Single Hunters</option></select></label><label className="text-sm font-bold">Participants<input className={controlClass} value={settings.participants} onChange={e => setSettings({...settings,participants:e.target.value})} min="1" type="number" /></label><label className="text-sm font-bold">Team size<input className={`${controlClass} disabled:bg-slate-100 disabled:text-slate-400`} disabled={settings.format==='Single Hunters'} value={settings.teamSize} onChange={e => {setSettings({...settings,teamSize:e.target.value});onTeamSizeChange(Math.max(1,Number(e.target.value)||1))}} min="2" type="number" /></label><label className="text-sm font-bold">Hunt access<select className={controlClass} value={settings.access} onChange={e => setSettings({...settings,access:e.target.value})}><option>Invitation-only</option><option>Open to everyone</option></select></label><div className={`sm:col-span-2 rounded-xl p-4 ${settings.format==='Single Hunters'?'bg-slate-100 text-slate-400':'bg-emerald-50 text-emerald-900'}`}><strong>Team challenges</strong><p className="mt-1 text-sm">{settings.format==='Single Hunters'?'Disabled for Single Hunters.':'Enabled for Team Hunters.'}</p></div></>}
            {active === 2 && <>{[['difficulty','Difficulty',['Easy','Medium','Advanced','User set']],['checkpointOrder','Checkpoint order',['Recommended route','Short route']]].map(([key, label, options]) => <label className="text-sm font-bold" key={key as string}>{label as string}<select className={`${controlClass} disabled:bg-slate-100 disabled:text-slate-500`} disabled={independent&&key==='checkpointOrder'} value={settings[key as keyof typeof settings]} onChange={e => setSettings({...settings,[key as string]:e.target.value})}>{(options as string[]).map(option => <option key={option}>{option}</option>)}</select>{independent&&key==='checkpointOrder'&&<span className="mt-2 block text-xs font-normal text-slate-500">Fixed by the Creator-verified route.</span>}</label>)}</>}
            {active === 3 && <><label className="text-sm font-bold">Hunt theme<select className={controlClass} value={settings.theme} onChange={e=>{const theme=e.target.value;const mission=templatesByTheme[theme][0];setSettings({...settings,theme,mission,name:mission})}}>{Object.keys(templatesByTheme).map(theme=><option key={theme}>{theme}</option>)}</select></label><label className="text-sm font-bold">Hunt template<select className={controlClass} value={settings.mission} onChange={e=>setSettings({...settings,mission:e.target.value,name:e.target.value})}>{templatesByTheme[settings.theme].map(mission=><option key={mission}>{mission}</option>)}</select></label><div className="sm:col-span-2 rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Template includes</p><p className="mt-2 text-sm text-slate-700">Approved challenges, checkpoint navigation and the final mission.</p><div className="mt-4 border-t border-slate-200 pt-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Hunt mission</p><p className="mt-2 text-sm font-bold text-slate-800">Restore six linked relay points, trace the signal to its source and restart the final transmitter together.</p></div></div></>}
          </div><aside className="rounded-xl bg-[#061812] p-4 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">Setup preview</p><h4 className="mt-3 font-black">{generalSteps[active]}</h4><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-200">{setupPreview}</p></aside></div>
          {saveError && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{saveError}</p>}
          <div className="mt-6 flex justify-between border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl border border-slate-300 px-5 font-black disabled:opacity-40" disabled={active === 0 || saving} onClick={() => setActive(active - 1)} type="button">Previous</button><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black disabled:cursor-wait disabled:opacity-60" disabled={saving} onClick={() => void saveGeneral()} type="button">{saving ? 'Saving…' : active === 3 ? 'Complete General Setup' : 'Save & continue'}</button></div>
        </article>
      </div>
    </section>
  )
}

const huntFeatures = organizerFeatures.filter((item) => item.id !== 'story')
type CustomChallenge = { format: 'Single choice'|'Multiple choice'|'True / False'|'Match the pairs'; question: string; answers: string[] }
const emptyCustomChallenge: CustomChallenge = { format: 'Single choice', question: 'Which answer restores the relay?', answers: ['Option A', 'Option B', 'Option C'] }

function CustomChallengeEditor({ value, onChange }: { value: CustomChallenge; onChange: (next: CustomChallenge) => void }) {
  const answerCount = value.format === 'True / False' ? 2 : value.format === 'Match the pairs' ? 6 : 3
  const labels = value.format === 'Match the pairs' ? ['Pair 1 · left','Pair 1 · right','Pair 2 · left','Pair 2 · right','Pair 3 · left','Pair 3 · right'] : value.format === 'True / False' ? ['True label','False label'] : ['Answer 1','Answer 2','Answer 3']
  const answers = [...value.answers, ...Array(answerCount).fill('')].slice(0, answerCount)
  return <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <label className="text-sm font-bold">Challenge format<select className={controlClass} value={value.format} onChange={e=>{const format=e.target.value as CustomChallenge['format'];onChange({format,question:value.question,answers:format==='True / False'?['True','False']:format==='Match the pairs'?['Clue A','Match A','Clue B','Match B','Clue C','Match C']:['Option A','Option B','Option C']})}}><option>Single choice</option><option>Multiple choice</option><option>True / False</option><option>Match the pairs</option></select></label>
    <label className="mt-4 block text-sm font-bold">Question or instruction<input className={controlClass} value={value.question} onChange={e=>onChange({...value,question:e.target.value})}/></label>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{answers.map((answer,index)=><label className="text-xs font-bold text-slate-600" key={labels[index]}>{labels[index]}<input className={controlClass} value={answer} onChange={e=>{const next=[...answers];next[index]=e.target.value;onChange({...value,answers:next})}}/></label>)}</div>
  </div>
}

type RewardProvider = 'Tedix inventory'|'Organizer'
type RewardKind = 'Physical'|'Virtual'
type RewardDraft = { id:number; place:string; provider:RewardProvider; kind:RewardKind; category:string; name:string; description:string; quantity:string; saved:boolean }
type SpecialAwardDefinition = { id:string; scope:'Team'|'Personal'; name:string; rule:string; description:string; eligibility:string }
type SpecialAwardDraft = RewardDraft & { definitionId:string }

const specialAwardDefinitions: SpecialAwardDefinition[] = [
  { id:'team-precision', scope:'Team', name:'Team Precision', rule:'Highest correct team answers ÷ submitted team answers.', description:'Recognizes accurate collective decisions across the Hunt.', eligibility:'Complete at least 70% of team challenges.' },
  { id:'everyone-contributed', scope:'Team', name:'Everyone Contributed', rule:'Highest percentage of team stages where every active member contributed.', description:'Recognizes balanced participation, not one dominant player.', eligibility:'At least three completed team stages.' },
  { id:'strong-comeback', scope:'Team', name:'Strong Comeback', rule:'Most challenges solved after an incorrect attempt without revealing the solution.', description:'Recognizes constructive recovery when the first approach fails.', eligibility:'Complete the Hunt without abandoning a team stage.' },
  { id:'consistent-team', scope:'Team', name:'Consistent Team', rule:'Highest percentage of checkpoints with no skipped personal or team contribution.', description:'Recognizes reliable participation throughout the whole Hunt.', eligibility:'Complete at least 70% of checkpoints.' },
  { id:'personal-precision', scope:'Personal', name:'Personal Precision', rule:'Highest correct first attempts ÷ personal challenges attempted.', description:'Recognizes careful and accurate individual problem solving.', eligibility:'Complete at least 70% of assigned personal challenges.' },
  { id:'persistent-solver', scope:'Personal', name:'Persistent Solver', rule:'Most personal challenges solved after a wrong attempt without revealing the solution.', description:'Recognizes persistence and learning from an unsuccessful attempt.', eligibility:'Complete at least three personal challenges.' },
  { id:'smart-help', scope:'Personal', name:'Smart Help Use', rule:'Most challenges solved after a hint without revealing the solution.', description:'Recognizes effective use of help while preserving ownership of the answer.', eligibility:'At least one hint-assisted correct solution.' },
  { id:'reliable-contributor', scope:'Personal', name:'Reliable Contributor', rule:'Highest percentage of assigned challenges completed and contributions submitted.', description:'Recognizes dependable participation at every team stage.', eligibility:'Complete at least 70% of assigned personal challenges.' },
]

const newReward = (id:number):RewardDraft => ({id,place:'1st place',provider:'Tedix inventory',kind:'Physical',category:virtualRewardCategories[0],name:'',description:'',quantity:'1',saved:false})
const ordinal = (value:number) => `${value}${value%10===1&&value%100!==11?'st':value%10===2&&value%100!==12?'nd':value%10===3&&value%100!==13?'rd':'th'} place`

function RewardFields({ reward, onChange, teamSize, scope='Team', inventoryAvailable }: { reward:RewardDraft; onChange:(next:RewardDraft)=>void; teamSize:number; scope?:'Team'|'Personal'; inventoryAvailable?:number }) {
  const requiredUnits=scope==='Team'?teamSize:1
  const availableUnits=inventoryAvailable??(scope==='Team'?(leaderboardPhysicalInventory[reward.place]??0):specialPhysicalInventory.Personal)
  const insufficient=reward.provider==='Tedix inventory'&&reward.kind==='Physical'&&availableUnits<requiredUnits
  return <div className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-bold">Provided by<select className={controlClass} value={reward.provider} onChange={e=>onChange({...reward,provider:e.target.value as RewardProvider})}><option>Tedix inventory</option><option>Organizer</option></select></label>
    <label className="text-sm font-bold">Reward type<select className={controlClass} value={reward.kind} onChange={e=>onChange({...reward,kind:e.target.value as RewardKind})}><option>Physical</option><option>Virtual</option></select></label>
    {reward.provider==='Tedix inventory'&&reward.kind==='Physical'&&<div className={`sm:col-span-2 rounded-xl border p-4 ${insufficient?'border-rose-300 bg-rose-50 text-rose-950':'border-violet-200 bg-violet-50 text-violet-950'}`}><p className="text-xs font-black uppercase tracking-wide">Tedix Mystery Physical Reward</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><div><span className="block text-xs opacity-70">Team size</span><strong>{scope==='Team'?teamSize:'—'}</strong></div><div><span className="block text-xs opacity-70">Required</span><strong>{requiredUnits}</strong></div><div><span className="block text-xs opacity-70">Available</span><strong>{availableUnits}</strong></div></div><p className="mt-3 text-sm font-black">{insufficient?'Insufficient prizes for this allocation.':'Available for this allocation.'}</p><p className="mt-2 text-sm leading-6">The exact prize, image, brand and value stay hidden from the Organizer and participants until final results.</p></div>}
    {reward.provider==='Tedix inventory'&&reward.kind==='Virtual'&&<label className="text-sm font-bold sm:col-span-2">Virtual reward category<select className={controlClass} value={reward.category} onChange={e=>onChange({...reward,category:e.target.value})}>{virtualRewardCategories.map(category=><option key={category}>{category}</option>)}</select><span className="mt-2 block text-xs font-normal text-slate-500">Five approved categories are available and visible to the Organizer.</span></label>}
    {reward.provider==='Organizer'&&<><label className="text-sm font-bold">Reward name<input className={controlClass} placeholder="Name the reward" value={reward.name} onChange={e=>onChange({...reward,name:e.target.value})}/></label><label className="text-sm font-bold">Quantity<input className={controlClass} min="1" type="number" value={reward.quantity} onChange={e=>onChange({...reward,quantity:e.target.value})}/></label><label className="text-sm font-bold sm:col-span-2">Short description<input className={controlClass} placeholder="What the winner receives" value={reward.description} onChange={e=>onChange({...reward,description:e.target.value})}/><span className="mt-2 block text-xs font-normal text-slate-500">The Organizer is responsible for supplying this reward.</span></label></>}
  </div>
}

function RewardsEditor({teamSize}:{teamSize:number}) {
  const [rewards,setRewards]=useState<RewardDraft[]>([])
  const [specialAwards,setSpecialAwards]=useState<SpecialAwardDraft[]>([])
  const nextId=()=>Date.now()+Math.floor(Math.random()*1000)
  const updateReward=(id:number,next:RewardDraft)=>setRewards(current=>current.map(item=>item.id===id?next:item))
  const updateSpecial=(id:number,next:SpecialAwardDraft)=>setSpecialAwards(current=>current.map(item=>item.id===id?next:item))
  const rewardEditorOpen=rewards.some(item=>!item.saved)
  const specialEditorOpen=specialAwards.some(item=>!item.saved)
  const insufficientLeaderboard=(reward:RewardDraft)=>reward.provider==='Tedix inventory'&&reward.kind==='Physical'&&(leaderboardPhysicalInventory[reward.place]??0)<teamSize
  return <div className="mt-5 space-y-6">
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-black">Leaderboard Rewards</h3><p className="mt-1 text-sm text-slate-500">Add as many allocations as needed. Saved rewards stay compact.</p></div><button className="min-h-11 rounded-xl bg-emerald-500 px-4 text-sm font-black disabled:bg-slate-300" disabled={rewardEditorOpen} onClick={()=>setRewards([...rewards,newReward(nextId())])} type="button">+ Add reward</button></div>
      {rewards.length===0?<div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No leaderboard rewards allocated yet.</div>:<div className="mt-5 space-y-3">{[...rewards].sort((a,b)=>parseInt(a.place)-parseInt(b.place)).map((reward,index)=>reward.saved?<article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4" key={reward.id}><div><span className="text-xs font-black uppercase tracking-wide text-emerald-700">{reward.place}</span><h4 className="mt-1 font-black">{reward.provider==='Tedix inventory'&&reward.kind==='Physical'?'Tedix Mystery Physical Reward':reward.provider==='Tedix inventory'?reward.category:reward.name||'Organizer-provided reward'}</h4><p className="mt-1 text-xs text-slate-500">{reward.provider} · {reward.kind}{reward.kind==='Physical'?' · hidden until final results':''}</p></div><div className="flex gap-3"><button className="text-sm font-black text-emerald-800" disabled={rewardEditorOpen} onClick={()=>updateReward(reward.id,{...reward,saved:false})} type="button">Edit</button><button className="text-sm font-black text-rose-700" onClick={()=>setRewards(rewards.filter(item=>item.id!==reward.id))} type="button">Remove</button></div></article>:<article className="rounded-xl border-2 border-emerald-300 bg-slate-50 p-4" key={reward.id}><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wide text-emerald-700">{reward.saved?'Saved allocation':`Reward allocation ${index+1}`}</span><button className="text-xs font-black text-slate-500" onClick={()=>setRewards(rewards.filter(item=>item.id!==reward.id))} type="button">Cancel</button></div><label className="mt-4 block text-sm font-bold">Select place<select className={controlClass} value={reward.place} onChange={e=>updateReward(reward.id,{...reward,place:e.target.value,saved:false})}>{Array.from({length:50},(_,place)=><option key={place}>{ordinal(place+1)}</option>)}</select></label><RewardFields reward={reward} teamSize={teamSize} onChange={next=>updateReward(reward.id,{...next,saved:false})}/><button className="mt-4 min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-black text-emerald-800 disabled:border-slate-300 disabled:text-slate-400" disabled={insufficientLeaderboard(reward)} onClick={()=>updateReward(reward.id,{...reward,saved:true})} type="button">{insufficientLeaderboard(reward)?'Insufficient prizes':'Save allocation'}</button></article>)}</div>}
      {rewards.length>0&&!rewardEditorOpen&&<div className="mt-4 flex justify-end"><button className="min-h-11 rounded-xl bg-emerald-500 px-4 text-sm font-black" onClick={()=>setRewards([...rewards,newReward(nextId())])} type="button">+ Add reward</button></div>}
    </section>
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-black">Special Awards</h3><p className="mt-1 text-sm text-slate-500">Choose a predefined metric. Rules cannot be edited by the Organizer.</p></div><button className="min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-black text-emerald-800 disabled:opacity-40" disabled={specialAwards.length===specialAwardDefinitions.length||specialEditorOpen} onClick={()=>{const available=specialAwardDefinitions.find(definition=>!specialAwards.some(award=>award.definitionId===definition.id));if(available){const base=newReward(nextId());setSpecialAwards([...specialAwards,{...base,definitionId:available.id}])}}} type="button">+ Add special award</button></div>
      <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Physical-prize eligibility</strong><p>Physical prizes go to the highest-ranked eligible team or participant who has not already received one. Virtual rewards do not affect eligibility.</p></div>
      {specialAwards.length===0?<div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No special awards selected.</div>:<div className="mt-5 space-y-3">{specialAwards.map((award,index)=>{const definition=specialAwardDefinitions.find(item=>item.id===award.definitionId)??specialAwardDefinitions[0];return award.saved?<article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4" key={award.id}><div><span className="text-xs font-black uppercase tracking-wide text-emerald-700">{definition.scope} Special Award</span><h4 className="mt-1 font-black">{definition.name}</h4><p className="mt-1 max-w-xl text-xs text-slate-500">{definition.rule}</p></div><div className="flex gap-3"><button className="text-sm font-black text-emerald-800" disabled={specialEditorOpen} onClick={()=>updateSpecial(award.id,{...award,saved:false})} type="button">Edit</button><button className="text-sm font-black text-rose-700" onClick={()=>setSpecialAwards(specialAwards.filter(item=>item.id!==award.id))} type="button">Remove</button></div></article>:<article className="rounded-xl border-2 border-emerald-300 bg-slate-50 p-4" key={award.id}><div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wide text-emerald-700">{definition.scope} award {index+1}</span><button className="text-xs font-black text-slate-500" onClick={()=>setSpecialAwards(specialAwards.filter(item=>item.id!==award.id))} type="button">Cancel</button></div><label className="mt-4 block text-sm font-bold">Predefined award<select className={controlClass} value={award.definitionId} onChange={e=>updateSpecial(award.id,{...award,definitionId:e.target.value,saved:false})}>{specialAwardDefinitions.map(item=><option disabled={specialAwards.some(existing=>existing.id!==award.id&&existing.definitionId===item.id)} key={item.id} value={item.id}>{item.scope} · {item.name}</option>)}</select></label><div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Winning rule · read only</p><p className="mt-2 font-black">{definition.rule}</p><p className="mt-2 text-sm leading-6 text-slate-600">{definition.description}</p><p className="mt-3 text-xs font-bold text-slate-500">Eligibility: {definition.eligibility}</p></div><RewardFields inventoryAvailable={specialPhysicalInventory[definition.scope]} reward={award} scope={definition.scope} teamSize={teamSize} onChange={next=>updateSpecial(award.id,{...award,...next,saved:false})}/><button className="mt-4 min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-black text-emerald-800" onClick={()=>updateSpecial(award.id,{...award,saved:true})} type="button">Save special award</button></article>})}</div>}
      {specialAwards.length>0&&!specialEditorOpen&&specialAwards.length<specialAwardDefinitions.length&&<div className="mt-4 flex justify-end"><button className="min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-black text-emerald-800" onClick={()=>{const available=specialAwardDefinitions.find(definition=>!specialAwards.some(award=>award.definitionId===definition.id));if(available){const base=newReward(nextId());setSpecialAwards([...specialAwards,{...base,definitionId:available.id}])}}} type="button">+ Add special award</button></div>}
    </section>
  </div>
}

export function CustomHuntEditorPage() {
  const [searchParams] = useSearchParams()
  const { huntId } = useParams()
  const navigate = useNavigate()
  const independent = searchParams.get('mode') === 'independent'
  const [persistedHunt, setPersistedHunt] = useState<Hunt | null>(null)
  const [initialSettings, setInitialSettings] = useState(newHuntDefaults)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('')
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(!huntId && !independent)
  const [organizationLoadFailed, setOrganizationLoadFailed] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(huntId))
  const [loadError, setLoadError] = useState('')
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [reviewing, setReviewing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')
  const [generalComplete, setGeneralComplete] = useState(false)
  const [verifiedPositionCount, setVerifiedPositionCount] = useState(0)
  const [huntFormat,setHuntFormat]=useState('Team Hunters')
  const [teamSize,setTeamSize]=useState(4)
  const [checkpoint, setCheckpoint] = useState(0)
  const [challengeSources, setChallengeSources] = useState<Record<number,'template'|'own'>>({})
  const [checkpointSelections, setCheckpointSelections] = useState<Record<string,Record<number,number>>>({})
  const [customChallenges, setCustomChallenges] = useState<Record<number,CustomChallenge>>({})
  const positionsVerified = verifiedPositionCount === initialCheckpointPositions.length
  const requiredFeatures = huntFeatures.filter((item) => !(huntFormat === 'Single Hunters' && item.id === 'team') && !(independent && item.id === 'rewards'))
  const feature = huntFeatures[active]
  const checkpointFeature = ['personal','team','navigation'].includes(feature.id)
  const defaultIndex = checkpointFeature ? Math.min(checkpoint, feature.templates.length - 1) : 0
  const chosenIndex = checkpointSelections[feature.id]?.[checkpoint] ?? selected[feature.id] ?? defaultIndex
  const customChallenge = customChallenges[checkpoint] ?? emptyCustomChallenge
  const customPreview: OrganizerTemplate = { name: customChallenge.format, note: customChallenge.question, example: customChallenge.answers.join(customChallenge.format === 'Match the pairs' ? ' ↔ ' : ' · ') }
  const template = feature.id === 'personal' && (challengeSources[checkpoint]??'template') === 'own' ? customPreview : feature.templates[chosenIndex]
  const completedRequired = requiredFeatures.filter((item) => completed.has(item.id)).length
  const progress = Math.round((completedRequired / requiredFeatures.length) * 100)
  const allComplete = completedRequired === requiredFeatures.length
  const checkpoints = useMemo(() => ['1', '2', '3', '4', '5', '6', 'F'], [])
  const featureDisabled = (id:string) => (id === 'team' && huntFormat === 'Single Hunters') || (id === 'rewards' && independent)

  const loadDraft = useCallback(async () => {
    if (!huntId) return
    setIsLoadingDraft(true)
    setLoadError('')
    try {
      const loaded = await huntsApi.getHunt(huntId)
      setPersistedHunt(loaded)
      setInitialSettings(settingsFromHunt(loaded))
    } catch {
      setLoadError('We couldn\'t load this Hunt draft. Please try again.')
    } finally {
      setIsLoadingDraft(false)
    }
  }, [huntId])

  useEffect(() => { void loadDraft() }, [loadDraft])
  useEffect(() => {
    if (huntId || independent) return
    let active = true
    setIsLoadingOrganizations(true)
    setOrganizationLoadFailed(false)
    organizationsApi.listAccessible().then((items) => {
      if (!active) return
      setOrganizations(items)
      setSelectedOrganizationId(items[0]?.id ?? '')
    }).catch(() => { if (active) { setOrganizations([]); setOrganizationLoadFailed(true) } })
      .finally(() => { if (active) setIsLoadingOrganizations(false) })
    return () => { active = false }
  }, [huntId, independent])

  async function saveGeneralSection(section: number, settings: GeneralSetupSettings): Promise<GeneralSetupSettings> {
    if (independent) return settings
    try {
      let current = persistedHunt
      if (section === 0) {
        const details = huntDetailsInput(settings)
        if (!details.name) throw new Error('Enter a Hunt name before saving.')
        if (!current) {
          if (isLoadingOrganizations) throw new Error('Your organizations are still loading. Please try again in a moment.')
          if (organizationLoadFailed) throw new Error('We couldn\'t load your organizations. Please refresh and try again.')
          if (!selectedOrganizationId) throw new Error('No accessible organization is available for this Hunt.')
          current = await huntsApi.createDraft({ organizationId: selectedOrganizationId, name: details.name })
          setPersistedHunt(current)
        }
        const updated = await huntsApi.updateDraft(current.id, details)
        setPersistedHunt(updated)
        const synchronized = settingsFromHunt(updated, settings)
        setInitialSettings(synchronized)
        if (!huntId) navigate(`/organizer/hunts/${updated.id}/setup`, { replace: true })
        return synchronized
      }
      if (section === 1) {
        if (!current) throw new Error('Save Hunt details before participants.')
        const updated = await huntsApi.updateDraft(current.id, capacityInput(settings))
        setPersistedHunt(updated)
        const synchronized = settingsFromHunt(updated, settings)
        setInitialSettings(synchronized)
        return synchronized
      }
      return settings
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) throw new Error('This Hunt is no longer editable as a draft.')
      if (error instanceof Error && !(error instanceof ApiError)) throw error
      throw new Error('We couldn\'t save this section. Please try again.')
    }
  }

  function saveAndContinue() {
    if (feature.id === 'positions' && !independent && !positionsVerified) return
    setCompleted((current) => new Set([...current, feature.id]))
    const next = huntFeatures.findIndex((item,index) => index > active && !featureDisabled(item.id))
    if (next >= 0) setActive(next)
  }

  function changeFormat(format: string) {
    setHuntFormat(format)
    if (format === 'Single Hunters' && huntFeatures[active].id === 'team') setActive(active + 1)
  }

  function previousFeature() {
    for (let index = active - 1; index >= 0; index -= 1) if (!featureDisabled(huntFeatures[index].id)) { setActive(index); break }
  }

  async function shareHunt() {
    const invitationLink = 'https://tedixhunt.app/join/SIGNAL26'
    const share = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share
    try {
      if (share) { await share.call(navigator,{title:'Join my TedixHunt',url:invitationLink});setLinkMessage('Share opened') }
      else { await navigator.clipboard?.writeText(invitationLink);setLinkMessage('Link copied') }
    } catch { setLinkMessage('Share cancelled') }
  }

  if (isLoadingDraft) return <main className="grid min-h-dvh place-items-center bg-slate-100 text-slate-700" role="status">Loading Hunt setup…</main>
  if (loadError) return <main className="grid min-h-dvh place-items-center bg-slate-100 p-5"><div className="rounded-2xl border border-rose-200 bg-white p-6 text-center"><p className="font-bold text-rose-700" role="alert">{loadError}</p><button className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 font-bold" onClick={() => void loadDraft()} type="button">Retry</button></div></main>

  if (sharing) return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader showProfile/><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8"><button className="text-sm font-bold text-slate-500" onClick={()=>{setSharing(false);setReviewing(true)}} type="button">← Back to Review Hunt</button><p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Block 4</p><h1 className="mt-2 text-4xl font-black">Create link &amp; share</h1><p className="mt-3 text-slate-600">Your Hunt is ready. Give participants one clear way to join.</p><section className="mt-7 rounded-2xl border border-emerald-300 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Participant access</p><h2 className="mt-2 text-2xl font-black">Signal: Cluj Napoca</h2><p className="mt-2 text-sm text-slate-600">Use the link, Hunt code or QR code below.</p></div><span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">Hunt created</span></div><div className="mt-6 grid gap-5 sm:grid-cols-[1fr_150px]"><div><label className="text-sm font-bold">Participant link<input aria-label="Hunt invitation link" className={controlClass} readOnly value="https://tedixhunt.app/join/SIGNAL26"/></label><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Hunt code</p><p className="mt-2 text-2xl font-black tracking-[0.18em]">SIGNAL26</p></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button className="min-h-12 flex-1 rounded-xl border border-emerald-400 bg-white px-4 font-black" onClick={async()=>{await navigator.clipboard?.writeText('https://tedixhunt.app/join/SIGNAL26');setLinkMessage('Link copied')}} type="button">Copy link</button><button className="min-h-12 flex-1 rounded-xl bg-slate-950 px-4 font-black text-white" onClick={shareHunt} type="button">Share</button></div></div><div className="grid aspect-square place-items-center self-start rounded-xl border-4 border-slate-950 bg-white text-center text-sm font-black">QR<br/>SIGNAL26</div></div>{linkMessage&&<p className="mt-4 text-sm font-bold text-emerald-800" role="status">✓ {linkMessage}</p>}<div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><Link className="inline-flex min-h-12 items-center rounded-xl bg-emerald-500 px-6 font-black" to="/organizer">Finish and open My Hunts</Link></div></section></div></main>

  if (reviewing) return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader showProfile/><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8"><button className="text-sm font-bold text-slate-500" onClick={()=>setReviewing(false)} type="button">← Back to Hunt Features</button><p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Block 3</p><h1 className="mt-2 text-4xl font-black">Review Hunt</h1><p className="mt-3 text-slate-600">Confirm the setup before creating participant access.</p><section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">{independent?'Independent Hunt':'Registered Hunt'}</p><h2 className="mt-2 text-2xl font-black">Signal: Cluj Napoca</h2><p className="mt-2 text-sm text-slate-600">7 checkpoints · {huntFormat} · Creator-verified route</p></div><span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">Ready to create</span></div>{independent&&<div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Independent Hunt</strong><p className="mt-1">This is an unofficial activity. Use the verified route and organize it safely. Rewards are unavailable.</p></div>}<div className="mt-5 grid gap-3 sm:grid-cols-3">{[['General Setup','Complete'],['Hunt Features',`${completedRequired}/${requiredFeatures.length} complete`],['Route','Verified']].map(([label,value])=><div className="rounded-xl bg-slate-50 p-4" key={label}><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-black">{value}</p></div>)}</div><div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><button className="min-h-12 rounded-xl border border-slate-300 px-5 font-black" onClick={()=>setReviewing(false)} type="button">Edit Hunt</button><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black" onClick={()=>{setReviewing(false);setSharing(true)}} type="button">Create Hunt &amp; continue</button></div></section></div></main>

  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to={`/organizer/hunts/new${independent?'?mode=independent':''}`}>← Setup options</Link>
        <div className="mt-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{independent?'Independent Organizer':'Registered Organizer'}</p><h1 className="mt-2 text-4xl font-black tracking-tight">Set the Hunt</h1><p className="mt-3 max-w-3xl text-slate-600">See the complete flow from the beginning: General Setup, Hunt Features, Review Hunt, then Create link &amp; share.</p></div>

        {independent && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Independent Organizer persistence is not connected yet. This setup remains a local prototype.</p>}
        {!independent && !huntId && isLoadingOrganizations && <p className="mt-5 text-sm font-semibold text-slate-500" role="status">Loading your organizations…</p>}
        {!independent && !huntId && !isLoadingOrganizations && !organizationLoadFailed && organizations.length === 0 && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">You need access to an organization before a Hunt draft can be created.</p>}
        {!independent && !huntId && organizationLoadFailed && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">We couldn\'t load your organizations. Refresh the page to try again.</p>}
        <GeneralSetup independent={independent} initialSettings={initialSettings} organizations={organizations} selectedOrganizationId={selectedOrganizationId} onOrganizationChange={setSelectedOrganizationId} onComplete={() => setGeneralComplete(true)} onFormatChange={changeFormat} onSave={saveGeneralSection} onTeamSizeChange={setTeamSize} />

        <section className="mt-8" aria-labelledby="features-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Block 2</p><h2 className="mt-2 text-2xl font-black" id="features-title">Hunt Features</h2><p className="mt-1 text-sm text-slate-500">Build what participants will experience during the Hunt.</p></div>
            <div className="min-w-48"><div className="flex justify-between text-xs font-bold"><span>{completedRequired} of {requiredFeatures.length} complete</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div></div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
          <nav className="space-y-2" aria-label="Hunt Features">{huntFeatures.map((item, index) => {const disabled=featureDisabled(item.id);return <button className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-black ${disabled?'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400':active === index ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white hover:border-emerald-300'}`} disabled={disabled} key={item.id} onClick={() => setActive(index)} type="button"><span><span className="mr-2 text-slate-400">{index + 1}.</span>{item.name}</span>{disabled?<span>Locked</span>:completed.has(item.id)&&<span className="text-emerald-600">✓</span>}</button>})}</nav>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Feature {active + 1} of {huntFeatures.length}</p><h2 className="mt-2 text-2xl font-black">{feature.name}</h2>
            {checkpointFeature && <><div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Checkpoints">{checkpoints.map((label, index) => <button aria-label={label==='F'?'FinishPoint':`Checkpoint ${label}`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-xs font-black ${checkpoint===index?'border-slate-950 bg-slate-950 text-white':checkpointSelections[feature.id]?.[index]!==undefined||challengeSources[index]==='own'?'border-emerald-500 bg-emerald-50 text-emerald-800':'border-slate-300 bg-white text-slate-600'}`} key={label} onClick={()=>setCheckpoint(index)} type="button">{label}</button>)}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 px-4 py-3"><div><span className="text-xs font-black uppercase tracking-wide text-emerald-700">Signal default</span><strong className="ml-2 text-sm">{signalCheckpointNames[checkpoint]}</strong></div><span className="text-xs text-emerald-900">Change only if needed</span></div></>}
            <div className={`mt-5 grid gap-6 xl:grid-cols-[1fr_280px] ${feature.id==='rewards'||feature.id==='map'?'hidden':''}`}>
              <div>{feature.id==='personal'?<><fieldset><legend className="text-sm font-black">Challenge source</legend><div className="mt-3 flex flex-wrap gap-4">{[['template','Template challenge'],['own','My challenge']].map(([value,label])=><label className="flex items-center gap-2 text-sm font-bold" key={value}><input checked={(challengeSources[checkpoint]??'template')===value} className="h-5 w-5 accent-emerald-500" name={`source-${checkpoint}`} onChange={()=>setChallengeSources({...challengeSources,[checkpoint]:value as 'template'|'own'})} type="radio"/>{label}</label>)}</div></fieldset>{(challengeSources[checkpoint]??'template')==='template'?<label className="mt-4 block text-sm font-bold">Template challenge<select className={controlClass} value={chosenIndex} onChange={event=>setCheckpointSelections({...checkpointSelections,personal:{...(checkpointSelections.personal??{}),[checkpoint]:Number(event.target.value)}})}>{feature.templates.map((item,index)=><option key={`${item.name}-${index}`} value={index}>{item.name}{index===checkpoint?' · Signal default':''}</option>)}</select></label>:<CustomChallengeEditor value={customChallenge} onChange={next=>setCustomChallenges({...customChallenges,[checkpoint]:next})}/>}</>:<label className="text-sm font-bold">{checkpointFeature?'Challenge or navigation template':'Template'}<select className={controlClass} value={chosenIndex} onChange={(event) => checkpointFeature?setCheckpointSelections({...checkpointSelections,[feature.id]:{...(checkpointSelections[feature.id]??{}),[checkpoint]:Number(event.target.value)}}):setSelected({ ...selected, [feature.id]: Number(event.target.value) })}>{feature.templates.map((item, index) => <option key={`${item.name}-${index}`} value={index}>{item.name}{checkpointFeature&&index===defaultIndex?' · Signal default':''}</option>)}</select></label>}<details className="mt-5 rounded-xl bg-slate-50 p-4" open><summary className="cursor-pointer text-sm font-black">Example</summary><p className="mt-3 text-sm leading-6 text-slate-700">{template.note}</p><p className="mt-2 text-sm text-slate-500">{template.example}</p></details></div>
              <aside><p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Preview</p><StudentPreview example={template.example} featureId={feature.id} name={template.name} /></aside>
            </div>
            {feature.id === 'map' && <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]"><div className="rounded-xl bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Fixed Hunt feature</p><h3 className="mt-2 text-lg font-black">A chronological record of the Hunt</h3><p className="mt-2 text-sm leading-6 text-slate-600">Participants see completed locations, team discoveries, routes unlocked and important mission events. Private personal answers stay hidden.</p><ol className="mt-4 space-y-2 text-sm"><li className="rounded-lg border border-emerald-200 bg-white p-3"><strong>1 · Matthias Rex Statue</strong><span className="ml-2 text-emerald-700">UNLOCKED</span></li><li className="rounded-lg border border-slate-200 bg-white p-3"><strong>2 · Stone Gate</strong><span className="ml-2 text-slate-500">Route recovered</span></li></ol></div><StudentPreview example="Matthias Rex Statue: UNLOCKED → Stone Gate: route recovered." featureId="history" name="Mission History" /></div>}
            {feature.id === 'rewards' && !independent && <RewardsEditor teamSize={teamSize} />}
            {feature.id === 'positions' && (independent?<div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">Creator-verified route</p><h3 className="mt-2 text-lg font-black">Cluj-Napoca centre · 7 fixed checkpoints</h3><p className="mt-2 text-sm text-emerald-950">For safety, checkpoint positions and the 30 m detection radius cannot be changed in an Independent Hunt.</p></div>:<CheckpointMapEditor onVerifiedChange={setVerifiedPositionCount} />)}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl border border-slate-300 px-5 font-black disabled:opacity-40" disabled={active === 0} onClick={previousFeature} type="button">Previous</button>{allComplete?<button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black disabled:bg-slate-300" disabled={!generalComplete} onClick={()=>setReviewing(true)} type="button">{generalComplete?'Review Hunt':'Complete General Setup first'}</button>:<button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black disabled:bg-slate-300" disabled={feature.id === 'positions' && !independent && !positionsVerified} onClick={saveAndContinue} type="button">{feature.id === 'positions' && !independent && !positionsVerified ? `Verify all checkpoints (${verifiedPositionCount}/7)` : 'Save & continue'}</button>}</div>
          </article>
        </div></section>

        <section className={`mt-8 rounded-2xl border p-5 shadow-sm sm:p-6 ${generalComplete&&allComplete?'border-emerald-300 bg-white':'border-slate-200 bg-slate-50'}`} aria-labelledby="review-hunt-title">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className={`text-xs font-black uppercase tracking-[0.16em] ${generalComplete&&allComplete?'text-emerald-700':'text-slate-400'}`}>Block 3</p><h2 className={`mt-2 text-2xl font-black ${generalComplete&&allComplete?'text-slate-950':'text-slate-500'}`} id="review-hunt-title">Review Hunt</h2><p className="mt-1 text-sm text-slate-500">Check the complete setup before creating participant access.</p></div>
            <button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-black disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500" disabled={!generalComplete||!allComplete} onClick={()=>setReviewing(true)} type="button">{generalComplete&&allComplete?'Review Hunt':`Locked · ${completedRequired}/${requiredFeatures.length} features`}</button>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6" aria-labelledby="share-hunt-title">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Block 4</p><h2 className="mt-2 text-2xl font-black text-slate-500" id="share-hunt-title">Create link &amp; share</h2><p className="mt-1 text-sm text-slate-500">Participant link, Hunt code and QR become available after Review Hunt.</p></div>
            <button className="min-h-12 cursor-not-allowed rounded-xl bg-slate-200 px-6 font-black text-slate-500" disabled type="button">Locked · Review first</button>
          </div>
        </section>
      </div>
    </main>
  )
}
