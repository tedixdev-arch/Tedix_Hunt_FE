import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorGeographicSelector } from '../src/features/creator/CreatorGeographicSelector'
const api = vi.hoisted(() => ({ countries: vi.fn(), regions: vi.fn(), cities: vi.fn(), resolveCity: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: api }))
const locality = { id: '11111111-1111-4111-8111-111111111111', name: 'Cluj-Napoca', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: 'Not a region identity', latitude: 46.77, longitude: 23.59, active: true }
const city = { ...locality, geographicId: '681290', admin1Code: '13', regionDisplayName: 'Cluj', regionStatus: 'resolved', localityId: locality.id, registeredActive: true, nextAction: 'bind_locality' }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  api.countries.mockResolvedValue({ countries: [{ code: 'RO', displayName: 'Romania' }, { code: 'US', displayName: 'United States' }] })
  api.regions.mockImplementation(async countryCode => ({ regions: [{ countryCode, admin1Code: '13', displayName: 'Cluj' }, { countryCode, admin1Code: '01', displayName: 'Alba' }], regionLabel: 'State / Region', metadataStatus: 'ready', nextAfter: null }))
  api.cities.mockResolvedValue({ cities: [city], nextAfter: null }); api.resolveCity.mockResolvedValue(city); api.get.mockResolvedValue(locality)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals() })
function Harness({ saved = false }: { saved?: boolean }) { const [value, setValue] = useState<string | null | undefined>(); return <><CreatorGeographicSelector savedId={saved ? locality.id : null} snapshot={saved ? locality : null} value={value} onChange={setValue} beforeChange={() => true} onSelect={() => {}} /><output>{value === undefined ? 'kept' : value ?? 'cleared'}</output></> }
async function render(saved = false) { await act(async () => root.render(<Harness saved={saved} />)) }
async function change(label: string, value: string) { await act(async () => { const node = container.querySelector(`[aria-label="${label} *"]`)!; Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) }) }
async function tick() { await act(async () => { await vi.advanceTimersByTimeAsync(300) }) }
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent!.includes(text))!.click()) }
async function find() { await render(); await change('Country', 'RO'); await change('Region', '13'); await change('City', 'Cluj'); await tick() }
const output = () => container.querySelector('output')!.textContent

