import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { OrganizerSetup } from '../src/features/organizer/OrganizerSetup'
import { OrganizerSetupChoicePage } from '../src/pages/OrganizerSetupFlow'
import { organizerLocalApi } from '../src/services/api/organizerLocal'
import { ApiError, huntsApi, huntOptionsApi, huntRewardsApi, organizationsApi, rewardOptionsApi, type Hunt } from '../src/services/api'
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer</header> }))
vi.mock('../src/components/HuntMapPreview', () => ({ HuntMapInspection: ({ configuration }: { configuration: unknown }) => <p>Read-only route {configuration ? 'available' : 'unavailable'}</p> }))
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
const local = { templateId: 'template-1', key: 'cluj', version: 7, displayName: 'Cluj Adventure', theme: 'Discover the old city', localityId: 'locality-1' }
const selection = { templateId: local.templateId, version: 7, countryCode: 'RO', localityId: local.localityId }
const options = { formats: [{ key: 'team', label: 'Team' }], teamSizes: [4], accessModes: [{ key: 'invitation_only', label: 'Invitation' }], difficulties: [{ key: 'easy', label: 'Easy' }], checkpointOrders: [{ key: 'recommended', label: 'Recommended' }] }
let saved: Hunt
let container: HTMLDivElement
let root: Root
beforeEach(() => {
  saved = { id: 'hunt-1', organizationId: 'org-1', name: local.displayName, status: 'draft', accessCode: null, templateKey: null, templateVersion: null, templateSnapshot: null } as Hunt
  vi.spyOn(organizationsApi, 'listAccessible').mockResolvedValue([{ id: 'org-1', name: 'Org' }])
  vi.spyOn(huntOptionsApi, 'listHuntOptions').mockResolvedValue(options)
  vi.spyOn(rewardOptionsApi, 'getOptions').mockResolvedValue({ providers: [{ key: 'tedix_inventory', label: 'Tedix inventory' }], kinds: [{ key: 'physical', label: 'Physical' }], virtualCategories: [], specialAwardDefinitions: [] })
  vi.spyOn(huntRewardsApi, 'list').mockResolvedValue({ leaderboard: [], specialAwards: [] })
  vi.spyOn(organizerLocalApi, 'page').mockImplementation(async kind => ({ items: (kind === 'countries' ? [{ countryCode: 'RO', displayName: 'Romania' }] : kind === 'regions' ? [{ regionId: 'RO:admin1:13', countryCode: 'RO', label: 'Cluj' }] : kind === 'subregions' ? [] : kind === 'cities' ? [{ geographicId: '681290', localityId: local.localityId, countryCode: 'RO', name: 'Cluj-Napoca', regionId: 'RO:admin1:13', countryDisplayName: 'Romania', regionDisplayName: 'Cluj' }] : [local]) as never[], nextCursor: null }))
  vi.spyOn(organizerLocalApi, 'preview').mockResolvedValue({ ...local, configuration: { checkpointPositions: [] } })
  vi.spyOn(huntsApi, 'createDraft').mockImplementation(async input => { saved = { ...saved, ...input }; return saved })
  vi.spyOn(organizerLocalApi, 'select').mockImplementation(async () => {
    saved = { ...saved, templateId: local.templateId, templateKey: local.key, templateVersion: local.version, templateLocalityId: local.localityId, templateLocalitySnapshot: { id: local.localityId, countryCode: 'RO', countryDisplayName: 'Romania', name: 'Cluj-Napoca', administrativeContext: 'Cluj', latitude: 46.77, longitude: 23.59 }, templateSnapshot: { key: local.key, version: 7, displayName: local.displayName, theme: local.theme } }; return saved
  })
  vi.spyOn(huntsApi, 'updateDraft').mockImplementation(async (_id, input) => { saved = { ...saved, ...input }; return saved })
  vi.spyOn(huntsApi, 'getHunt').mockImplementation(async () => saved)
  vi.spyOn(huntsApi, 'publish').mockImplementation(async () => { saved = { ...saved, status: 'published' }; return saved })
  vi.spyOn(huntsApi, 'createOrGetAccess').mockResolvedValue({ huntId: saved.id, code: 'REAL-ACCESS' })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks() })
