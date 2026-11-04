import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { OrganizerMonitorPage } from '../src/pages/OrganizerMonitor'

const mocks = vi.hoisted(() => ({ monitor: vi.fn(), checkIn: vi.fn(), resolveHelp: vi.fn(), getHunt: vi.fn(), pause: vi.fn(), access: vi.fn() }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer</header> }))
vi.mock('../src/components/OrganizerHuntGeography', () => ({ OrganizerHuntGeographyInspection: ({ huntId }: { huntId: string }) => <p>Geography for {huntId}</p> }))
vi.mock('../src/services/api/operations', () => ({ huntOperationsApi: { monitor: mocks.monitor, checkIn: mocks.checkIn, resolveHelp: mocks.resolveHelp } }))
vi.mock('../src/services/api', async original => ({ ...await original<typeof import('../src/services/api')>(), huntsApi: { getHunt: mocks.getHunt, pause: mocks.pause, createOrGetAccess: mocks.access } }))

const data = {
  hunt: { id: 'hunt-1', name: 'Signal Cluj', status: 'active', capacity: 30, durationMinutes: 120, startDate: '2026-11-20', startTime: '10:00:00', timezone: 'Europe/Bucharest' },
  totals: { participants: 2, started: 2, finished: 0, openHelpRequests: 1 },
  participants: [
    { participantId: 'p-1', displayName: 'Ana', rank: 1, score: 625, joinedAt: '2026-11-20T08:00:00Z', startedAt: '2026-11-20T08:01:00Z', finishedAt: null, lastActivityAt: '2026-11-20T08:05:00Z', checkpointsCompleted: 1, checkpointsTotal: 7, current: { checkpointId: 'c-2', ordinal: 2, kind: 'regular', accessState: 'eligible_for_proximity' } },
    { participantId: 'p-2', displayName: 'Bogdan', rank: 2, score: 500, joinedAt: '2026-11-20T08:00:00Z', startedAt: '2026-11-20T08:01:00Z', finishedAt: null, lastActivityAt: null, checkpointsCompleted: 0, checkpointsTotal: 7, current: { checkpointId: 'c-1', ordinal: 1, kind: 'regular', accessState: 'proximity_verified' } },
  ],
  helpRequests: [{ id: 'h-1', participantId: 'p-2', displayName: 'Bogdan', kind: 'help', message: 'Lost near the statue', status: 'open', createdAt: '2026-11-20T08:06:00Z', resolvedAt: null }],
  activity: [{ participantId: 'p-1', displayName: 'Ana', ordinal: 1, stage: 'team', correct: true, at: '2026-11-20T08:05:00Z' }],
}
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  mocks.monitor.mockResolvedValue(data); mocks.getHunt.mockResolvedValue({ id: 'hunt-1', accessCode: 'ABCDEFGH' })
  mocks.pause.mockResolvedValue({}); mocks.checkIn.mockResolvedValue({}); mocks.resolveHelp.mockResolvedValue({})
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/organizer/hunts/hunt-1']}><Routes><Route path="/organizer/hunts/:huntId" element={<OrganizerMonitorPage />} /></Routes></MemoryRouter>))
}
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!
async function click(text: string) { await act(async () => button(text).click()) }

test('shows real participants, scores, help requests, activity and the participant link', async () => {
  await render()
  expect(mocks.monitor).toHaveBeenCalledWith('hunt-1')
  expect(container.textContent).toContain('Signal Cluj')
  expect(container.textContent).toContain('Ana')
  expect(container.textContent).toContain('625')
  expect(container.textContent).toContain('Lost near the statue')
  expect(container.textContent).toContain('Ana solved the team challenge at checkpoint 1')
  expect(container.querySelector<HTMLInputElement>('input[aria-label="Participant link"]')!.value).toContain('/#/join/ABCDEFGH')
  expect(container.textContent).toContain('Geography for hunt-1')
  expect(container.textContent).not.toContain('simulated')
})

test('lifecycle controls call the real API and refresh', async () => {
  await render()
  await click('Pause Hunt')
  expect(mocks.pause).toHaveBeenCalledWith('hunt-1')
  expect(mocks.monitor).toHaveBeenCalledTimes(2)
})

test('confirm arrival is offered only for a participant on the way, and resolving help calls the API', async () => {
  await render()
  const confirms = [...container.querySelectorAll('button')].filter(b => b.textContent === 'Confirm arrival')
  expect(confirms).toHaveLength(1)
  await act(async () => confirms[0].click())
  expect(mocks.checkIn).toHaveBeenCalledWith('hunt-1', 'p-1', 'c-2')
  await click('Mark resolved')
  expect(mocks.resolveHelp).toHaveBeenCalledWith('hunt-1', 'h-1')
})
