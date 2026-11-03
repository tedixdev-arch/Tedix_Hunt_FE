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
  vi.spyOn(organizerLocalApi, 'page').mockImplementation(async kind => ({ items: (kind === 'countries' ? [{ countryCode: 'RO', displayName: 'Romania' }] : kind === 'regions' ? [{ regionId: 'RO:admin1:13', countryCode: 'RO', label: 'Cluj' }] : kind === 'cities' ? [{ localityId: local.localityId, countryCode: 'RO', name: 'Cluj-Napoca', regionId: 'RO:admin1:13', countryDisplayName: 'Romania', regionDisplayName: 'Cluj' }] : [local]) as never[], nextCursor: null }))
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
async function select(index: number, value: string) { await act(async () => { const element = container.querySelectorAll('select')[index]; element.value = value; element.dispatchEvent(new Event('change', { bubbles: true })) }) }
async function field(label: string, value: string) {
  await act(async () => { const input = [...container.querySelectorAll('label')].find(item => item.textContent?.startsWith(label))!.querySelector('input')!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) })
}
async function choose() {
  await select(0, 'RO'); await select(1, 'RO:admin1:13'); await select(2, local.localityId)
  expect(container.textContent).toContain('Choose your adventure')
  await act(async () => container.querySelector<HTMLInputElement>('input[type=radio]')!.click())
  expect(container.textContent).toContain('Read-only route available')
}
async function configure() {
  await click('Use this Hunt')
  expect(container.textContent).toContain('Make it your event')
  await field('Event name', 'Our adventure'); await field('Local contact', 'Alex'); await field('Date', '2026-12-12')
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(container.textContent).toContain('Ready for an adventure?')
}
test('Romania → Cluj → Cluj-Napoca → exact Hunt → event → persisted creation → real link', async () => {
  await mount(); await choose(); await configure(); await click('Create Hunt')
  expect(organizerLocalApi.select).toHaveBeenLastCalledWith(saved.id, selection)
  expect(organizerLocalApi.select).toHaveBeenCalledTimes(2)
  expect(huntsApi.createDraft).toHaveBeenCalledTimes(1)
  expect(huntsApi.updateDraft).toHaveBeenCalledWith(saved.id, expect.objectContaining({ country: 'Romania', region: 'Cluj', city: 'Cluj-Napoca', name: 'Our adventure', contactName: 'Alex', startDate: '2026-12-12', format: 'team', teamSize: 4 }))
  expect(container.querySelector('input[readonly]')?.getAttribute('value')).toContain('/#/join/REAL-ACCESS')
  expect(container.textContent).not.toContain('SIGNAL26')
})
test('Back preserves event fields and selected Hunt without creating another draft', async () => {
  await mount(); await choose(); await configure(); await click('Back'); expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('Our adventure')
  await click('Back'); expect(container.querySelector<HTMLInputElement>('input[type=radio]')?.checked).toBe(true)
  await click('Use this Hunt'); expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('Our adventure'); expect(huntsApi.createDraft).toHaveBeenCalledTimes(1)
})
test('empty eligible geography has no dead primary action or fabricated locations', async () => {
  vi.mocked(organizerLocalApi.page).mockResolvedValue({ items: [], nextCursor: null })
  await mount(); expect(container.textContent).toContain('No locations with available Hunts'); expect(container.querySelectorAll('option')).toHaveLength(3); expect(huntsApi.createDraft).not.toHaveBeenCalled()
})
test('geography errors can be retried', async () => {
  vi.mocked(organizerLocalApi.page).mockRejectedValueOnce(new ApiError('offline', null, 'network'))
  await mount(); expect(container.querySelector('[role=alert]')).not.toBeNull(); await click('Retry choices'); expect(container.textContent).toContain('Romania')
})
test('upstream location change clears downstream city and Hunt', async () => {
  await mount(); await choose(); await click('Back'); await select(0, ''); expect(container.querySelectorAll('select')[1].value).toBe(''); expect(container.querySelectorAll('select')[2].value).toBe(''); expect(container.querySelectorAll('input[type=radio]')).toHaveLength(0)
})
test('expired eligibility at creation cannot publish or show success', async () => {
  await mount(); await choose(); await configure(); vi.mocked(organizerLocalApi.select).mockRejectedValueOnce(new ApiError('template_selection_stale', 409, 'conflict')); await click('Create Hunt')
  expect(container.textContent).toContain('select a Hunt again'); expect(container.textContent).toContain('Choose your adventure'); expect(huntsApi.publish).not.toHaveBeenCalled(); expect(huntsApi.createOrGetAccess).not.toHaveBeenCalled(); expect(container.querySelector('input[readonly]')).toBeNull()
})
test('publish failure retains review and allows retry without fake success', async () => {
  await mount(); await choose(); await configure(); vi.mocked(huntsApi.publish).mockRejectedValueOnce(new ApiError('offline', null, 'network')); await click('Create Hunt'); expect(container.textContent).toContain('Ready for an adventure?'); expect(huntsApi.createOrGetAccess).not.toHaveBeenCalled(); await click('Create Hunt'); expect(container.textContent).toContain('Your Hunt is created')
})
test('access failure retries access only after successful creation', async () => {
  await mount(); await choose(); await configure(); vi.mocked(huntsApi.createOrGetAccess).mockRejectedValueOnce(new ApiError('offline', null, 'network')); await click('Create Hunt'); expect(container.textContent).toContain('Your Hunt is created'); expect(container.querySelector('input[readonly]')).toBeNull(); await click('Create sharing link'); expect(huntsApi.publish).toHaveBeenCalledTimes(1); expect(container.querySelector('input[readonly]')?.getAttribute('value')).toContain('REAL-ACCESS')
})
test('saved C7 Local draft resumes event configuration using saved exact identity', async () => {
  await organizerLocalApi.select(saved.id, selection); saved = { ...saved, country: 'Romania', region: 'Cluj', city: 'Cluj-Napoca', contactName: 'Alex', startDate: '2026-12-12', startTime: '10:00', timezone: 'Europe/Bucharest', capacity: 24, durationMinutes: 120 }
  await mount('/organizer/hunts/hunt-1/setup'); expect(container.textContent).toContain('Make it your event'); await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); await click('Create Hunt'); expect(organizerLocalApi.select).toHaveBeenLastCalledWith(saved.id, selection); expect(huntsApi.createDraft).not.toHaveBeenCalled()
})
test('legacy draft keeps the existing builder', async () => {
  await mount('/organizer/hunts/hunt-1/setup'); expect(container.textContent).toContain('General Setup'); expect(container.querySelector('[aria-label="Hunt setup progress"]')).toBeNull()
})
test('Independent mode keeps its existing builder and cannot use C7 discovery', async () => {
  await mount('/organizer/hunts/new/setup?mode=independent'); expect(container.textContent).toContain('General Setup'); expect(organizerLocalApi.page).not.toHaveBeenCalled(); expect(huntsApi.createDraft).not.toHaveBeenCalled()
})
test('mismatched exact preview blocks selection', async () => {
  vi.mocked(organizerLocalApi.preview).mockResolvedValue({ ...local, version: 8, configuration: {} })
  await mount(); await select(0, 'RO'); await select(1, 'RO:admin1:13'); await select(2, local.localityId); await act(async () => container.querySelector<HTMLInputElement>('input[type=radio]')!.click())
  expect(button('Use this Hunt').disabled).toBe(true); expect(huntsApi.createDraft).not.toHaveBeenCalled(); expect(container.querySelector('[role=alert]')).not.toBeNull()
})
test('selection failure keeps the created draft and retry does not duplicate it', async () => {
  await mount(); await choose(); vi.mocked(organizerLocalApi.select).mockRejectedValueOnce(new ApiError('offline', null, 'network')); await click('Use this Hunt'); expect(container.textContent).toContain('Choose your adventure'); await click('Use this Hunt'); expect(huntsApi.createDraft).toHaveBeenCalledTimes(1); expect(container.textContent).toContain('Make it your event')
})
test('saved-draft loading failure offers retry and preserves the existing route', async () => {
  vi.mocked(huntsApi.getHunt).mockRejectedValueOnce(new ApiError('offline', null, 'network')); await mount('/organizer/hunts/hunt-1/setup'); expect(container.textContent).toContain('couldn’t load your saved Hunt'); await click('Retry'); expect(container.textContent).toContain('General Setup')
})
test('server pagination appends eligible countries and preserves opaque cursor', async () => {
  vi.mocked(organizerLocalApi.page).mockResolvedValueOnce({ items: [{ countryCode: 'RO', displayName: 'Romania' }], nextCursor: 'opaque+cursor' }).mockResolvedValueOnce({ items: [{ countryCode: 'GB', displayName: 'United Kingdom' }], nextCursor: null })
  await mount(); await click('Show more'); expect(container.textContent).toContain('Romania'); expect(container.textContent).toContain('United Kingdom'); expect(organizerLocalApi.page).toHaveBeenLastCalledWith('countries', {}, 'opaque+cursor')
})
test('late responses for a previous country cannot populate the current region choices', async () => {
  const original = vi.mocked(organizerLocalApi.page).getMockImplementation()!
  let resolve!: (value: { items: never[]; nextCursor: null }) => void
  vi.mocked(organizerLocalApi.page).mockImplementation((kind, filters, cursor) => kind === 'regions' ? new Promise(done => { resolve = done }) : original(kind, filters, cursor))
  await mount(); await select(0, 'RO'); await select(0, ''); await act(async () => resolve({ items: [{ regionId: 'late', label: 'Stale region' }] as never[], nextCursor: null })); expect(container.textContent).not.toContain('Stale region')
})

test('rewards persist through existing APIs and unsaved edits cannot be abandoned by review', async () => {
  await mount(); await choose(); await click('Use this Hunt')
  await act(async () => { const details = [...container.querySelectorAll('details')].find(item => item.querySelector('summary')?.textContent === 'Rewards (optional)')!; details.open = true })
  await click('+ Add reward'); expect(button('Review event').disabled).toBe(true); expect(button('Back').disabled).toBe(true)
  const reward = { id: 'reward-1', huntId: saved.id, place: 1, provider: 'tedix_inventory' as const, kind: 'physical' as const, category: null, name: null, description: null, quantity: 4 }
  vi.spyOn(huntRewardsApi, 'createLeaderboard').mockResolvedValue(reward)
  await click('Save allocation'); expect(huntRewardsApi.createLeaderboard).toHaveBeenCalledWith(saved.id, expect.objectContaining({ place: 1, quantity: 4 })); expect(button('Review event').disabled).toBe(false)
  vi.mocked(huntRewardsApi.list).mockResolvedValue({ leaderboard: [reward], specialAwards: [] })
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  expect(container.textContent).toContain('1 leaderboard rewards')
})
