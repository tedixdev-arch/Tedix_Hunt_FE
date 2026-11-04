import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, test, vi } from 'vitest'
import { ApprovedExercises, approvedFilters } from '../src/features/creator/content/ApprovedExercises'
import { ContentLibrary } from '../src/features/creator/content/ContentLibrary'
import { initialFilters } from '../src/features/creator/content/catalog'
import { CreatorContentApi, creatorContentApi, type ApprovedContent, type ApprovedDetail, type ApprovedPage } from '../src/services/api/creatorContent'
import { ApiClient, ApiError } from '../src/services/api/client'
import { prototypes, personalTypes, teamNames } from '../src/features/creator/exercises/catalog'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { teamExample } from '../src/features/creator/exercises/teamExamples'
import { geographyApi } from '../src/services/api/geography'
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: vi.fn(async () => ({ countries: [] })), regions: vi.fn(async () => ({regions:[],nextAfter:null})), city: vi.fn(), cities: vi.fn() } }))
const item: ApprovedContent = { contentId:'other-creators-content', revisionId:'approved-old-revision', version:1,status:'approved',classification:'personal',type:'single-choice',title:'Another Creator’s exercise',category:'Mathematics',curriculum:{grade:'7'},geography:{scope:'universal'} }
const detail: ApprovedDetail = {...item,exercise:toPersistence(authorPrototype({...prototypes[1],title:item.title}))}
const deferred = <T,>() => { let resolve!:(v:T)=>void;let reject!:(e:unknown)=>void;const promise=new Promise<T>((r,j)=>{resolve=r;reject=j});return {promise,resolve,reject} }
afterEach(()=>vi.restoreAllMocks())
async function mount(element:ReactNode, run:(h:{host:HTMLDivElement;click:(text:string)=>Promise<void>;change:(label:string,value:string)=>Promise<void>})=>Promise<void>) {
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true)
 Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(){this.setAttribute('open','')}})
 Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(){this.removeAttribute('open')}})
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host)
 const click=async(text:string)=>{const b=[...host.querySelectorAll('button')].find(b=>b.textContent===text||b.getAttribute('aria-label')===text);expect(b, text).toBeDefined();await act(async()=>b!.click())}
 const change=async(label:string,value:string)=>{const f=label==='Search'?host.querySelector('input[type="search"]')!:host.querySelector(`[aria-label="${label}"]`)!;await act(async()=>{Object.getOwnPropertyDescriptor(Object.getPrototypeOf(f),'value')!.set!.call(f,value);f.dispatchEvent(new Event(f instanceof HTMLSelectElement?'change':'input',{bubbles:true}))})}
 try {await act(async()=>root.render(element));await run({host,click,change})}finally{act(()=>root.unmount());host.remove();vi.unstubAllGlobals()}
}
function feed(){return vi.spyOn(creatorContentApi,'approved').mockResolvedValue({items:[item],nextAfter:null})}
test('authenticated discovery client sends bounded backend filters and exact escaped revision URL',async()=>{
 const client=new ApiClient();const get=vi.spyOn(client,'get').mockResolvedValue({items:[],nextAfter:null});const api=new CreatorContentApi(client)
 await api.approved({classification:'team',type:'filter-noise',q:'100%_ + $x$',countryCode:'RO',geographicId:'683506'},'opaque cursor')
 const url=new URL(get.mock.calls[0][0],'http://local');expect(url.pathname).toBe('/api/creator/content/approved');expect(Object.fromEntries(url.searchParams)).toEqual({limit:'20',classification:'team',type:'filter-noise',q:'100%_ + $x$',countryCode:'RO',geographicId:'683506',after:'opaque cursor'})
 await api.approvedRevision('id/one','rev/two');expect(get).toHaveBeenLastCalledWith('/api/creator/content/approved/id%2Fone/revisions/rev%2Ftwo')
})
test('Library defaults to My Content, keeps Starters, and discovers across Creators without mutation controls',async()=>{
 vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:[],nextAfter:null});const list=feed();const edit=vi.fn()
 await mount(<ContentLibrary onEdit={edit}/>,async({host,click})=>{expect(list).not.toHaveBeenCalled();expect(host.textContent).toContain('Starter (15 examples)');await click('Approved Exercises');expect(host.textContent).toContain(item.title);expect(host.textContent).not.toContain('Starter (');expect([...host.querySelectorAll('li button')].map(b=>b.textContent)).toEqual(['Preview']);expect(edit).not.toHaveBeenCalled();await click('My Content');expect(host.textContent).toContain('Starter (15 examples)')})
})
for(const [classification,mechanics] of [['personal',personalTypes.map(([type])=>type)],['team',Object.keys(teamNames)]] as const) for(const type of mechanics) test(`backend mechanic filter and shared playable exact preview: ${type}`,async()=>{
 const exercise=classification==='personal'?prototypes.find(e=>e.type===type)!:teamExample(type as keyof typeof teamNames)
 const row={...item,classification,type:exercise.type as ApprovedContent['type']};const list=feed();list.mockResolvedValue({items:[row],nextAfter:null})
 const exact=vi.spyOn(creatorContentApi,'approvedRevision').mockResolvedValue({...row,exercise:toPersistence(authorPrototype(exercise))})
 await mount(<ApprovedExercises classification={classification}/>,async({host,change,click})=>{await change('Exercise mechanic',type);expect(list).toHaveBeenLastCalledWith({classification,type},undefined);await click(`Preview ${row.title}`);expect(exact).toHaveBeenCalledWith(row.contentId,row.revisionId);expect(host.querySelector('dialog')).not.toBeNull();expect(host.textContent).toContain('Read-only preview');expect(host.querySelector('dialog [role="alert"]')).toBeNull();expect(host.querySelector('dialog')!.textContent).not.toContain(exercise.solution);await click('Close')})
})
for(const category of ['Mathematics','History','Science','Mixed'])test(`canonical category backend filter: ${category}`,async()=>{const list=feed();await mount(<ApprovedExercises classification="personal"/>,async({change,host})=>{await change('Content category',category);expect(list).toHaveBeenLastCalledWith({classification:'personal',category},undefined);expect(host.textContent).not.toContain('Main →')})})
test('grade and unspecified are distinct filters; literal search is sent without client filtering',async()=>{const list=feed();await mount(<ApprovedExercises classification="personal"/>,async({change,host})=>{await change('Content category','Mathematics');for(const grade of ['5','12','unspecified']){await change('Grade',grade);expect(list.mock.calls.at(-1)![0].grade).toBe(grade)}await change('Search','100%_');expect(list.mock.calls.at(-1)![0].q).toBe('100%_');expect(host.textContent).toContain(item.title);await change('Content category','History');expect(list.mock.calls.at(-1)![0].grade).toBeUndefined()})})
test('canonical location query preserves exact city and never sends region together with city',()=>{for(const [scope,expected] of [[{country:'',region:'',city:''},{}],[{country:'RO',region:'',city:''},{countryCode:'RO'}],[{country:'RO',region:'13',city:''},{countryCode:'RO',admin1Code:'13'}],[{country:'RO',region:'13',city:'683506'},{countryCode:'RO',geographicId:'683506'}]] as const)expect(approvedFilters('personal',{...initialFilters,scope})).toEqual({classification:'personal',...expected})})
test('pagination repeats filters, blocks duplicate requests, deduplicates rows and resets on change',async()=>{
 const next=deferred<ApprovedPage>();const list=feed().mockResolvedValueOnce({items:[item],nextAfter:'opaque'}).mockImplementationOnce(()=>next.promise)
 await mount(<ApprovedExercises classification="personal"/>,async({click,change,host})=>{await click('Load More');await click('Load More');expect(list).toHaveBeenCalledTimes(2);expect(list).toHaveBeenLastCalledWith({classification:'personal'},'opaque');await act(async()=>next.resolve({items:[item,{...item,contentId:'second',title:'Second'}],nextAfter:null}));expect(host.querySelectorAll('li')).toHaveLength(2);await change('Search','new');expect(list).toHaveBeenLastCalledWith({classification:'personal',q:'new'},undefined)})
})
test('late search and pagination responses cannot replace current results',async()=>{
 const old=deferred<ApprovedPage>();const list=feed().mockImplementationOnce(()=>old.promise)
 await mount(<ApprovedExercises classification="personal"/>,async({change,host})=>{await change('Search','current');expect(host.textContent).toContain(item.title);await act(async()=>old.resolve({items:[{...item,title:'Stale search'}],nextAfter:'stale'}));expect(host.textContent).not.toContain('Stale search');expect(host.textContent).not.toContain('Load More');expect(list).toHaveBeenCalledTimes(2)})
})
for(const status of [400,401,403,null])test(`discovery ${status??'network'} failure is not empty; recovery starts a fresh search`,async()=>{
 const list=feed().mockRejectedValueOnce(new ApiError('raw-token-secret',status,'http'))
 await mount(<ApprovedExercises classification="personal"/>,async({host,click})=>{expect(host.querySelector('[role="alert"]')).not.toBeNull();expect(host.textContent).not.toContain('No approved exercises');expect(host.textContent).not.toContain('raw-token-secret');await click('Refresh search');expect(list).toHaveBeenLastCalledWith({classification:'personal'},undefined);expect(host.textContent).toContain(item.title)})
})
for(const status of [400,401,403,404,null])test(`exact preview ${status??'network'} failure never substitutes a revision`,async()=>{
 feed();vi.spyOn(creatorContentApi,'approvedRevision').mockRejectedValue(new ApiError('private-id',status,'http'));const fallback=vi.spyOn(creatorContentApi,'revision')
 await mount(<ApprovedExercises classification="personal"/>,async({host,click})=>{await click(`Preview ${item.title}`);expect(host.querySelector('dialog')).toBeNull();expect(host.querySelector('[role="alert"]')).not.toBeNull();expect(fallback).not.toHaveBeenCalled()})
})
test('mismatched detail cannot open a substitute preview',async()=>{feed();vi.spyOn(creatorContentApi,'approvedRevision').mockResolvedValue({...detail,revisionId:'newer-draft'});await mount(<ApprovedExercises classification="personal"/>,async({host,click})=>{await click(`Preview ${item.title}`);expect(host.querySelector('dialog')).toBeNull()})})
test('expired or tampered Load More cursor offers a fresh search without replaying the cursor',async()=>{
 const list=feed().mockResolvedValueOnce({items:[item],nextAfter:'opaque-expired-token'}).mockRejectedValueOnce(new ApiError('invalid_cursor',400,'bad_request'))
 await mount(<ApprovedExercises classification="personal"/>,async({click,host})=>{await click('Load More');expect(host.textContent).toContain('Refresh the search');expect(host.textContent).not.toContain('opaque-expired-token');await click('Refresh search');expect(list).toHaveBeenLastCalledWith({classification:'personal'},undefined)})
})
test('late pagination cannot append stale rows after a filter change',async()=>{
 const old=deferred<ApprovedPage>();const list=feed().mockResolvedValueOnce({items:[item],nextAfter:'old-page'}).mockImplementationOnce(()=>old.promise)
 await mount(<ApprovedExercises classification="personal"/>,async({click,change,host})=>{await click('Load More');await change('Content category','Science');await act(async()=>old.resolve({items:[{...item,title:'Stale page'}],nextAfter:'old-next'}));expect(host.textContent).not.toContain('Stale page');expect(list).toHaveBeenLastCalledWith({classification:'personal',category:'Science'},undefined)})
})
test('failed exact city lookup retains selection and blocks discovery until a successful retry',async()=>{
 vi.mocked(geographyApi.countries).mockResolvedValue({countries:[{code:'RO',displayName:'Romania'}]})
 const city={geographicId:'683506',countryCode:'RO',admin1Code:'13',name:'Cluj-Napoca',countryDisplayName:'Romania',regionDisplayName:'Cluj',regionStatus:'resolved'} as never
 vi.mocked(geographyApi.cities).mockResolvedValue({cities:[city]} as never)
 vi.mocked(geographyApi.city).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(city)
 const list=feed()
 await mount(<ApprovedExercises classification="personal"/>,async({change,click,host})=>{
  await change('Content country','RO');await change('Find content city','Cluj');await act(async()=>{await new Promise(r=>setTimeout(r,300))})
  const before=list.mock.calls.length;await change('Content city','683506');expect(list).toHaveBeenCalledTimes(before);expect(host.textContent).toContain('saved location is retained');expect((host.querySelector('[aria-label="Content city"]') as HTMLSelectElement).value).toBe('683506')
  await click('Retry geography');expect(list).toHaveBeenLastCalledWith({classification:'personal',countryCode:'RO',geographicId:'683506'},undefined)
 })
})
