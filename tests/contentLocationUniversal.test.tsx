import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ContentGeography, universalScope, type ContentScope } from '../src/features/creator/content/ContentGeography'
import type { GeographicCity } from '../src/services/api/geography'
const api = vi.hoisted(() => ({ countries: vi.fn(), regions: vi.fn(), subregions: vi.fn(), browse: vi.fn(), city: vi.fn() }))
vi.mock('../src/services/api/geography', async importOriginal => ({ ...(await importOriginal<typeof import('../src/services/api/geography')>()), geographyApi: api }))
const base = { countryCode: 'RO', countryDisplayName: 'Romania', admin1Code: '13', regionDisplayName: 'Cluj', regionStatus: 'resolved', administrativeContext: 'Cluj', latitude: 46, longitude: 23, source: 'geonames' } as const
const cluj = { ...base, geographicId: '681290', name: 'Cluj-Napoca', localityId: 'cluj-uuid', registeredActive: true, registrationState: 'registered', nextAction: 'bind_locality' } as GeographicCity
const turda = { ...base, geographicId: '665444', name: 'Turda', localityId: null, registeredActive: false, registrationState: 'not_linked', nextAction: 'resolve_city' } as GeographicCity
const manual = { ...base, geographicId: null, name: 'Added Hamlet', localityId: 'manual', registeredActive: true, registrationState: 'registered', nextAction: 'bind_locality', source: 'registry' } as GeographicCity
let root: Root, container: HTMLDivElement, latest: ContentScope
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  api.countries.mockResolvedValue({ countries: [{ code: 'RO', displayName: 'Romania' }] })
  api.regions.mockResolvedValue({ regions: [{ countryCode: 'RO', admin1Code: '13', displayName: 'Cluj', labelStatus: 'resolved' }, { countryCode: 'RO', admin1Code: 'unspecified', displayName: 'Other', labelStatus: 'unspecified' }], regionLabel: 'County', metadataStatus: 'ready', nextAfter: null })
  api.browse.mockResolvedValue({ cities: [turda, cluj], registryLocalities: [manual], nextAfter: null })
  api.city.mockImplementation(async (id: string) => id === turda.geographicId ? turda : cluj)
  api.subregions.mockResolvedValue({ subregions: [], regionLabel: 'County', subregionLabel: 'Commune' })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function Harness() { const [value, setValue] = useState<ContentScope>({ ...universalScope }); latest = value; return <ContentGeography value={value} onChange={setValue} /> }
const field = (label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement & HTMLInputElement
const options = (label: string) => [...field(label).options].map(o => o.text)
async function change(label: string, value: string) { await act(async () => { const node = field(label); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('change', { bubbles: true })) }) }

test('Universal is the default: County/Region and City show Universal, are disabled, and show no warning', async () => {
  await act(async () => root.render(<Harness />))
  expect(field('Content country').value).toBe(''); expect(options('Content country')[0]).toBe('Universal')
  expect(field('Content region').disabled).toBe(true); expect(options('Content region')).toEqual(['Universal'])
  expect(field('Content city').tagName).toBe('SELECT'); expect(field('Content city').disabled).toBe(true); expect(options('Content city')).toEqual(['Universal'])
  // All three fields use the same control and styling, so they line up.
  expect(field('Content city').className).toBe(field('Content region').className); expect(field('Content city').className).toBe(field('Content country').className)
  expect(container.textContent).not.toMatch(/registration|Admin/i); expect(container.textContent).toContain('County/Region')
  expect(field('Content subregion')).toBeNull()
})
test('a specific country enables its own region label and City dropdowns, resets them and loads options for the choice', async () => {
  await act(async () => root.render(<Harness />))
  await change('Content country', 'RO')
  expect(latest).toEqual({ country: 'RO', region: '', city: '' })
  expect(field('Content region').disabled).toBe(false); expect(options('Content region')).toEqual(['Choose County', 'Cluj'])
  expect(field('Content city').tagName).toBe('SELECT'); expect(field('Content city').disabled).toBe(true)
  await change('Content region', '13')
  expect(api.browse).toHaveBeenCalledWith('RO', '13', undefined)
  // Plain names, alphabetical; manual Localities are not content scopes; no separate search box.
  expect(options('Content city')).toEqual(['Choose City', 'Cluj-Napoca', 'Turda'])
  expect(container.querySelector('[aria-label="Find content city"]')).toBeNull()
  await change('Content city', '681290'); expect(latest.city).toBe('681290')
  await change('Content region', '13'); await change('Content country', '')
  expect(latest).toEqual(universalScope)
})
test('any listed city can be chosen with no registration warning', async () => {
  await act(async () => root.render(<Harness />))
  await change('Content country', 'RO'); await change('Content region', '13'); await change('Content city', '665444')
  expect(latest).toEqual({ country: 'RO', region: '13', city: '665444' })
  expect(container.textContent).not.toMatch(/registration|registered|Admin/i)
})

test('the optional Subregion only narrows the City list and is not part of the saved scope', async () => {
  api.subregions.mockResolvedValue({ subregions: [{ countryCode: 'RO', admin1Code: '13', admin2Code: '55003', displayName: 'Municipiul Turda', labelStatus: 'resolved' }], regionLabel: 'County', subregionLabel: 'Commune' })
  api.browse.mockImplementation(async (_c: string, _r: string, _a?: string, admin2?: string) => ({ cities: admin2 ? [turda] : [turda, cluj], registryLocalities: [], nextAfter: null }))
  await act(async () => root.render(<Harness />)); await change('Content country', 'RO'); await change('Content region', '13')
  expect(options('Content subregion')).toEqual(['All of Cluj', 'Municipiul Turda']); expect(container.textContent).toContain('Commune only narrows the City list')
  await change('Content city', cluj.geographicId!); expect(latest).toEqual({ country: 'RO', region: '13', city: cluj.geographicId })
  await change('Content subregion', '55003'); expect(latest).toEqual({ country: 'RO', region: '13', city: '' }); expect(options('Content city')).toEqual(['Choose City', 'Turda'])
  await change('Content region', ''); expect(field('Content subregion')).toBeNull()
})
