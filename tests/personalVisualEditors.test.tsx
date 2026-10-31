import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { PersonalMechanicEditor, originalVisualMechanics, visualMechanics } from '../src/features/creator/exercises/PersonalMechanicEditor'
import { authorPrototype, fromPersistence, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { prototypes, validateExercise, type Exercise } from '../src/features/creator/exercises/catalog'
import { applyExerciseDrafts, hydrateExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import { personalExamples } from '../src/features/creator/exercises/personalExamples'

let container: HTMLDivElement, root: Root, state: Exercise
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
function Harness({ initial }: { initial: Exercise }) { const [e, set] = useState(initial); state = e; return <PersonalMechanicEditor exercise={e} onChange={set} /> }
const buttons = () => [...container.querySelectorAll<HTMLButtonElement>('button')]
const button = (name: string) => buttons().find(b => b.textContent === name || b.getAttribute('aria-label') === name)!
const click = async (name: string) => { expect(button(name)).toBeDefined(); await act(async () => button(name).click()) }
async function input(node: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => { const proto = node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })) })
}
const extended = visualMechanics.filter(type => !originalVisualMechanics.includes(type))
for (const type of extended) test(`${type}: contextual focus, shared guided state, normal and FinishPoint persistence`, async () => {
  const example = structuredClone(personalExamples.find(e => e.type === type)!), original = structuredClone(example)
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === type)!)} />))
  const id = state.id, authored = structuredClone(state.authored)
  expect(button('Edit with Preview').getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector(`[aria-label="${type} visual editor"]`)).not.toBeNull()
  await click('Edit Title'); const field = container.querySelector<HTMLTextAreaElement>('textarea')!
  expect(document.activeElement).toBe(field); await input(field, `My ${type}`)
  await act(async () => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(document.activeElement).toBe(button('Edit Title')); expect(state.id).toBe(id); expect(state.authored).toEqual(authored)
  await click('Step by Step'); expect(container.querySelector('[aria-label="Guided challenge editor"]')).not.toBeNull()
  await click('Next'); expect(container.querySelector(`[aria-label="${type} visual editor"]`)).not.toBeNull()
  await click('Next'); await click('Next'); await click('Next')
  expect(container.querySelector(`[aria-label="${type} interactive exercise"]`)).not.toBeNull()
  await click('Edit with Preview'); expect(state.title).toBe(`My ${type}`)
  expect(validateExercise(state)).toEqual([])
  for (const terminal of [false, true]) {
    const slot = terminal ? 'kind:terminal' : 'kind:0'
    const applied = applyExerciseDrafts([{ checkpoint: 1 }, { role: 'terminal' }], { [slot]: { source: 'custom', assignment: 'custom', custom: state } })
    expect(applied.errors).toEqual([])
    const reloaded = hydrateExerciseDrafts({ checkpoints: applied.checkpoints } as any)[slot].custom!
    expect(toPersistence(reloaded)).toEqual(toPersistence(state)); expect(JSON.stringify(toPersistence(reloaded))).not.toMatch(/attempt|playing|stage|customByType/)
    expect(fromPersistence(toPersistence(reloaded)).authored).toEqual(state.authored)
  }
  expect(personalExamples.find(e => e.type === type)).toEqual(original)
})

const collections = [
  ['multiple-choice','Add option','Remove option','options',2], ['sequence','Add sequence item','Remove sequence item','elements',2],
  ['drag-drop','Add item','Remove item','items',2], ['drag-drop','Add target','Remove target','targets',2],
  ['find-mistake','Add step','Remove step','steps',2], ['find-mistake','Add correction','Remove correction','explanations',2],
  ['build-problem','Add piece','Remove piece','pieces',2], ['build-problem','Add position','Remove position','slots',1],
  ['shape-pattern','Add shape','Remove shape','shapes',2], ['rule-discovery','Add rule','Remove rule','rules',2],
] as const
for (const [type, add, remove, key, minimum] of collections) test(`${type}/${key}: removal retains valid references and add respects maximum`, async () => {
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === type)!)} />))
  while ((state.authored!.activity as any)[key].length > minimum) {
    // Removing a construction position/piece can require explicit answer repair; never silently invent the answer.
    await click(`${remove} ${(state.authored!.activity as any)[key].length}`)
  }
  expect(button(`${remove} 1`).disabled).toBe(true)
  while ((state.authored!.activity as any)[key].length < 40) await click(add)
  expect(button(add).disabled).toBe(true)
  expect(new Set((state.authored!.activity as any)[key].map((x: any) => x.id)).size).toBe(40)
  expect((state.authored!.activity as any)[key].length).toBe(40)
})

