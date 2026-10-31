import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { ChallengeAuthoring } from '../src/features/creator/exercises/ChallengeAuthoring'
import { teamExamples, teamMechanics } from '../src/features/creator/exercises/teamExamples'
import { independentExercise, validateExercise, type Exercise } from '../src/features/creator/exercises/catalog'
import { toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { applyExerciseDrafts, hydrateExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import type { PersonalCreationContext } from '../src/features/creator/exercises/creationContext'

let container: HTMLDivElement, root: Root, state: AuthoringDraft
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.spyOn(window, 'confirm').mockReturnValue(true); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function Harness({ initial, context }: { initial?: AuthoringDraft; context?: PersonalCreationContext }) {
  const [draft, setDraft] = useState<AuthoringDraft>(initial ?? { source: 'saved', assignment: 'predefined' }); state = draft
  return <ChallengeAuthoring field="teamKind" context={context} value={{ teamKind: 'scrambled-word' }} onChange={() => {}} draft={draft} onDraftChange={setDraft} />
}
const button = (name: string) => [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === name || b.getAttribute('aria-label') === name)!
const click = async (name: string) => { expect(button(name), name).toBeDefined(); await act(async () => button(name).click()) }
async function input(node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  expect(node).toBeTruthy()
  await act(async () => { const proto = node instanceof HTMLSelectElement ? HTMLSelectElement.prototype : node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true })) })
}
const choose = (type: string) => input(container.querySelector('[aria-label="Team Challenge"]')!, type)
async function mount(initial?: AuthoringDraft, context?: PersonalCreationContext) { await act(async () => root.render(<Harness initial={initial} context={context} />)) }
const own = (e: Exercise): AuthoringDraft => ({ source: 'custom', assignment: 'custom', custom: independentExercise(e) })

for (const example of teamExamples) test(`${example.type}: seven modern choices, immutable example, independent copy, shared guided state and persistence`, async () => {
  const before = structuredClone(example)
  await mount(); await choose(example.type)
  expect([...container.querySelector<HTMLSelectElement>('[aria-label="Team Challenge"]')!.options].map(o => o.value)).toEqual(['', ...Object.keys(teamMechanics)])
  expect(container.querySelector('textarea')).toBeNull(); expect(button('Test Challenge')).toBeUndefined()
  expect(container.querySelector('[aria-label="Mobile challenge canvas"]')).toBeTruthy()
  await click('Check team answer'); await click('Reset simulation')
  expect(example).toEqual(before); expect(state.assignment).toBe('predefined')
  await click('Create Your Own'); expect(state.custom!.id).not.toBe(example.id)
  expect(button('Edit with Preview').getAttribute('aria-pressed')).toBe('true')
  await click('Edit Title'); await input(container.querySelector('[role="group"][aria-label="Edit Title"] textarea')!, 'Our mission')
  expect(container.querySelector('[aria-label="Mobile challenge canvas"]')!.textContent).toContain('Our mission')
  await click('Step by Step'); expect(container.textContent).toContain('Step 1 of 5')
  await input(container.querySelector('textarea')!, 'Guided mission')
  await click('Next'); expect(container.textContent).toContain('Give the team information')
  await click('Edit with Preview'); expect(container.textContent).toContain('Guided mission')
  await click('Apply Team Challenge')
  const cp = applyExerciseDrafts([{ checkpoint: 1 }, { role: 'terminal' }], { 'teamKind:0': state }); expect(cp.errors).toEqual([])
  const content: any = { checkpoints: cp.checkpoints }
  expect(toPersistence(hydrateExerciseDrafts(content)['teamKind:0'].custom!)).toEqual(cp.checkpoints[0].customExercises!.team)
  expect(cp.checkpoints[1]).toEqual({ role: 'terminal' }); expect(example).toEqual(before)
  expect(JSON.stringify(cp.checkpoints)).not.toMatch(/attempt|perspective|customByType/)
})

test('Distributed Information isolates private facts, scales to schema limit, preserves team attempt across perspectives and resets', async () => {
  const e = independentExercise(teamExamples[1]); const d: any = e.authored!.activity
  d.facts.push({ id: 'third', text: 'Private third fact' })
  await mount(own(e))
  const privateView = () => container.querySelector('[aria-label="Private player information"]')!
  expect(privateView().textContent).toContain(d.facts[0].text); expect(privateView().textContent).not.toContain(d.facts[1].text)
  await input(container.querySelector('[aria-label="Player perspective"]')!, '2'); expect(privateView().textContent).toContain('Private third fact'); expect(privateView().textContent).not.toContain(d.facts[0].text)
  await click('Green door'); await input(container.querySelector('[aria-label="Player perspective"]')!, '1'); await click('Check team answer'); expect(container.textContent).toContain(e.correctFeedback)
  expect(button('Solution')).toBeUndefined()
  await click('Reset simulation'); expect(container.querySelector<HTMLSelectElement>('[aria-label="Player perspective"]')!.value).toBe('0'); expect(button('Green door').getAttribute('aria-pressed')).toBe('false')
  await click('Add player information'); expect(container.querySelector<HTMLSelectElement>('[aria-label="Player perspective"]')!.options).toHaveLength(4)
  await click('Edit Player information 4'); await input(container.querySelector('[role="group"] textarea')!, 'New private fact'); expect(privateView().textContent).toContain('New private fact')
  expect(validateExercise(state.custom!)).toEqual([])
})