async function mount(url = '/organizer/hunts/new/setup') {
  await act(async () => root.render(<MemoryRouter initialEntries={[url]}><Routes><Route path="/organizer/hunts/new" element={<OrganizerSetupChoicePage />} /><Route path="/organizer/hunts/new/setup" element={<OrganizerSetup />} /><Route path="/organizer/hunts/:huntId/setup" element={<OrganizerSetup />} /></Routes></MemoryRouter>))
}
function button(label: string) { const element = [...container.querySelectorAll('button')].find(item => item.textContent === label); expect(element, label).toBeDefined(); return element! }
async function click(label: string) { await act(async () => button(label).click()) }

const selectedText = () => [...container.querySelectorAll('select')].map(el => el.selectedOptions[0]?.text)
async function pick(index: number, value: string) {
  const select = container.querySelectorAll('select')[index] as HTMLSelectElement
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, value); select.dispatchEvent(new Event('change', { bubbles: true })) })
}
/** A new Hunt preselects nothing; the Organizer chooses Country → County/Region → City. */
async function chooseCluj() { await pick(0, 'RO'); await pick(1, 'RO:admin1:13'); await pick(2, '681290') }
test('a new Hunt preselects no location; choosing Country → County/Region → City lists its approved Hunts', async () => {
  await mount()
  expect(selectedText()).toEqual(['Choose Country', 'Choose County/Region', 'Choose City'])
  expect(button('Choose Hunt').disabled).toBe(true)
  await chooseCluj()
  expect(selectedText()).toEqual(['Romania', 'Cluj', 'Cluj-Napoca'])
  expect(organizerLocalApi.page).toHaveBeenCalledWith('countries', {})
  expect(organizerLocalApi.page).toHaveBeenCalledWith('regions', { countryCode: 'RO' })
  expect(organizerLocalApi.page).toHaveBeenCalledWith('cities', { countryCode: 'RO', regionId: 'RO:admin1:13' })
  await click('Choose Hunt')
  expect(container.textContent).toContain('Choose your adventure')
  expect(organizerLocalApi.page).toHaveBeenCalledWith('templates', { countryCode: 'RO', localityId: local.localityId })
  expect(container.textContent).toContain('Cluj Adventure')
  expect(huntsApi.createDraft).not.toHaveBeenCalled()
  expect(organizerLocalApi.select).not.toHaveBeenCalled()
  await click('Back'); expect(button('Choose Hunt').disabled).toBe(false)
})
test('Cluj on a later catalog page is still listed (full country imports span several pages)', async () => {
  const original = vi.mocked(organizerLocalApi.page).getMockImplementation()!
  const filler = (kind: string) => Array.from({ length: 20 }, (_, i) => kind === 'regions'
    ? { regionId: `RO:admin1:${String(i).padStart(2, '0')}`, countryCode: 'RO', label: `County ${i}` }
    : { geographicId: `9${i}`, localityId: null, countryCode: 'RO', name: `Town ${i}`, regionId: 'RO:admin1:13' })
  vi.mocked(organizerLocalApi.page).mockImplementation(async (kind, filters, cursor) => kind === 'regions' || kind === 'cities'
    ? cursor ? original(kind, filters) : { items: filler(kind) as never[], nextCursor: 'page-2' }
    : original(kind, filters, cursor))
  await mount(); await chooseCluj()
  expect(selectedText()).toEqual(['Romania', 'Cluj', 'Cluj-Napoca'])
  expect(organizerLocalApi.page).toHaveBeenCalledWith('regions', { countryCode: 'RO' }, 'page-2')
  expect(organizerLocalApi.page).toHaveBeenCalledWith('cities', { countryCode: 'RO', regionId: 'RO:admin1:13' }, 'page-2')
  expect(button('Choose Hunt').disabled).toBe(false)
  expect(container.textContent).not.toContain('Show more')
})
test('any listed city can be chosen without registration; options are plain names; the country\'s own region label', async () => {
  const original = vi.mocked(organizerLocalApi.page).getMockImplementation()!
  vi.mocked(organizerLocalApi.page).mockImplementation(async (kind, filters, cursor) => kind === 'regions'
    ? { items: [{ regionId: 'RO:admin1:13', countryCode: 'RO', label: 'Cluj', levelLabel: 'County' }] as never[], nextCursor: null }
    : kind === 'cities' ? { items: [
      { geographicId: '681290', localityId: local.localityId, registeredActive: true, countryCode: 'RO', name: 'Cluj-Napoca', regionId: 'RO:admin1:13', source: 'geonames' },
      { geographicId: '665444', localityId: null, registeredActive: false, countryCode: 'RO', name: 'Turda', regionId: 'RO:admin1:13', source: 'geonames' },
      { geographicId: null, localityId: 'manual-1', registeredActive: true, countryCode: 'RO', name: 'Added Hamlet', regionId: 'RO:admin1:13', source: 'registry', attribution: null },
    ] as never[], nextCursor: null } : original(kind, filters, cursor))
  await mount(); await pick(0, 'RO'); await pick(1, 'RO:admin1:13')
  expect(container.textContent).toContain('Choose County'); expect(container.textContent).not.toContain('County/Region')
  const city = container.querySelectorAll('select')[2] as HTMLSelectElement
  expect([...city.options].map(o => o.text)).toEqual(['Choose City', 'Added Hamlet', 'Cluj-Napoca', 'Turda'])
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(city, '665444'); city.dispatchEvent(new Event('change', { bubbles: true })) })
  // No registration warning; a city with no Local Hunts yet simply lists none.
  expect(container.textContent).not.toMatch(/registration|not registered|Admin/i)
  expect(button('Choose Hunt').disabled).toBe(false)
  await click('Choose Hunt')
  expect(container.textContent).toContain('No approved Local Hunts are available in Turda yet.')
  expect(organizerLocalApi.page).not.toHaveBeenCalledWith('templates', expect.anything())
  await click('Back')
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(city, 'registry:manual-1'); city.dispatchEvent(new Event('change', { bubbles: true })) })
  expect(button('Choose Hunt').disabled).toBe(false)
})
test('an empty catalog says so and blocks Choose Hunt', async () => {
  vi.mocked(organizerLocalApi.page).mockImplementation(async () => ({ items: [], nextCursor: null }))
  await mount()
  expect(container.textContent).toContain('No countries are available yet')
  expect(button('Choose Hunt').disabled).toBe(true)
})
test('event metadata outage cannot block Location or Choose Hunt', async () => {
  vi.mocked(huntOptionsApi.listHuntOptions).mockRejectedValue(new ApiError('offline', null, 'network'))
  await mount(); expect(container.querySelector('[role=alert]')).toBeNull()
  await chooseCluj(); await click('Choose Hunt'); expect(container.textContent).toContain('Choose your adventure')
})
test('saved Local draft resumes with exact server identity and preserves event settings', async () => {
  await organizerLocalApi.select(saved.id, selection)
  saved = { ...saved, name: 'Saved event', country: 'Romania', region: 'Cluj', city: 'Cluj-Napoca' }
  await mount('/organizer/hunts/hunt-1/setup')
  expect(container.textContent).toContain('Make it your event')
  expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('Saved event')
  await click('Back')
  expect(organizerLocalApi.page).toHaveBeenCalledWith('templates', { countryCode: 'RO', localityId: local.localityId })
  expect(huntsApi.createDraft).not.toHaveBeenCalled()
})
test('legacy draft and independent mode keep existing builder', async () => {
  await mount('/organizer/hunts/new/setup?mode=independent')
  expect(container.textContent).toContain('General Setup')
  expect(organizerLocalApi.page).not.toHaveBeenCalled()
})

