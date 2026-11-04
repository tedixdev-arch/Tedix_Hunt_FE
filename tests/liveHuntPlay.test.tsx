import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LiveHuntPlayPage } from '../src/pages/LiveHuntPlay'
import type { PlayState } from '../src/services/api/gameplay'

const mocks = vi.hoisted(() => ({ state: vi.fn(), arrive: vi.fn(), answerPersonal: vi.fn(), answerTeam: vi.fn(), requestHelp: vi.fn(), leaderboard: vi.fn() }))
vi.mock('../src/services/api/gameplay', async original => ({ ...await original<typeof import('../src/services/api/gameplay')>(), gameplayApi: mocks }))

const base: PlayState = {
  huntId: 'hunt-1', participantId: 'p-1', huntName: 'Signal Cluj', huntStatus: 'active', policyRevision: 'pilot',
  mission: { displayName: 'Signal', theme: null, name: 'Restore the Signal', signal: 'SIGNAL: CLUJ NAPOCA', briefing: 'Restore the relays.', finishLocation: null },
  score: 500, startedAt: null, finishedAt: null, durationMinutes: 90,
  checkpoints: [{ checkpointId: 'c-1', ordinal: 1, kind: 'regular', accessState: 'eligible_for_proximity', completed: false }, { checkpointId: 'c-2', ordinal: 2, kind: 'finish', accessState: 'not_yet_accessible', completed: false }],
  stage: 'navigate', history: [],
  current: { checkpointId: 'c-1', ordinal: 1, kind: 'regular', playable: true, navigation: { location: 'MATTHIAS REX STATUE', target: { latitude: 46.77, longitude: 23.59, radiusMeters: 25 }, clue: null } },
}
const personal: PlayState = { ...base, stage: 'personal', current: { ...base.current!, story: { kind: 'hidden-rule', title: 'Find the missing output', prompt: 'Find the output for 3416.', storyObjective: 'Find the first relay.', answerKeys: ['x'] }, personalAttempts: 0 } }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/hunts/hunt-1/play']}><Routes><Route path="/hunts/:huntId/play" element={<LiveHuntPlayPage />} /></Routes></MemoryRouter>))
}
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!

test('navigation stage shows the destination, server score and a check-in action', async () => {
  mocks.state.mockResolvedValue(base)
  await render()
  expect(mocks.state).toHaveBeenCalledWith('hunt-1')
  expect(container.textContent).toContain('MATTHIAS REX STATUE')
  expect(container.textContent).toContain('Get within 25 m')
  expect(button("I'm here")).toBeTruthy()
  expect(container.textContent).toContain('500')
})

test('waiting stage explains the Hunt has not started', async () => {
  mocks.state.mockResolvedValue({ ...base, huntStatus: 'published', stage: 'waiting', current: base.current })
  await render()
  expect(container.textContent).toContain("hasn't started yet")
})

test('answers are checked by the server; wrong answers give generic feedback and correct ones celebrate', async () => {
  mocks.state.mockResolvedValue(personal)
  mocks.answerPersonal.mockResolvedValueOnce({ correct: false, stage: 'personal', checkpointCompleted: false, state: { ...personal, score: 475 } })
  mocks.answerPersonal.mockResolvedValueOnce({ correct: true, stage: 'personal', checkpointCompleted: false, reveal: { successText: 'Multiply the digits.' }, state: { ...personal, score: 575, stage: 'team' } })
  await render()
  const input = container.querySelector<HTMLInputElement>('input[aria-label="Your answer"]')!
  const type = async (value: string) => act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) })
  await type('70'); await act(async () => button('Submit answer').click())
  expect(mocks.answerPersonal).toHaveBeenCalledWith('hunt-1', 'c-1', { x: '70' })
  expect(container.textContent).toContain('Not quite')
  expect(container.textContent).not.toContain('72')
  await type('72'); await act(async () => button('Submit answer').click())
  expect(container.textContent).toContain('Correct!')
  expect(container.textContent).toContain('+100 points')
  expect(container.textContent).toContain('Multiply the digits.')
})