test('Shared Final Key requires both ordering and correct code, supports pencils, reset and isolated simulation', async () => {
  const e = teamExamples[6]; await mount(own(e)); const before = structuredClone(state)
  await input(container.querySelector('input')!, '000'); await click('Check team answer'); expect(container.textContent).toContain(e.incorrectFeedback)
  for (const digits of ['2', '3', '7']) await click(`Add ${digits}`)
  await input(container.querySelector('input')!, '237'); await click('Check team answer'); expect(container.textContent).toContain(e.correctFeedback)
  expect(state).toEqual(before)
  await click('Reset simulation'); expect(container.querySelector<HTMLInputElement>('input')!.value).toBe(''); expect(container.querySelector('[aria-label="Combined contributions"]')!.children).toHaveLength(0)
  await click('Edit Shared objective'); await input(container.querySelector('[role="group"] textarea')!, 'Smallest digit first'); expect(state.custom!.authored!.activity).toMatchObject({ orderingInstructions: 'Smallest digit first' })
  await click('Edit Final shared key'); const fields = container.querySelectorAll('textarea'); await input(fields[fields.length - 1], '000'); expect(validateExercise(state.custom!).length).toBeGreaterThan(0); expect(button('Apply Team Challenge').disabled).toBe(true)
})

for (const example of teamExamples.filter(e => !['distributed-information', 'shared-final-key'].includes(e.type))) test(`${example.type}: mechanic-specific success, failure, reset and direct guided access`, async () => {
  await mount(own(example)); const a: any = example.authored!.expected, d: any = example.authored!.activity
  await click('Check team answer'); expect(container.textContent).toContain(example.incorrectFeedback)
  if (example.type === 'assemble-machine') await click(d.frequencies.find((x: any) => x.id === a.frequencyId).text)
  else if (example.type === 'filter-noise') for (const id of a.trustedSignalIds) { const labels = [...container.querySelectorAll('label')]; const node = labels.find(n => n.textContent === d.signals.find((x: any) => x.id === id).text)!.querySelector('input')!; await act(async () => node.click()) }
  else await input(container.querySelector('input')!, a.word ?? a.value)
  await click('Check team answer'); expect(container.textContent).toContain(example.correctFeedback)
  await click('Reset simulation'); expect(container.querySelector('[aria-label$="team simulation"]')!.textContent).not.toContain(example.correctFeedback)
  await click('Edit this challenge step by step'); expect(container.textContent).toContain('Step 2 of 5')
})

test('authoritative Legacy and unresolved contexts retain compatibility without ID inference', async () => {
  await mount(undefined, { mode: 'legacy', kinds: [] }); expect(button('Preview Exercise')).toBeDefined(); expect(button('Edit with Preview')).toBeUndefined()
  await act(async () => root.unmount()); root = createRoot(container)
  await mount(undefined, { mode: 'unresolved', kinds: [] }); expect(container.querySelector('select')).toBeNull(); await click('Use modern challenge editor'); await choose('distributed-information'); expect(container.querySelector('[aria-label="Player perspective"]')).toBeTruthy()
})

test('mode and mechanic switches retain unapplied drafts and selected ownership; terminal round trip', async () => {
  await mount(own(teamExamples[1])); await click('Edit Title'); await input(container.querySelector('textarea')!, 'Keep me'); const old = structuredClone(state.custom!)
  await choose('shared-final-key'); expect(state.appliedCustom!.id).toBe(old.id); await choose('distributed-information'); expect(state.custom!.title).toBe('Keep me')
  await click('Apply Team Challenge'); const applied = applyExerciseDrafts([{ checkpoint: 1 }, { role: 'terminal', marker: 'keep' }], { 'teamKind:terminal': state }); expect(applied.errors).toEqual([])
  const reloaded = hydrateExerciseDrafts({ checkpoints: applied.checkpoints } as any); expect(toPersistence(reloaded['teamKind:terminal'].custom!)).toEqual(toPersistence(state.custom!)); expect(applied.checkpoints[1]).toMatchObject({ marker: 'keep' })
})

test('invalid guided information remains recoverable in the preview; player count follows the 2–16 contract', async () => {
  const e = independentExercise(teamExamples[1]); const d: any = e.authored!.activity
  d.facts = []
  await mount(own(e)); expect(container.textContent).toContain('Add information for at least two players.')
  expect(button('Check team answer').disabled).toBe(true)
  await click('Add player information'); await click('Add player information')
  expect(validateExercise(state.custom!)).toEqual([])
  for (let i = 2; i < 16; i++) await click('Add player information')
  expect(button('Add player information').disabled).toBe(true)
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Player perspective"]')!.options).toHaveLength(16)
  await input(container.querySelector('[aria-label="Player perspective"]')!, '15')
  expect(container.querySelector('[aria-label="Private player information"]')!.textContent).not.toContain('Player information 1Edit')
})