test('legacy draft keeps the existing builder', async () => {
  await mount('/organizer/hunts/hunt-1/setup'); expect(container.textContent).toContain('General Setup'); expect(container.querySelector('[aria-label="Hunt setup progress"]')).toBeNull()
})
test('saved-draft loading failure offers retry and preserves the existing route', async () => {
  vi.mocked(huntsApi.getHunt).mockRejectedValueOnce(new ApiError('offline', null, 'network')); await mount('/organizer/hunts/hunt-1/setup'); expect(container.textContent).toContain('couldn’t load your saved Hunt'); await click('Retry'); expect(container.textContent).toContain('General Setup')
})
test.each([false, true])('saved draft creation preserves server identity and eligibility gate (stale=%s)', async stale => {
  await organizerLocalApi.select(saved.id, selection)
  saved = { ...saved, country: 'Romania', region: 'Cluj', city: 'Cluj-Napoca', contactName: 'Alex', startDate: '2026-12-12', startTime: '10:00', timezone: 'Europe/Bucharest', capacity: 24, durationMinutes: 120 }
  await mount('/organizer/hunts/hunt-1/setup')
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(container.textContent).toContain('Ready for an adventure?')
  if (stale) vi.mocked(organizerLocalApi.select).mockRejectedValueOnce(new ApiError('template_selection_stale', 409, 'conflict'))
  await click('Create Hunt')
  expect(organizerLocalApi.select).toHaveBeenLastCalledWith(saved.id, selection)
  expect(huntsApi.createDraft).not.toHaveBeenCalled()
  if (stale) {
    expect(huntsApi.publish).not.toHaveBeenCalled()
    expect(huntsApi.createOrGetAccess).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Choose your adventure')
  } else {
    expect(huntsApi.publish).toHaveBeenCalledWith(saved.id)
    expect(container.textContent).toContain('Your Hunt is created')
    expect(container.querySelector('input[readonly]')?.getAttribute('value')).toContain('REAL-ACCESS')
  }
})
test('optional Subregion: All of the region lists every city; a subdivision filters cities by subregionId; region change resets it', async () => {
  const original = vi.mocked(organizerLocalApi.page).getMockImplementation()!
  const city = (geographicId: string, name: string, subregionId: string) => ({ geographicId, localityId: null, countryCode: 'US', name, regionId: 'US:admin1:CA', subregionId, countryDisplayName: 'United States', regionDisplayName: 'California', attribution: 'GeoNames (CC BY 4.0)' })
  const all = [city('5368361', 'Los Angeles', 'US:admin1:CA:admin2:037'), city('5391959', 'San Francisco', 'US:admin1:CA:admin2:075')]
  vi.mocked(organizerLocalApi.page).mockImplementation(async (kind, filters, cursor) => kind === 'countries' ? { items: [{ countryCode: 'US', displayName: 'United States' }] as never[], nextCursor: null }
    : kind === 'regions' ? { items: [{ regionId: 'US:admin1:CA', countryCode: 'US', label: 'California', levelLabel: 'State' }, { regionId: 'US:admin1:NV', countryCode: 'US', label: 'Nevada', levelLabel: 'State' }] as never[], nextCursor: null }
    : kind === 'subregions' ? { items: (filters.regionId === 'US:admin1:CA' ? [
        { subregionId: 'US:admin1:CA:admin2:075', regionId: 'US:admin1:CA', subregionCode: '075', label: 'San Francisco County', labelStatus: 'resolved', levelLabel: 'County' },
        { subregionId: 'US:admin1:CA:admin2:037', regionId: 'US:admin1:CA', subregionCode: '037', label: 'Los Angeles County', labelStatus: 'resolved', levelLabel: 'County' }] : []) as never[], nextCursor: null }
    : kind === 'cities' ? { items: all.filter(item => item.regionId === filters.regionId && (!filters.subregionId || item.subregionId === filters.subregionId)) as never[], nextCursor: null }
    : original(kind, filters, cursor))
  await mount(); await pick(0, 'US')
  expect(selectedText()).toEqual(['United States', 'Choose State', 'Choose City'])
  await pick(1, 'US:admin1:CA')
  expect(selectedText()).toEqual(['United States', 'California', 'All of California', 'Choose City'])
  expect(container.textContent).toContain('County')
  expect([...container.querySelectorAll('select')[2].querySelectorAll('option')].map(o => o.text)).toEqual(['All of California', 'Los Angeles County', 'San Francisco County'])
  expect([...container.querySelectorAll('select')[3].querySelectorAll('option')].map(o => o.text)).toEqual(['Choose City', 'Los Angeles', 'San Francisco'])
  await pick(3, '5368361'); await pick(2, 'US:admin1:CA:admin2:075')
  expect(organizerLocalApi.page).toHaveBeenCalledWith('cities', { countryCode: 'US', regionId: 'US:admin1:CA', subregionId: 'US:admin1:CA:admin2:075' })
  expect(selectedText()).toEqual(['United States', 'California', 'San Francisco County', 'Choose City'])
  expect([...container.querySelectorAll('select')[3].querySelectorAll('option')].map(o => o.text)).toEqual(['Choose City', 'San Francisco'])
  // A region without official subdivisions has no Subregion dropdown.
  await pick(1, 'US:admin1:NV'); expect(container.querySelectorAll('select')).toHaveLength(3); expect(selectedText()).toEqual(['United States', 'Nevada', 'Choose City'])
})

