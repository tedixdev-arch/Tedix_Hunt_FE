import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ApiError } from '../src/services/api/client'
import type { Hunt } from '../src/services/api/hunts'
import { monitorControls } from '../src/features/organizer/monitorLifecycle'
import { OrganizerMonitorPage } from '../src/pages/OrganizerMonitor'

const mocks = vi.hoisted(() => ({ get: vi.fn(), start: vi.fn(), pause: vi.fn(), resume: vi.fn(), finish: vi.fn(), cancel: vi.fn(), publish: vi.fn() }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer workspace</header> }))
vi.mock('../src/components/OrganizerHuntGeography', () => ({ OrganizerHuntGeographyInspection: () => null }))
vi.mock('../src/services/api', async importOriginal => ({
  ...await importOriginal<any>(),
  huntsApi: { getHunt: mocks.get, start: mocks.start, pause: mocks.pause, resume: mocks.resume, finish: mocks.finish, cancel: mocks.cancel, publish: mocks.publish },
}))

const hunt = (status: Hunt['status']) => ({ id: 'h1', name: 'Signal Spring', status, startDate: '2026-11-10', startTime: '10:00' }) as Hunt
let container: HTMLDivElement, root: Root
beforeEach(() => { vi.clearAllMocks(); (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove() })

async function renderMonitor(path = '/organizer/hunts/h1') {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/organizer/hunts/:huntId" element={<OrganizerMonitorPage />} /></Routes></MemoryRouter>))
}
const button = (label: string) => [...container.querySelectorAll('button')].find(item => item.textContent === label)
async function click(label: string) { const target = button(label); expect(target, label).toBeDefined(); await act(async () => target!.click()) }
const status = () => container.querySelector('[data-testid="server-hunt-status"]')?.textContent

test('control mapping follows the backend lifecycle', () => {
  expect(monitorControls('published')).toEqual({ primary: 'start', canEnd: false })
  expect(monitorControls('active')).toEqual({ primary: 'pause', canEnd: true })
  expect(monitorControls('paused')).toEqual({ primary: 'resume', canEnd: true })
  for (const s of ['draft', 'finished', 'cancelled'] as const) expect(monitorControls(s)).toEqual({ primary: null, canEnd: false })
})

test('shows the persisted status and pauses/resumes through the API', async () => {
  mocks.get.mockResolvedValue(hunt('active')); mocks.pause.mockResolvedValue(hunt('paused')); mocks.resume.mockResolvedValue(hunt('active'))
  await renderMonitor()
  expect(mocks.get).toHaveBeenCalledWith('h1'); expect(status()).toBe('In progress'); expect(container.textContent).toContain('Signal Spring · 2026-11-10, 10:00')
  await click('Pause Hunt'); expect(mocks.pause).toHaveBeenCalledWith('h1'); expect(status()).toBe('Paused')
  await click('Resume Hunt'); expect(mocks.resume).toHaveBeenCalledWith('h1'); expect(status()).toBe('In progress')
})

test('starts a published Hunt', async () => {
  mocks.get.mockResolvedValue(hunt('published')); mocks.start.mockResolvedValue(hunt('active'))
  await renderMonitor()
  expect(button('End Hunt')!.disabled).toBe(true)
  await click('Start Hunt'); expect(mocks.start).toHaveBeenCalledWith('h1'); expect(status()).toBe('In progress'); expect(button('End Hunt')!.disabled).toBe(false)
})

test('End Hunt requires confirmation and then finishes on the server', async () => {
  mocks.get.mockResolvedValue(hunt('active')); mocks.finish.mockResolvedValue(hunt('finished'))
  await renderMonitor()
  await click('End Hunt'); expect(mocks.finish).not.toHaveBeenCalled()
  await click('Keep running'); expect(mocks.finish).not.toHaveBeenCalled()
  await click('End Hunt'); await click('Confirm end Hunt')
  expect(mocks.finish).toHaveBeenCalledWith('h1'); expect(status()).toBe('Completed')
  expect(container.textContent).toContain('Live controls are no longer available'); expect(button('Pause Hunt')).toBeUndefined()
})

test('a state conflict shows an error and reloads the authoritative Hunt', async () => {
  mocks.get.mockResolvedValueOnce(hunt('active')).mockResolvedValueOnce(hunt('cancelled'))
  mocks.pause.mockRejectedValue(new ApiError('conflict', 409, 'conflict', { error: 'invalid_hunt_state' }))
  await renderMonitor()
  await click('Pause Hunt')
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('changed state on the server')
  expect(mocks.get).toHaveBeenCalledTimes(2); expect(status()).toBe('Cancelled')
})

test('load failure can be retried', async () => {
  mocks.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(hunt('paused'))
  await renderMonitor()
  expect(container.textContent).toContain('We couldn’t load the Hunt status.')
  await click('Retry'); expect(status()).toBe('Paused')
})

test('independent mode stays local and never calls the API', async () => {
  await act(async () => root.render(<MemoryRouter initialEntries={['/monitor?mode=independent']}><OrganizerMonitorPage /></MemoryRouter>))
  await click('Pause Hunt'); expect(container.textContent).toContain('Resume Hunt')
  for (const fn of Object.values(mocks)) expect(fn).not.toHaveBeenCalled()
})
