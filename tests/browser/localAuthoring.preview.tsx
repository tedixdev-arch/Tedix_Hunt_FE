import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CreatorStudioNavigation } from '../../src/features/creator/CreatorStudioNavigation'
import { CreatorTemplateEditorPage } from '../../src/pages/CreatorStudio'
import { AuthProvider } from '../../src/app/providers/AuthProvider'
import { authApi } from '../../src/services/api'
import { creatorTemplatesApi, type CreatorTemplate } from '../../src/services/api/creatorTemplates'
import { universalLibraryApi } from '../../src/services/api/universalLibrary'
import { geographyApi } from '../../src/services/api/geography'
import '../../src/index.css'
import '../../src/shared/theme/theme.css'
import '../../src/shared/theme/global.css'
// Deterministic FE-only fixture. No real account or backend writes.
authApi.bootstrapSession = async () => null
const scope = window as typeof window & { fixtureCalls: unknown[]; registryName: string }
scope.fixtureCalls = []; scope.registryName = 'Original town'
let record: CreatorTemplate | null = JSON.parse(sessionStorage.getItem('local-authoring-fixture') ?? 'null')
const place = { id:'11111111-1111-4111-8111-111111111111', countryCode:'RO', countryDisplayName:'Romania', name:'Original town', administrativeContext:'Northern county',latitude:46,longitude:23 }
const product = { id:'22222222-2222-4222-8222-222222222222',key:'shared-story',displayName:'Shared approved story',theme:'City',creator:{id:'other',name:'Another Creator'},publishedReference:{templateId:'22222222-2222-4222-8222-222222222222',version:2} }
const content = { key:product.key,version:2,displayName:product.displayName,theme:product.theme,mission:{name:'Approved story'},configuration:{normalCheckpointCount:1,checkpointPositions:[]},scoring:{model:'platform'},checkpoints:[{role:'normal',checkpoint:1},{role:'terminal'}] }
const store = (value: CreatorTemplate) => { record=value;sessionStorage.setItem('local-authoring-fixture',JSON.stringify(value));return structuredClone(value) }
creatorTemplatesApi.create = async (content,category,localityId) => { scope.fixtureCalls.push({method:'create',category,content,localityId});return store({key:content.key,version:1,category,status:'draft',content,localityId:localityId??null,localitySnapshot:localityId?place:null}) }
creatorTemplatesApi.fromUniversal = async (sourceKey,key,publishedReference) => { scope.fixtureCalls.push({method:'copy',sourceKey,key,publishedReference});await new Promise(done=>setTimeout(done,80));return store({key,version:1,status:'draft',category:'local',content:{...content,key,version:1},localityId:null,localitySnapshot:null}) }
creatorTemplatesApi.get = async key => { scope.fixtureCalls.push({method:'get',key});if(!record) throw new Error('Missing fixture');return structuredClone(record) }
creatorTemplatesApi.createVersion = async (key,content,localityId) => { scope.fixtureCalls.push({method:'version',key,content,...(localityId!==undefined?{localityId}:{})});return store({...record!,version:content.version,content,...(localityId!==undefined?{localityId,localitySnapshot:localityId?{...place,name:scope.registryName}:null}:{})}) }
universalLibraryApi.list=async()=>({items:[product]});universalLibraryApi.get=async()=>({...product,content})
geographyApi.countries=async()=>({countries:[{code:'RO',displayName:'Romania'},{code:'US',displayName:'United States'}]})
geographyApi.get=async()=>({...place,name:scope.registryName,active:true})
geographyApi.search=async(countryCode,q)=>({localities:countryCode==='RO'&&q.trim()?[{...place,name:scope.registryName,active:true},{...place,id:'33333333-3333-4333-8333-333333333333',name:scope.registryName,administrativeContext:'Southern county',active:true}]:[],providerStatus:'not_requested'})
const initial = new URLSearchParams(location.search).has('open')&&record?`/create?template=${record.key}`:'/creator'
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={[initial]}><AuthProvider><Routes><Route path="/creator" element={<main className="h-dvh overflow-y-auto bg-slate-100 p-4 sm:p-8"><CreatorStudioNavigation /></main>} /><Route path="/create" element={<CreatorTemplateEditorPage />} /></Routes></AuthProvider></MemoryRouter>)
