import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
const api = vi.hoisted(() => ({ create: vi.fn(), createVersion: vi.fn(), get: vi.fn(), submit: vi.fn() }))
const geo = vi.hoisted(() => ({ countries: vi.fn(), search: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: geo }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div data-testid="actual-route-map" /> }))
const city = { id: '11111111-1111-4111-8111-111111111111', name: 'Paris', countryCode: 'FR', countryDisplayName: 'France', administrativeContext: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, active: true }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  geo.countries.mockResolvedValue({ countries: [{ code: 'FR', displayName: 'France' }, { code: 'DE', displayName: 'Germany' }] }); geo.search.mockResolvedValue({ localities: [city, city] }); geo.get.mockResolvedValue(city)
  api.create.mockImplementation(async (content, category, localityId) => ({ key: content.key, version: 1, status: 'draft', category, content, localityId, localitySnapshot: localityId ? city : null }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render(url = '/create?category=local') { await act(async () => root.render(<MemoryRouter initialEntries={[url]}><CreatorTemplateEditorPage /></MemoryRouter>)) }
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!
async function click(text: string) { await act(async () => button(text).click()) }
async function change(selector: string, value: string) { await act(async () => { const el = container.querySelector(selector)!; Object.getOwnPropertyDescriptor(el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(el,value); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) }) }
async function selectCity() { await change('#local-geography select','FR'); await change('#local-geography input','Paris'); await click('Paris · Île-de-France · France') }
function record(category: 'local' | 'universal' | undefined = 'local', positioned = false): any { return { key: 'owned', version: 1, status: 'draft', category, content: { key: 'owned', version: 1, displayName: 'Adventure', theme: 'Mixed', mission: { name: 'Our story' }, configuration: { normalCheckpointCount: 1, checkpointPositions: positioned ? [{ checkpointNumber: 1, name: 'Museum', latitude: 48.8, longitude: 2.3, radiusMeters: 15 }] : [] }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1 }, { role: 'terminal' }] } } }
test('Local starts with Hunt Setup and requires country and city before positioning; search deduplicates exact identities', async () => {
  await render(); expect(container.querySelector('fieldset section h2')!.textContent).toBe('Hunt Setup'); expect(container.querySelector('#checkpoint-positions')).toBeNull()
  await click('Continue to Hunt builder'); expect(container.textContent).toContain('Choose a country and city to continue.')
  await change('#local-geography select','FR'); await click('Continue to Hunt builder'); expect(container.querySelector('#checkpoint-positions')).toBeNull()
  await change('#local-geography input','Paris'); expect(geo.search).toHaveBeenCalledWith('FR','Paris'); expect(container.querySelectorAll('#local-geography li')).toHaveLength(1)
  await click('Paris · Île-de-France · France'); await click('Continue to Hunt builder'); expect(container.querySelector('#checkpoint-positions')).not.toBeNull(); expect(document.activeElement?.id).toBe('template-setup-heading')
})
test('Universal needs no locality and optional unsupported learning controls never block Continue or persist invented metadata', async () => {
  await render('/create?category=universal'); expect(container.querySelector('#local-geography input')).toBeNull(); expect(geo.countries).not.toHaveBeenCalled()
  await click('Continue to Hunt builder'); expect(container.textContent).not.toContain('Choose a country and city to continue.')
  const controls = container.querySelectorAll<HTMLSelectElement>('#local-geography select'); expect(controls).toHaveLength(2)
  for (const control of controls) { expect(control.disabled).toBe(true); expect(control.value).toBe(''); expect([...control.options].some(option => option.value === 'mixed')).toBe(true) }
  await change('#template-setup input','Anywhere adventure'); await click('Save draft')
  const [content, category, localityId] = api.create.mock.calls[0]; expect(category).toBe('universal'); expect(localityId).toBeUndefined(); expect(content.configuration).not.toHaveProperty('curriculum'); expect(content.configuration).not.toHaveProperty('grade')
})
test('changing country clears incompatible city and blocks geographic positioning', async () => {
  await render(); await selectCity(); expect(container.querySelector('#checkpoint-positions')).not.toBeNull()
  await change('#local-geography select','DE'); expect(container.querySelector('#checkpoint-positions')).toBeNull(); expect((container.querySelector('#local-geography input') as HTMLInputElement).value).toBe('')
})
test('selected city saves only UUID, reloads server snapshot, and leaves learning metadata unset', async () => {
  await render(); await selectCity(); await change('#template-setup input','Paris adventure'); await click('Save draft')
  const [content,,localityId] = api.create.mock.calls[0]; expect(localityId).toBe(city.id); expect(content).not.toHaveProperty('localitySnapshot'); expect(content.configuration).not.toHaveProperty('curriculum'); expect(content.configuration).not.toHaveProperty('grade')
  expect(container.textContent).toContain('Selected city: Paris'); expect(content.configuration.checkpointPositions).toEqual([]); expect(JSON.stringify(content)).not.toContain('Signal')
})
test('Local copied from Universal still requires an explicit destination', async () => {
  const saved = { ...record(), origin: { source: 'universal', templateKey: 'source', version: 2 } }; api.get.mockResolvedValue(saved)
  await render('/create?template=owned'); await click('Continue to Hunt builder'); expect(container.querySelector('#checkpoint-positions')).toBeNull(); expect(container.textContent).toContain('Choose a country and city to continue.')
})
test('city change confirmation cancels all selection mutations or preserves original positioned checkpoints on acceptance', async () => {
  const saved = { ...record('local',true), localityId: city.id, localitySnapshot: city }; api.get.mockResolvedValue(saved); api.createVersion.mockImplementation(async (_,content,localityId) => ({ ...saved,version:2,content,localityId,localitySnapshot:null }))
  await render('/create?template=owned'); vi.mocked(window.confirm).mockReturnValue(false); await change('#local-geography select','DE')
  expect((container.querySelector('#local-geography select') as HTMLSelectElement).value).toBe('FR'); expect(container.querySelector('#checkpoint-positions')).not.toBeNull()
  vi.mocked(window.confirm).mockReturnValue(true); await change('#local-geography select','DE'); await click('Save draft')
  expect(api.createVersion.mock.calls[0][1].configuration.checkpointPositions).toEqual(saved.content.configuration.checkpointPositions); expect(api.createVersion.mock.calls[0][2]).toBeNull()
})
test('search failure preserves selection and can retry without fake coordinates or repeated requests on rerender', async () => {
  await render(); await selectCity(); const count = geo.search.mock.calls.length
  await change('#template-setup input','A title'); expect(geo.search).toHaveBeenCalledTimes(count)
  geo.search.mockRejectedValueOnce(new Error('offline')); await change('#local-geography input','Par'); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(container.textContent).toContain('Selected city: Paris')
  await click('Retry registry'); expect(container.textContent).toContain('Paris · Île-de-France · France')
})
test('invalid city camera remains selected and recovers through exact registry lookup', async () => {
  geo.search.mockResolvedValue({ localities: [{ ...city, latitude: NaN }] }); await render(); await selectCity(); expect(container.textContent).toContain('The city location could not be loaded.')
  geo.get.mockRejectedValueOnce(new Error('offline')); await click('Retry city location'); expect(container.textContent).toContain('Your selection is kept.')
  await click('Retry city location'); expect(geo.get).toHaveBeenCalledWith(city.id); expect(container.textContent).not.toContain('The city location could not be loaded.')
})
test('legacy templates retain existing flow and content without locality migration', async () => {
  const saved = record(undefined,true); delete saved.category; api.get.mockResolvedValue(saved)
  await render('/create?template=owned'); expect(container.querySelector('#hunt-setup-heading')).toBeNull(); expect(container.querySelector('#checkpoint-positions')).not.toBeNull(); expect(api.createVersion).not.toHaveBeenCalled(); expect(saved.localityId).toBeUndefined(); expect(saved.content.configuration.checkpointPositions[0]).toMatchObject({ latitude: 48.8, longitude: 2.3 })
})
