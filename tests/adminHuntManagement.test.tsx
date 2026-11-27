import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminHuntDetailPage } from '../src/pages/AdminHuntDetail'
import { AdminAlertsPage, AdminHuntsPage } from '../src/pages/AdminOperations'
import { ApiError } from '../src/services/api/client'

const api = vi.hoisted(() => ({ list: vi.fn(), filterOptions: vi.fn(), export: vi.fn(), detail: vi.fn(), history: vi.fn(), createAccess: vi.fn(), lifecycle: vi.fn() }))
const ops = vi.hoisted(() => ({ monitor: vi.fn(), checkIn: vi.fn(), resolveHelp: vi.fn(), alerts: vi.fn(), resolveAlert: vi.fn() }))
vi.mock('../src/services/api/adminHunts', async original => ({ ...await original<typeof import('../src/services/api/adminHunts')>(), adminHuntsApi: api }))
vi.mock('../src/services/api/operations', () => ({
  huntOperationsApi: { monitor: ops.monitor, checkIn: ops.checkIn, resolveHelp: ops.resolveHelp },
  adminOperationsApi: { alerts: ops.alerts, resolveAlert: ops.resolveAlert },
}))
vi.mock('../src/pages/AdminConsole', () => ({ AdminShell: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
vi.mock('../src/components/OrganizerHuntGeography', () => ({ HuntSnapshotGeographyInspection: () => <p>Geography</p> }))

const row = (over: object = {}) => ({
  id: 'h1', name: 'Signal Cluj', status: 'active', city: 'Cluj-Napoca', country: 'Romania', startDate: '2027-05-01', startTime: '10:00:00', timezone: 'Europe/Bucharest',
  durationMinutes: 90, capacity: 30, createdAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-02T10:00:00Z', templateName: 'Signal',
  organization: { id: 'o1', name: 'Alpha School', independent: false }, organizer: { id: 'u1', name: 'Olga', email: 'olga@example.test' },
  participants: 5, activeParticipants: 3, finished: 1, openAlerts: 2, ...over,
})
const detail = (over: object = {}) => ({
  ...row(), hunt: { id: 'h1', name: 'Signal Cluj', status: 'active', accessCode: 'ABCD2345', templateKey: 'signal', templateVersion: 1, city: 'Cluj-Napoca', country: 'Romania', region: null,
    startDate: '2027-05-01', startTime: '10:00:00', timezone: 'Europe/Bucharest', durationMinutes: 90, capacity: 30, contactName: 'Olga', format: 'team', teamSize: 4,
    templateSnapshot: { displayName: 'Signal', theme: 'Explore', mission: { name: 'Restore the signal' }, checkpoints: [{ checkpoint: 1, kind: 'hidden-rule' }, { role: 'terminal' }], configuration: { checkpointPositions: [{ checkpointNumber: 1, name: 'Union Square' }] } } },
  helpRequests: { open: 2, resolved: 1 }, startedAt: '2026-11-03T10:00:00Z', endedAt: null, allowedActions: ['pause', 'cancel', 'finish'], readiness: null, ...over,
})
const monitor = { hunt: { id: 'h1', name: 'Signal Cluj', status: 'active', capacity: 30, durationMinutes: 90, startDate: null, startTime: null, timezone: null },
  totals: { participants: 0, started: 0, finished: 0, openHelpRequests: 0 }, participants: [], helpRequests: [], activity: [] }

let root: Root, container: HTMLDivElement
let lastLocation = ''
let mounts = 0
function LocationProbe() { const l = useLocation(); lastLocation = `${l.pathname}${l.search}`; return null }
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  api.list.mockResolvedValue({ hunts: [row(), row({ id: 'h2', name: 'Draft trail', status: 'draft', openAlerts: 0, organization: { id: 'o2', name: 'Otto', independent: true } })], total: 60, page: 1, pageSize: 25 })
  api.filterOptions.mockResolvedValue({ organizations: [{ id: 'o1', name: 'Alpha School', independent: false }], organizers: [] })
  api.detail.mockResolvedValue(detail()); api.history.mockResolvedValue([])
  ops.monitor.mockResolvedValue(monitor); ops.alerts.mockResolvedValue({ alerts: [] })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals() })
async function render(path: string, state?: unknown) {
  await act(async () => root.render(<MemoryRouter key={`${path}:${++mounts}`} initialEntries={[{ pathname: path.split('?')[0], search: path.includes('?') ? `?${path.split('?')[1]}` : '', state }]}><LocationProbe /><Routes>
    <Route path="/admin/hunts" element={<AdminHuntsPage />} /><Route path="/admin/hunts/:huntId" element={<AdminHuntDetailPage />} /><Route path="/admin/alerts" element={<AdminAlertsPage />} />
  </Routes></MemoryRouter>))
}
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text) as HTMLButtonElement
const click = async (text: string) => { await act(async () => button(text).click()) }
async function type(selector: string, value: string) {
  await act(async () => {
    const el = container.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  })
}

