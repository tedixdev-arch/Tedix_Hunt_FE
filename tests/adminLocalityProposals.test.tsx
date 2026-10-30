import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LocalityProposalReview } from '../src/features/admin/LocalityProposalReview'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ list: vi.fn(), decide: vi.fn(), search: vi.fn(), userId: 'admin' }))
vi.mock('../src/services/api/adminLocalityProposals', () => ({ adminLocalityProposalsApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: { search: api.search } }))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: api.userId, roles: ['admin', 'creator'] } }) }))
let root: Root, container: HTMLDivElement
const proposal = { id: 'proposal', creatorUserId: 'creator', status: 'pending', countryCode: 'RO', name: 'Independent town', administrativeContext: 'North county', latitude: 46, longitude: 23, explanation: 'Missing independently documented locality', evidenceReference: 'Independent gazetteer, volume 2 page 30', createdAt: '2026-10-30', reviewerUserId: null, decisionReason: null, decidedAt: null, localityId: null }
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); api.userId = 'admin'; api.list.mockResolvedValue([proposal]); api.search.mockResolvedValue({ localities: [] }); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<LocalityProposalReview />)) }
const button = (name: string) => [...container.querySelectorAll('button')].find(node => node.textContent === name)!
async function select() { await act(async () => container.querySelector<HTMLButtonElement>('ul button')!.click()) }
async function fill(value: string) { const node = container.querySelector('textarea')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })) }) }
test.each(['approved', 'rejected'])('05 human %s requires reason and shows only returned decision', async decision => {
  api.decide.mockResolvedValue({ ...proposal, status: decision, decisionReason: 'Verified independently', reviewerUserId: 'admin', localityId: decision === 'approved' ? 'stored-uuid' : null }); await render(); await select()
  expect(container.textContent).toContain(proposal.evidenceReference); expect(container.textContent).toContain('46, 23'); expect(button('Approve locality').disabled).toBe(true); await fill('short'); expect(button('Approve locality').disabled).toBe(true); await fill('Verified independently')
  const name = decision === 'approved' ? 'Approve locality' : 'Reject proposal'; await act(async () => { button(name).click(); button(name).click() }); expect(api.decide).toHaveBeenCalledExactlyOnceWith('proposal', decision, 'Verified independently'); expect(container.textContent).toContain(`Proposal ${decision}.`); expect(container.querySelector('textarea')).toBeNull()
  if (decision === 'approved') expect(container.textContent).toContain('stored-uuid')
})
test('05 duplicate conflict leaves pending and does not invent registry identity', async () => {
  api.search.mockResolvedValue({ localities: [{ name: 'Possible match', latitude: 46, longitude: 23 }] }); api.decide.mockRejectedValue(new ApiError('locality_duplicate_conflict', 409, 'conflict')); await render(); await select(); await fill('Verified independently'); await act(async () => button('Approve locality').click())
  expect(container.textContent).toContain('proposal remains pending'); expect(container.textContent).toContain('Possible match'); expect(container.querySelector('textarea')!.value).toBe(''); expect(button('Approve locality').disabled).toBe(true); expect(api.decide).toHaveBeenCalledTimes(1)
})
test('05 combined-role self-review denies approve and reject', async () => { api.userId = 'creator'; await render(); await select(); await fill('Verified independently'); expect(button('Approve locality').disabled).toBe(true); expect(button('Reject proposal').disabled).toBe(true); expect(api.decide).not.toHaveBeenCalled() })
test('05 concurrent decision disappears on fresh read and never posts', async () => { await render(); await select(); await fill('Verified independently'); api.list.mockResolvedValue([]); await act(async () => button('Approve locality').click()); expect(api.decide).not.toHaveBeenCalled(); expect(container.textContent).toContain('already decided') })
test.each([401, 403])('05 %s clears private proposal on decision denial', async status => { api.decide.mockRejectedValue(new ApiError('forbidden', status, 'http')); await render(); await select(); await fill('Verified independently'); await act(async () => button('Reject proposal').click()); expect(container.textContent).not.toContain(proposal.evidenceReference); expect(container.querySelector('[role="alert"]')).toBeTruthy() })
test('05 empty and load error have recovery', async () => { api.list.mockResolvedValue([]); await render(); expect(container.textContent).toContain('No locality proposals'); api.list.mockRejectedValue(new Error('offline')); await act(async () => button('Refresh proposals').click()); expect(container.querySelector('[role="alert"]')).toBeTruthy() })
