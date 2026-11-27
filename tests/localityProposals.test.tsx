import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { LocalityProposals, proposalValidation } from '../src/features/creator/LocalityProposals'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ mine: vi.fn(), submit: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/localityProposals', () => ({ localityProposalsApi: api }))
vi.mock('../src/services/api/geography', async importOriginal => ({ ...(await importOriginal<typeof import('../src/services/api/geography')>()), geographyApi: api }))
const input = { countryCode: 'RO', name: 'Town', administrativeContext: 'County', latitude: 46, longitude: 23, explanation: 'This settlement is missing from the registry.', evidenceReference: 'Independent official gazetteer 2026 entry 123.' }
const proposal = { ...input, id: 'proposal', status: 'pending', localityId: null, decisionReason: null }
let root: Root, container: HTMLDivElement, select: ReturnType<typeof vi.fn>
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); api.mine.mockResolvedValue({ proposals: [] }); api.submit.mockResolvedValue(proposal); select = vi.fn(); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent!.includes(text))!.click()) }
async function render() { await act(async () => root.render(<LocalityProposals country="RO" countries={[{ code: 'RO', displayName: 'Romania' }]} onRegistryPlace={select} />)) }
async function fill() { for (const [i, value] of [input.name, input.administrativeContext, '46', '23', input.explanation, input.evidenceReference].entries()) await act(async () => { const node = container.querySelectorAll('input,textarea')[i]; Object.getOwnPropertyDescriptor(node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('10 inline disclosure, native labels, explicit proposal, pending never selected', async () => {
  await render(); expect(container.querySelector('input')).toBeNull(); expect(api.mine).not.toHaveBeenCalled()
  await click("Can't find"); expect(container.querySelector('[aria-expanded]')?.getAttribute('aria-expanded')).toBe('true'); expect(container.querySelectorAll('label')).toHaveLength(6)
  await click('Send locality'); expect(api.submit).not.toHaveBeenCalled(); expect(container.textContent).toContain('Enter a locality name')
  await fill(); await click('Send locality'); expect(api.submit).toHaveBeenCalledExactlyOnceWith(input); expect(select).not.toHaveBeenCalled(); expect(container.textContent).toContain('Pending review — not selectable'); expect(container.textContent).not.toContain('Find approved locality')
})
test('10 owner statuses are real; approved selection requires active authoritative registry read', async () => {
  api.mine.mockResolvedValue({ proposals: [proposal, { ...proposal, id: 'approved', status: 'approved', localityId: 'registry', decisionReason: 'Evidence confirmed' }, { ...proposal, id: 'rejected', status: 'rejected', decisionReason: 'Duplicate of stored town' }] })
  await render(); await click("Can't find"); expect(container.textContent).toContain('Rejected'); expect(container.textContent).toContain('Duplicate of stored town'); expect(select).not.toHaveBeenCalled()
  const place = { ...input, id: 'registry', name: 'Corrected registry name', active: true }
  api.get.mockResolvedValue(place); await click('Find approved'); expect(api.get).toHaveBeenCalledExactlyOnceWith('registry'); expect(select).toHaveBeenCalledExactlyOnceWith(place)
})
test.each([{ id: 'registry', active: false, countryCode: 'RO' }, { id: 'wrong', active: true, countryCode: 'RO' }, { id: 'registry', active: true, countryCode: 'US' }])('10 unavailable or mismatched approved record never selected: %j', async place => {
  api.mine.mockResolvedValue({ proposals: [{ ...proposal, status: 'approved', localityId: 'registry' }] }); api.get.mockResolvedValue(place)
  await render(); await click("Can't find"); await click('Find approved'); expect(select).not.toHaveBeenCalled(); expect(container.querySelector('[role=alert]')).not.toBeNull()
})
test.each([400, 401, 403, 409, 500])('10 submission error %s keeps input and sends no registry selection', async status => {
  await render(); await click("Can't find"); await fill(); api.submit.mockRejectedValue(new ApiError('failure', status, 'http')); await click('Send locality')
  expect(container.querySelector('input')!.value).toBe('Town'); expect(container.querySelector('[role=alert]')).not.toBeNull(); expect(select).not.toHaveBeenCalled()
  if (status === 500) { await click('Send locality'); expect(api.submit).toHaveBeenCalledTimes(1); await click('Refresh proposals'); await click('Send locality'); expect(api.submit).toHaveBeenCalledTimes(2) }
})
test.each([401,403])('10 denied refresh clears previously displayed private history: %s', async status => {
  api.mine.mockResolvedValueOnce({ proposals: [proposal] }).mockRejectedValue(new ApiError('denied', status, 'http')); await render(); await click("Can't find"); expect(container.textContent).toContain('Pending review'); await click('Refresh proposals'); expect(container.textContent).not.toContain('Pending review'); expect(container.querySelector('[role=alert]')).not.toBeNull()
})
test.each([{ latitude: 91 }, { longitude: NaN }, { countryCode: '' }, { evidenceReference: 'short' }, { explanation: 'Mapbox generated coordinates stored here' }])('10 bounded validation rejects invalid or provider-derived input %j', invalid => { expect(proposalValidation({ ...input, ...invalid })).not.toBe('') })
test('10b proposal is filed in the selected county/region and is refused for places already in the City list', async () => {
  await act(async () => root.render(<LocalityProposals country="RO" countries={[{ code: 'RO', displayName: 'Romania' }]} region={null} regionRequired onRegistryPlace={select} />))
  await click("Can't find"); expect(container.textContent).toContain('not in the City list'); expect(container.textContent).toContain('Choose County/Region above')
  expect([...container.querySelectorAll('button')].find(b => b.textContent!.includes('Send locality'))!.disabled).toBe(true)
  await act(async () => root.render(<LocalityProposals country="RO" countries={[{ code: 'RO', displayName: 'Romania' }]} region={{ admin1Code: '13', displayName: 'Cluj' }} regionRequired onRegistryPlace={select} />))
  await fill(); await click('Send locality'); expect(api.submit).toHaveBeenCalledExactlyOnceWith({ ...input, admin1Code: '13' })
  api.submit.mockRejectedValue(new ApiError('catalog_city_exists', 409, 'http', { error: 'catalog_city_exists' })); await fill(); await click('Send locality')
  expect(container.textContent).toContain('already in the City list'); expect(select).not.toHaveBeenCalled()
})

test('10c the proposal uses the country\'s own region label and sends people to the whole region when a subdivision filter hides cities', async () => {
  const props = { country: 'RO', countries: [{ code: 'RO', displayName: 'Romania' }], regionRequired: true, regionLabel: 'County', onRegistryPlace: select }
  await act(async () => root.render(<LocalityProposals {...props} region={null} />))
  await click("Can't find"); expect(container.textContent).toContain('County: Choose County above'); expect(container.textContent).not.toContain('County/Region')
  await act(async () => root.render(<LocalityProposals {...props} region={{ admin1Code: '13', displayName: 'Cluj' }} subregion={{ label: 'Commune', displayName: 'Comuna Apahida' }} />))
  expect(container.textContent).toContain('The City list above shows only Comuna Apahida. Choose "All of Cluj"')
  expect((container.querySelectorAll('input')[1] as HTMLInputElement).placeholder).toBe('Comuna Apahida, Cluj')
  // Proposals stay at region level: the subdivision is never sent.
  await fill(); await click('Send locality'); expect(api.submit).toHaveBeenCalledExactlyOnceWith({ ...input, admin1Code: '13' })
  api.submit.mockRejectedValue(new ApiError('catalog_city_exists', 409, 'http', { error: 'catalog_city_exists' })); await fill(); await click('Send locality')
  expect(container.querySelector('[role=alert]')!.textContent).toBe('This place is already in the City list for the chosen county. Choose "All of Cluj" and pick it from the City dropdown instead; a proposal is not needed.')
  await act(async () => root.render(<LocalityProposals {...props} region={{ admin1Code: '13', displayName: 'Cluj' }} />))
  expect(container.textContent).not.toContain('The City list above shows only')
})