test('list shows every column, links to the admin detail and to alerts, never to organizer routes', async () => {
  await render('/admin/hunts')
  expect(api.list).toHaveBeenCalledWith({}, 1, 25)
  const text = container.textContent!
  for (const value of ['60 Hunts', 'Alpha School', 'Olga', 'olga@example.test', 'Romania', '90 min', '5 / 30', 'Independent', 'Page 1 of 3']) expect(text).toContain(value)
  const hrefs = [...container.querySelectorAll('a')].map(a => a.getAttribute('href'))
  expect(hrefs).toContain('/admin/hunts/h1'); expect(hrefs).toContain('/admin/hunts/h2'); expect(hrefs).toContain('/admin/alerts?huntId=h1')
  expect(hrefs.some(h => h?.startsWith('/organizer'))).toBe(false)
  expect([...container.querySelectorAll('a')].find(a => a.getAttribute('href') === '/admin/hunts/h2' && a.textContent === 'View')).toBeTruthy()
})

test('filters, sorting and paging are kept in the URL and sent to the API', async () => {
  await render('/admin/hunts?status=active&page=2&pageSize=50')
  expect(api.list).toHaveBeenLastCalledWith({ status: 'active' }, 2, 50)
  await type('[aria-label="Status"]', 'paused')
  expect(lastLocation).toBe('/admin/hunts?status=paused&pageSize=50')
  await click('Created ▼')
  expect(lastLocation).toContain('order=asc')
  api.list.mockResolvedValue({ hunts: [row()], total: 60, page: 1, pageSize: 25 })
  await render('/admin/hunts')
  await click('Next'); expect(lastLocation).toBe('/admin/hunts?page=2')
})

test('search is debounced into the URL and auto-refresh keeps the same query', async () => {
  vi.useFakeTimers()
  await render('/admin/hunts?status=active')
  await type('[aria-label="Search Hunts"]', 'cluj')
  await act(async () => { await vi.advanceTimersByTimeAsync(450) })
  expect(lastLocation).toBe('/admin/hunts?status=active&q=cluj')
  expect(api.list).toHaveBeenLastCalledWith({ status: 'active', q: 'cluj' }, 1, 25)
  const calls = api.list.mock.calls.length
  await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
  expect(api.list.mock.calls.length).toBe(calls + 1); expect(api.list).toHaveBeenLastCalledWith({ status: 'active', q: 'cluj' }, 1, 25)
})

test('export uses the current filters and downloads a CSV', async () => {
  api.export.mockResolvedValue({ filename: 'tedixhunt-hunts.csv', csv: 'a,b\r\n', rows: 1, truncated: false })
  const create = vi.fn(() => 'blob:x'); vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }))
  const clicks = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  await render('/admin/hunts?organizationId=o1&sort=name&order=asc')
  await click('Export CSV')
  expect(api.export).toHaveBeenCalledWith({ organizationId: 'o1', sort: 'name', order: 'asc' })
  expect(create).toHaveBeenCalled(); expect(clicks).toHaveBeenCalled(); expect(container.textContent).toContain('Exported 1 Hunt.')
})

test('detail shows complete information, access code and back link to the same list view', async () => {
  await render('/admin/hunts/h1', { from: '?status=active&page=2' })
  const text = container.textContent!
  for (const value of ['Signal Cluj', 'Alpha School', 'olga@example.test', 'Cluj-Napoca, Romania', '90 min', 'ABCD2345', 'Restore the signal', 'Union Square', 'Playing now'])
    expect(text).toContain(value)
  expect((container.querySelector('[aria-label="Participant link"]') as HTMLInputElement).value).toContain('/#/join/ABCD2345')
  expect(container.querySelector('a[href="/admin/hunts?status=active&page=2"]')?.textContent).toBe('← Back to Hunts')
  expect(container.querySelector('a[href="/admin/alerts?huntId=h1"]')).not.toBeNull()
  expect(text).not.toContain('My Hunts')
  expect(ops.monitor).toHaveBeenCalledWith('h1')
})