test('number patterns preserve exactly one missing position when it moves', async () => {
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === 'number-pattern')!)} />))
  const before: any = structuredClone(state.authored)
  await click('Make position 1 missing')
  const d: any = state.authored!.activity, a: any = state.authored!.expected
  expect(d.missingId).toBe(before.activity.terms[0].id); expect(a.value).toBe(before.activity.terms[0].value)
  expect(d.terms.find((x: any) => x.id === before.activity.missingId).value).toBe(before.expected.value)
  expect(d.terms.filter((x: any) => !Object.hasOwn(x, 'value'))).toHaveLength(1)
  expect(button('Remove term 1').disabled).toBe(true); expect(validateExercise(state)).toEqual([])
})

test('matching relationships swap atomically without duplicate right-side identities', async () => {
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === 'match-columns')!)} />))
  const before: any = structuredClone(state.authored), select = container.querySelector<HTMLSelectElement>('select')!
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, before.expected.pairs[1].rightId); select.dispatchEvent(new Event('change', { bubbles: true })) })
  const after: any = state.authored
  expect(after.expected.pairs[0].rightId).toBe(before.expected.pairs[1].rightId); expect(after.expected.pairs[1].rightId).toBe(before.expected.pairs[0].rightId)
  expect(after.activity).toEqual(before.activity); expect(validateExercise(state)).toEqual([])
})

test('invalid number-line edits block Play and guided continuation rather than coercing empty input', async () => {
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === 'number-line')!)} />))
  await click('Edit Maximum'); await input(container.querySelector('input[type="number"]')!, '')
  expect(Number.isNaN((state.authored!.activity as any).max)).toBe(true)
  expect(button('Play').disabled).toBe(true)
  await click('Step by Step'); await click('Next'); expect(button('Next').disabled).toBe(true)
})

test('minimum number-line position is an explicit keyboard answer and survives mode switches', async () => {
  const initial = authorPrototype(prototypes.find(e => e.type === 'number-line')!)
  ;(initial.authored!.expected as any).target = (initial.authored!.activity as any).min
  await act(async () => root.render(<Harness initial={initial} />))
  await click('Play')
  const simulation = container.querySelector('[aria-label="number-line interactive exercise"]')!, slider = simulation.querySelector<HTMLInputElement>('input[type="range"]')!
  await act(async () => slider.dispatchEvent(new KeyboardEvent('keyup', { key: 'Home', bubbles: true })))
  await click('Check answer'); expect(simulation.querySelector('[role="status"]')?.textContent).toBe(state.correctFeedback)
  await click('Step by Step'); await click('Edit with Preview')
  expect(simulation.querySelector('[role="status"]')?.textContent).toBe(state.correctFeedback)
  await click('Reset'); expect(simulation.querySelector('[role="status"]')).toBeNull()
  await click('Check answer'); expect(simulation.querySelector('[role="status"]')?.textContent).toBe(state.incorrectFeedback)
  expect(toPersistence(state).answer).toEqual({ target: (initial.authored!.activity as any).min, tolerance: (initial.authored!.expected as any).tolerance })
})

for (const [type, add, remove, key, minimum] of [
  ['match-columns', 'Add pair', 'Remove pair', 'left', 2],
  ['number-pattern', 'Add term', 'Remove term', 'terms', 3],
  ['shape-pattern', 'Add term', 'Remove term', 'terms', 3],
  ['rule-discovery', 'Add example', 'Remove example', 'examples', 2],
] as const) test(`${type}/${key}: bounded additions/removals retain canonical answer relationships`, async () => {
  await act(async () => root.render(<Harness initial={authorPrototype(prototypes.find(e => e.type === type)!)} />))
  while ((state.authored!.activity as any)[key].length < 40) await click(add)
  expect(button(add).disabled).toBe(true); expect(validateExercise(state)).toEqual([])
  while ((state.authored!.activity as any)[key].length > minimum) {
    const candidates = buttons().filter(b => b.textContent?.startsWith(`${remove} `) && !b.disabled)
    await act(async () => candidates.at(-1)!.click())
  }
  expect(validateExercise(state)).toEqual([])
  expect(buttons().filter(b => b.textContent?.startsWith(`${remove} `)).every(b => b.disabled)).toBe(true)
  expect(document.activeElement?.getAttribute('aria-label')).toMatch(/^Edit /)
}, 20000)
