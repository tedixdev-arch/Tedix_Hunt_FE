import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LocalGeographySelector } from '../src/features/creator/LocalGeographySelector'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ countries: vi.fn(), search: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: api }))
const place = { id: '11111111-1111-4111-8111-111111111111', name: 'Springfield', administrativeContext: 'North', countryCode: 'RO', countryDisplayName: 'Romania', latitude: 46, longitude: 23, active: true }
let root: Root, container: HTMLDivElement
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); api.countries.mockResolvedValue({ countries: [{ code: 'RO', displayName: 'Romania' }, { code: 'US', displayName: 'United States' }] }); api.search.mockResolvedValue({ localities: [] }); api.get.mockResolvedValue({ ...place, name: 'Registry renamed' }); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function Harness({ saved = false }: { saved?: boolean }) { const [value,setValue] = useState<string | null | undefined>(); return <><LocalGeographySelector savedId={saved ? place.id : null} snapshot={saved ? place : null} value={value} onChange={setValue} /><output>{value === undefined ? 'omitted' : value === null ? 'null' : value}</output></> }
async function render(saved = false) { await act(async () => root.render(<Harness saved={saved} />)) }
async function change(selector: string, value: string) { await act(async () => { const node = container.querySelector(selector)!; Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node,value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles:true })) }) }
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent!.includes(text))!.click()) }
test('09 same-name choices select exact UUID and country change clears; no automatic choice', async () => {
  api.search.mockResolvedValue({ localities: [place, { ...place, id: '22222222-2222-4222-8222-222222222222', administrativeContext: 'South' }, { ...place, id: 'inactive', active: false }] })
  await render(); await change('select','RO'); await change('input','Spring'); expect(api.search).toHaveBeenCalledWith('RO','Spring'); expect(container.querySelectorAll('li')).toHaveLength(2); expect(container.querySelector('output')!.textContent).toBe('null')
  await click('South'); expect(container.querySelector('output')!.textContent).toBe('22222222-2222-4222-8222-222222222222')
  await change('select','US'); expect(container.querySelector('output')!.textContent).toBe('null'); expect(container.querySelector('input')!.value).toBe(''); expect(container.querySelectorAll('li')).toHaveLength(0)
})
test('09 saved snapshot remains distinct from current registry; explicit refresh, clear and omission', async () => {
  await render(true); expect(container.textContent).toContain('Springfield'); expect(container.textContent).toContain('Registry renamed'); expect(container.querySelector('output')!.textContent).toBe('omitted')
  await click('Use current registry details'); expect(container.querySelector('output')!.textContent).toBe(place.id)
  await click('Clear locality'); expect(container.querySelector('output')!.textContent).toBe('null')
  await click('Keep saved locality'); expect(container.querySelector('output')!.textContent).toBe('omitted')
})
test('09 delayed old-country response cannot restore results after country reset', async () => {
  let resolve!: (v:any) => void; api.search.mockReturnValue(new Promise(done => resolve=done)); await render(); await change('select','RO'); await change('input','Spring'); await change('select','US'); await act(async () => resolve({ localities:[place] })); expect(container.querySelectorAll('li')).toHaveLength(0); expect(container.querySelector('output')!.textContent).toBe('null')
})
test('09 empty results and inactive registry remain usable as incomplete drafts without rebinding', async () => {
  api.get.mockResolvedValue({ ...place,active:false }); await render(true); expect(container.textContent).toContain('Inactive'); expect(container.textContent).not.toContain('Use current registry details'); await change('input','missing'); expect(container.textContent).toContain('No active registered localities'); expect(container.querySelector('output')!.textContent).toBe('omitted')
})
test.each([400,401,403,404,409])('09 registry error %s preserves saved selection', async status => {
  api.get.mockRejectedValue(new ApiError('Failed',status,'http')); await render(true); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(container.textContent).toContain('Springfield'); expect(container.querySelector('output')!.textContent).toBe('omitted')
})
