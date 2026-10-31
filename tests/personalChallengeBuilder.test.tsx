import { CheckpointStoryPreview } from '../src/features/creator/CheckpointStoryPreview'
import { verifyCustomSave } from '../src/features/creator/templatePersistence'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { ChallengeAuthoring } from '../src/features/creator/exercises/ChallengeAuthoring'
import { predefinedPersonal, predefinedAssignments, personalChallengeStatus } from '../src/features/creator/exercises/predefinedPersonal'
import { prototypes, type Exercise, validateExercise } from '../src/features/creator/exercises/catalog'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { applyExerciseDrafts, hydrateExerciseDrafts, reconcileExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import { checkpointExercises } from '../src/data/templateOne'

let container: HTMLDivElement, root: Root, state: AuthoringDraft
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function Harness({ initial, unavailable = {} }: { initial?: AuthoringDraft; unavailable?: Record<string, string> }) {
  const [draft, setDraft] = useState<AuthoringDraft>(initial ?? { source: 'saved', assignment: 'predefined' })
  state = draft
  return <ChallengeAuthoring field="kind" value={{ kind: 'hidden-rule' }} onChange={() => {}} draft={draft} onDraftChange={setDraft} unavailablePredefined={unavailable} />
}
async function mount(initial?: AuthoringDraft, unavailable?: Record<string, string>) { await act(async () => root.render(<Harness initial={initial} unavailable={unavailable} />)) }
const button = (name: string) => [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === name || b.getAttribute('aria-label') === name)!
async function click(name: string) { expect(button(name), name).toBeDefined(); await act(async () => button(name).click()) }
async function input(node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const proto = node instanceof HTMLSelectElement ? HTMLSelectElement.prototype : node instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(node, value)
    node.dispatchEvent(new Event(node instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}
async function choose(type: string) { await input(container.querySelector('select')!, type) }
const custom = (type: string) => authorPrototype(prototypes.find(e => e.type === type)!)
const content = (checkpoints: any[]): any => ({ key: 'test', version: 2, displayName: 'Test', theme: 'City', mission: 'Go', configuration: { normalCheckpointCount: 2 }, scoring: {}, checkpoints })
const asDraft = (e: Exercise): AuthoringDraft => ({ source: 'custom', assignment: 'custom', custom: e })

for (const preset of predefinedPersonal) test(`${preset.type}: complete read-only predefined content, test and single dropdown`, async () => {
  expect(validateExercise(preset)).toEqual([]); expect(toPersistence(preset).type).toBe(preset.type)
  const before = structuredClone(preset)
  await mount(); await choose(preset.type)
  expect(container.querySelectorAll('select')).toHaveLength(1)
  expect(container.querySelectorAll('textarea, input')).toHaveLength(0)
  expect(container.querySelectorAll('select option:not(:disabled)')).toHaveLength(24) // 15 mechanics + preserved story choices + optional/current
  expect(state.assignment).toBe('predefined'); expect(state.predefined).toBeUndefined()
  await click('Test Challenge'); await click('Check answer'); await click('Reset'); await click('Return to Edit')
  expect(predefinedPersonal.find(e => e.type === preset.type)).toEqual(before)
  await click('Use this challenge'); expect(state.predefinedKey).toBe(preset.type)
  expect(toPersistence(state.predefined!)).toEqual(toPersistence(preset))
})

for (const type of ['tap-pair', 'single-choice', 'fill-blank']) test(`${type}: shared draft, stable IDs, keyboard reordering, invalid additions and independent testing`, async () => {
  await mount(); await click('Create Your Own'); await choose(type)
  expect(container.querySelectorAll('select')).toHaveLength(1)
  const original = structuredClone(state.custom!), originalContent = JSON.stringify(original.authored)
  const firstText = container.querySelector<HTMLInputElement>('input')!
  await input(firstText, 'Edited visible content')
  const edited = JSON.stringify(state.custom!.authored)
  expect(edited).not.toBe(originalContent)
  await click('Edit with Preview'); expect(JSON.stringify(state.custom!.authored)).toBe(edited)
  await click('Move row 1 down')
  const a: any = state.custom!.authored!.activity, answer: any = state.custom!.authored!.expected
  const old: any = original.authored!.activity, oldAnswer: any = original.authored!.expected
  if (type === 'tap-pair') { expect(answer.pairs[1]).toEqual(oldAnswer.pairs[0]); expect(a.left[1].id).toBe(old.left[0].id); expect(a.right[1].id).toBe(oldAnswer.pairs[0].rightId) }
  if (type === 'single-choice') { expect(a.options[1].id).toBe(old.options[0].id); expect(answer.optionId).toBe(oldAnswer.optionId) }
  if (type === 'fill-blank') { expect(a.blanks[1].id).toBe(old.blanks[0].id); expect(answer.values).toEqual(oldAnswer.values) }
  const beforeTest = structuredClone(state)
  await click('Test Challenge'); await click('Check answer'); await click('Hint'); await click('Solution'); await click('Reset'); await click('Return to Edit')
  expect(state).toEqual(beforeTest)
  await click('Test Challenge'); expect(container.querySelector('[role="status"]')?.textContent).not.toContain('Not quite'); await click('Return to Edit')
  await click(type === 'tap-pair' ? 'Add pair' : type === 'single-choice' ? 'Add option' : 'Add blank')
  expect(validateExercise(state.custom!)).not.toEqual([])
  expect(button('Test Challenge').disabled).toBe(true); expect(button('Apply to Hunt').disabled).toBe(true)
  const count = type === 'tap-pair' ? a.left.length + 1 : type === 'single-choice' ? a.options.length + 1 : a.blanks.length + 1
  await click(`Remove row ${count}`); expect(validateExercise(state.custom!)).toEqual([])
  await click('Step by Step'); expect(container.textContent).toContain('Step 1')
  await click('Next'); expect(container.textContent).toContain('Hints and feedback')
  await click('Next'); expect(container.textContent).toContain('Review and test')
  await click('Back'); await click('Back'); expect(JSON.stringify(state.custom!.authored)).not.toBe(originalContent)
})

test('marking a choice correct survives text changes and removing it requires a new correct answer', async () => {
  await mount(asDraft(custom('single-choice')))
  await act(async () => (container.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement).click())
  const id = (state.custom!.authored!.activity as any).options[0].id
  await input(container.querySelector('input')!, 'Renamed correct option')
  expect((state.custom!.authored!.expected as any).optionId).toBe(id)
  await click('Remove row 1'); expect((state.custom!.authored!.expected as any).optionId).toBe('')
  expect(button('Apply to Hunt').disabled).toBe(true)
})

test('blank answers retain their own identity through edit/add/remove and case sensitivity changes', async () => {
  await mount(asDraft(custom('fill-blank')))
  const expected: any = state.custom!.authored!.expected
  await input(container.querySelectorAll('input')[1], 'New answer')
  expect((state.custom!.authored!.expected as any).values[0]).toEqual({ ...expected.values[0], value: 'New answer' })
  await act(async () => (container.querySelector('input[type="checkbox"]') as HTMLInputElement).click())
  expect((state.custom!.authored!.expected as any).caseSensitive).toBe(true)
  await click('Remove row 1')
  expect((state.custom!.authored!.expected as any).values).toEqual([expected.values[1]])
})

test('switching custom mechanics retains selected instance until explicit confirmed replacement', async () => {
  const original = custom('tap-pair')
  await mount(asDraft(original)); await choose('single-choice')
  let applied = applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': state })
  expect((applied.checkpoints[0].customExercises!.personal as any).type).toBe('tap-pair')
  vi.mocked(window.confirm).mockReturnValueOnce(false); await click('Apply to Hunt')
  applied = applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': state })
  expect(applied.checkpoints[0].customExercises!.personal!.type).toBe('tap-pair')
  await click('Apply to Hunt'); expect(state.appliedCustom!.type).toBe('single-choice')
  await choose('tap-pair'); expect(state.custom).toEqual(original)
})

test('predefined uniqueness survives serialization/reload; replacement releases only its own slot; separate Templates and custom copies stay independent', () => {
  const preset = predefinedPersonal[0], original = structuredClone(checkpointExercises)
  const first: AuthoringDraft = { source: 'example', assignment: 'predefined', predefined: preset, predefinedKey: preset.type }
  const checkpoints = [{ ...structuredClone(checkpointExercises[0]), checkpoint: 1 }, { ...structuredClone(checkpointExercises[1]), checkpoint: 2 }, { role: 'terminal' as const }]
  const assigned = applyExerciseDrafts(checkpoints, { 'kind:0': first })
  expect(assigned.errors).toEqual([])
  expect(assigned.checkpoints[0].kind).toBe(checkpoints[0].kind); expect(assigned.checkpoints[0].teamKind).toBe(checkpoints[0].teamKind)
  const drafts = hydrateExerciseDrafts(content(assigned.checkpoints)); expect(drafts['kind:0'].predefinedKey).toBe(preset.type)
  expect(predefinedAssignments(assigned.checkpoints, drafts)).toEqual({ 'tap-pair': '0' })
  expect(applyExerciseDrafts(checkpoints, { 'kind:0': first, 'kind:terminal': first }).errors).toHaveLength(1)
  expect(applyExerciseDrafts(checkpoints, { 'kind:0': first }).errors).toEqual([]) // independent Template
  const moved = applyExerciseDrafts(assigned.checkpoints, { 'kind:0': asDraft(custom('single-choice')), 'kind:terminal': first })
  expect(moved.errors).toEqual([]); expect(moved.checkpoints[0].personalChallengePreset).toBeUndefined()
  expect(moved.checkpoints[2].personalChallengePreset).toBe('tap-pair'); expect(moved.checkpoints[2].checkpoint).toBeUndefined()
  const copies = [custom('tap-pair'), custom('tap-pair')]
  expect(copies[0].id).not.toBe(copies[1].id)
  expect(applyExerciseDrafts(checkpoints, { 'kind:0': asDraft(copies[0]), 'kind:1': asDraft(copies[1]) }).errors).toEqual([])
  expect(checkpointExercises).toEqual(original)
})

test('used predefined options are visible and disabled; attempting replacement keeps current draft when cancelled', async () => {
  await mount(asDraft(custom('tap-pair')), { 'single-choice': 'FinishPoint' }); await click('Predefined')
  const used = container.querySelector<HTMLOptionElement>('option[value="single-choice"]')!
  expect(used.disabled).toBe(true); expect(used.textContent).toContain('FinishPoint')
  await choose('fill-blank'); const before = structuredClone(state)
  vi.mocked(window.confirm).mockReturnValueOnce(false); await click('Use this challenge'); expect(state).toEqual(before)
  await click('Use this challenge'); expect(state.assignment).toBe('predefined'); expect(state.custom).toEqual(before.custom)
})

test('authoritative identities rebase selected predefined and retained custom drafts for later same-slot revision', () => {
  const draft: AuthoringDraft = { source: 'example', assignment: 'predefined', predefined: predefinedPersonal[0], predefinedKey: 'tap-pair', custom: custom('single-choice') }
  const applied = applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': draft })
  const persisted = applied.checkpoints[0].customExercises!.personal!
  persisted.id = crypto.randomUUID(); persisted.owner = { templateKey: 'test', version: 2 }
  const rebased = reconcileExerciseDrafts({ 'kind:0': draft }, { 'kind:0': draft }, content(applied.checkpoints))['kind:0']
  expect(rebased.predefined!.persistedIdentity).toEqual({ id: persisted.id, owner: persisted.owner })
  expect(rebased.custom!.persistedIdentity).toEqual(rebased.predefined!.persistedIdentity)
  expect(personalChallengeStatus(applied.checkpoints[0], rebased)).toBe('Challenge assigned')
  const next = applyExerciseDrafts(applied.checkpoints, { 'kind:0': { ...rebased, assignment: 'custom' } })
  expect(next.checkpoints[0].customExercises!.personal!.id).toBe(persisted.id)
  expect(next.checkpoints[0].personalChallengePreset).toBeUndefined()
})

test('selecting question text and inserting a blank captures the accepted answer without changing its identity', async () => {
  await mount(asDraft(custom('fill-blank')))
  const before: any = state.custom!.authored!.activity
  const question = container.querySelector('input')!
  await input(question, 'The treasure is under the bridge.')
  question.setSelectionRange(26, 32)
  await click('Insert blank in question 1')
  const activity: any = state.custom!.authored!.activity, expected: any = state.custom!.authored!.expected
  expect(activity.blanks[0].id).toBe(before.blanks[0].id)
  expect(activity.blanks[0].prompt).toBe('The treasure is under the ___.')
  expect(expected.values[0]).toEqual({ blankId: before.blanks[0].id, value: 'bridge' })
})

test('a dropped, changed or unexpectedly retained predefined selection cannot be acknowledged as saved', () => {
  const draft: AuthoringDraft = { source: 'saved', assignment: 'predefined', predefined: predefinedPersonal[0], predefinedKey: 'tap-pair' }
  const sent = content(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': draft }).checkpoints)
  const saved: any = { key: 'test', version: 2, status: 'draft', content: structuredClone(sent) }
  saved.content.checkpoints[0].customExercises.personal.id = crypto.randomUUID()
  saved.content.checkpoints[0].customExercises.personal.owner = { templateKey: 'test', version: 2 }
  expect(verifyCustomSave(sent, saved)).toBe(saved)
  delete saved.content.checkpoints[0].personalChallengePreset
  expect(() => verifyCustomSave(sent, saved)).toThrow('predefined challenge selection')
  saved.content.checkpoints[0].personalChallengePreset = 'single-choice'
  expect(() => verifyCustomSave(sent, saved)).toThrow('predefined challenge selection')
  const removed = structuredClone(sent); delete removed.checkpoints[0].personalChallengePreset
  expect(() => verifyCustomSave(removed, saved)).toThrow('predefined challenge selection')
})

test('Personal story context presents nested saved text without raw JSON or backend labels', async () => {
  await act(async () => root.render(<CheckpointStoryPreview friendly value={{ story: { message: 'Keep the light', clues: ['Gate', 'Tower'] } }} />))
  expect(container.textContent).toContain('Keep the light'); expect(container.textContent).toContain('Gate')
  expect(container.textContent).not.toContain('Backend'); expect(container.textContent).not.toContain('{')
})
