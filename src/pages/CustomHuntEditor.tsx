import { developmentLocation, developmentLocationEnabled } from '../features/creator/developmentLocation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { OrganizerHeader } from './OrganizerFlow'
import { useCatalogLocationOptions } from '../features/organizer/catalogLocationOptions'
import { ApprovedTemplateGeographyInspection, HuntSnapshotGeographyInspection } from '../components/OrganizerHuntGeography'
import { ApiError, huntOptionsApi, huntRewardsApi, huntsApi, huntTemplatesApi, organizationsApi, rewardOptionsApi, rewardSaveError, type Hunt, type HuntOptions, type HuntRewards, type HuntTemplateMetadata, type HuntTemplateSnapshot, type LeaderboardReward, type Organization, type RewardKind, type RewardOptions, type RewardProvider, type SpecialAward, type VirtualRewardCategory } from '../services/api'
import { general2Input, general3Input, generalSetupProgressFromNavigationState, huntDetailsInput, newHuntDefaults, optionSupported, settingsFromHunt, settingsWithTemplate, templateInput, type GeneralSetupProgress, type GeneralSetupSettings } from './generalSetup'
import { formatDate, formatLocation, formatTime, parseHuntNotReady, reviewHunt, reviewOptionLabels, reviewRefreshError, statusLabels, type GeneralSection, type HuntReviewIssue } from './huntReview'
import { accessCreationError, copyParticipantLink, participantLink, shareParticipantLink } from './participantAccess'

const controlClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500'

const generalSteps = ['Hunt details', 'Participants & access', 'Experience defaults', 'Mission template & story']