test('lifecycle overrides need a reason, warn for destructive actions and report invalid transitions', async () => {
  api.lifecycle.mockRejectedValueOnce(new ApiError('conflict', 409, 'conflict', { error: 'invalid_transition', message: 'Cannot finish a paused Hunt.' })).mockResolvedValue({})
  await render('/admin/hunts/h1')
  await click('End Hunt')
  expect(container.querySelector('[role="dialog"]')!.textContent).toContain('cannot be undone')
  expect(button('Confirm end hunt').disabled).toBe(true)
  await type('[role="dialog"] textarea', 'Organizer unreachable')
  await click('Confirm end hunt')
  expect(api.lifecycle).toHaveBeenCalledWith('h1', 'finish', 'Organizer unreachable')
  expect(container.querySelector('[role="dialog"] [role="alert"]')!.textContent).toContain('Cannot finish a paused Hunt.')
  await click('Confirm end hunt')
  expect(container.querySelector('[role="dialog"]')).toBeNull(); expect(container.textContent).toContain('Recorded in the audit history')
  expect(api.history).toHaveBeenCalledTimes(2)
})

test('draft detail shows publishing readiness issues and offers publish with readiness errors', async () => {
  api.detail.mockResolvedValue(detail({ status: 'draft', allowedActions: ['publish', 'cancel'], readiness: { ready: false, issues: [{ field: 'contactName', section: 'general', message: 'Add a local contact' }] },
    hunt: { ...detail().hunt, status: 'draft', accessCode: null } }))
  api.lifecycle.mockRejectedValue(new ApiError('not ready', 422, 'http', { error: 'hunt_not_ready', issues: [{ field: 'contactName', section: 'general', message: 'Add a local contact' }] }))
  await render('/admin/hunts/h1')
  expect(container.textContent).toContain('Publishing readiness'); expect(container.textContent).toContain('Add a local contact')
  expect(container.textContent).toContain('available once the Hunt is published')
  expect(ops.monitor).not.toHaveBeenCalled()
  await click('Publish'); await type('[role="dialog"] textarea', 'Organizer asked'); await click('Confirm publish')
  expect(container.querySelector('[role="dialog"] [role="alert"]')!.textContent).toContain('cannot be published yet')
})

test('history lists actor, role, status change and admin reason; load errors are explained', async () => {
  api.history.mockResolvedValue([{ id: 'e1', occurredAt: '2026-11-04T10:00:00Z', actor: { userId: 'a', label: 'admin@example.test', roles: ['admin'] }, action: 'hunt.admin_override', category: 'hunts',
    summary: 'Admin override: Hunt paused', details: { previousStatus: 'active', newStatus: 'paused', reason: 'Storm warning' } }])
  await render('/admin/hunts/h1')
  const history = container.querySelector('[aria-labelledby="history-title"]')!.textContent!
  for (const value of ['Admin override', 'admin@example.test', 'admin', 'active → paused', 'Storm warning']) expect(history).toContain(value)
  api.detail.mockRejectedValue(new ApiError('missing', 404, 'http'))
  await render('/admin/hunts/missing')
  expect(container.querySelector('[role="alert"]')!.textContent).toBe('This Hunt does not exist or was removed.')
})

test('alerts page filters by Hunt and links back to the admin Hunt page', async () => {
  ops.alerts.mockResolvedValue({ alerts: [{ id: 'a1', huntId: 'h1', huntName: 'Signal Cluj', displayName: 'Ana', kind: 'help', message: 'Lost', status: 'open', createdAt: '2026-11-04T10:00:00Z', resolvedAt: null }] })
  await render('/admin/alerts?huntId=h1')
  expect(ops.alerts).toHaveBeenCalledWith('h1')
  expect(container.querySelector('a[href="/admin/hunts/h1"]')?.textContent).toBe('← Back to Hunt')
  expect([...container.querySelectorAll('a')].some(a => a.getAttribute('href')?.startsWith('/organizer'))).toBe(false)
})
