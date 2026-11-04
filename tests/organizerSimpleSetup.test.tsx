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

test('Cluj default resolves its canonical locality through the catalog and lists its approved Hunts', async () => {
  await mount()
  expect([...container.querySelectorAll('select')].map(el => el.value)).toEqual(['Romania', 'Cluj', 'Cluj-Napoca'])
  expect(organizerLocalApi.page).toHaveBeenCalledWith('countries', {}, undefined)
  expect(organizerLocalApi.page).toHaveBeenCalledWith('regions', { countryCode: 'RO' }, undefined)
  expect(organizerLocalApi.page).toHaveBeenCalledWith('cities', { countryCode: 'RO', regionId: 'RO:admin1:13' }, undefined)
  await click('Choose Hunt')
  expect(container.textContent).toContain('Choose your adventure')
  expect(organizerLocalApi.page).toHaveBeenCalledWith('templates', { countryCode: 'RO', localityId: local.localityId })
  expect(container.textContent).toContain('Cluj Adventure')
  expect(huntsApi.createDraft).not.toHaveBeenCalled()
  expect(organizerLocalApi.select).not.toHaveBeenCalled()
  await click('Back'); expect(button('Choose Hunt').disabled).toBe(false)
})
test('a missing Cluj catalog entry blocks Choose Hunt with a retry', async () => {
  vi.mocked(organizerLocalApi.page).mockImplementation(async () => ({ items: [], nextCursor: null }))
  await mount()
  expect(container.textContent).toContain('not available in the location catalog')
  expect(button('Choose Hunt').disabled).toBe(true)
  expect(button('Retry location')).toBeTruthy()
})
test('event metadata outage cannot block Location or Choose Hunt', async () => {
  vi.mocked(huntOptionsApi.listHuntOptions).mockRejectedValue(new ApiError('offline', null, 'network'))
  await mount(); expect(container.querySelector('[role=alert]')).toBeNull()
  await click('Choose Hunt'); expect(container.textContent).toContain('Choose your adventure')
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
