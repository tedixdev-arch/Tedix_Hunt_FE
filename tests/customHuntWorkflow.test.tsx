import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminCustomRequestsPage } from '../src/pages/AdminOperations'
import { CustomRequestPage, OrganizerCustomRequestsPage } from '../src/pages/OrganizerSetupFlow'
import { CreatorCustomRequests } from '../src/features/creator/CreatorCustomRequests'
import { ApiError } from '../src/services/api/client'

const ops = vi.hoisted(() => ({
  customRequests: vi.fn(), updateCustomRequest: vi.fn(), assignCustomRequest: vi.fn(), rejectCustomRequest: vi.fn(),
  submit: vi.fn(), mine: vi.fn(), list: vi.fn(), linkTemplate: vi.fn(),
}))
const users = vi.hoisted(() => ({ listUsers: vi.fn() }))
const orgs = vi.hoisted(() => ({ listAccessible: vi.fn() }))
const auth = vi.hoisted(() => ({ user: { id: 'u1', name: 'Ana', email: 'ana@example.test' } as unknown }))
vi.mock('../src/services/api/operations', () => ({
  adminOperationsApi: { customRequests: ops.customRequests, updateCustomRequest: ops.updateCustomRequest, assignCustomRequest: ops.assignCustomRequest, rejectCustomRequest: ops.rejectCustomRequest },
  customHuntRequestsApi: { submit: ops.submit, mine: ops.mine },
  creatorCustomRequestsApi: { list: ops.list, linkTemplate: ops.linkTemplate },
}))
vi.mock('../src/services/api/adminUsers', () => ({ adminUsersApi: users }))
vi.mock('../src/services/api/organizations', () => ({ organizationsApi: orgs }))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => auth }))
vi.mock('../src/pages/AdminConsole', () => ({ AdminShell: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))

const request = (over: object = {}) => ({
  id: 'r1', organizationId: 'o1', organizationName: 'Requesting school', city: 'Cluj-Napoca', preferredDate: '2027-05-01', participantCount: 40,
  details: 'School anniversary trail', status: 'new', createdAt: '2026-11-20T10:00:00Z', updatedAt: '2026-11-20T10:00:00Z', completedAt: null,
  contactName: 'Ana', contactEmail: 'ana@example.test', adminNote: null, organizerNote: null, submittedByUserId: 'u1',
  assignedCreator: null, assignedAt: null, template: null, ...over,
})
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  auth.user = { id: 'u1', name: 'Ana', email: 'ana@example.test' }
  users.listUsers.mockResolvedValue([{ id: 'c1', name: 'Cora Creator', email: 'cora@example.test', roles: ['creator'], activationState: 'not_required', status: 'active' }])
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const render = async (node: ReactNode) => { await act(async () => root.render(<MemoryRouter>{node}</MemoryRouter>)) }
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text) as HTMLButtonElement
const click = async (text: string) => { await act(async () => button(text).click()) }
async function set(selector: string, value: string) {
  await act(async () => {
    const el = container.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  })
}

test('Admin assigns a request to an active Creator and can mark it in review', async () => {
  ops.customRequests.mockResolvedValue({ requests: [request()] }); ops.assignCustomRequest.mockResolvedValue(request({ status: 'assigned' }))
  await render(<AdminCustomRequestsPage />)
  expect(container.textContent).toContain('New'); expect(button('Assign').disabled).toBe(true)
  await set('[aria-label="Assign Creator"]', 'c1'); await click('Assign')
  expect(ops.assignCustomRequest).toHaveBeenCalledWith('r1', 'c1'); expect(ops.customRequests).toHaveBeenCalledTimes(2)
  await click('Mark in review'); expect(ops.updateCustomRequest).toHaveBeenCalledWith('r1', { status: 'in_review' })
})

test('Admin sees the linked template with a review link, and cannot assign a request without an organization', async () => {
  ops.customRequests.mockResolvedValue({ requests: [
    request({ status: 'in_progress', assignedCreator: { id: 'c1', name: 'Cora Creator', email: 'cora@example.test' }, template: { key: 'school-trail', status: 'submitted', submittedVersion: 1, approvedVersion: null, displayName: 'School trail', locality: null } }),
    request({ id: 'r2', organizationId: null, organizationName: null }),
  ] })
  await render(<AdminCustomRequestsPage />)
  expect(container.textContent).toContain('Creator building'); expect(container.textContent).toContain('School trail · submitted for review')
  expect(container.querySelector('a[href="/admin/reviews/school-trail"]')?.textContent).toBe('Review and approve')
  expect(container.textContent).toContain('No organization linked'); expect((container.querySelectorAll('[aria-label="Assign Creator"]')[1] as HTMLSelectElement).disabled).toBe(true)
})

