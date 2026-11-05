import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useCatalogLocationOptions } from '../src/features/organizer/catalogLocationOptions'

const page = vi.hoisted(() => vi.fn())
vi.mock('../src/services/api/organizerLocal', () => ({ organizerLocalApi: { page } }))

let root: Root, container: HTMLDivElement, latest: ReturnType<typeof useCatalogLocationOptions>
function Probe({ country, region, enabled = true }: { country: string; region: string; enabled?: boolean }) { latest = useCatalogLocationOptions(country, region, enabled); return null }
const render = (props: { country: string; region: string; enabled?: boolean }) => act(async () => root.render(<Probe {...props} />))
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  page.mockImplementation(async (kind: string, filters: Record<string, string>, cursor?: string) => kind === 'countries'
    ? cursor ? { items: [{ countryCode: 'HU', displayName: 'Hungary' }], nextCursor: null } : { items: [{ countryCode: 'RO', displayName: 'Romania' }, { countryCode: 'BG', displayName: 'Bulgaria' }], nextCursor: 'next' }
    : kind === 'regions' ? { items: filters.countryCode === 'RO' ? [{ regionId: 'RO:admin1:13', label: 'Cluj' }, { regionId: 'RO:admin1:10', label: 'Bucureşti' }] : [], nextCursor: null }
    : { items: [{ name: 'Cluj-Napoca' }, { name: 'Turda' }], nextCursor: null })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })

test('lists every catalog country across pages, sorted, then chains regions and cities by the chosen names', async () => {
  await render({ country: 'Romania', region: 'Cluj' })
  expect(latest.countries).toEqual(['Bulgaria', 'Hungary', 'Romania'])
  expect(latest.regions).toEqual(['Bucureşti', 'Cluj'])
  expect(latest.cities).toEqual(['Cluj-Napoca', 'Turda'])
  expect(page).toHaveBeenCalledWith('cities', { countryCode: 'RO', regionId: 'RO:admin1:13' }, undefined)
})

test('returns null lists when disabled or unavailable so the editor keeps its fallback options', async () => {
  await render({ country: 'Romania', region: 'Cluj', enabled: false })
  expect(latest).toEqual({ countries: null, regions: null, cities: null })
  expect(page).not.toHaveBeenCalled()
  page.mockRejectedValue(new Error('offline'))
  await render({ country: 'Atlantis', region: '' })
  expect(latest.countries).toBeNull()
})
