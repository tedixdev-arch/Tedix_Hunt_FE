import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ContentStudio } from '../src/features/creator/content/ContentStudio'
import { creatorContentApi, type LibraryContent } from '../src/services/api/creatorContent'
import { ApiError } from '../src/services/api/client'
import { prototypes } from '../src/features/creator/exercises/catalog'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }) } }))
const saved: LibraryContent = { contentId: 'content', revisionId: 'revision-1', ownerId: 'owner', version: 1, status: 'draft', createdAt: '2026-01-01', updatedAt: '2026-01-01', category: null, curriculum: {}, geography: { scope: 'universal' }, exercise: toPersistence(authorPrototype(prototypes[0])) }
async function harness(run: (h: { host: HTMLDivElement; router: ReturnType<typeof createMemoryRouter>; click: (s: string) => Promise<void>; edit: (s: string) => Promise<void> }) => Promise<void>) {
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host)
 const router=createMemoryRouter([{path:'/',element:<ContentStudio active/>},{path:'/away',element:<p>Away</p>}])
 const click=async(name:string)=>{await act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent===name || b.getAttribute('aria-label')===name)!.click())}
 const edit=async(text:string)=>{if (!host.querySelector('[aria-label="Title"]')) await click('Edit Title');const field=host.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!;await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(field,text);field.dispatchEvent(new Event('input',{bubbles:true}))})}
 try {await act(async()=>root.render(<RouterProvider router={router}/>));await run({host,router,click,edit})}
 finally {act(()=>root.unmount());router.dispose();host.remove();vi.restoreAllMocks();vi.unstubAllGlobals()}
}
test('pending save prevents duplicate submissions and only confirmed success resets dirty baseline',async()=>{
 let resolve!: (v: LibraryContent)=>void
 const create=vi.spyOn(creatorContentApi,'create').mockImplementation(()=>new Promise(r=>{resolve=r}))
 await harness(async({host,click,edit,router})=>{
  await edit('Durable');await click('Add Exercise')
  expect(host.textContent).not.toContain('Saved to Library.')
  expect(host.querySelector<HTMLButtonElement>('[aria-busy="true"]')!.disabled).toBe(true)
  await click('Saving…');expect(create).toHaveBeenCalledTimes(1)
  await act(async()=>resolve({...saved,exercise:{...saved.exercise,title:'Durable'}}))
  expect(host.textContent).toContain('Saved to Library.');expect(host.textContent).toContain('View in Library')
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false)
  await act(async()=>{void router.navigate('/away')});expect(router.state.location.pathname).toBe('/away');expect(confirm).not.toHaveBeenCalled()
 })
})
test('conflict retains local edits, canceled reload is safe, confirmed reload advances the base revision',async()=>{
 vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:[saved],nextAfter:null})
 const get=vi.spyOn(creatorContentApi,'get').mockResolvedValue(saved)
 const update=vi.spyOn(creatorContentApi,'update').mockRejectedValue(new ApiError('revision_conflict',409,'conflict'))
 await harness(async({host,click,edit})=>{
  await click('Library');await act(async()=>host.querySelector<HTMLButtonElement>(`[aria-label="Edit ${saved.exercise.title}"]`)!.click())
  await edit('Local retained');await click('Save Changes');expect(host.querySelector('[role="alert"]')!.textContent).toContain('Your edits are still here')
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false)
  await click('Reload saved version');expect(get).toHaveBeenCalledTimes(1);expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toBe('Local retained')
  confirm.mockReturnValue(true);get.mockResolvedValue({...saved,revisionId:'revision-2',version:2})
  await click('Reload saved version');await edit('New local')
  update.mockResolvedValue({...saved,revisionId:'revision-3',version:3})
  await click('Save Changes');expect(update.mock.calls.at(-1)?.slice(0,2)).toEqual(['content','revision-2'])
 })
})
test('failed create retains payload and dirty navigation protection',async()=>{
 vi.spyOn(creatorContentApi,'create').mockRejectedValue(new ApiError('offline',null,'network'))
 await harness(async({host,click,edit,router})=>{
  await edit('Keep this');await click('Add Exercise');expect(host.textContent).not.toContain('Saved to Library.')
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toBe('Keep this')
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);await act(async()=>{void router.navigate('/away')});expect(confirm).toHaveBeenCalled();expect(router.state.location.pathname).toBe('/')
 })
})
test('continuing protected history clones once and preserves local edits if its update fails',async()=>{
 vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:[saved],nextAfter:null})
 vi.spyOn(creatorContentApi,'get').mockResolvedValue({...saved,status:'approved'})
 const clone=vi.spyOn(creatorContentApi,'clone').mockResolvedValue({...saved,revisionId:'cloned-draft',version:2})
 const update=vi.spyOn(creatorContentApi,'update').mockRejectedValue(new ApiError('offline',null,'network'))
 await harness(async({host,click,edit})=>{
  await click('Library');await act(async()=>host.querySelector<HTMLButtonElement>(`[aria-label="Edit ${saved.exercise.title}"]`)!.click())
  await edit('Retained after clone');await click('Save Changes');expect(clone).toHaveBeenCalledTimes(1)
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toBe('Retained after clone')
  update.mockResolvedValue({...saved,revisionId:'next',version:3});await click('Save Changes')
  expect(clone).toHaveBeenCalledTimes(1);expect(update.mock.calls.at(-1)?.slice(0,2)).toEqual(['content','cloned-draft'])
 })
})
test('saving one mechanic does not mark another retained local variant as saved',async()=>{
 vi.spyOn(creatorContentApi,'create').mockImplementation(async body=>({...saved,...body}))
 await harness(async({host,click,edit,router})=>{
  await edit('Unsaved pair variant')
  const select=host.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
  await act(async()=>{select.value='true-false';select.dispatchEvent(new Event('change',{bubbles:true}))})
  await click('Add Exercise');expect(host.textContent).toContain('Saved to Library.')
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false)
  await act(async()=>{void router.navigate('/away')});expect(confirm).toHaveBeenCalled();expect(router.state.location.pathname).toBe('/')
  await act(async()=>{select.value='tap-pair';select.dispatchEvent(new Event('change',{bubbles:true}))})
  await click('Edit Title');expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Title"]')!.value).toBe('Unsaved pair variant')
 })
})
test('View in Library retrieves the saved draft even when it is outside the first page',async()=>{
 vi.spyOn(creatorContentApi,'create').mockResolvedValue(saved)
 vi.spyOn(creatorContentApi,'list').mockResolvedValue({items:[],nextAfter:'next-page'})
 const get=vi.spyOn(creatorContentApi,'get').mockResolvedValue(saved)
 await harness(async({host,click})=>{
  await click('Add Exercise');await click('View in Library')
  expect(get).toHaveBeenCalledWith(saved.contentId)
  expect(host.querySelector(`[aria-label="Edit ${saved.exercise.title}"]`)).not.toBeNull()
 })
})