test('Admin rejection requires a note for the Organizer and shows server errors', async () => {
  ops.customRequests.mockResolvedValue({ requests: [request()] })
  ops.rejectCustomRequest.mockRejectedValueOnce(new ApiError('conflict', 409, 'conflict', { error: 'request_finalized' })).mockResolvedValue(request({ status: 'rejected' }))
  await render(<AdminCustomRequestsPage />)
  await click('Reject request…'); expect(button('Reject and notify').disabled).toBe(true)
  await set('[aria-label="Note for the Organizer"]', 'Venue not accessible'); await click('Reject and notify')
  expect(ops.rejectCustomRequest).toHaveBeenCalledWith('r1', 'Venue not accessible'); expect(container.textContent).toContain('already finished')
  await click('Reject and notify'); expect(ops.rejectCustomRequest).toHaveBeenCalledTimes(2)
})

test('Organizer tracking shows In work / Done / Rejected with notes and a setup link when done', async () => {
  ops.mine.mockResolvedValue([
    { ...request(), progress: 'in_work', note: null, hunt: null },
    { ...request({ id: 'r2', status: 'completed' }), progress: 'done', note: 'Enjoy!', hunt: { key: 'k', status: 'approved', submittedVersion: 1, approvedVersion: 1, displayName: 'School trail', locality: { id: 'l', name: 'Cluj-Napoca', administrativeContext: 'Cluj', countryCode: 'RO', countryDisplayName: 'Romania' } } },
    { ...request({ id: 'r3', status: 'rejected' }), progress: 'rejected', note: 'Venue not accessible', hunt: null },
  ])
  await render(<OrganizerCustomRequestsPage />)
  const items = [...container.querySelectorAll('li')]
  expect(items.map(li => li.querySelector('span')?.textContent)).toEqual(['In work', 'Done', 'Rejected'])
  expect(items[1].textContent).toContain('School trail is ready in Cluj-Napoca'); expect(items[1].querySelector('a')?.getAttribute('href')).toBe('/organizer/hunts/new/setup')
  expect(items[2].textContent).toContain('Venue not accessible')
})

test('signed-in Organizer request is linked to their organization', async () => {
  orgs.listAccessible.mockResolvedValue([{ id: 'o1', name: 'Requesting school' }, { id: 'p', name: 'Personal', independent: true }]); ops.submit.mockResolvedValue({ id: 'r1', status: 'new' })
  await render(<CustomRequestPage />)
  expect((container.querySelector('select') as HTMLSelectElement).value).toBe('o1')
  await set('input[placeholder="City or venue"]', 'Cluj-Napoca'); await set('input[type="date"]', '2027-05-01'); await set('input[type="number"]', '40'); await set('textarea', 'Trail')
  await act(async () => { container.querySelector('form')!.requestSubmit() })
  expect(ops.submit).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'o1', city: 'Cluj-Napoca', participantCount: 40 }))
  expect(ops.submit.mock.calls[0][0]).not.toHaveProperty('organizationName')
})

test('Creator brief offers Build for this request and links an existing Local draft', async () => {
  ops.list.mockResolvedValueOnce([{ ...request({ status: 'assigned' }) }]).mockResolvedValue([{ ...request({ status: 'in_progress', template: { key: 'draft-1', status: 'draft', submittedVersion: null, approvedVersion: null, displayName: 'Draft one', locality: null } }) }])
  ops.linkTemplate.mockResolvedValue({})
  const templates = [
    { key: 'draft-1', version: 1, status: 'draft', category: 'local', content: { displayName: 'Draft one' } },
    { key: 'uni', version: 1, status: 'draft', category: 'universal', content: { displayName: 'Universal' } },
  ] as never
  await render(<CreatorCustomRequests templates={templates} />)
  expect(container.querySelector('a[href="/create?category=local&customRequest=r1"]')?.textContent).toBe('Build template for this request')
  expect([...container.querySelectorAll('[aria-label="Existing Local draft"] option')].map(o => o.textContent)).toEqual(['Use an existing Local draft', 'Draft one'])
  expect(container.textContent).not.toContain('ana@example.test')
  await set('[aria-label="Existing Local draft"]', 'draft-1'); await click('Link')
  expect(ops.linkTemplate).toHaveBeenCalledWith('r1', 'draft-1'); expect(container.textContent).toContain('Template: Draft one · Draft')
})
