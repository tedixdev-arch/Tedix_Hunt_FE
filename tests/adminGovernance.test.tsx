import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminTemplateReviewsPage, AdminTemplateReviewDetailPage } from '../src/pages/AdminTemplateReviews'
import type { AdminTemplateReview } from '../src/services/api/adminTemplateReviews'
const api = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), approve: vi.fn(), requestChanges: vi.fn(), approved: vi.fn(), suspend: vi.fn() }))
vi.mock('../src/services/api/adminTemplateReviews.ts', () => ({ adminTemplateReviewsApi: api }))
vi.mock('../src/pages/AdminConsole.tsx', () => ({ AdminShell: ({ children }: any) => <main>{children}</main> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'admin', roles: ['admin', 'creator'] } }) }))
let root: Root, container: HTMLDivElement
export const fixture = (category?: 'universal' | 'local'): AdminTemplateReview => ({ key: category ?? 'legacy', category, version: 3, status: 'submitted', origin: 'creator', creator: { id: 'creator', name: 'Ada', email: 'ada@test' }, content: { key: category ?? 'legacy', version: 3, displayName: category ?? 'Legacy', theme: 'City', mission: 'Exact story v3', configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Saved pin', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Saved finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } }, checkpoints: [{ answer: 'exact v3 answer' }], scoring: { points: 10 } } })
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); api.list.mockResolvedValue([fixture('universal'), fixture('local'), fixture()]); api.get.mockResolvedValue(fixture('universal')) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render(path = '/admin/templates') { await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/templates" element={<AdminTemplateReviewsPage />} /><Route path="/admin/reviews/:key" element={<AdminTemplateReviewDetailPage />} /></Routes></MemoryRouter>)) }
const button = (name: string) => [...container.querySelectorAll('button')].find(node => node.textContent === name)!
async function click(name: string) { await act(async () => button(name).click()) }
test('01 mixed queue filters locally and exact selected GET owns inspection', async () => {
  await render(); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('universal'); expect(api.list).toHaveBeenCalledWith()
  await act(async () => ([...container.querySelectorAll('a')].find(a => a.textContent === 'Local')!).click())
  expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('local'); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).not.toContain('universal')
  api.get.mockResolvedValue({ ...fixture('local'), content: { ...fixture('local').content, mission: 'Pinned v3, candidate v8 is private' } })
  await act(async () => container.querySelector<HTMLAnchorElement>('a[href*="/admin/reviews/local"]')!.click())
  expect(api.get).toHaveBeenCalledWith('local'); expect(container.textContent).toContain('Pinned v3'); expect(container.textContent).toContain('Submitted version 3')
})
test('01 Universal omits geography, Legacy remains selectable', async () => {
  await render('/admin/reviews/universal'); expect(container.textContent).not.toContain('Saved geography'); expect(container.textContent).not.toContain('Saved pin')
  await act(async () => ([...container.querySelectorAll('a')].find(a => a.textContent === 'Legacy')!).click()); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('Legacy')
})
test('01 empty and ambiguous missing inspection have readable recovery', async () => {
  const { ApiError } = await import('../src/services/api/client'); api.list.mockResolvedValue([]); api.get.mockRejectedValue(new ApiError('not_found', 404, 'http'))
  await render('/admin/reviews/gone'); expect(container.textContent).toContain('No items awaiting review'); expect(container.textContent).toContain('may have changed'); expect(button('Refresh inspection')).toBeTruthy()
})
test('02 classified decisions pin exact version and repeated clicks submit once', async () => {
  api.approve.mockResolvedValue({ ...fixture('universal'), status: 'approved' }); await render('/admin/reviews/universal')
  await act(async () => { button('Approve template').click(); button('Approve template').click() })
  expect(api.approve).toHaveBeenCalledExactlyOnceWith('universal', 3); expect(container.textContent).toContain('Template approved')
})
test('02 combined-role owner cannot self-approve but may request changes per BE contract', async () => {
  api.get.mockResolvedValue({ ...fixture('local'), creator: { id: 'admin', name: 'Me', email: null } }); await render('/admin/reviews/local')
  expect(button('Approve template').disabled).toBe(true); expect(button('Request changes').disabled).toBe(false); expect(api.approve).not.toHaveBeenCalled()
})
test('02 stale 409 refreshes exact inspection and requires a new explicit action', async () => {
  const { ApiError } = await import('../src/services/api/client'); api.approve.mockRejectedValueOnce(new ApiError('conflict', 409, 'conflict'))
  await render('/admin/reviews/universal'); api.get.mockResolvedValue({ ...fixture('universal'), version: 5, content: { ...fixture('universal').content, version: 5 } })
  await click('Approve template'); expect(api.approve).toHaveBeenCalledTimes(1); expect(container.textContent).toContain('Submitted version 5'); expect(container.textContent).toContain('new explicit decision')
  api.requestChanges.mockResolvedValue({ ...fixture('universal'), version: 5, status: 'changes_requested' }); await click('Request changes'); expect(api.requestChanges).toHaveBeenCalledExactlyOnceWith('universal', 5)
})
test.each([401, 403])('02 %s decision denial clears private inspection and shows no success', async status => {
  const { ApiError } = await import('../src/services/api/client'); api.approve.mockRejectedValue(new ApiError('forbidden', status, 'http')); await render('/admin/reviews/universal'); await click('Approve template')
  expect(container.textContent).not.toContain('Exact story'); expect(container.textContent).not.toContain('Template approved'); expect(container.querySelector('[role="alert"]')).toBeTruthy()
})
test('02 legacy decisions preserve optional body behavior', async () => {
  api.get.mockResolvedValue(fixture()); api.requestChanges.mockResolvedValue({ ...fixture(), status: 'changes_requested' }); await render('/admin/reviews/legacy'); await click('Request changes'); expect(api.requestChanges).toHaveBeenCalledExactlyOnceWith('legacy', undefined)
})
const locality = { id: 'place', countryCode: 'RO', countryDisplayName: 'Romania', name: 'Saved town', administrativeContext: 'North', latitude: 46, longitude: 23 }
const retained = () => ({ ...fixture('local'), status: 'draft', version: 2, candidateVersion: 7, candidateStatus: 'draft', submittedVersion: null, localityId: 'place', localitySnapshot: locality, currentLocality: { ...locality, active: true }, localApprovedVersion: 2, localApproval: { version: 2, authority: 'approved', independentEvidence: true, localityBound: true }, localSuspension: null })
test('03 retained exact approval remains inspectable during draft revisions', async () => {
  api.approved.mockResolvedValue(retained()); await render('/admin/reviews/local?category=Local&view=approved')
  expect(api.get).not.toHaveBeenCalled(); expect(api.approved).toHaveBeenCalledWith('local'); expect(container.textContent).toContain('Candidate version: 7 · draft. Retained version: 2.'); expect(container.textContent).toContain('Saved town'); expect(button('Approve template')).toBeUndefined()
})
test.each([{ name: 'Corrected town' }, { latitude: 47 }, { active: false }])('03 saved snapshot stays distinct from registry %j', async change => {
  api.approved.mockResolvedValue({ ...retained(), currentLocality: { ...locality, active: true, ...change } }); await render('/admin/reviews/local?view=approved')
  expect(container.textContent).toContain('Saved town'); expect(container.textContent).toMatch(/labels changed|coordinates, country or identity changed|locality is inactive/)
})
test('03 historical unresolved authority exposes missing evidence and never substitutes candidate', async () => {
  api.approved.mockResolvedValue({ ...retained(), version: null, content: null, localitySnapshot: null, currentLocality: null, localApproval: { version: 2, authority: 'integrity_exception', independentEvidence: false, localityBound: false } })
  await render('/admin/reviews/local?view=approved'); expect(container.textContent).toContain('Retained content is unresolved'); expect(container.textContent).toContain('does not establish eligibility'); expect(container.textContent).not.toContain('Exact story v3')
})
async function fill(selector: string, value: string) { const node = container.querySelector<HTMLTextAreaElement>(selector)!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })) }) }
test('04 suspension requires a reason and pins retained authority instead of candidate', async () => {
  api.approved.mockResolvedValue(retained()); const audit = { version: 2, reason: 'Unsafe access', at: '2026-10-30T12:00:00Z', byUserId: 'admin' }; api.suspend.mockResolvedValue({ key: 'local', localApprovedVersion: 2, localSuspension: audit })
  await render('/admin/reviews/local?view=approved'); expect(button('Suspend version 2').disabled).toBe(true); await fill('#suspension-reason', '   '); expect(button('Suspend version 2').disabled).toBe(true)
  await fill('#suspension-reason', 'Unsafe access'); expect(container.querySelector('textarea')!.maxLength).toBe(1000); await click('Suspend version 2'); expect(api.suspend).toHaveBeenCalledExactlyOnceWith('local', 2, 'Unsafe access'); expect(container.textContent).toContain('Existing Hunts are not terminated'); expect(container.textContent).toContain('Unsafe access'); expect(button('Suspend version 2')).toBeUndefined()
})
test('04 suspension conflict reloads retained version and never silently retries', async () => {
  const { ApiError } = await import('../src/services/api/client'); api.approved.mockResolvedValue(retained()); api.suspend.mockRejectedValue(new ApiError('conflict', 409, 'conflict')); await render('/admin/reviews/local?view=approved'); await fill('#suspension-reason', 'Changed access'); api.approved.mockResolvedValue({ ...retained(), version: 4 }); await click('Suspend version 2'); expect(api.suspend).toHaveBeenCalledTimes(1); expect(container.textContent).toContain('Retained version: 4'); expect(button('Suspend version 4').disabled).toBe(true)
})
test('04 already suspended authority retains audit and offers no reset', async () => {
  api.approved.mockResolvedValue({ ...retained(), localSuspension: { version: 2, reason: 'Retained suspension', at: '2026-10-30T12:00:00Z', byUserId: 'admin' } }); await render('/admin/reviews/local?view=approved'); expect(container.textContent).toContain('Retained suspension'); expect(container.querySelector('textarea')).toBeNull(); expect(container.textContent).not.toMatch(/Reinstate|Reset suspension/)
})
test('01 late inspection cannot overwrite another selected item', async () => {
  let resolve!: (value: AdminTemplateReview) => void
  api.get.mockImplementationOnce(() => new Promise(done => { resolve = done })); await render('/admin/reviews/universal?category=Local')
  expect(container.textContent).toContain('Loading submitted Template'); api.get.mockResolvedValue(fixture('local'))
  await act(async () => container.querySelector<HTMLAnchorElement>('a[href*="/admin/reviews/local"]')!.click())
  await act(async () => resolve({ ...fixture('universal'), content: { ...fixture('universal').content, mission: 'Late private response' } }))
  expect(container.textContent).not.toContain('Late private response'); expect(container.textContent).toContain('Saved geography')
})
test('01 revoked Admin queue access clears all inspection content', async () => {
  const { ApiError } = await import('../src/services/api/client'); await render('/admin/reviews/universal'); api.list.mockRejectedValue(new ApiError('forbidden', 403, 'http')); await click('Refresh queue'); expect(container.textContent).not.toContain('Exact story v3'); expect(container.querySelector('[aria-label="Review queue"]')).toBeNull(); expect(button('Retry access')).toBeTruthy()
})
test('04 more than 1000 suspension characters cannot be submitted', async () => {
  api.approved.mockResolvedValue(retained()); await render('/admin/reviews/local?view=approved'); await fill('#suspension-reason', 'x'.repeat(1001)); expect(button('Suspend version 2').disabled).toBe(true); expect(api.suspend).not.toHaveBeenCalled()
})
test('04 candidate approval refreshes retained authority without removing suspension', async () => {
  const audit = { version: 2, reason: 'Still suspended after new approval', at: '2026-10-30', byUserId: 'admin' }
  api.get.mockResolvedValue(fixture('local')); api.approved.mockResolvedValue({ ...retained(), localSuspension: audit }); api.approve.mockResolvedValue({ ...fixture('local'), status: 'approved' }); await render('/admin/reviews/local?category=Local')
  api.approved.mockResolvedValue({ ...retained(), version: 3, localApprovedVersion: 3, localSuspension: audit }); await click('Approve template'); expect(api.approved).toHaveBeenCalledTimes(2); expect(container.textContent).toContain('Retained version: 3'); expect(container.textContent).toContain(audit.reason); expect(container.querySelector('textarea')).toBeNull()
})
