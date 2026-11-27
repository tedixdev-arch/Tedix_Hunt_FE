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
  expect(latest).toEqual({ countries: null, regions: null, subregions: [], cities: null, regionLabel: 'County/Region', subregionLabel: 'District/County' })
  expect(page).not.toHaveBeenCalled()
  page.mockRejectedValue(new Error('offline'))
  await render({ country: 'Atlantis', region: '' })
  expect(latest.countries).toBeNull()
})

test('optional Subregion: country-specific labels, subdivisions listed, and the City list narrowed by the chosen subdivision', async () => {
  page.mockImplementation(async (kind: string, filters: Record<string, string>) => kind === 'countries' ? { items: [{ countryCode: 'US', displayName: 'United States' }], nextCursor: null }
    : kind === 'regions' ? { items: [{ regionId: 'US:admin1:TX', label: 'Texas', levelLabel: 'State' }, { regionId: 'US:admin1:DC', label: 'District of Columbia', levelLabel: 'State' }], nextCursor: null }
    : kind === 'subregions' ? { items: filters.regionId === 'US:admin1:TX' ? [
        { subregionId: 'US:admin1:TX:unspecified', label: 'Other (not specified)', labelStatus: 'unspecified', levelLabel: 'County' },
        { subregionId: 'US:admin1:TX:admin2:201', label: 'Harris County', labelStatus: 'resolved', levelLabel: 'County' },
        { subregionId: 'US:admin1:TX:admin2:113', label: 'Dallas County', labelStatus: 'resolved', levelLabel: 'County' }] : [], nextCursor: null }
    : { items: filters.subregionId === 'US:admin1:TX:admin2:201' ? [{ name: 'Houston' }] : [{ name: 'Dallas' }, { name: 'Houston' }], nextCursor: null })
  const probe = (subregion: string, region = 'Texas') => act(async () => root.render(<SubProbe region={region} subregion={subregion} />))
  function SubProbe({ region, subregion }: { region: string; subregion: string }) { latest = useCatalogLocationOptions('United States', region, true, subregion); return null }
  await probe('')
  expect(latest).toMatchObject({ regionLabel: 'State', subregionLabel: 'County', subregions: ['Dallas County', 'Harris County', 'Other (not specified)'], cities: ['Dallas', 'Houston'] })
  await probe('Harris County')
  expect(page).toHaveBeenCalledWith('cities', { countryCode: 'US', regionId: 'US:admin1:TX', subregionId: 'US:admin1:TX:admin2:201' }, undefined)
  expect(latest.cities).toEqual(['Houston'])
  // A region without official subdivisions has no Subregion level.
  await probe('', 'District of Columbia'); expect(latest.subregions).toEqual([])
})