test('Romania → Cluj → Cluj-Napoca binds canonical UUID only after explicit selection', async () => {
  await find(); expect(container.textContent).toContain('County *'); expect(api.cities).toHaveBeenCalledWith('RO', 'Cluj', '13', undefined); expect(api.resolveCity).not.toHaveBeenCalled(); expect(output()).toBe('cleared')
  await click('Cluj-Napoca · Cluj'); expect(api.resolveCity).toHaveBeenCalledWith('681290'); expect(output()).toBe(locality.id)
  expect(container.querySelector('a[href="https://creativecommons.org/licenses/by/4.0/"]')).not.toBeNull()
})
test('country and county changes clear selection and dependent search', async () => {
  await find(); await click('Cluj-Napoca · Cluj'); await change('Region', '01'); expect(output()).toBe('cleared'); expect(container.querySelector('input')!.value).toBe('')
  await change('Country', 'US'); expect((container.querySelector('[aria-label="Region *"]') as HTMLSelectElement).value).toBe(''); expect(container.querySelector('input')!.disabled).toBe(true); expect(container.textContent).toContain('State / Region *')
})
test('debounce, short query and empty results', async () => {
  api.cities.mockResolvedValue({ cities: [], nextAfter: null }); await render(); await change('Country', 'RO'); await change('Region', '13'); await change('City', 'C'); await tick(); expect(api.cities).not.toHaveBeenCalled()
  await change('City', 'Cl'); await change('City', 'Cluj'); await tick(); expect(api.cities).toHaveBeenCalledTimes(1); expect(container.textContent).toContain('No cities match')
})
test('late city results cannot replace newer search or country', async () => {
  let done!: (result: unknown) => void
  api.cities.mockReturnValueOnce(new Promise(resolve => { done = resolve })); await find(); await change('City', 'Alba'); await tick(); await change('Country', 'US')
  await act(async () => done({ cities: [city], nextAfter: null })); expect(container.querySelectorAll('li')).toHaveLength(0)
})
test('late resolve cannot bind after county changes', async () => {
  let done!: (result: unknown) => void
  api.resolveCity.mockReturnValue(new Promise(resolve => { done = resolve })); await find(); await click('Cluj-Napoca · Cluj'); await change('Region', '01'); await act(async () => done(city)); expect(output()).toBe('cleared')
})
test('late regions from previous country are ignored', async () => {
  let done!: (result: unknown) => void
  api.regions.mockReturnValueOnce(new Promise(resolve => { done = resolve })); await render(); await change('Country', 'RO'); await change('Country', 'US')
  await act(async () => done({ regions: [{ countryCode: 'RO', admin1Code: '99', displayName: 'Old' }], nextAfter: null, metadataStatus: 'ready', regionLabel: 'County' })); expect(container.textContent).not.toContain('Old'); expect(container.textContent).toContain('State / Region')
})
test.each(['ready', 'incomplete'])('empty region metadata %s is explicit', async metadataStatus => {
  api.regions.mockResolvedValue({ regions: [], regionLabel: 'County', metadataStatus, nextAfter: null }); await render(); await change('Country', 'RO'); expect(container.textContent).toContain('No regions available'); expect(container.textContent.includes('Region metadata is incomplete')).toBe(metadataStatus === 'incomplete'); expect(container.querySelector('input')!.disabled).toBe(true)
})
test('unregistered city never binds or registers silently', async () => {
  api.resolveCity.mockResolvedValue({ geographicId: city.geographicId, localityId: null, registrationState: 'registration_required', nextAction: 'request_registration' }); await find(); await click('Cluj-Napoca · Cluj'); expect(output()).toBe('cleared'); expect(container.textContent).toContain('requires Admin registration or reconciliation'); expect(api.get).not.toHaveBeenCalled()
})
test('saved draft recovers authoritative region by exact canonical UUID without writes', async () => {
  await render(true); expect(output()).toBe('kept'); expect((container.querySelector('[aria-label="Region *"]') as HTMLSelectElement).value).toBe('13'); expect(container.querySelector('input')!.value).toBe('Cluj-Napoca'); expect(api.resolveCity).not.toHaveBeenCalled(); expect(container.textContent).toContain('Not a region identity')
})
test('same name with different UUID cannot recover a saved region', async () => {
  api.cities.mockResolvedValue({ cities: [{ ...city, localityId: 'different' }], nextAfter: null }); await render(true); expect(output()).toBe('kept'); expect(container.textContent).toContain('region unresolved'); expect((container.querySelector('[aria-label="Region *"]') as HTMLSelectElement).value).toBe('')
})
test('unspecified saved region preserves locality and snapshot', async () => {
  api.cities.mockResolvedValue({ cities: [{ ...city, regionStatus: 'unspecified', admin1Code: '00', regionDisplayName: null }], nextAfter: null }); await render(true); expect(output()).toBe('kept'); expect(container.textContent).toContain('region unresolved'); expect(container.querySelector('input')!.disabled).toBe(true)
})
test('region and city pagination use returned cursors', async () => {
  api.regions.mockResolvedValueOnce({ regions: [], regionLabel: 'County', metadataStatus: 'ready', nextAfter: '12' }).mockResolvedValueOnce({ regions: [{ countryCode: 'RO', admin1Code: '13', displayName: 'Cluj' }], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null })
  api.cities.mockResolvedValueOnce({ cities: [city], nextAfter: '681290' }).mockResolvedValueOnce({ cities: [{ ...city, geographicId: '681291', name: 'Cluj Other' }], nextAfter: null }); await find(); expect(api.regions).toHaveBeenCalledWith('RO', '12'); await click('More cities'); expect(api.cities).toHaveBeenLastCalledWith('RO', 'Cluj', '13', '681290'); expect(container.querySelectorAll('li')).toHaveLength(2)
})
test('API error retry preserves the current country and region intent', async () => {
  api.cities.mockRejectedValueOnce(new Error('offline')); await find(); expect(container.querySelector('[role="alert"]')).not.toBeNull(); await click('Retry geography'); await tick(); expect(api.cities).toHaveBeenLastCalledWith('RO', 'Cluj', '13', undefined); expect(container.querySelectorAll('li')).toHaveLength(1)
})
test('desktop row and mobile stacking use responsive grid classes', async () => {
  await render(); const grid = container.querySelector('.grid')!; expect(grid.classList.contains('grid-cols-1')).toBe(true); expect(grid.classList.contains('sm:grid-cols-3')).toBe(true); expect(grid.querySelectorAll('label')).toHaveLength(3)
})
