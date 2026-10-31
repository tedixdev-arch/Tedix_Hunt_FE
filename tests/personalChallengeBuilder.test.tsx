import { exerciseFixtures } from './fixtures/customExercises'
import { CheckpointStoryPreview } from '../src/features/creator/CheckpointStoryPreview'
import { verifyCustomSave } from '../src/features/creator/templatePersistence'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { ChallengeAuthoring } from '../src/features/creator/exercises/ChallengeAuthoring'
import { personalExamples, exampleContentKey, personalChallengeStatus } from '../src/features/creator/exercises/personalExamples'
import { prototypes, personalTypes, type Exercise, validateExercise } from '../src/features/creator/exercises/catalog'
import { authorPrototype, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { applyExerciseDrafts, hydrateExerciseDrafts, reconcileExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import { hasCustomExercises } from '../src/features/creator/exercises/persistenceValidation'
import { ApiError } from '../src/services/api/client'
import { persistCreatorTemplate } from '../src/features/creator/templatePersistence'
import { checkpointExercises } from '../src/data/templateOne'

let container: HTMLDivElement, root: Root, state: AuthoringDraft
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function Harness({ initial }: { initial?: AuthoringDraft }) {
  const [draft, setDraft] = useState<AuthoringDraft>(initial ?? { source: 'saved', assignment: 'predefined' })
  state = draft
  return <ChallengeAuthoring field="kind" value={{ kind: 'hidden-rule' }} onChange={() => {}} draft={draft} onDraftChange={setDraft} />
}
async function mount(initial?: AuthoringDraft) { await act(async () => root.render(<Harness initial={initial} />)) }
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

for (const preset of personalExamples) test(`${preset.type}: one modern selector, immediate read-only play and independent custom authoring`, async () => {
  const before = structuredClone(preset)
  await mount(); await choose(preset.type)
  const selector = container.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
  expect([...selector.options].map(o => o.value)).toEqual(['', ...personalTypes.map(row => row[0])])
  expect(selector.querySelector('optgroup')).toBeNull()
  expect(container.querySelector('[aria-label="Mobile challenge canvas"]')).not.toBeNull()
  expect(container.querySelector('textarea')).toBeNull()
  expect(button('Test Challenge')).toBeUndefined(); expect(button('Apply to Hunt')).toBeUndefined()
  expect(container.querySelector('[aria-label^="Edit "]')).toBeNull()
  expect(state.assignment).toBe('predefined'); expect(state.custom).toBeUndefined()
  await click('Check answer'); await click('Reset')
  expect(personalExamples.find(e => e.type === preset.type)).toEqual(before)
  expect(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': state }).checkpoints[0].customExercises).toBeUndefined()
  await click('Create Your Own'); expect(state.custom!.type).toBe(preset.type)
  expect(state.custom!.id).not.toBe(preset.id); expect(state.assignment).toBe('predefined')
  await click('Apply to Hunt')
  expect(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': state }).checkpoints[0].customExercises!.personal!.type).toBe(preset.type)
  expect(personalExamples.find(e => e.type === preset.type)).toEqual(before)
})

for (const type of ['tap-pair', 'single-choice', 'fill-blank']) test(`${type}: pencil editing, simulation isolation, shared guided draft and stable identities`, async () => {
  await mount(asDraft(custom(type)))
  expect(button('Edit with Preview').getAttribute('aria-pressed')).toBe('true')
  const before = structuredClone(state.custom!), key = type === 'tap-pair' ? 'Card 1' : type === 'single-choice' ? 'Option 1' : 'Question 1'
  await click(`Edit ${key}`)
  const field = container.querySelector<HTMLTextAreaElement>(`[role="group"][aria-label="Edit ${key}"] textarea`)!
  expect(document.activeElement).toBe(field)
  await input(field, type === 'fill-blank' ? 'Edited ___ question' : 'Edited card')
  const authored: any = state.custom!.authored!, old: any = before.authored!
  if (type === 'tap-pair') { expect(authored.activity.left[0].id).toBe(old.activity.left[0].id); expect(authored.expected).toEqual(old.expected) }
  if (type === 'single-choice') { expect(authored.activity.options[0].id).toBe(old.activity.options[0].id); expect(authored.expected).toEqual(old.expected) }
  if (type === 'fill-blank') { expect(authored.activity.blanks[0].id).toBe(old.activity.blanks[0].id); expect(authored.expected).toEqual(old.expected) }
  await act(async () => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(document.activeElement).toBe(button(`Edit ${key}`)); expect(container.querySelector('[role="group"]')).toBeNull()
  const edited = structuredClone(state)
  await click('Play'); await click('Check answer'); await click('Hint'); await click('Solution'); await click('Reset')
  expect(state).toEqual(edited)
  await click('Edit'); expect(container.textContent).toContain(type === 'fill-blank' ? 'Edited ___ question' : 'Edited card')
  await click('Step by Step'); expect(container.textContent).toContain('Step 1')
  const surface = container.querySelector(`[aria-label="${type === 'tap-pair' ? 'Pair cards' : type === 'single-choice' ? 'Answer options' : 'Blank questions'} editor"]`)!
  expect(surface.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])')).toHaveLength(type === 'single-choice' ? 1 : 2)
  await click('Next'); await click('Back'); await click('Edit with Preview')
  expect(state).toEqual(edited)
  await click(type === 'tap-pair' ? 'Add pair' : type === 'single-choice' ? 'Add option' : 'Add blank')
  expect(validateExercise(state.custom!)).not.toEqual([]); expect(button('Play').disabled).toBe(true); expect(button('Apply to Hunt').disabled).toBe(true)
  const count = type === 'tap-pair' ? authored.activity.left.length + 1 : type === 'single-choice' ? authored.activity.options.length + 1 : authored.activity.blanks.length + 1
  await click(`Edit ${type === 'tap-pair' ? 'Card' : type === 'single-choice' ? 'Option' : 'Question'} ${count}`)
  await click(`${type === 'tap-pair' ? 'Remove pair' : type === 'single-choice' ? 'Remove option' : 'Remove question'} ${count}`)
  expect(validateExercise(state.custom!)).toEqual([])
  expect(state.custom!.authored).toEqual(edited.custom!.authored)
})

test('marking a choice correct uses stable identity and removing it requires another correct answer', async () => {
  await mount(asDraft(custom('single-choice'))); await click('Edit Option 1')
  const id = (state.custom!.authored!.activity as any).options[0].id
  await act(async () => (container.querySelector('input[type="radio"]') as HTMLInputElement).click())
  await input(container.querySelector('[role="group"] textarea')!, 'Renamed option')
  expect((state.custom!.authored!.expected as any).optionId).toBe(id)
  await click('Remove option 1'); expect((state.custom!.authored!.expected as any).optionId).toBe('')
  expect(button('Apply to Hunt').disabled).toBe(true)
})

test('blank accepted answer edits and removals retain other identities', async () => {
  await mount(asDraft(custom('fill-blank')))
  const expected: any = structuredClone(state.custom!.authored!.expected)
  await click('Edit Accepted answer 1'); await input(container.querySelector('[role="group"] textarea')!, 'New answer'); await click('Done')
  expect((state.custom!.authored!.expected as any).values[0]).toEqual({ ...expected.values[0], value: 'New answer' })
  await act(async () => (container.querySelector('input[type="checkbox"]') as HTMLInputElement).click())
  expect((state.custom!.authored!.expected as any).caseSensitive).toBe(true)
  await click('Edit Question 1'); await click('Remove question 1')
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

test('reload and metadata loss cannot introduce duplicate predefined selections or promote example snapshots', async () => {
  const before = structuredClone(checkpointExercises)
  const canonical = toPersistence(personalExamples[0])
  canonical.id = crypto.randomUUID(); canonical.owner = { templateKey: 'test', version: 2 }
  const checkpoints: any[] = [{ checkpoint: 1, kind: 'hidden-rule', personalChallengePreset: 'tap-pair', customExercises: { personal: canonical } }, { role: 'terminal', kind: 'shared-final-key' }]
  for (const metadata of ['tap-pair', undefined, 'hidden-rule', { forged: true }]) {
    checkpoints[0].personalChallengePreset = metadata
    const restored = hydrateExerciseDrafts(content(checkpoints))['kind:0']
    expect(restored.source).toBe('custom'); expect(restored.assignment).toBe('custom')
    expect(exampleContentKey(restored.custom!)).toBe('tap-pair') // content recognition, never provenance authority
    expect(toPersistence(restored.custom!)).toEqual(canonical)
    expect(hasCustomExercises(content(applyExerciseDrafts(checkpoints, { 'kind:0': restored }).checkpoints))).toBe(true)
  }
  delete checkpoints[0].personalChallengePreset
  await mount(hydrateExerciseDrafts(content(checkpoints))['kind:0'])
  expect(container.textContent).toContain('not available in published Hunts')
  await click('Predefined'); await choose('tap-pair')
  const values = [...container.querySelector('select')!.options].map(o => o.value)
  expect(new Set(values).size).toBe(values.length)
  expect(values.filter(value => value === 'tap-pair')).toHaveLength(1)
  expect(button('Use this challenge')).toBeUndefined() // no duplicate-assignment path, including after reload
  expect(checkpointExercises).toEqual(before)
})

test('independent Custom copies may repeat every mechanic, including mechanics without item IDs', () => {
  for (const [type] of personalTypes) {
    const copies = [custom(type), custom(type)]
    expect(copies[0].id).not.toBe(copies[1].id)
    const applied = applyExerciseDrafts([{ checkpoint: 1 }, { role: 'terminal' }], { 'kind:0': asDraft(copies[0]), 'kind:terminal': asDraft(copies[1]) })
    expect(applied.errors).toEqual([])
    expect(applied.checkpoints[1].checkpoint).toBeUndefined()
    expect(applied.checkpoints.every(cp => cp.customExercises?.personal?.type === type)).toBe(true)
    expect(applied.checkpoints.every(cp => cp.personalChallengePreset === undefined)).toBe(true)
  }
})

test('metadata-free custom snapshots retain authoritative same-slot identity across saving and newer edits', () => {
  const exercise = custom('single-choice'), draft = asDraft(exercise)
  const applied = applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': draft })
  const persisted = applied.checkpoints[0].customExercises!.personal!
  persisted.id = crypto.randomUUID(); persisted.owner = { templateKey: 'test', version: 2 }
  const rebased = reconcileExerciseDrafts({ 'kind:0': draft }, { 'kind:0': draft }, content(applied.checkpoints))['kind:0']
  expect(rebased.custom!.persistedIdentity).toEqual({ id: persisted.id, owner: persisted.owner })
  expect(personalChallengeStatus(applied.checkpoints[0], rebased)).toBe('Challenge assigned')
  expect(applyExerciseDrafts(applied.checkpoints, { 'kind:0': rebased }).checkpoints[0].customExercises!.personal!.id).toBe(persisted.id)
})

test('selecting question text and inserting a blank captures the accepted answer without changing its identity', async () => {
  await mount(asDraft(custom('fill-blank'))); await click('Step by Step')
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

test('preset metadata is advisory: loss/change does not hide content, missing or altered exercise data still rejects save confirmation', () => {
  const sent = content(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': asDraft(personalExamples[0]) }).checkpoints)
  sent.checkpoints[0].personalChallengePreset = 'tap-pair'
  const saved: any = { key: 'test', version: 2, status: 'draft', content: structuredClone(sent) }
  saved.content.checkpoints[0].customExercises.personal.id = crypto.randomUUID()
  saved.content.checkpoints[0].customExercises.personal.owner = { templateKey: 'test', version: 2 }
  delete saved.content.checkpoints[0].personalChallengePreset
  expect(verifyCustomSave(sent, saved)).toBe(saved)
  expect(hydrateExerciseDrafts(saved.content)['kind:0'].assignment).toBe('custom')
  saved.content.checkpoints[0].personalChallengePreset = 'hidden-rule'
  expect(verifyCustomSave(sent, saved)).toBe(saved)
  saved.content.checkpoints[0].customExercises.personal.title = 'Changed by response'
  expect(() => verifyCustomSave(sent, saved)).toThrow('differs from the authored exercise')
  delete saved.content.checkpoints[0].customExercises.personal
  expect(() => verifyCustomSave(sent, saved)).toThrow()
})

test('a backend rejection of historical metadata preserves the full custom draft and performs no retry or guard bypass', async () => {
  const current = content(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': asDraft(custom('tap-pair')) }).checkpoints)
  current.configuration = {}; current.mission = { name: 'Find it' }; current.scoring = { startingScore: 100 }
  current.checkpoints[0].personalChallengePreset = 'tap-pair'
  const before = structuredClone(current)
  const rejection = new ApiError('Invalid preset metadata', 400, 'bad_request', { error: 'invalid_input' })
  const api = { create: vi.fn().mockRejectedValue(rejection), createVersion: vi.fn() }
  await expect(persistCreatorTemplate(api, current, null)).rejects.toBe(rejection)
  expect(current).toEqual(before); expect(api.create).toHaveBeenCalledTimes(1)
  expect(hasCustomExercises(api.create.mock.calls[0][0])).toBe(true)
  expect(api.createVersion).not.toHaveBeenCalled()
})

test('Personal story context presents nested saved text without raw JSON or backend labels', async () => {
  await act(async () => root.render(<CheckpointStoryPreview friendly value={{ story: { message: 'Keep the light', clues: ['Gate', 'Tower'] } }} />))
  expect(container.textContent).toContain('Keep the light'); expect(container.textContent).toContain('Gate')
  expect(container.textContent).not.toContain('Backend'); expect(container.textContent).not.toContain('{')
})

test('a persisted example/custom instance cannot be duplicated into FinishPoint after reload, even with preset metadata missing', async () => {
  const original = toPersistence(personalExamples[0])
  original.id = crypto.randomUUID(); original.owner = { templateKey: 'test', version: 2 }
  const savedContent = content([{ checkpoint: 1, customExercises: { personal: original } }, { role: 'terminal' }])
  const restored = hydrateExerciseDrafts(savedContent)['kind:0']
  const attempted = content(applyExerciseDrafts(savedContent.checkpoints, { 'kind:0': restored, 'kind:terminal': restored }).checkpoints)
  const api = { create: vi.fn(), createVersion: vi.fn() }
  const record: any = { key: 'test', version: 2, status: 'draft', category: 'universal', content: savedContent }
  await expect(persistCreatorTemplate(api, attempted, record)).rejects.toThrow('Duplicate exercise instance ID')
  expect(api.create).not.toHaveBeenCalled(); expect(api.createVersion).not.toHaveBeenCalled()
  expect(original.owner).toEqual({ templateKey: 'test', version: 2 })
})

for (const [index, signal] of checkpointExercises.entries()) test(`${signal.kind}: existing Signal assignment restores only Personal legacy content, including FinishPoint`, async () => {
  const terminal = index === 6
  const original: any = { ...structuredClone(signal), role: terminal ? 'terminal' : 'normal', customExercises: { personal: toPersistence(custom('single-choice')), team: structuredClone(exerciseFixtures.find(e => e.type === 'distributed-information')!) } }
  if (terminal) delete original.checkpoint
  let checkpoint = original
  function SignalHarness() {
    const [value, setValue] = useState(original)
    const [draft, setDraft] = useState<AuthoringDraft>(asDraft(custom('single-choice')))
    checkpoint = value; state = draft
    return <ChallengeAuthoring context={{ mode: 'legacy', kinds: [signal.kind] }} field="kind" value={value} onChange={setValue} draft={draft} onDraftChange={setDraft} />
  }
  await act(async () => root.render(<SignalHarness />))
  await click('Predefined'); await choose(signal.kind); await click('Use this challenge')
  expect(state.assignment).toBe('predefined')
  const slot = terminal ? 'kind:terminal' : `kind:${index}`
  const applied = applyExerciseDrafts([checkpoint], { [slot]: state })
  expect(applied.errors).toEqual([])
  expect(applied.checkpoints[0].customExercises!.personal).toBeUndefined()
  expect(applied.checkpoints[0].customExercises!.team).toEqual(original.customExercises.team)
  const { customExercises: _custom, ...legacy } = applied.checkpoints[0]
  const { customExercises: _oldCustom, ...oldLegacy } = original
  expect(legacy).toEqual(oldLegacy)
  expect(applied.checkpoints[0].role).toBe(terminal ? 'terminal' : 'normal')
  if (terminal) expect(applied.checkpoints[0].checkpoint).toBeUndefined()
})

for (const type of ['tap-pair', 'single-choice', 'fill-blank']) test(`${type}: guided reordering keeps answer references and validates only the current task`, async () => {
  await mount(asDraft(custom(type))); await click('Step by Step')
  const before: any = structuredClone(state.custom!.authored)
  await click('Move row 1 down')
  const after: any = state.custom!.authored
  if (type === 'tap-pair') { expect(after.activity.left[1].id).toBe(before.activity.left[0].id); expect(after.expected.pairs[1]).toEqual(before.expected.pairs[0]) }
  if (type === 'single-choice') { expect(after.activity.options[1].id).toBe(before.activity.options[0].id); expect(after.expected).toEqual(before.expected) }
  if (type === 'fill-blank') { expect(after.activity.blanks[1].id).toBe(before.activity.blanks[0].id); expect(after.expected).toEqual(before.expected) }
  await click(type === 'tap-pair' ? 'Add pair' : type === 'single-choice' ? 'Add option' : 'Add blank')
  expect(button('Next').disabled).toBe(false)
  const count = type === 'tap-pair' ? after.activity.left.length : type === 'single-choice' ? after.activity.options.length : after.activity.blanks.length
  for (let i = 0; i < count; i++) await click('Next')
  expect(button('Next').disabled).toBe(true)
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Complete the text and answer')
})
