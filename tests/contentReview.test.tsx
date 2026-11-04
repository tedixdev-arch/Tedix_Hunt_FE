import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ContentStudio } from '../src/features/creator/content/ContentStudio'
import { ContentReviewWorkspace } from '../src/pages/AdminContentReview'
import { creatorContentApi, type LibraryContent } from '../src/services/api/creatorContent'
import { adminContentReviewApi, AdminContentReviewApi, reviewCommentValid, reviewError, type ContentReviewItem } from '../src/services/api/adminContentReview'
import { ApiClient, ApiError } from '../src/services/api/client'
import { LocalSessionStore } from '../src/services/api/session'
import { prototypes } from '../src/features/creator/exercises/catalog'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { teamExample } from '../src/features/creator/exercises/teamExamples'
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }) } }))
const saved: LibraryContent = { contentId:'content',revisionId:'exact-revision',ownerId:'creator',version:1,status:'draft',createdAt:'2026-01-01',updatedAt:'2026-01-01',category:'Science',curriculum:{},geography:{scope:'universal'},exercise:toPersistence(authorPrototype(prototypes[0])),reviewEvents:[] }
const item: ContentReviewItem = {contentId:saved.contentId,revisionId:saved.revisionId,version:1,status:'submitted',title:saved.exercise.title,classification:'personal',type:saved.exercise.type,category:'Science',curriculum:{},geographicScope:'universal',countryCode:null,admin1Code:null,geographicId:null,submittedAt:'2026-01-02'}
async function harness(element:ReactNode,run:(h:{host:HTMLDivElement;click:(name:string)=>Promise<void>;change:(label:string,value:string)=>Promise<void>})=>Promise<void>){
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true)
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host)
 const router=createMemoryRouter([{path:'/',element}])
 const click=async(name:string)=>{const button=[...host.querySelectorAll('button')].find(b=>b.textContent===name||b.getAttribute('aria-label')===name);expect(button,`button ${name}`).toBeDefined();await act(async()=>button!.click())}
 const change=async(label:string,value:string)=>{const input=host.querySelector<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`[aria-label="${label}"]`)!;expect(input).not.toBeNull();await act(async()=>{Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input),'value')!.set!.call(input,value);input.dispatchEvent(new Event(input instanceof HTMLSelectElement?'change':'input',{bubbles:true}))})}
 try{await act(async()=>root.render(<RouterProvider router={router}/>));await run({host,click,change})}
 finally{act(()=>root.unmount());router.dispose();host.remove();vi.restoreAllMocks();vi.unstubAllGlobals()}
}
function creator(record=saved){vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:[record],nextAfter:null});vi.spyOn(creatorContentApi,'get').mockResolvedValue(record)}
function admin(record={...saved,status:'submitted' as const}){vi.spyOn(adminContentReviewApi,'list').mockResolvedValue({items:[item],nextAfter:null});vi.spyOn(adminContentReviewApi,'detail').mockResolvedValue(record)}
test('save then submit exact confirmed revision once; pending and submitted states cannot edit',async()=>{
 const create=vi.spyOn(creatorContentApi,'create').mockResolvedValue(saved)
 let finish!:(r:LibraryContent)=>void
 const submit=vi.spyOn(creatorContentApi,'submit').mockImplementation(()=>new Promise(resolve=>{finish=resolve}))
 await harness(<ContentStudio active/>,async({host,click,change})=>{
  expect(host.textContent).not.toContain('Submit for Approval')
  await change('Exercise category','Science');await click('Add Exercise');expect(create).toHaveBeenCalledTimes(1)
  await click('Submit for Approval');await click('Please wait…');expect(submit).toHaveBeenCalledTimes(1);expect(submit).toHaveBeenCalledWith('content','exact-revision')
  expect(host.textContent).not.toContain('Submitted for Review')
  await act(async()=>finish({...saved,status:'submitted'}))
  expect(host.textContent).toContain('Submitted for Review');expect(host.querySelector('[aria-label="Edit Title"]')).toBeNull()
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Exercise category"]')!.disabled).toBe(true)
 })
})
test('unsaved title and classification prevent submission until exact new revision is saved',async()=>{
 creator();const submit=vi.spyOn(creatorContentApi,'submit').mockResolvedValue({...saved,status:'submitted'})
 const update=vi.spyOn(creatorContentApi,'update').mockResolvedValue({...saved,revisionId:'new-revision'})
 await harness(<ContentStudio active/>,async({host,click,change})=>{
  await click('My Content');await click(`Edit ${saved.exercise.title}`);await click('Edit Title');await change('Title','Changed title')
  await click('Submit for Approval');expect(submit).not.toHaveBeenCalled();expect(host.textContent).toContain('Save Changes before submitting')
  await click('Save Changes');expect(update).toHaveBeenCalledWith(saved.contentId,saved.revisionId,expect.anything())
  await click('Submit for Approval');expect(submit).toHaveBeenCalledWith(saved.contentId,'new-revision')
 })
})
test('missing saved category gives actionable validation without calling submit',async()=>{
 creator({...saved,category:null});const submit=vi.spyOn(creatorContentApi,'submit')
 await harness(<ContentStudio active/>,async({host,click})=>{await click('My Content');await click(`Edit ${saved.exercise.title}`);await click('Submit for Approval');expect(submit).not.toHaveBeenCalled();expect(host.textContent).toContain('Choose a category and Save Changes')})
})
for(const status of ['submitted','approved','archived'] as const)test(`${status} opens playable read-only saved content`,async()=>{
 creator({...saved,status});const update=vi.spyOn(creatorContentApi,'update')
 await harness(<ContentStudio active/>,async({host,click})=>{await click('My Content');await click(`View ${saved.exercise.title}`);expect(host.querySelector('[aria-label="Edit Title"]')).toBeNull();expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull();expect(update).not.toHaveBeenCalled()})
})
test('changes requested feedback is plain text and Revise clones exact revision into shared editor',async()=>{
 const reviewed={...saved,status:'changes_requested' as const,reviewEvents:[{eventId:'event',contentId:saved.contentId,revisionId:saved.revisionId,actorUserId:'admin',decision:'changes_requested' as const,comment:'Explain the second hint <script>unsafe</script>',decidedAt:'2026-01-02'}]}
 const before=structuredClone(reviewed);creator(reviewed)
 const clone=vi.spyOn(creatorContentApi,'clone').mockResolvedValue({...saved,revisionId:'new-draft',version:2})
 await harness(<ContentStudio active/>,async({host,click})=>{await click('My Content');expect(host.textContent).toContain(reviewed.reviewEvents[0].comment);expect(host.querySelector('script')).toBeNull();await click(`Revise ${saved.exercise.title}`);expect(clone).toHaveBeenCalledWith(saved.contentId,saved.revisionId);expect(host.querySelector('[aria-label="Edit Title"]')).not.toBeNull();expect(host.textContent).toContain(reviewed.reviewEvents[0].comment);expect(reviewed).toEqual(before)})
})
test('My Content includes every current lifecycle status',async()=>{
 vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:(['draft','submitted','approved','changes_requested','archived'] as const).map(status=>({...saved,contentId:status,status})),nextAfter:null})
 await harness(<ContentStudio active/>,async({host,click})=>{await click('My Content');for(const status of ['Draft','Submitted','Approved','Changes Requested','Archived'])expect(host.querySelector('[aria-label="My Content"]')!.textContent).toContain(status)})
})
for(const team of [false,true])test(`Admin plays exact ${team?'Team':'Personal'} revision and approves once after response`,async()=>{
 const record={...saved,status:'submitted' as const,exercise:team?toPersistence(authorPrototype(teamExample('scrambled-word'))):saved.exercise};admin(record)
 let finish!:(r:LibraryContent)=>void
 const decide=vi.spyOn(adminContentReviewApi,'decide').mockImplementation(()=>new Promise(resolve=>{finish=resolve}))
 await harness(<ContentReviewWorkspace reviewerId="admin"/>,async({host,click})=>{
  await click(`Review ${item.title}`);expect(adminContentReviewApi.detail).toHaveBeenCalledWith(item.contentId,item.revisionId)
  expect(host.querySelector('[aria-label="Edit Title"]')).toBeNull();expect(host.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  const details=host.querySelector<HTMLDetailsElement>('details')!;expect(details.open).toBe(false)
  await click('Approve');await click('Approve');expect(decide).toHaveBeenCalledTimes(1);expect(decide).toHaveBeenCalledWith(item.contentId,item.revisionId,'approve','');expect(host.textContent).not.toContain('Exercise approved.')
  vi.mocked(adminContentReviewApi.list).mockResolvedValue({items:[],nextAfter:null});await act(async()=>finish({...record,status:'approved'}))
  expect(host.textContent).toContain('Exercise approved.');expect(host.textContent).toContain('No submissions awaiting review.')
 })
})
test('Request Changes requires meaningful feedback and submits trimmed plain text',async()=>{
 admin();const decide=vi.spyOn(adminContentReviewApi,'decide').mockResolvedValue({...saved,status:'changes_requested'})
 await harness(<ContentReviewWorkspace reviewerId="admin"/>,async({host,click,change})=>{await click(`Review ${item.title}`);await click('Request Changes');await change('Review comment',' ... ');await click('Send Request');expect(decide).not.toHaveBeenCalled();expect(host.querySelector('[role="alert"]')!.textContent).toContain('3–1000');await change('Review comment','  Explain why this is correct.  ');await click('Send Request');expect(decide).toHaveBeenCalledWith(saved.contentId,saved.revisionId,'request-changes','  Explain why this is correct.  ');expect(host.textContent).toContain('Changes requested.')})
})
for(const status of [400,401,403,404,409,null] as const)test(`Admin decision handles ${status} without premature success`,async()=>{
 admin();const list=vi.mocked(adminContentReviewApi.list)
 const decide=vi.spyOn(adminContentReviewApi,'decide').mockRejectedValue(new ApiError(status===403?'content_self_review_forbidden':'server-private',status,'http'))
 await harness(<ContentReviewWorkspace reviewerId="admin"/>,async({host,click})=>{await click(`Review ${item.title}`);await click('Approve');expect(decide).toHaveBeenCalledTimes(1);expect(host.textContent).not.toContain('Exercise approved.');expect(host.querySelector('[role="alert"]')).not.toBeNull();expect(host.textContent).not.toContain('server-private');if(status===409||status===404){expect(list).toHaveBeenCalledTimes(2);expect(host.querySelector('[aria-label="Saved exercise preview"]')).toBeNull()}if(status===null)expect(adminContentReviewApi.detail).toHaveBeenCalledTimes(2);if(status===403)expect(host.textContent).toContain('cannot review your own exercise')})
})
test('dual-role self-review disables decisions; backend 403 is separately handled',async()=>{
 admin();const decide=vi.spyOn(adminContentReviewApi,'decide')
 await harness(<ContentReviewWorkspace reviewerId="creator"/>,async({host,click})=>{await click(`Review ${item.title}`);await click('Approve');expect(decide).not.toHaveBeenCalled();expect(host.textContent).toContain('Another Admin must review your exercise.');expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Approve')!.disabled).toBe(true)})
})
test('Admin queue follows revision pagination and deduplicates rows',async()=>{
 vi.spyOn(adminContentReviewApi,'list').mockResolvedValueOnce({items:[item],nextAfter:'revision-cursor'}).mockResolvedValueOnce({items:[item,{...item,revisionId:'second',title:'Another exercise'}],nextAfter:null})
 await harness(<ContentReviewWorkspace/>,async({host,click})=>{await click('Load more');expect(adminContentReviewApi.list).toHaveBeenLastCalledWith('revision-cursor');expect(host.querySelectorAll('li')).toHaveLength(2)})
})
for(const status of [400,401,403,404,409,null] as const)test(`Creator submission ${status} retains saved exercise and has no success`,async()=>{
 creator();vi.spyOn(creatorContentApi,'submit').mockRejectedValue(new ApiError('private',status,'http'))
 await harness(<ContentStudio active/>,async({host,click})=>{await click('My Content');await click(`Edit ${saved.exercise.title}`);await click('Submit for Approval');expect(host.textContent).not.toContain('Submitted for Review');expect(host.querySelector('[role="alert"]')).not.toBeNull();expect(host.querySelector('[aria-label="Edit Title"]')).not.toBeNull()})
})
test('Admin contract paths, authentication and trimmed meaningful comment',async()=>{
 const calls:{url:string;init?:RequestInit}[]=[];const session=new LocalSessionStore();session.saveSession({accessToken:'test'})
 const client=new ApiClient('https://fixture.test',session,async(url,init)=>{calls.push({url:String(url),init});return new Response('{}',{headers:{'Content-Type':'application/json'}})})
 const api=new AdminContentReviewApi(client)
 await api.list('revision/cursor');await api.detail('content/id','revision/id');await api.decide('content/id','revision/id','approve');await api.decide('content/id','revision/id','request-changes','  Please clarify.  ')
 expect(calls.map(c=>[c.init?.method,c.url])).toEqual([['GET','https://fixture.test/api/admin/content/review?limit=20&after=revision%2Fcursor'],['GET','https://fixture.test/api/admin/content/review/content%2Fid/revisions/revision%2Fid'],['POST','https://fixture.test/api/admin/content/review/content%2Fid/revisions/revision%2Fid/approve'],['POST','https://fixture.test/api/admin/content/review/content%2Fid/revisions/revision%2Fid/request-changes']])
 expect(JSON.parse(String(calls[3].init?.body))).toEqual({comment:'Please clarify.'});calls.forEach(c=>expect(new Headers(c.init?.headers).get('Authorization')).toBe('Bearer test'));session.clearSession()
 for(const comment of ['','   ','...','a','a'.repeat(1001)])expect(reviewCommentValid(comment)).toBe(false)
 expect(reviewCommentValid('  Știință  ')).toBe(true)
 expect(reviewError(new ApiError('private',500,'http'))).not.toContain('private')
})
