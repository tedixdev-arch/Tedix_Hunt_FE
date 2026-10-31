import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ create: vi.fn(), createVersion: vi.fn(), get: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => {
  const city = { id: '11111111-1111-4111-8111-111111111111', countryCode:'FR', countryDisplayName:'France', name:'Paris', administrativeContext:'Île-de-France', latitude:48.8566, longitude:2.3522, active:true }
  return { geographyApi: { countries: async () => ({ countries:[{code:'FR',displayName:'France'}] }), search: async () => ({localities:[city]}), get:async () => city } }
})
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn(); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?category=local']}><CreatorTemplateEditorPage /></MemoryRouter>)); await completeLocalSetup() }
function save() { return [...container.querySelectorAll('button')].find(b => b.textContent === 'Save draft')! }
async function name() { const input = container.querySelector('#template-setup input')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Local mystery'); input.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('08 route-free creation uses shared editor and returned identity; synchronous duplicate clicks create once', async () => {
  let resolve!: (v: any) => void; api.create.mockReturnValue(new Promise(done => resolve = done)); await render(); await name()
  expect(container.textContent).toContain('Local Template'); expect(container.textContent).toContain('Safety checkboxes')
  await act(async () => { save().click(); save().click() })
  expect(api.create).toHaveBeenCalledTimes(1); const [content, category] = api.create.mock.calls[0]
  expect(category).toBe('local'); expect(content.configuration.checkpointPositions).toEqual([]); expect(content.configuration.finishPoint).toBeUndefined()
  await act(async () => resolve({ key: 'server-key', version: 1, status: 'draft', category: 'local', content: { ...content, key: 'server-key', displayName: 'Server title' } }))
  expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Server title'); expect(api.submit).not.toHaveBeenCalled()
})
test.each([400,403,409])('08 error %s preserves authored input and permits correction', async status => {
  api.create.mockRejectedValue(new ApiError('Failed', status, 'http')); await render(); await name(); await act(async () => save().click())
  expect(container.querySelector('[role=alert]')).not.toBeNull(); expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Local mystery'); expect(save().disabled).toBe(false)
})
test('08 uncertain creation prevents blind retry and links to owned recovery', async () => {
  api.create.mockRejectedValue(new ApiError('Lost', null, 'network')); await render(); await name(); await act(async () => save().click())
  expect(container.textContent).toContain('Creation could not be confirmed'); expect(save().disabled).toBe(true); expect(container.querySelector('a[href="/creator"]')).not.toBeNull()
})

async function completeLocalSetup() {
  for (const [selector,value] of [['#local-geography select','FR'],['#local-geography input','Paris']]) {
    await act(async () => { const node = container.querySelector(selector)!; Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype,'value')!.set!.call(node,value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change':'input',{bubbles:true})) })
  }
  for (const text of ['Paris · Île-de-France · France','Continue to Hunt builder']) await act(async () => [...container.querySelectorAll('button')].find(button=>button.textContent===text)!.click())
}
