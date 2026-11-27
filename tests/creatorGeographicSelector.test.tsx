import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorGeographicSelector } from '../src/features/creator/CreatorGeographicSelector'
const api = vi.hoisted(() => ({ countries: vi.fn(), regions: vi.fn(), subregions: vi.fn(), browse: vi.fn(), resolveCity: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/geography', async importOriginal => ({ ...(await importOriginal<typeof import('../src/services/api/geography')>()), geographyApi: api }))
const locality = { id: '11111111-1111-4111-8111-111111111111', name: 'Cluj-Napoca', countryCode: 'RO', countryDisplayName: 'Romania', administrativeContext: 'Not a region identity', latitude: 46.77, longitude: 23.59, active: true, geographicId: '681290', admin1Code: '13', regionDisplayName: 'Cluj' }
const city = { ...locality, geographicId: '681290', admin1Code: '13', regionDisplayName: 'Cluj', regionStatus: 'resolved', localityId: locality.id, registeredActive: true, registrationState: 'registered', nextAction: 'bind_locality', source: 'geonames' }
const turda = { ...city, geographicId: '665444', name: 'Turda', localityId: null, registeredActive: false, registrationState: 'not_linked', nextAction: 'resolve_city' }
/** Selecting a city without a Locality links or creates one automatically (no Admin registration). */
const turdaResolved = { ...turda, localityId: '44444444-4444-4444-8444-444444444444', registeredActive: true, registrationState: 'registered', nextAction: 'bind_locality' }
const inactive = { ...city, registeredActive: false, registrationState: 'registered_inactive', nextAction: 'unavailable' }
const manual = { ...city, geographicId: null, name: 'Added Hamlet', localityId: '33333333-3333-4333-8333-333333333333', source: 'registry' }
const guard = vi.fn(() => true)
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  guard.mockReset().mockReturnValue(true)
  api.countries.mockResolvedValue({ countries: [{ code: 'RO', displayName: 'Romania' }, { code: 'US', displayName: 'United States' }] })
  api.regions.mockImplementation(async (countryCode: string) => ({ regions: [{ countryCode, admin1Code: '13', displayName: 'Cluj', labelStatus: 'resolved' }, { countryCode, admin1Code: '01', displayName: 'Alba', labelStatus: 'resolved' }], regionLabel: countryCode === 'RO' ? 'County' : 'State', metadataStatus: 'ready', nextAfter: null }))
  api.browse.mockResolvedValue({ cities: [turda, city], registryLocalities: [], nextAfter: null })
  // Regions without official subdivisions skip the optional Subregion level.
  api.subregions.mockResolvedValue({ subregions: [], regionLabel: 'County', subregionLabel: 'Commune' })
  api.resolveCity.mockResolvedValue(city); api.get.mockResolvedValue(locality)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function Harness({ saved = false }: { saved?: boolean }) { const [value, setValue] = useState<string | null | undefined>(); const [pending, setPending] = useState(false); return <><CreatorGeographicSelector savedId={saved ? locality.id : null} snapshot={saved ? locality : null} value={value} onChange={setValue} beforeChange={guard} onSearchPendingChange={setPending} onSelect={() => {}} /><output>{value === undefined ? 'kept' : value ?? 'cleared'}</output><output data-pending>{String(pending)}</output></> }
async function render(saved = false) { await act(async () => root.render(<Harness saved={saved} />)) }
const field = (label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement | HTMLInputElement
async function change(label: string, value: string) { await act(async () => { const node = field(label); Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) }) }
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent!.includes(text))!.click()) }
const options = (label: string) => [...field(label).querySelectorAll('option')].map(o => o.textContent)
async function region() { await render(); await change('Country *', 'RO'); await change('Region *', '13') }
const output = () => container.querySelector('output')!.textContent