function GeneralSetup({ initialSettings, initialProgress, organizations, selectedOrganizationId, templates, templatesLoading, templatesError, huntOptions, optionsLoading, optionsError, savedTemplateKey, savedTemplateSnapshot, onRetryTemplates, onRetryOptions, onOrganizationChange, onSave }: {
  initialSettings: GeneralSetupSettings; organizations: Organization[]; selectedOrganizationId: string;
  initialProgress: GeneralSetupProgress;
  onOrganizationChange: (id: string) => void;
  templates: HuntTemplateMetadata[]; templatesLoading: boolean; templatesError: boolean; onRetryTemplates: () => void;
  huntOptions: HuntOptions | null; optionsLoading: boolean; optionsError: boolean; onRetryOptions: () => void;
  savedTemplateKey: string | null; savedTemplateSnapshot: HuntTemplateSnapshot | null;
  onSave: (section: number, settings: GeneralSetupSettings, templateKey: string | null) => Promise<GeneralSetupSettings>;
}) {
  const [active, setActive] = useState(initialProgress.activeSection)
  const [completed, setCompleted] = useState<Set<number>>(() => new Set(initialProgress.completedSections))
  const [collapsed, setCollapsed] = useState(false)
  const [settings, setSettings] = useState(initialSettings)
  // Location choices come from the Organizer geography catalog; fixed lists remain only as an offline fallback.
  const catalog = useCatalogLocationOptions(settings.country, settings.county, true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(savedTemplateKey ?? '')
  const savingRef = useRef(false)
  const progress = Math.round((completed.size / generalSteps.length) * 100)

  useEffect(() => { setSettings(initialSettings) }, [initialSettings])
  useEffect(() => { setSelectedTemplateKey(savedTemplateKey ?? '') }, [savedTemplateKey])
  useEffect(() => {
    setActive(initialProgress.activeSection)
    setCompleted(new Set(initialProgress.completedSections))
    setCollapsed(false)
  }, [initialProgress])

  const selectedTemplate = templates.find(template => template.key === selectedTemplateKey)
  const missingSavedTemplate = Boolean(savedTemplateKey && savedTemplateSnapshot && !templates.some(template => template.key === savedTemplateKey))
  const supported = (kind: 'formats' | 'accessModes' | 'difficulties' | 'checkpointOrders', label: string) => Boolean(huntOptions && optionSupported(huntOptions[kind], label))

  function selectTemplate(key: string) {
    setSelectedTemplateKey(key)
    const selected = templates.find(template => template.key === key)
    if (selected) setSettings(current => settingsWithTemplate(current, selected))
  }

  async function saveGeneral() {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    try {
      if (active === 3 && !selectedTemplate) throw new Error('Select an available Hunt template before completing setup.')
      const synchronized = await onSave(active, settings, selectedTemplateKey || null)
      setSettings(synchronized)
      const next = new Set([...completed, active])
      setCompleted(next)
      if (active < generalSteps.length - 1) setActive(active + 1)
      if (next.size === generalSteps.length) setCollapsed(true)
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
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">General Setup ✓</p><h2 className="mt-2 text-xl font-bold" id="general-title">{settings.name}</h2><p className="mt-2 text-sm text-slate-600">{settings.date} · {settings.time} · {settings.location} · {settings.duration} minutes</p><p className="mt-1 text-sm text-slate-600">{settings.participants} participants · {settings.format === 'Team Hunters' ? `Teams of ${settings.teamSize}` : 'Single Hunters'} · {settings.access}</p></div>
        <button aria-label="Edit General Setup" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-700" onClick={() => setCollapsed(false)} title="Edit General Setup" type="button">✎</button>
      </div>
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Mission</p><p className="mt-2 font-bold">{settings.theme}</p><p className="mt-1 text-sm text-emerald-950">{settings.mission}</p></div>
    </section>
  )

  const setupPreview = active === 0 ? `${settings.country} · ${settings.county}\n${settings.location} · ${settings.language}\n${settings.date} · ${settings.time}` : active === 1 ? `${settings.participants} participants\n${settings.format === 'Team Hunters' ? `Teams of ${settings.teamSize}` : 'Single Hunters'} · ${settings.access}` : active === 2 ? `${settings.difficulty}\n${settings.checkpointOrder}` : `${settings.theme}\n${settings.mission}`

  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="general-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Block 1</p><h2 className="mt-2 text-2xl font-bold" id="general-title">General Setup</h2><p className="mt-1 text-sm text-slate-500">Define the event before building its participant experience.</p></div>
        <div className="min-w-48"><div className="flex justify-between text-xs font-semibold"><span>{completed.size} of 4 complete</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div></div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-2" aria-label="General Setup sections">{generalSteps.map((step, index) => <button className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-bold ${active === index ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50'}`} key={step} onClick={() => { setActive(index); setSaveError('') }} type="button"><span>{index + 1}. {step}</span>{completed.has(index) && <span className="text-emerald-600">✓</span>}</button>)}</nav>
        <article className="rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">General {active + 1} of 4</p><h3 className="mt-2 text-xl font-bold">{generalSteps[active]}</h3>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_240px]"><div className="grid gap-4 sm:grid-cols-2">
            {active === 0 && <>{organizations.length > 1 && <label className="text-sm font-bold sm:col-span-2">Organization<select className={controlClass} value={selectedOrganizationId} onChange={event => onOrganizationChange(event.target.value)}>{organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>}<label className="text-sm font-bold sm:col-span-2">Hunt name<input className={controlClass} value={settings.name} onChange={e => setSettings({...settings,name:e.target.value})} /></label>{[['country','Country',catalog.countries ?? (developmentLocationEnabled() ? [developmentLocation.country] : ['Romania','United Kingdom'])],['county','County / region',catalog.regions ?? ['Cluj','Bucharest']],['location','City',catalog.cities ?? (developmentLocationEnabled() ? [developmentLocation.city] : ['Cluj Napoca'])],['language','Language',['English','Romanian']]].map(([key,label,options])=>{ const fromCatalog = key !== 'language' && (key === 'country' ? catalog.countries : key === 'county' ? catalog.regions : catalog.cities) !== null; const pinned = !fromCatalog && developmentLocationEnabled() && ['country','location'].includes(key as string) && settings[key as keyof typeof settings]; return <label className="text-sm font-bold" key={key as string}>{label as string}<select className={controlClass} value={settings[key as keyof typeof settings]} onChange={e=>setSettings({...settings,[key as string]:e.target.value,...(key === 'country' ? { county: '', location: '' } : key === 'county' ? { location: '' } : {})})}>{fromCatalog && <option value="">Choose {(label as string).toLowerCase()}</option>}{(pinned ? [settings[key as keyof typeof settings]] : options as string[]).map(option=><option key={option}>{option}</option>)}{!pinned && settings[key as keyof typeof settings] && !(options as string[]).includes(settings[key as keyof typeof settings]) && <option>{settings[key as keyof typeof settings]}</option>}</select></label> })}<label className="text-sm font-bold">Hunt date<input className={controlClass} value={settings.date} onChange={e => setSettings({...settings,date:e.target.value})} type="date" /></label><label className="text-sm font-bold">Start time<input className={controlClass} value={settings.time} onChange={e => setSettings({...settings,time:e.target.value})} type="time" /></label><label className="text-sm font-bold">Duration (minutes)<input className={controlClass} value={settings.duration} onChange={e => setSettings({...settings,duration:e.target.value})} min="1" type="number" /></label><label className="text-sm font-bold">Local contact<input className={controlClass} value={settings.contact} onChange={e => setSettings({...settings,contact:e.target.value})} /></label></>}
            {(active === 1 || active === 2) && optionsLoading && <p className="sm:col-span-2 text-sm font-semibold text-slate-500" role="status">Loading supported Hunt options…</p>}
            {(active === 1 || active === 2) && optionsError && <div className="sm:col-span-2 rounded-xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-700" role="alert">We couldn't load the supported Hunt options.</p><button className="mt-3 min-h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" onClick={onRetryOptions} type="button">Retry</button></div>}
            {active === 1 && huntOptions && <><label className="text-sm font-bold">Hunt format<select className={controlClass} value={settings.format} onChange={e=>setSettings({...settings,format:e.target.value})}>{['Team Hunters','Single Hunters'].map(option => <option disabled={!supported('formats', option)} key={option} value={option}>{option}{!supported('formats', option) ? ' · Not available in the current pilot' : ''}</option>)}</select></label><label className="text-sm font-bold">Participants<input className={controlClass} value={settings.participants} onChange={e => setSettings({...settings,participants:e.target.value})} min="1" type="number" /></label><label className="text-sm font-bold">Team size<input className={`${controlClass} disabled:bg-slate-100 disabled:text-slate-500`} disabled readOnly value={settings.teamSize} min="2" type="number" /><span className="mt-2 block text-xs font-normal text-slate-500">Current pilot: teams of {huntOptions?.teamSizes.join(', ')}</span></label><label className="text-sm font-bold">Hunt access<select className={controlClass} value={settings.access} onChange={e => setSettings({...settings,access:e.target.value})}>{['Invitation-only','Open to everyone'].map(option => <option disabled={!supported('accessModes', option)} key={option} value={option}>{option}{!supported('accessModes', option) ? ' · Not available in the current pilot' : ''}</option>)}</select></label><div className={`sm:col-span-2 rounded-xl p-4 ${settings.format==='Single Hunters'?'bg-slate-100 text-slate-400':'bg-emerald-50 text-emerald-900'}`}><strong>Team challenges</strong><p className="mt-1 text-sm">{settings.format==='Single Hunters'?'Disabled for Single Hunters.':'Enabled for Team Hunters.'}</p></div></>}
            {active === 2 && huntOptions && <>{[['difficulty','Difficulty',['Easy','Medium','Advanced','User set'],'difficulties'],['checkpointOrder','Checkpoint order',['Recommended route','Short route'],'checkpointOrders']].map(([key, label, choices, kind]) => <label className="text-sm font-bold" key={key as string}>{label as string}<select className={`${controlClass} disabled:bg-slate-100 disabled:text-slate-500`} value={settings[key as keyof typeof settings]} onChange={e => setSettings({...settings,[key as string]:e.target.value})}>{(choices as string[]).map(option => <option disabled={!supported(kind as 'difficulties' | 'checkpointOrders', option)} key={option} value={option}>{option}{!supported(kind as 'difficulties' | 'checkpointOrders', option) ? ' · Not available in the current pilot' : ''}</option>)}</select></label>)}</>}
            {active === 3 && <>
              {templatesLoading && <p className="sm:col-span-2 text-sm font-semibold text-slate-500" role="status">Loading Hunt templates…</p>}
              {templatesError && <div className="sm:col-span-2 rounded-xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-700" role="alert">We couldn't load Hunt templates.</p><button className="mt-3 min-h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" onClick={onRetryTemplates} type="button">Retry</button></div>}
              {!templatesLoading && !templatesError && templates.length === 0 && !missingSavedTemplate && <p className="sm:col-span-2 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-950" role="status">No approved Competition Templates are currently available.</p>}
              {!templatesLoading && !templatesError && missingSavedTemplate && savedTemplateSnapshot && <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Saved template · no longer available</p><p className="mt-2 font-bold">{savedTemplateSnapshot.displayName}</p><p className="mt-1 text-sm">{savedTemplateSnapshot.theme} · Version {savedTemplateSnapshot.version}</p></div>}
              {!templatesLoading && !templatesError && templates.length > 0 && <><label className="text-sm font-bold">Theme<input className={`${controlClass} bg-slate-50`} readOnly value={selectedTemplate?.theme ?? savedTemplateSnapshot?.theme ?? ''} /></label><label className="text-sm font-bold">Competition template<select className={controlClass} value={selectedTemplate?.key ?? ''} onChange={event=>selectTemplate(event.target.value)}><option value="">Select a template</option>{templates.map(template=><option key={template.key} value={template.key}>{template.displayName}</option>)}</select>{selectedTemplate && <span className="mt-2 block text-xs font-normal text-slate-500">Version {selectedTemplate.version}</span>}</label></>}
            </>}
            {active === 3 && (selectedTemplate || missingSavedTemplate) && <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Template includes</p><p className="mt-2 text-sm text-slate-700">Approved challenges, checkpoint navigation and the final mission.</p></div>}
          </div><aside className="rounded-xl bg-[#061812] p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">Setup preview</p><h4 className="mt-3 font-bold">{generalSteps[active]}</h4><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-200">{setupPreview}</p></aside></div>
          {active === 3 && !templatesLoading && !templatesError && templates.length > 0 && <div className="mt-4"><ApprovedTemplateGeographyInspection templates={templates} onRefreshTemplates={onRetryTemplates} /></div>}
          {saveError && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">{saveError}</p>}
          <div className="mt-6 flex justify-between border-t border-slate-100 pt-5"><button className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold disabled:opacity-40" disabled={active === 0 || saving} onClick={() => setActive(active - 1)} type="button">Previous</button><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-bold disabled:cursor-wait disabled:opacity-60" disabled={saving || ((active === 1 || active === 2) && !huntOptions) || (active === 3 && (templatesLoading || templatesError || !selectedTemplate))} onClick={() => void saveGeneral()} type="button">{saving ? 'Saving…' : active === 3 ? 'Complete General Setup' : 'Save & continue'}</button></div>
        </article>
      </div>
    </section>
  )
}

type RewardDraft = { id:string; persisted:boolean; place:number; provider:RewardProvider; kind:RewardKind; category:VirtualRewardCategory|null; name:string; description:string; quantity:string; saved:boolean }
type SpecialAwardDraft = Omit<RewardDraft,'place'> & { definitionKey:string }
const ordinal = (value:number) => `${value}${value%10===1&&value%100!==11?'st':value%10===2&&value%100!==12?'nd':value%10===3&&value%100!==13?'rd':'th'} place`
const draftId = () => `draft-${Date.now()}-${Math.random()}`
const fromLeaderboard = (reward:LeaderboardReward):RewardDraft => ({...reward,persisted:true,name:reward.name??'',description:reward.description??'',quantity:String(reward.quantity),saved:true})
const fromSpecial = (reward:SpecialAward):SpecialAwardDraft => ({...reward,persisted:true,name:reward.name??'',description:reward.description??'',quantity:String(reward.quantity),saved:true})
const details = (reward:RewardDraft|SpecialAwardDraft) => ({provider:reward.provider,kind:reward.kind,category:reward.provider==='tedix_inventory'&&reward.kind==='virtual'?reward.category:null,name:reward.provider==='organizer'?reward.name.trim():null,description:reward.provider==='organizer'?(reward.description.trim()||null):null,quantity:Number(reward.quantity)})
const validReward = (reward:RewardDraft|SpecialAwardDraft) => Number.isInteger(Number(reward.quantity))&&Number(reward.quantity)>=1&&(reward.provider!=='organizer'||Boolean(reward.name.trim()))&&(reward.provider!=='tedix_inventory'||reward.kind!=='virtual'||Boolean(reward.category))

function RewardFields({reward,onChange,options,disabled=false}:{reward:RewardDraft|SpecialAwardDraft;onChange:(next:typeof reward)=>void;options:RewardOptions;disabled?:boolean}) {
  const providerLabel=(key:string)=>options.providers.find(item=>item.key===key)?.label??key
  const kindLabel=(key:string)=>options.kinds.find(item=>item.key===key)?.label??key
  return <div className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-bold">Provided by<select className={controlClass} disabled={disabled} value={reward.provider} onChange={e=>onChange({...reward,provider:e.target.value as RewardProvider})}>{options.providers.map(item=><option key={item.key} value={item.key}>{providerLabel(item.key)}</option>)}</select></label>
    <label className="text-sm font-bold">Reward type<select className={controlClass} disabled={disabled} value={reward.kind} onChange={e=>onChange({...reward,kind:e.target.value as RewardKind})}>{options.kinds.map(item=><option key={item.key} value={item.key}>{kindLabel(item.key)}</option>)}</select></label>
    {reward.provider==='tedix_inventory'&&reward.kind==='physical'&&<div className="sm:col-span-2 rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-950"><p className="text-xs font-semibold uppercase tracking-wide">Tedix Mystery Physical Reward</p><p className="mt-3 text-sm font-bold">Tedix physical reward availability is managed separately.</p><p className="mt-2 text-sm leading-6">The exact prize, image, brand and value stay hidden until final results.</p></div>}
    {reward.provider==='tedix_inventory'&&reward.kind==='virtual'&&<label className="text-sm font-bold sm:col-span-2">Virtual reward category<select className={controlClass} disabled={disabled} value={reward.category??''} onChange={e=>onChange({...reward,category:e.target.value as VirtualRewardCategory})}><option value="">Select a category</option>{options.virtualCategories.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></label>}
    {reward.provider==='organizer'&&<><label className="text-sm font-bold">Reward name<input className={controlClass} disabled={disabled} placeholder="Name the reward" value={reward.name} onChange={e=>onChange({...reward,name:e.target.value})}/></label><label className="text-sm font-bold sm:col-span-2">Short description<input className={controlClass} disabled={disabled} placeholder="What the winner receives" value={reward.description} onChange={e=>onChange({...reward,description:e.target.value})}/><span className="mt-2 block text-xs font-normal text-slate-500">The Organizer is responsible for supplying this reward.</span></label></>}
    <label className="text-sm font-bold">Quantity<input className={controlClass} disabled={disabled} min="1" step="1" type="number" value={reward.quantity} onChange={e=>onChange({...reward,quantity:e.target.value})}/></label>
  </div>
}

export function RewardsEditor({huntId,huntStatus,teamSize,onLoaded,onEditingChange}:{huntId:string;huntStatus:Hunt['status'];teamSize:number;onLoaded:(rewards:HuntRewards)=>void;onEditingChange?:(editing:boolean)=>void}) {
  const [options,setOptions]=useState<RewardOptions|null>(null),[rewards,setRewards]=useState<RewardDraft[]>([]),[specialAwards,setSpecialAwards]=useState<SpecialAwardDraft[]>([])
  const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[actionError,setActionError]=useState(''),[pending,setPending]=useState<Set<string>>(new Set())
  const pendingRef=useRef(new Set<string>())
  const editable=huntStatus==='draft'
  const editing = pending.size > 0 || rewards.some(item=>!item.saved) || specialAwards.some(item=>!item.saved)
  useEffect(()=>{onEditingChange?.(editing)},[editing,onEditingChange])
  const load=useCallback(async()=>{setLoading(true);setLoadError('');try{const [metadata,data]=await Promise.all([rewardOptionsApi.getOptions(),huntRewardsApi.list(huntId)]);setOptions(metadata);setRewards(data.leaderboard.map(fromLeaderboard));setSpecialAwards(data.specialAwards.map(fromSpecial));onLoaded(data)}catch{setLoadError("We couldn't load rewards. Please try again.")}finally{setLoading(false)}},[huntId,onLoaded])
  useEffect(()=>{void load()},[load])
  const updateReward=(id:string,next:RewardDraft)=>setRewards(current=>current.map(item=>item.id===id?next:item)), updateSpecial=(id:string,next:SpecialAwardDraft)=>setSpecialAwards(current=>current.map(item=>item.id===id?next:item))
  const busy=(id:string)=>pending.has(id), run=async(id:string,operation:()=>Promise<void>)=>{if(pendingRef.current.has(id)||!editable)return;pendingRef.current.add(id);setPending(new Set(pendingRef.current));setActionError('');try{await operation()}catch(error){setActionError(rewardSaveError(error))}finally{pendingRef.current.delete(id);setPending(new Set(pendingRef.current))}}
  const publishState=(leaderboard:RewardDraft[],special:SpecialAwardDraft[])=>onLoaded({leaderboard:leaderboard.filter(x=>x.persisted).map(x=>({...details(x),id:x.id,huntId,place:x.place})),specialAwards:special.filter(x=>x.persisted).map(x=>({...details(x),id:x.id,huntId,definitionKey:x.definitionKey}))})
  if(loading)return <p className="mt-5 text-sm font-semibold text-slate-500" role="status">Loading rewards…</p>
  if(loadError)return <div className="mt-5 rounded-xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-700" role="alert">{loadError}</p><button className="mt-3 min-h-10 rounded-lg border bg-white px-4 text-sm font-bold" onClick={()=>void load()} type="button">Retry</button></div>
  if(!options)return null
  const rewardEditorOpen=rewards.some(item=>!item.saved), specialEditorOpen=specialAwards.some(item=>!item.saved)
  const addReward=()=>setRewards(current=>[...current,{id:draftId(),persisted:false,place:1,provider:'tedix_inventory',kind:'physical',category:null,name:'',description:'',quantity:String(Math.max(1,teamSize)),saved:false}])
  const addSpecial=()=>{const definition=options.specialAwardDefinitions.find(item=>!specialAwards.some(award=>award.definitionKey===item.key));if(definition)setSpecialAwards(current=>[...current,{id:draftId(),persisted:false,definitionKey:definition.key,provider:'tedix_inventory',kind:'physical',category:null,name:'',description:'',quantity:'1',saved:false}])}
  const saveLeaderboard=(reward:RewardDraft)=>void run(reward.id,async()=>{if(!validReward(reward))return;const input={...details(reward),place:reward.place};const saved=reward.persisted?await huntRewardsApi.updateLeaderboard(huntId,reward.id,input):await huntRewardsApi.createLeaderboard(huntId,input);const next=rewards.map(item=>item.id===reward.id?fromLeaderboard(saved):item);setRewards(next);publishState(next,specialAwards)})
  const saveSpecial=(reward:SpecialAwardDraft)=>void run(reward.id,async()=>{if(!validReward(reward))return;const input={...details(reward),definitionKey:reward.definitionKey};const saved=reward.persisted?await huntRewardsApi.updateSpecial(huntId,reward.id,input):await huntRewardsApi.createSpecial(huntId,input);const next=specialAwards.map(item=>item.id===reward.id?fromSpecial(saved):item);setSpecialAwards(next);publishState(rewards,next)})
  const removeLeaderboard=(reward:RewardDraft)=>reward.persisted?void run(reward.id,async()=>{await huntRewardsApi.deleteLeaderboard(huntId,reward.id);const next=rewards.filter(x=>x.id!==reward.id);setRewards(next);publishState(next,specialAwards)}):setRewards(rewards.filter(x=>x.id!==reward.id))
  const removeSpecial=(reward:SpecialAwardDraft)=>reward.persisted?void run(reward.id,async()=>{await huntRewardsApi.deleteSpecial(huntId,reward.id);const next=specialAwards.filter(x=>x.id!==reward.id);setSpecialAwards(next);publishState(rewards,next)}):setSpecialAwards(specialAwards.filter(x=>x.id!==reward.id))
  const label=(items:RewardOptions['providers']|RewardOptions['kinds']|RewardOptions['virtualCategories'],key:string|null)=>items.find(item=>item.key===key)?.label??key??''
  return <div className="mt-5 space-y-6">{!editable&&<p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-950">Rewards are locked after the Hunt is published.</p>}{actionError&&<p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">{actionError}</p>}
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">Leaderboard Rewards</h3><p className="mt-1 text-sm text-slate-500">Add as many allocations as needed. Saved rewards stay compact.</p></div>{editable&&<button className="min-h-11 rounded-xl bg-emerald-500 px-4 text-sm font-bold disabled:bg-slate-300" disabled={rewardEditorOpen} onClick={addReward} type="button">+ Add reward</button>}</div>
    {rewards.length===0?<div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No leaderboard rewards allocated yet.</div>:<div className="mt-5 space-y-3">{[...rewards].sort((a,b)=>a.place-b.place).map((reward,index)=>reward.saved?<article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4" key={reward.id}><div><span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{ordinal(reward.place)}</span><h4 className="mt-1 font-bold">{reward.provider==='tedix_inventory'&&reward.kind==='physical'?'Tedix Mystery Physical Reward':reward.provider==='tedix_inventory'?label(options.virtualCategories,reward.category):reward.name}</h4><p className="mt-1 text-xs text-slate-500">{label(options.providers,reward.provider)} · {label(options.kinds,reward.kind)} · Quantity {reward.quantity}</p></div>{editable&&<div className="flex gap-3"><button className="text-sm font-bold text-emerald-800 disabled:opacity-40" disabled={rewardEditorOpen||busy(reward.id)} onClick={()=>updateReward(reward.id,{...reward,saved:false})} type="button">Edit</button><button className="text-sm font-bold text-rose-700 disabled:opacity-40" disabled={busy(reward.id)} onClick={()=>removeLeaderboard(reward)} type="button">{busy(reward.id)?'Removing…':'Remove'}</button></div>}</article>:<article className="rounded-xl border-2 border-emerald-300 bg-slate-50 p-4" key={reward.id}><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Reward allocation {index+1}</span><button className="text-xs font-semibold text-slate-500" disabled={busy(reward.id)} onClick={()=>reward.persisted?void load():removeLeaderboard(reward)} type="button">Cancel</button></div><label className="mt-4 block text-sm font-bold">Select place<select className={controlClass} value={reward.place} onChange={e=>updateReward(reward.id,{...reward,place:Number(e.target.value)})}>{Array.from({length:50},(_,place)=><option key={place} value={place+1}>{ordinal(place+1)}</option>)}</select></label><RewardFields options={options} reward={reward} onChange={next=>updateReward(reward.id,next as RewardDraft)}/>{!validReward(reward)&&<p className="mt-3 text-xs font-semibold text-rose-700">Add a valid quantity and all required reward details.</p>}<button className="mt-4 min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-bold text-emerald-800 disabled:opacity-40" disabled={!validReward(reward)||busy(reward.id)} onClick={()=>saveLeaderboard(reward)} type="button">{busy(reward.id)?'Saving…':'Save allocation'}</button></article>)}</div>}</section>
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">Special Awards</h3><p className="mt-1 text-sm text-slate-500">Choose a predefined metric. Rules cannot be edited by the Organizer.</p></div>{editable&&<button className="min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-bold text-emerald-800 disabled:opacity-40" disabled={specialAwards.length===options.specialAwardDefinitions.length||specialEditorOpen} onClick={addSpecial} type="button">+ Add special award</button>}</div><div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Physical-prize eligibility</strong><p>Physical prizes go to the highest-ranked eligible team or participant who has not already received one. Virtual rewards do not affect eligibility.</p></div>
    {specialAwards.length===0?<div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No special awards selected.</div>:<div className="mt-5 space-y-3">{specialAwards.map((award,index)=>{const definition=options.specialAwardDefinitions.find(item=>item.key===award.definitionKey);if(!definition)return null;return award.saved?<article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4" key={award.id}><div><span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{definition.scope} Special Award</span><h4 className="mt-1 font-bold">{definition.name}</h4><p className="mt-1 max-w-xl text-xs text-slate-500">{definition.rule}</p><p className="mt-1 text-xs text-slate-500">Quantity {award.quantity}</p></div>{editable&&<div className="flex gap-3"><button className="text-sm font-bold text-emerald-800" disabled={specialEditorOpen||busy(award.id)} onClick={()=>updateSpecial(award.id,{...award,saved:false})} type="button">Edit</button><button className="text-sm font-bold text-rose-700" disabled={busy(award.id)} onClick={()=>removeSpecial(award)} type="button">{busy(award.id)?'Removing…':'Remove'}</button></div>}</article>:<article className="rounded-xl border-2 border-emerald-300 bg-slate-50 p-4" key={award.id}><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{definition.scope} award {index+1}</span><button className="text-xs font-semibold text-slate-500" disabled={busy(award.id)} onClick={()=>award.persisted?void load():removeSpecial(award)} type="button">Cancel</button></div><label className="mt-4 block text-sm font-bold">Predefined award<select className={controlClass} value={award.definitionKey} onChange={e=>updateSpecial(award.id,{...award,definitionKey:e.target.value})}>{options.specialAwardDefinitions.map(item=><option disabled={specialAwards.some(existing=>existing.id!==award.id&&existing.definitionKey===item.key)} key={item.key} value={item.key}>{item.scope} · {item.name}</option>)}</select></label><div className="mt-4 rounded-xl border bg-white p-4"><p className="text-xs font-semibold uppercase text-slate-400">Winning rule · read only</p><p className="mt-2 font-bold">{definition.rule}</p><p className="mt-2 text-sm text-slate-600">{definition.description}</p><p className="mt-3 text-xs font-semibold text-slate-500">Eligibility: {definition.eligibility}</p></div><RewardFields options={options} reward={award} onChange={next=>updateSpecial(award.id,next as SpecialAwardDraft)}/>{!validReward(award)&&<p className="mt-3 text-xs font-semibold text-rose-700">Add a valid quantity and all required reward details.</p>}<button className="mt-4 min-h-11 rounded-xl border border-emerald-500 bg-white px-4 text-sm font-bold text-emerald-800 disabled:opacity-40" disabled={!validReward(award)||busy(award.id)} onClick={()=>saveSpecial(award)} type="button">{busy(award.id)?'Saving…':'Save special award'}</button></article>})}</div>}</section>
  </div>
}
export function CustomHuntEditorPage() {
  const { huntId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [generalProgress, setGeneralProgress] = useState(() => generalSetupProgressFromNavigationState(location.state))
  const [persistedHunt, setPersistedHunt] = useState<Hunt | null>(null)
  const [initialSettings, setInitialSettings] = useState(() => developmentLocationEnabled() ? { ...newHuntDefaults, country: developmentLocation.country, county: developmentLocation.administrativeContext, location: developmentLocation.city } : newHuntDefaults)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('')
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(!huntId)
  const [organizationLoadFailed, setOrganizationLoadFailed] = useState(false)
  const [huntTemplates, setHuntTemplates] = useState<HuntTemplateMetadata[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState(false)
  const [huntOptions, setHuntOptions] = useState<HuntOptions | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(huntId))
  const [loadError, setLoadError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewRefreshing, setReviewRefreshing] = useState(false)
  const [reviewRefreshFailure, setReviewRefreshFailure] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishIssues, setPublishIssues] = useState<HuntReviewIssue[]>([])
  const publishingRef = useRef(false)
  const [creatingAccess, setCreatingAccess] = useState(false)
  const creatingAccessRef = useRef(false)
  const [accessError, setAccessError] = useState('')
  const [linkMessage, setLinkMessage] = useState('')
  const [loadedRewards,setLoadedRewards]=useState<HuntRewards|null>(null)
  const handleRewardsLoaded=useCallback((value:HuntRewards)=>setLoadedRewards(value),[])
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
  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplatesError(false)
    try { setHuntTemplates(await huntTemplatesApi.listHuntTemplates()) }
    catch { setHuntTemplates([]); setTemplatesError(true) }
    finally { setTemplatesLoading(false) }
  }, [])
  useEffect(() => { void loadTemplates() }, [loadTemplates])
  const loadHuntOptions = useCallback(async () => {
    setOptionsLoading(true)
    setOptionsError(false)
    try { setHuntOptions(await huntOptionsApi.listHuntOptions()) }
    catch { setHuntOptions(null); setOptionsError(true) }
    finally { setOptionsLoading(false) }
  }, [])
  useEffect(() => { void loadHuntOptions() }, [loadHuntOptions])
  useEffect(() => {
    if (persistedHunt && huntOptions) setInitialSettings(current => settingsFromHunt(persistedHunt, current, huntOptions))
  }, [persistedHunt, huntOptions])
  useEffect(() => {
    if (generalSetupProgressFromNavigationState(location.state).activeSection === 1) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }
  }, [location.pathname, location.search, location.state, navigate])
  useEffect(() => {
    if (huntId) return
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
  }, [huntId])

  async function saveGeneralSection(section: number, settings: GeneralSetupSettings, selectedTemplateKey: string | null): Promise<GeneralSetupSettings> {
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
        if (!huntId) {
          const nextProgress = generalSetupProgressFromNavigationState({ resumeGeneralSection: 1 })
          setGeneralProgress(nextProgress)
          navigate(`/organizer/hunts/${updated.id}/setup`, { replace: true, state: { resumeGeneralSection: 1 } })
        }
        return synchronized
      }
      if (section === 1) {
        if (!current) throw new Error('Save Hunt details before participants.')
        if (!huntOptions) throw new Error('We couldn\'t load the supported Hunt options.')
        const updated = await huntsApi.updateDraft(current.id, general2Input(settings, huntOptions))
        setPersistedHunt(updated)
        const synchronized = settingsFromHunt(updated, settings, huntOptions)
        setInitialSettings(synchronized)
        return synchronized
      }
      if (section === 2) {
        if (!current) throw new Error('Save Hunt details before experience defaults.')
        if (!huntOptions) throw new Error('We couldn\'t load the supported Hunt options.')
        const updated = await huntsApi.updateDraft(current.id, general3Input(settings, huntOptions))
        setPersistedHunt(updated)
        const synchronized = settingsFromHunt(updated, settings, huntOptions)
        setInitialSettings(synchronized)
        return synchronized
      }
      if (section === 3) {
        if (!current) throw new Error('Save Hunt details before selecting a template.')
        if (!selectedTemplateKey || !huntTemplates.some(template => template.key === selectedTemplateKey)) {
          throw new Error('Select an available Hunt template before completing setup.')
        }
        const updated = await huntsApi.updateDraft(current.id, templateInput(selectedTemplateKey))
        setPersistedHunt(updated)
        // The save response contains the authoritative snapshot; never manufacture one from catalog metadata.
        const synchronized = settingsFromHunt(updated, settings)
        setInitialSettings(synchronized)
        return synchronized
      }
      return settings
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) throw new Error('This Hunt is no longer editable as a draft.')
      if (error instanceof ApiError && error.status === 403) throw new Error('You don\'t have access to update this Hunt.')
      if (error instanceof Error && !(error instanceof ApiError)) throw error
      if (section === 3) throw new Error('We couldn\'t save the Hunt template.')
      throw new Error('We couldn\'t save this section. Please try again.')
    }
  }

  async function openReview() {
    const id = persistedHunt?.id ?? huntId
    if (!id) { setReviewRefreshFailure("We couldn't load the latest saved Hunt."); return }
    setReviewRefreshing(true)
    setReviewRefreshFailure('')
    try {
      const [latest,rewards] = await Promise.all([huntsApi.getHunt(id),huntRewardsApi.list(id)])
      setPersistedHunt(latest)
      setLoadedRewards(rewards)
      setInitialSettings(current => settingsFromHunt(latest, current, huntOptions ?? undefined))
      setPublishError('')
      setPublishIssues([])
      setReviewing(true)
    } catch (error) {
      setReviewRefreshFailure(reviewRefreshError(error))
    } finally {
      setReviewRefreshing(false)
    }
  }

  function editGeneralSection(section: GeneralSection) {
    setReviewing(false)
    setGeneralProgress(current => ({ activeSection: section - 1, completedSections: new Set(current.completedSections) }))
  }

  async function publishHunt() {
    if (publishingRef.current || !persistedHunt || persistedHunt.status !== 'draft' || !reviewHunt(persistedHunt).ready) return
    publishingRef.current = true
    setPublishing(true)
    setPublishError('')
    setPublishIssues([])
    try {
      const published = await huntsApi.publish(persistedHunt.id)
      if (published.status !== 'published') throw new Error('Unexpected publish response')
      setPersistedHunt(published)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const issues = parseHuntNotReady(error.details)
        if (issues) {
          setPublishError('This Hunt is no longer ready to publish.')
          setPublishIssues(issues)
        } else setPublishError("We couldn't publish this Hunt. Please try again.")
      } else if (error instanceof ApiError && error.status === 409) {
        setPublishError('This Hunt is no longer in a publishable draft state.')
        try {
          const latest = await huntsApi.getHunt(persistedHunt.id)
          setPersistedHunt(latest)
        } catch { /* Keep the safe conflict message and current saved Hunt. */ }
      } else if (error instanceof ApiError && error.status === 403) setPublishError("You don't have access to publish this Hunt.")
      else if (error instanceof ApiError && error.status === 404) setPublishError('This Hunt could not be found.')
      else setPublishError("We couldn't publish this Hunt. Please try again.")
    } finally {
      publishingRef.current = false
      setPublishing(false)
    }
  }

  async function createParticipantAccess() {
    if (creatingAccessRef.current || !persistedHunt || persistedHunt.accessCode) return
    creatingAccessRef.current = true
    setCreatingAccess(true)
    setAccessError('')
    setLinkMessage('')
    try {
      const access = await huntsApi.createOrGetAccess(persistedHunt.id)
      setPersistedHunt(current => current ? { ...current, accessCode: access.code } : current)
    } catch (error) {
      setAccessError(accessCreationError(error))
    } finally {
      creatingAccessRef.current = false
      setCreatingAccess(false)
    }
  }

  async function copyRegisteredLink(link: string) {
    setLinkMessage(await copyParticipantLink(link, navigator.clipboard))
  }

  async function shareRegisteredLink(link: string, name: string) {
    setLinkMessage(await shareParticipantLink(link, name, navigator.share?.bind(navigator), navigator.clipboard))
  }

  if (isLoadingDraft) return <main className="grid min-h-dvh place-items-center bg-slate-100 text-slate-700" role="status">Loading Hunt setup…</main>
  if (loadError) return <main className="grid min-h-dvh place-items-center bg-slate-100 p-5"><div className="rounded-2xl border border-rose-200 bg-white p-6 text-center"><p className="font-bold text-rose-700" role="alert">{loadError}</p><button className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 font-bold" onClick={() => void loadDraft()} type="button">Retry</button></div></main>



  if (reviewing && persistedHunt) {
    const review = reviewHunt(persistedHunt)
    const labels = reviewOptionLabels(persistedHunt, huntOptions)
    const snapshot = persistedHunt.templateSnapshot
    const snapshotCheckpointNames = Array.isArray(snapshot?.checkpointNames) ? snapshot.checkpointNames : []
    const displayedIssues = publishIssues.length ? publishIssues : review.issues
    const uniqueIssues = displayedIssues.filter((issue, index, issues) => issues.findIndex(candidate => candidate.message === issue.message && candidate.generalSection === issue.generalSection) === index)
    if (persistedHunt.status === 'published') {
      const link = persistedHunt.accessCode ? participantLink(window.location.origin, persistedHunt.accessCode) : ''
      return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader showProfile/><div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Registered Hunt</p><h1 className="mt-2 text-4xl font-bold">Hunt published</h1>
      <section className="mt-7 rounded-2xl border border-emerald-300 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-2xl font-bold">{persistedHunt.name}</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Status</dt><dd className="font-bold">Published</dd></div><div><dt className="text-slate-500">Template</dt><dd className="font-bold">{snapshot?.displayName || 'Not saved'}</dd></div><div><dt className="text-slate-500">Date</dt><dd className="font-bold">{formatDate(persistedHunt.startDate)} · {formatTime(persistedHunt.startTime)}</dd></div><div><dt className="text-slate-500">Location</dt><dd className="font-bold">{formatLocation(persistedHunt)}</dd></div></dl>
        <HuntSnapshotGeographyInspection hunt={persistedHunt} />
        <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Participant access</p>{persistedHunt.accessCode ? <div className="mt-4"><p className="text-sm font-bold text-slate-600">Hunt code</p><p className="mt-1 text-2xl font-bold tracking-[0.18em]">{persistedHunt.accessCode}</p><label className="mt-4 block text-sm font-bold">Participant link<input aria-label="Hunt invitation link" className={controlClass} readOnly value={link}/></label><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button className="min-h-12 flex-1 rounded-xl border border-emerald-400 bg-white px-4 font-bold" onClick={() => void copyRegisteredLink(link)} type="button">Copy link</button><button className="min-h-12 flex-1 rounded-xl bg-slate-950 px-4 font-bold text-white" onClick={() => void shareRegisteredLink(link, persistedHunt.name)} type="button">Share</button></div><p className="mt-3 text-xs text-slate-500">QR code can be added later.</p>{linkMessage && <p className="mt-3 text-sm font-bold text-emerald-800" role="status">{linkMessage}</p>}</div> : <button className="mt-4 min-h-12 rounded-xl bg-emerald-500 px-5 font-bold disabled:bg-slate-300" disabled={creatingAccess} onClick={() => void createParticipantAccess()} type="button">{creatingAccess ? 'Creating participant access…' : 'Create participant access'}</button>}{accessError && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{accessError}</p>}</div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><Link className="inline-flex min-h-12 items-center rounded-xl bg-emerald-500 px-6 font-bold" to="/organizer">Back to My Hunts</Link></div></section>
    </div></main>
    }
    return <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950"><OrganizerHeader showProfile/><div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <button className="text-sm font-bold text-slate-500" onClick={()=>setReviewing(false)} type="button">← Back to Hunt Features</button>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Block 3</p><h1 className="mt-2 text-4xl font-bold">Review Hunt</h1><p className="mt-3 text-slate-600">Review the latest settings saved for this Hunt.</p>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Registered Hunt</p><h2 className="mt-2 text-2xl font-bold">{persistedHunt.name || 'Unnamed Hunt'}</h2><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabels[persistedHunt.status]}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{review.ready ? 'Ready for publishing' : 'Needs attention'}</span></div></div></div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold">Hunt</h3><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-slate-500">Location</dt><dd className="font-bold">{formatLocation(persistedHunt)}</dd></div><div><dt className="text-slate-500">Date &amp; time</dt><dd className="font-bold">{formatDate(persistedHunt.startDate)} · {formatTime(persistedHunt.startTime)}</dd></div><div><dt className="text-slate-500">Timezone</dt><dd className="font-bold">{persistedHunt.timezone || 'Not saved'}</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="font-bold">{persistedHunt.durationMinutes ? `${persistedHunt.durationMinutes} minutes` : 'Not saved'}</dd></div><div><dt className="text-slate-500">Capacity</dt><dd className="font-bold">{persistedHunt.capacity ? `${persistedHunt.capacity} participants` : 'Not saved'}</dd></div><div><dt className="text-slate-500">Local contact</dt><dd className="font-bold">{persistedHunt.contactName || 'Not saved'}</dd></div></dl></section>
          <section className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold">Template</h3><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-slate-500">Name</dt><dd className="font-bold">{snapshot?.displayName || 'Not saved'}</dd></div><div><dt className="text-slate-500">Theme</dt><dd className="font-bold">{snapshot?.theme || 'Not saved'}</dd></div><div><dt className="text-slate-500">Version</dt><dd className="font-bold">{persistedHunt.templateVersion ?? 'Not saved'}</dd></div><div><dt className="text-slate-500">Route</dt><dd className="font-bold">{snapshot?.checkpointNames ? `${snapshotCheckpointNames.length} checkpoints` : 'Not saved'}</dd></div></dl>{snapshot && snapshotCheckpointNames.length > 0 && <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">Checkpoint names</summary><ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600">{snapshotCheckpointNames.map(name => <li key={name}>{name}</li>)}</ol></details>}</section>
          <section className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold">Pilot configuration</h3><dl className="mt-3 space-y-2 text-sm">{[['Format',labels.format],['Team size',labels.teamSize],['Access',labels.accessMode],['Difficulty',labels.difficulty],['Checkpoint order',labels.checkpointOrder]].map(([term,value])=><div key={term}><dt className="text-slate-500">{term}</dt><dd className="font-bold">{value}</dd></div>)}</dl></section>
        </div>
        <HuntSnapshotGeographyInspection hunt={persistedHunt} />
        <div className="mt-5 grid gap-4"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-slate-500">Rewards</p>{loadedRewards && (loadedRewards.leaderboard.length||loadedRewards.specialAwards.length)?<><p className="mt-1 font-bold">Leaderboard rewards: {loadedRewards.leaderboard.length}</p><p className="mt-1 text-sm font-bold">Special awards: {loadedRewards.specialAwards.length}</p></>:<p className="mt-1 font-bold">No rewards configured</p>}<p className="mt-1 text-xs text-slate-500">Rewards are optional and do not affect readiness.</p></div></div>
        {publishError && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">{publishError}</p>}
        {uniqueIssues.length > 0 && <section className="mt-5 rounded-xl bg-amber-50 p-4" aria-labelledby="review-issues"><h3 className="font-bold text-amber-950" id="review-issues">{publishIssues.length ? 'Publishing issues' : 'Required settings'}</h3><ul className="mt-3 space-y-2">{uniqueIssues.map(issue => <li className="flex flex-wrap items-center justify-between gap-3 text-sm" key={`${issue.generalSection}-${issue.field}-${issue.message}`}><span>{issue.message}</span><button className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-bold" onClick={()=>editGeneralSection(issue.generalSection)} type="button">Fix in General {issue.generalSection}</button></li>)}</ul></section>}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">{persistedHunt.status === 'draft' && <button className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold" onClick={()=>setReviewing(false)} type="button">Edit Hunt</button>}<div className="text-right"><button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-bold disabled:bg-slate-300" disabled={publishing || persistedHunt.status !== 'draft' || !review.ready || publishIssues.length > 0} onClick={() => void publishHunt()} type="button">{publishing ? 'Publishing…' : persistedHunt.status !== 'draft' ? statusLabels[persistedHunt.status] : review.ready && !publishIssues.length ? 'Publish Hunt' : 'Complete required settings'}</button></div></div>
      </section>
    </div></main>
  }


  return (
    <main className="h-dvh overflow-y-auto bg-slate-100 text-slate-950">
      <OrganizerHeader showProfile />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <Link className="text-sm font-bold text-slate-500 hover:text-slate-900" to="/organizer/hunts/new">← Setup options</Link>
        <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Organizer</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Set the Hunt</h1><p className="mt-3 max-w-3xl text-slate-600">Complete General Setup, configure Rewards, then review and publish to create the participant link.</p></div>

        {reviewRefreshing && <p className="mt-5 rounded-xl bg-white p-4 text-sm font-semibold text-slate-600" role="status">Refreshing saved Hunt…</p>}
        {reviewRefreshFailure && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-700" role="alert">{reviewRefreshFailure}</p><button className="min-h-10 rounded-lg border border-rose-200 bg-white px-4 text-sm font-bold" onClick={() => void openReview()} type="button">Retry</button></div>}
        {!huntId && isLoadingOrganizations && <p className="mt-5 text-sm font-semibold text-slate-500" role="status">Loading your organizations…</p>}
        {!huntId && !isLoadingOrganizations && !organizationLoadFailed && organizations.length === 0 && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">You need access to an organization before a Hunt draft can be created.</p>}
        {!huntId && organizationLoadFailed && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">We couldn\'t load your organizations. Refresh the page to try again.</p>}
        <GeneralSetup initialProgress={generalProgress} initialSettings={initialSettings} organizations={organizations} selectedOrganizationId={selectedOrganizationId} templates={huntTemplates} templatesLoading={templatesLoading} templatesError={templatesError} huntOptions={huntOptions} optionsLoading={optionsLoading} optionsError={optionsError} savedTemplateKey={persistedHunt?.templateKey ?? null} savedTemplateSnapshot={persistedHunt?.templateSnapshot ?? null} onRetryTemplates={() => void loadTemplates()} onRetryOptions={() => void loadHuntOptions()} onOrganizationChange={setSelectedOrganizationId} onSave={saveGeneralSection} />

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="rewards-title">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Block 2</p><h2 className="mt-2 text-2xl font-bold" id="rewards-title">Rewards</h2>
          <p className="mt-1 text-sm text-slate-500">Checkpoints, challenges and the route come from the approved Template saved with this Hunt.</p>
          {persistedHunt ? <RewardsEditor huntId={persistedHunt.id} huntStatus={persistedHunt.status} onLoaded={handleRewardsLoaded} teamSize={persistedHunt.teamSize ?? 4} />
            : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-950">Save Hunt details before configuring rewards.</p>}
        </section>

        <section className={`mt-8 rounded-2xl border p-5 shadow-sm sm:p-6 ${persistedHunt?'border-emerald-300 bg-white':'border-slate-200 bg-slate-50'}`} aria-labelledby="review-hunt-title">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className={`text-xs font-semibold uppercase tracking-[0.16em] ${persistedHunt?'text-emerald-700':'text-slate-400'}`}>Block 3</p><h2 className={`mt-2 text-2xl font-bold ${persistedHunt?'text-slate-950':'text-slate-500'}`} id="review-hunt-title">Review Hunt</h2><p className="mt-1 text-sm text-slate-500">Check the saved setup, publish, then create the participant link.</p></div>
            <button className="min-h-12 rounded-xl bg-emerald-500 px-6 font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500" disabled={reviewRefreshing || !persistedHunt} onClick={() => void openReview()} type="button">{reviewRefreshing ? 'Refreshing saved Hunt…' : 'Review saved Hunt'}</button>
          </div>
        </section>
      </div>
    </main>
  )
}