async function setInput(selector: string, value: string) {
  const input = container.querySelector(selector) as HTMLInputElement
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) })
}
async function resumeWithTemplate(configuration: Record<string, unknown>, hunt: Partial<Hunt> = {}) {
  await organizerLocalApi.select(saved.id, selection)
  saved = { ...saved, name: 'Saved event', contactName: 'Ana', startDate: '2027-05-01', ...hunt,
    templateSnapshot: { ...saved.templateSnapshot!, configuration } } as Hunt
  await mount('/organizer/hunts/hunt-1/setup')
  expect(container.textContent).toContain('Make it your event')
}
test('team size is editable within the template range and participants stay within its participant range', async () => {
  await resumeWithTemplate({ format: 'Team Hunters', participants: '16–40', teamSize: '3–5' }, { format: 'team', teamSize: 4, capacity: 20 })
  const team = container.querySelector('[aria-describedby="event-team-hint"]') as HTMLInputElement
  expect(team.disabled).toBe(false); expect(team.min).toBe('3'); expect(team.max).toBe('5'); expect(team.value).toBe('4')
  expect(container.textContent).toContain('Members per team: 3–5 for this Hunt.')
  expect(container.textContent).toContain('This Hunt is designed for 16–40 participants.')
  await setInput('[aria-describedby="event-team-hint"]', '6')
  expect(container.textContent).toContain('Teams must have 3–5 members for this Hunt.'); expect(button('Review event').disabled).toBe(true)
  await setInput('[aria-describedby="event-team-hint"]', '5')
  await setInput('[aria-describedby="event-capacity-hint"]', '50')
  expect(container.textContent).toContain('This Hunt is designed for 16–40 participants.'); expect(button('Review event').disabled).toBe(true)
  await setInput('[aria-describedby="event-capacity-hint"]', '30')
  expect(button('Review event').disabled).toBe(false)
  await click('Review event')
  expect(huntsApi.updateDraft).toHaveBeenLastCalledWith('hunt-1', expect.objectContaining({ capacity: 30, format: 'team', teamSize: 5 }))
})
test('Single Hunters templates show no team size and send none', async () => {
  await resumeWithTemplate({ format: 'Single Hunters', participants: '2–10' }, { format: 'solo', teamSize: null, capacity: 8 })
  expect(container.querySelector('[aria-describedby="event-team-hint"]')).toBeNull()
  expect(container.textContent).toContain('Participants play individually')
  await click('Review event')
  const input = vi.mocked(huntsApi.updateDraft).mock.calls.at(-1)![1]
  expect(input).not.toHaveProperty('teamSize'); expect(input).not.toHaveProperty('format')
  expect(container.textContent).toContain('8 · Single Hunters')
})
test('templates without a team size range keep teams of 4', async () => {
  await resumeWithTemplate({}, { format: 'team', teamSize: 4, capacity: 24 })
  const team = container.querySelector('[aria-describedby="event-team-hint"]') as HTMLInputElement
  expect(team.disabled).toBe(true); expect(team.value).toBe('4'); expect(container.textContent).toContain('This Hunt plays in teams of 4.')
})