test('Country → County → City dropdowns; canonical UUID binds only after an explicit city choice', async () => {
  await region()
  expect(container.textContent).toContain('County *'); expect(api.browse).toHaveBeenCalledWith('RO', '13', undefined); expect(field('Subregion')).toBeNull(); expect(api.resolveCity).not.toHaveBeenCalled(); expect(output()).toBe('cleared')
  // Alphabetical plain names; registration state is explained below the field, not inside options.
  expect(options('City *')).toEqual(['Choose City', 'Cluj-Napoca', 'Turda'])
  await change('City *', '681290'); expect(api.resolveCity).toHaveBeenCalledWith('681290'); expect(output()).toBe(locality.id); expect(container.textContent).toContain('Selected city: Cluj-Napoca')
  expect(container.querySelector('a[href="https://creativecommons.org/licenses/by/4.0/"]')).not.toBeNull()
})
test('any listed city can be used: a city without a Locality binds after selection, with no registration message', async () => {
  api.resolveCity.mockResolvedValue(turdaResolved); api.get.mockResolvedValue({ ...locality, id: turdaResolved.localityId, name: 'Turda', geographicId: '665444' })
  await region(); await change('City *', '665444')
  expect(api.resolveCity).toHaveBeenCalledWith('665444'); expect(output()).toBe(turdaResolved.localityId)
  expect(container.textContent).toContain('Selected city: Turda'); expect(container.textContent).not.toMatch(/registration|registered|Admin/i)
})
test('only a Locality switched off in the registry is unavailable', async () => {
  api.resolveCity.mockResolvedValue(inactive); await region(); await change('City *', '681290')
  expect(container.textContent).toContain('This place is currently unavailable. Choose another city.'); expect(output()).toBe('cleared')
  expect(container.textContent).not.toMatch(/Admin/)
})
test('a manual Locality from an approved proposal is listed in its region and binds without catalog resolve', async () => {
  api.browse.mockResolvedValue({ cities: [city], registryLocalities: [manual], nextAfter: null }); api.get.mockResolvedValue({ ...locality, id: manual.localityId, name: 'Added Hamlet', geographicId: null })
  await region(); expect(options('City *')).toContain('Added Hamlet')
  await change('City *', `registry:${manual.localityId}`); expect(api.resolveCity).not.toHaveBeenCalled(); expect(api.get).toHaveBeenCalledWith(manual.localityId); expect(output()).toBe(manual.localityId)
})
test('country and county changes clear the selection; each country uses its own region label', async () => {
  await region(); await change('City *', '681290'); await change('Region *', '01'); expect(output()).toBe('cleared'); expect(field('City *').value).toBe('')
  await change('Country *', 'US'); expect(field('Region *').value).toBe(''); expect(field('City *').disabled).toBe(true); expect(container.textContent).toContain('State *'); expect(container.textContent).not.toContain('County *')
})
test('guard refusal keeps the current binding', async () => {
  await region(); await change('City *', '681290'); guard.mockReturnValue(false); await change('Region *', '01')
  expect(output()).toBe(locality.id); expect(field('Region *').value).toBe('13')
})
test('late resolve cannot bind after the county changes', async () => {
  let done!: (result: unknown) => void
  api.resolveCity.mockReturnValue(new Promise(resolve => { done = resolve })); await region(); await change('City *', '681290'); expect(container.querySelector('[data-pending]')!.textContent).toBe('true')
  await change('Region *', '01'); await act(async () => done(city)); expect(output()).toBe('cleared'); expect(container.querySelector('[data-pending]')!.textContent).toBe('false')
})
test('late cities from a previous region are ignored', async () => {
  let done!: (result: unknown) => void
  api.browse.mockReturnValueOnce(new Promise(resolve => { done = resolve })); await region(); api.browse.mockResolvedValue({ cities: [], nextAfter: null }); await change('Region *', '01')
  await act(async () => done({ cities: [city], nextAfter: null })); expect(options('City *')).toEqual(['Choose City'])
})
test('late regions from a previous country are ignored', async () => {
  let done!: (result: unknown) => void
  api.regions.mockReturnValueOnce(new Promise(resolve => { done = resolve })); await render(); await change('Country *', 'RO'); await change('Country *', 'US')
  await act(async () => done({ regions: [{ countryCode: 'RO', admin1Code: '99', displayName: 'Old' }], nextAfter: null, metadataStatus: 'ready', regionLabel: 'County' })); expect(container.textContent).not.toContain('Old')
})
test('every page of a region is loaded and manual Localities from the first page are merged', async () => {
  api.browse.mockResolvedValueOnce({ cities: [city], registryLocalities: [manual], nextAfter: '681290' }).mockResolvedValueOnce({ cities: [turda], registryLocalities: [], nextAfter: null })
  await region(); expect(api.browse).toHaveBeenLastCalledWith('RO', '13', '681290'); expect(options('City *')).toEqual(['Choose City', 'Added Hamlet', 'Cluj-Napoca', 'Turda'])
})
test('the unspecified region and code-only regions are offered; empty region metadata is explicit', async () => {
  api.regions.mockResolvedValue({ regions: [{ countryCode: 'RO', admin1Code: 'unspecified', displayName: 'Other (region not specified)', labelStatus: 'unspecified' }, { countryCode: 'RO', admin1Code: '13', displayName: 'Cluj', labelStatus: 'resolved' }], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null })
  await render(); await change('Country *', 'RO'); expect(options('Region *')).toEqual(['Choose County', 'Cluj', 'Other (region not specified)'])
  api.regions.mockResolvedValue({ regions: [], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null }); await change('Country *', 'US'); expect(container.textContent).toContain('No regions available')
})
test('saved draft restores country, region and city from the canonical Locality without writes', async () => {
  await render(true); expect(output()).toBe('kept'); expect(field('Region *').value).toBe('13'); expect(field('City *').value).toBe('681290'); expect(api.resolveCity).not.toHaveBeenCalled(); expect(container.textContent).toContain('Not a region identity')
})
test('a saved Locality not found in its region keeps the saved binding and says so', async () => {
  api.browse.mockResolvedValue({ cities: [{ ...city, localityId: 'different' }], nextAfter: null }); await render(true)
  expect(output()).toBe('kept'); expect(container.textContent).toContain('region unresolved'); expect(field('City *').value).toBe('')
})
test('Keep saved locality restores omission semantics after a change', async () => {
  api.resolveCity.mockResolvedValue(inactive); await render(true); await change('City *', '681290'); expect(output()).toBe('cleared'); await click('Keep saved locality'); expect(output()).toBe('kept')
})
test('API error retry preserves the current country and region', async () => {
  api.browse.mockRejectedValueOnce(new Error('offline')); await region(); expect(container.querySelector('[role="alert"]')).not.toBeNull()
  await click('Retry geography'); expect(api.browse).toHaveBeenLastCalledWith('RO', '13', undefined); expect(options('City *')).toContain('Cluj-Napoca')
})
test('long city lists stay one plain dropdown without a separate filter or search box', async () => {
  const many = Array.from({ length: 35 }, (_, i) => ({ ...turda, geographicId: String(1000 + i), name: `Town ${i}` }))
  api.browse.mockResolvedValue({ cities: [city, ...many], nextAfter: null }); await region()
  expect(options('City *')).toHaveLength(37); expect(container.querySelector('input[aria-label="Filter cities"]')).toBeNull()
  expect(field('City *').tagName).toBe('SELECT')
})
test('a new selector preselects nothing', async () => {
  await render(); expect(field('Country *').value).toBe(''); expect(options('Country *')[0]).toBe('Choose Country'); expect(field('Region *').disabled).toBe(true); expect(field('City *').disabled).toBe(true)
})
test('desktop row and mobile stacking use responsive grid classes', async () => {
  await render(); const grid = container.querySelector('.grid')!; expect(grid.classList.contains('grid-cols-1')).toBe(true); expect(grid.classList.contains('sm:grid-cols-3')).toBe(true); expect(grid.querySelectorAll('label')).toHaveLength(3)
})

