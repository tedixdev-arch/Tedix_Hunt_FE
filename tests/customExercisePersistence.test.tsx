import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, test, vi } from 'vitest'
import { exerciseFixtures, customTemplateFixture } from './fixtures/customExercises'
import { authorPrototype, fromPersistence, toPersistence } from '../src/features/creator/exercises/persistenceAdapter'
import { validateCustomExercises } from '../src/features/creator/exercises/persistenceValidation'
import { applyExerciseDrafts, hydrateExerciseDrafts, reconcileExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
import { AuthoredContentEditor } from '../src/features/creator/exercises/AuthoredContentEditor'
import { checkAuthoredAnswer } from '../src/features/creator/exercises/AuthoredExerciseRenderer'
import { prototypes, emptyAttempt, type Exercise } from '../src/features/creator/exercises/catalog'
import type { CustomExercise } from '../src/features/creator/exercises/persistenceTypes'
import { persistCreatorTemplate, verifyCustomSave } from '../src/features/creator/templatePersistence'
const fixtures = exerciseFixtures as CustomExercise[]
for (const wire of fixtures) {
  test(`${wire.type}: lossless round-trip, identity separation and valid interactive answers`, () => {
    const saved = { ...structuredClone(wire), id: '22a8945d-01fb-49ac-b18b-34c1f779be85', owner: { templateKey: 'fixture', version: 3 } } as CustomExercise
    const e = fromPersistence(saved)
    expect(e.id).not.toBe(saved.id); expect(toPersistence(e)).toEqual(saved)
    expect(toPersistence(fromPersistence(wire))).toEqual(wire)
    expect(validateCustomExercises(customTemplateFixture('fixture', 3, [saved]))).toEqual([])
    const d: any = e.authored!.activity, a: any = e.authored!.expected, attempt = emptyAttempt()
    attempt.text = String(a.value ?? a.optionId ?? a.target ?? a.shapeId ?? a.predictedOutput ?? a.word ?? a.frequencyId ?? a.code ?? '')
    attempt.selected = a.optionIds ?? a.trustedSignalIds ?? []
    attempt.order = a.order ?? a.construction ?? []
    attempt.rule = a.ruleId ?? ''; attempt.explanation = a.explanationId ?? ''
    if (a.stepId) attempt.text = a.stepId
    for (const p of a.pairs ?? []) attempt.values[p.leftId] = p.rightId
    for (const p of a.assignments ?? []) attempt.values[p.itemId] = p.targetId
    for (const p of a.values ?? []) attempt.values[p.blankId] = p.value
    expect(checkAuthoredAnswer(e, attempt)).toBe(true)
    expect(checkAuthoredAnswer(e, emptyAttempt())).toBe(false)
    if (wire.type === 'memory-card') expect(d.card).not.toBe(a.value)
    const output = toPersistence(e); output.title = 'Independent'; expect(wire.title).not.toBe('Independent')
  })
  test(`${wire.type}: unsupported versions, extra fields and incomplete data fail explicitly`, () => {
    for (const patch of [{ schemaVersion: 2 }, { answer: {} }, { extra: 'never dropped' }, { classification: wire.classification === 'personal' ? 'team' : 'personal' }]) {
      expect(() => fromPersistence({ ...wire, ...patch } as CustomExercise)).toThrow()
    }
  })
  test(`${wire.type}: real editor retains content, ordered hints and stable item IDs`, async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container)
    let latest = fromPersistence(wire)
    function Harness() { const [e, update] = useState(latest); return <AuthoredContentEditor exercise={e} onChange={value => { latest = value; update(value) }} /> }
    try {
      await act(async () => root.render(<Harness />))
      const textarea = container.querySelector('textarea')
      if (textarea) await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'Changed text')
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      })
      const before: any = wire.interaction, after: any = latest.authored!.activity
      for (const key of Object.keys(before)) if (Array.isArray(before[key]) && before[key][0]?.id) expect(after[key].map((v: any) => v.id)).toEqual(before[key].map((v: any) => v.id))
      expect(latest.authored!.hints.length).toBe(2)
      expect(JSON.stringify(latest)).toContain('Changed text')
    } finally { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals() }
  })
}
test('all local Personal examples convert explicitly without mutating shared examples', () => {
  const original = structuredClone(prototypes)
  for (const e of prototypes) { const converted = authorPrototype(e); expect(() => toPersistence(converted), e.type).not.toThrow(); expect(toPersistence(converted).id).toBeUndefined() }
  expect(prototypes).toEqual(original)
})
test('checkpoint and Personal/Team drafts survive saving and authoritative identity rebasing, including newer edits', () => {
  const content = customTemplateFixture('fixture', 1, [fixtures[0], fixtures[21]])
  const drafts = hydrateExerciseDrafts(content), sent = structuredClone(drafts), newer = structuredClone(drafts)
  newer['kind:0'].custom!.title = 'Newer edit'
  const saved = structuredClone(content)
  saved.version = 2
  for (const cp of saved.checkpoints) for (const exercise of Object.values(cp.customExercises ?? {}) as any[]) {
    exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: 'fixture', version: 2 }
  }
  const next = reconcileExerciseDrafts(newer, sent, saved)
  expect(next['kind:0'].custom!.title).toBe('Newer edit'); expect(next['kind:0'].custom!.persistedIdentity?.owner.version).toBe(2)
  expect(toPersistence(next['teamKind:terminal'].custom!)).toEqual(saved.checkpoints[1].customExercises.team)
  const applied = applyExerciseDrafts(saved.checkpoints, next)
  expect(applied.errors).toEqual([]); expect(applied.checkpoints[1].checkpoint).toBeUndefined()
  expect(applied.checkpoints[0].customExercises!.personal!.title).toBe('Newer edit')
  expect(content.checkpoints[0].customExercises.personal.title).not.toBe('Newer edit')
  const removed = applyExerciseDrafts([saved.checkpoints[1]], next)
  expect(removed.errors.join()).toContain('checkpoint was removed')
})
test('only explicitly preview-only content is excluded, and malformed intended content blocks saving', () => {
  const content = customTemplateFixture(), drafts = hydrateExerciseDrafts(content)
  drafts['kind:0'].custom!.title = ''
  expect(applyExerciseDrafts(content.checkpoints, drafts).errors.join()).toContain('Checkpoint 1')
  drafts['kind:0'].intendedForSubmission = false
  const applied = applyExerciseDrafts(content.checkpoints, drafts)
  expect(applied.errors).toEqual([]); expect(applied.checkpoints[0].customExercises).toBeUndefined()
})
test('persistence validates the whole payload before calling real Template operations; failures retain input', async () => {
  const content = customTemplateFixture(), original = structuredClone(content)
  const create = vi.fn().mockRejectedValue(new Error('network failed')), createVersion = vi.fn()
  await expect(persistCreatorTemplate({ create, createVersion } as any, content, null, 'universal')).rejects.toThrow('network failed')
  expect(content).toEqual(original); expect(create).toHaveBeenCalledWith({ ...content, mission: { name: 'Find' } }, 'universal')
  content.checkpoints[0].customExercises.personal.schemaVersion = 2
  await expect(persistCreatorTemplate({ create, createVersion } as any, content, null)).rejects.toThrow('Unsupported value')
  expect(create).toHaveBeenCalledTimes(1); expect(createVersion).not.toHaveBeenCalled()
})
test('revising an approved version echoes only same-slot source identity and leaves approval content immutable', async () => {
  const content = customTemplateFixture('fixture', 3)
  const e = content.checkpoints[0].customExercises.personal
  e.id = crypto.randomUUID(); e.owner = { templateKey: 'fixture', version: 3 }
  const persisted = { key: 'fixture', version: 3, status: 'approved', category: 'universal', content } as any
  const previous = structuredClone(persisted)
  const drafts = hydrateExerciseDrafts(content)
  drafts['kind:0'].custom!.title = 'Revision content'
  const applied = applyExerciseDrafts(content.checkpoints, drafts)
  const createVersion = vi.fn(async (key, next) => { const content = structuredClone(next); const exercise = content.checkpoints[0].customExercises.personal; exercise.id = crypto.randomUUID(); exercise.owner = { templateKey: key, version: next.version }; return { ...persisted, status: 'draft', version: next.version, content } })
  const result = await persistCreatorTemplate({ create: vi.fn(), createVersion }, { ...content, checkpoints: applied.checkpoints }, persisted)
  expect(createVersion).toHaveBeenCalledWith('fixture', expect.objectContaining({ version: 4 }))
  expect((createVersion.mock.calls[0][1].checkpoints[0] as any).customExercises.personal).toMatchObject({ id: e.id, owner: e.owner, title: 'Revision content' })
  expect((result.content.checkpoints[0] as any).customExercises.personal.owner.version).toBe(4)
  expect(persisted).toEqual(previous)
})
test('type variants rebase to the latest same-slot identity after save and clear identity after slot removal', () => {
  const content = customTemplateFixture('fixture', 1), drafts = hydrateExerciseDrafts(content)
  drafts['kind:0'].customByType = { 'single-choice': fromPersistence(fixtures[1]) }
  const saved = structuredClone(content), e = saved.checkpoints[0].customExercises.personal
  e.id = crypto.randomUUID(); e.owner = { templateKey: 'fixture', version: 2 }; saved.version = 2
  const next = reconcileExerciseDrafts(drafts, drafts, saved)
  expect(next['kind:0'].customByType!['single-choice']!.persistedIdentity?.id).toBe(e.id)
  delete saved.checkpoints[0].customExercises
  expect(reconcileExerciseDrafts(next, next, saved)['kind:0'].customByType!['single-choice']!.persistedIdentity).toBeUndefined()
})

test('missing identity, dropped custom content and altered exercise responses cannot report a successful save', () => {
  const content = customTemplateFixture(), saved = { key: content.key, version: 1, status: 'draft', content: structuredClone(content) } as any
  expect(() => verifyCustomSave(content, saved)).toThrow('identity or ownership')
  delete saved.content.checkpoints[0].customExercises
  expect(() => verifyCustomSave(content, saved)).toThrow('identity or ownership')
  saved.content = structuredClone(content)
  const e = saved.content.checkpoints[0].customExercises.personal
  e.id = crypto.randomUUID(); e.owner = { templateKey: saved.key, version: 1 }; e.title = 'Unexpected replacement'
  expect(() => verifyCustomSave(content, saved)).toThrow('differs from the authored exercise')
})
