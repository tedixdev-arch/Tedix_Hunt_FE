import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CustomExercisePlay } from '../src/features/play/CustomExercisePlay'
import { LiveHuntPlayPage } from '../src/pages/LiveHuntPlay'
import type { CustomExercisePlay as Exercise, PlayState } from '../src/services/api/gameplay'

const mocks = vi.hoisted(() => ({ state: vi.fn(), arrive: vi.fn(), answerPersonal: vi.fn(), answerTeam: vi.fn(), answerCustom: vi.fn(), requestHelp: vi.fn(), leaderboard: vi.fn() }))
vi.mock('../src/services/api/gameplay', async original => ({ ...await original<typeof import('../src/services/api/gameplay')>(), gameplayApi: mocks }))

const ab = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]
const ex = (type: string, interaction: Record<string, unknown>, classification: 'personal' | 'team' = 'personal'): Exercise =>
  ({ type, classification, title: `${type} title`, instructions: 'Solve it', interaction })

let root: Root, container: HTMLDivElement, last: unknown
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); last = undefined
  container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const mount = async (exercise: Exercise) => { await act(async () => root.render(<CustomExercisePlay exercise={exercise} onChange={r => { last = r }} />)) }
const click = async (name: string) => { await act(async () => ([...container.querySelectorAll('button')].find(b => b.textContent === name) as HTMLButtonElement).click()) }
async function set(selector: string, value: string) {
  await act(async () => {
    const el = container.querySelector(selector) as HTMLInputElement | HTMLSelectElement
    Object.getOwnPropertyDescriptor(el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  })
}
const check = async (label: string) => { await act(async () => ([...container.querySelectorAll('label')].find(l => l.textContent === label)!.querySelector('input') as HTMLInputElement).click()) }

test('choice mechanics produce option responses only when chosen', async () => {
  await mount(ex('single-choice', { options: ab })); expect(last).toBeNull(); await click('B'); expect(last).toEqual({ optionId: 'b' })
  await mount(ex('true-false', {})); await click('False'); expect(last).toEqual({ value: false })
  await mount(ex('distributed-information', { facts: ab, options: ab }, 'team')); await click('A'); expect(last).toEqual({ optionId: 'a' })
  await mount(ex('assemble-machine', { contributions: ab, frequencies: [{ id: 'f1', text: '100 Hz', value: 100 }, { id: 'f2', text: '200 Hz', value: 200 }] }, 'team')); await click('200 Hz'); expect(last).toEqual({ frequencyId: 'f2' })
  await mount(ex('shape-pattern', { terms: [{ id: 'x', shapeId: 'a' }, { id: 'y' }], missingId: 'y', shapes: ab })); expect(container.textContent).toContain('A  ___'); await click('B'); expect(last).toEqual({ shapeId: 'b' })
})

test('multi-select, pairing and assignment mechanics need a complete answer', async () => {
  await mount(ex('multiple-choice', { options: ab })); await check('A'); await check('B'); expect(last).toEqual({ optionIds: ['a', 'b'] })
  await mount(ex('filter-noise', { signals: ab }, 'team')); await check('B'); expect(last).toEqual({ trustedSignalIds: ['b'] })
  await mount(ex('match-columns', { left: ab, right: ab })); await set('[aria-label="Match for A"]', 'b'); expect(last).toBeNull()
  await set('[aria-label="Match for B"]', 'a'); expect(last).toEqual({ pairs: [{ leftId: 'a', rightId: 'b' }, { leftId: 'b', rightId: 'a' }] })
  await mount(ex('drag-drop', { items: ab, targets: [{ id: 't', text: 'T' }] })); await set('[aria-label="Target for A"]', 't'); await set('[aria-label="Target for B"]', 't')
  expect(last).toEqual({ assignments: [{ itemId: 'a', targetId: 't' }, { itemId: 'b', targetId: 't' }] })
  await mount(ex('fill-blank', { blanks: [{ id: 'x', prompt: '2 + 2 =' }] })); await set('[aria-label="2 + 2 ="]', '4'); expect(last).toEqual({ values: [{ blankId: 'x', value: '4' }] })
})

test('ordering mechanics build the tapped order; shared final key derives the code', async () => {
  await mount(ex('sequence', { elements: ab })); await click('B'); expect(last).toBeNull(); await click('A'); expect(last).toEqual({ order: ['b', 'a'] })
  await mount(ex('build-problem', { pieces: ab, slots: [{ id: 's1', text: 'first' }] })); await click('A'); expect(last).toEqual({ construction: ['a'] })
  await mount(ex('shared-final-key', { contributions: [{ id: 'x', digits: '01' }, { id: 'y', digits: '23' }], orderingInstructions: 'Y first' }, 'team'))
  await click('23'); await click('01'); expect(last).toEqual({ order: ['y', 'x'], code: '2301' })
})

test('text and number mechanics', async () => {
  await mount(ex('memory-card', { revealDelayMs: 1000 })); expect(container.textContent).toContain('revealed after you answer'); await set('input', '81'); expect(last).toEqual({ value: '81' })
  await mount(ex('scrambled-word', { contributions: ab }, 'team')); await set('input', 'BA'); expect(last).toEqual({ word: 'BA' })
  await mount(ex('number-pattern', { terms: [{ id: 'a', value: 3 }, { id: 'b', value: 6 }, { id: 'c' }], missingId: 'c' })); expect(container.textContent).toContain('3, 6, ___')
  await set('input', 'x'); expect(last).toBeNull(); await set('input', '9'); expect(last).toEqual({ value: 9 })
  await mount(ex('rule-discovery', { examples: [{ input: 1, output: 2 }], rules: ab, predictionInput: 3 })); await click('B'); await set('input', '6'); expect(last).toEqual({ ruleId: 'b', predictedOutput: 6 })
  await mount(ex('number-line', { min: 0, max: 10, step: 0.5 })); expect(last).toBeNull(); await set('[aria-label="Number line"]', '4.5'); expect(last).toEqual({ value: 4.5 })
  await mount(ex('find-mistake', { steps: ab, explanations: [{ id: 'e1', text: 'Sign error' }] })); await click('A'); expect(last).toBeNull(); await click('Sign error'); expect(last).toEqual({ stepId: 'a', explanationId: 'e1' })
})

const playing: PlayState = {
  huntId: 'hunt-1', participantId: 'p-1', huntName: 'Custom Hunt', huntStatus: 'active', policyRevision: 'pilot',
  mission: { displayName: 'Custom', theme: null, name: 'Go', signal: null, briefing: null, finishLocation: null },
  score: 0, startedAt: null, finishedAt: null, durationMinutes: 60, history: [], stage: 'personal',
  checkpoints: [{ checkpointId: 'c-1', ordinal: 1, kind: 'regular', accessState: 'proximity_verified', completed: false }],
  current: { checkpointId: 'c-1', ordinal: 1, kind: 'regular', playable: true, navigation: { location: null, target: null, clue: null },
    story: { storyObjective: 'Pick the answer', answerKeys: [] }, personalExercise: ex('single-choice', { options: ab }) },
}

test('live play submits a custom exercise response and shows the success feedback', async () => {
  mocks.state.mockResolvedValue(playing)
  mocks.answerCustom.mockResolvedValueOnce({ correct: false, stage: 'personal', checkpointCompleted: false, state: playing })
    .mockResolvedValueOnce({ correct: true, stage: 'personal', checkpointCompleted: true, reveal: { successText: 'Well done', recallCard: undefined }, state: { ...playing, score: 50, stage: 'finished', current: null } })
  await act(async () => root.render(<MemoryRouter initialEntries={['/hunts/hunt-1/play']}><Routes><Route path="/hunts/:huntId/play" element={<LiveHuntPlayPage />} /></Routes></MemoryRouter>))
  expect(container.textContent).toContain('Pick the answer'); expect(container.textContent).toContain('single-choice title')
  const submit = () => [...container.querySelectorAll('button')].find(b => b.textContent === 'Submit answer') as HTMLButtonElement
  expect(submit().disabled).toBe(true)
  await click('B'); await act(async () => submit().click())
  expect(mocks.answerCustom).toHaveBeenLastCalledWith('hunt-1', 'c-1', 'personal', { optionId: 'b' })
  expect(container.querySelector('[role="alert"]')!.textContent).toContain('Not quite')
  await click('A'); await act(async () => submit().click())
  expect(mocks.answerCustom).toHaveBeenLastCalledWith('hunt-1', 'c-1', 'personal', { optionId: 'a' })
  expect(container.textContent).toContain('Mission complete!'); expect(container.textContent).toContain('Well done')
  expect(mocks.answerPersonal).not.toHaveBeenCalled()
})