const communes = { subregions: [
  { countryCode: 'RO', admin1Code: '13', admin2Code: '54975', displayName: 'Municipiul Cluj-Napoca', labelStatus: 'resolved' },
  { countryCode: 'RO', admin1Code: '13', admin2Code: '55003', displayName: 'Municipiul Turda', labelStatus: 'resolved' },
  { countryCode: 'RO', admin1Code: '13', admin2Code: 'unspecified', displayName: 'Other (not specified)', labelStatus: 'unspecified' },
], regionLabel: 'County', subregionLabel: 'Commune' }
test('optional Subregion: All of the region by default, a subdivision narrows the cities, changes reset the city', async () => {
  api.subregions.mockResolvedValue(communes)
  api.browse.mockImplementation(async (_c: string, _r: string, _a?: string, admin2?: string) => ({ cities: admin2 === '55003' ? [turda] : admin2 ? [] : [turda, city], registryLocalities: [], nextAfter: null }))
  await region()
  expect(api.subregions).toHaveBeenCalledWith('RO', '13'); expect(container.textContent).toContain('Commune')
  expect(options('Subregion')).toEqual(['All of Cluj', 'Municipiul Cluj-Napoca', 'Municipiul Turda', 'Other (not specified)'])
  expect(field('Subregion').value).toBe(''); expect(options('City *')).toEqual(['Choose City', 'Cluj-Napoca', 'Turda'])
  await change('City *', '681290'); expect(output()).toBe(locality.id)
  await change('Subregion', '55003'); expect(output()).toBe('cleared'); expect(api.browse).toHaveBeenLastCalledWith('RO', '13', undefined, '55003'); expect(options('City *')).toEqual(['Choose City', 'Turda'])
  await change('Subregion', ''); expect(options('City *')).toEqual(['Choose City', 'Cluj-Napoca', 'Turda'])
  await change('Subregion', '55003'); await change('Region *', '01'); expect(field('Subregion')).toBeNull(); expect(api.browse).toHaveBeenLastCalledWith('RO', '01', undefined)
  await change('Country *', 'US'); expect(field('Subregion')).toBeNull(); expect(field('Region *').value).toBe('')
})
test('the unspecified region has no Subregion level and a failed subregion lookup keeps the whole region usable', async () => {
  api.subregions.mockRejectedValue(new Error('offline'))
  await region(); expect(field('Subregion')).toBeNull(); expect(options('City *')).toEqual(['Choose City', 'Cluj-Napoca', 'Turda'])
  expect(container.querySelector('[role=alert]')).toBeNull()
  api.subregions.mockClear(); api.regions.mockResolvedValue({ regions: [{ countryCode: 'RO', admin1Code: 'unspecified', displayName: 'Other (region not specified)', labelStatus: 'unspecified' }], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null })
  await change('Country *', 'US'); await change('Country *', 'RO'); await change('Region *', 'unspecified'); expect(api.subregions).not.toHaveBeenCalled()
})
test('a saved draft restores its subdivision from the canonical Locality', async () => {
  api.subregions.mockResolvedValue(communes); api.get.mockResolvedValue({ ...locality, admin1Code: '13', admin2Code: '54975', subregionDisplayName: 'Municipiul Cluj-Napoca' })
  await render(true)
  expect(field('Subregion').value).toBe('54975'); expect(api.browse).toHaveBeenCalledWith('RO', '13', undefined, '54975'); expect(field('City *').value).toBe('681290')
})
