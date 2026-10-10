import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialPreviewProgress, projectPreview, transitionPreview } from '../src/features/creator/participantPreview.ts'
import type { CreatorTemplateContent } from '../src/services/api/creatorTemplates.ts'

const point = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const finish = { name: 'Wall', latitude: 46.78, longitude: 23.64, radiusMeters: 17 }
function template(count = 1): CreatorTemplateContent {
  return { key: 'trail', version: 1, displayName: 'Trail', theme: 'City', mission: 'Go', scoring: { model: 'platform', startingScore: 500 },
    configuration: { normalCheckpointCount: count, checkpointPositions: Array.from({ length: count }, (_, index) => ({ ...point, checkpointNumber: index + 1 })), finishPoint: finish },
    checkpoints: [...Array.from({ length: count }, (_, index) => ({ checkpoint: index + 1, kind: 'square', teamKind: 'hypothesis' })), { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis' }] }
}

test('one and twenty normal checkpoints progress in order to terminal after both activities resolve', () => {
  for (const count of [1, 20]) {
    const input = template(count), before = structuredClone(input), journey = projectPreview(input)
    assert.deepEqual(journey.checkpoints.map(checkpoint => checkpoint.label), [...Array.from({ length: count }, (_, index) => `CP${index + 1}`), 'FinishPoint'])
    let state = transitionPreview(initialPreviewProgress, { type: 'start' }, journey)
    for (let index = 0; index <= count; index++) {
      assert.equal(state.index, index)
      assert.equal(state.phase, 'navigation')
      assert.equal(transitionPreview(state, { type: 'continue' }, journey), state)
      assert.equal(transitionPreview(state, { type: 'resolve', activity: 'kind' }, journey), state)
      state = transitionPreview(state, { type: 'arrive' }, journey)
      assert.equal(state.phase, 'arrived')
      assert.equal(transitionPreview(state, { type: 'continue' }, journey), state)
      state = transitionPreview(state, { type: 'resolve', activity: 'kind' }, journey)
      assert.equal(transitionPreview(state, { type: 'continue' }, journey), state)
      assert.equal(transitionPreview(state, { type: 'resolve', activity: 'kind' }, journey), state)
      state = transitionPreview(state, { type: 'resolve', activity: 'teamKind' }, journey)
      state = transitionPreview(state, { type: 'continue' }, journey)
    }
    assert.equal(state.phase, 'complete')
    assert.deepEqual(transitionPreview(state, { type: 'restart' }, journey), initialPreviewProgress)
    assert.deepEqual(input, before)
  }
})

test('optional challenges do not invent activities; terminal still requires explicit completion after arrival', () => {
  const input = template(); input.checkpoints = [{ checkpoint: 1 }, { role: 'terminal' }]
  const journey = projectPreview(input)
  let state = transitionPreview(initialPreviewProgress, { type: 'start' }, journey)
  state = transitionPreview(state, { type: 'arrive' }, journey)
  state = transitionPreview(state, { type: 'continue' }, journey)
  state = transitionPreview(state, { type: 'arrive' }, journey)
  assert.equal(state.phase, 'arrived')
  assert.equal(transitionPreview(state, { type: 'continue' }, journey).phase, 'complete')
})

test('incomplete and invalid geography emits actionable warnings without inventing or repairing locations', () => {
  for (const value of [NaN, Infinity, 91, undefined, '46']) {
    const input = template()
    input.configuration.checkpointPositions[0].latitude = value as number
    const before = structuredClone(input), journey = projectPreview(input)
    assert.equal(journey.checkpoints[0].position, undefined)
    assert.match(journey.checkpoints[0].warnings.join(' '), /Feature 2/)
    assert.deepEqual(input, before)
  }
  for (const radiusMeters of [4, 501, NaN]) {
    const input = template(); input.configuration.finishPoint = { ...finish, radiusMeters }
    assert.equal(projectPreview(input).checkpoints.at(-1)?.position, undefined)
  }
  const input = template(); delete input.configuration.finishPoint
  assert.match(projectPreview(input).checkpoints.at(-1)!.warnings.join(' '), /Feature 6/)
})

test('duplicate, unordered and conflicting numbering is warned and never silently repaired', () => {
  const input = template(2)
  input.configuration.checkpointPositions.reverse()
  input.checkpoints = [{ checkpoint: 1, checkpointNumber: 2 }, { checkpoint: 1 }, { role: 'terminal' }]
  const before = structuredClone(input), journey = projectPreview(input)
  assert.match(journey.warnings.join(' '), /numbering/)
  assert.equal(journey.checkpoints[0].position, undefined)
  assert.deepEqual(journey.checkpoints[0].gameplay, {})
  assert.deepEqual(input, before)
})

test('unsupported saved challenges remain inspectable and require manual resolution', () => {
  const input = template(); input.checkpoints[0] = { checkpoint: 1, kind: 'future-type', teamKind: '', custom: { prompt: 'Actual saved prompt' } }
  const journey = projectPreview(input)
  assert.match(journey.checkpoints[0].warnings.join(' '), /unsupported or incomplete/)
  assert.deepEqual(journey.checkpoints[0].gameplay.custom, { prompt: 'Actual saved prompt' })
  let state = transitionPreview(initialPreviewProgress, { type: 'start' }, journey)
  state = transitionPreview(state, { type: 'arrive' }, journey)
  state = transitionPreview(state, { type: 'resolve', activity: 'kind' }, journey)
  assert.equal(transitionPreview(state, { type: 'continue' }, journey), state)
})

test('legacy gameplay compatibility is read-only and does not manufacture mockup content or coordinates', () => {
  const input = { ...template(), configuration: { durationMinutes: 45 }, checkpoints: [{ personal: 0, team: 0, navigation: 1 }] } as unknown as CreatorTemplateContent
  const before = structuredClone(input), journey = projectPreview(input)
  assert.equal(journey.checkpoints[0].gameplay.kind, 'hidden-rule')
  assert.equal(journey.checkpoints[0].gameplay.navigationMode, 'compass')
  assert.equal(journey.checkpoints[0].position, undefined)
  assert.equal(journey.checkpoints.at(-1)!.position, undefined)
  assert.equal(journey.checkpoints[0].gameplay.prompt, undefined)
  assert.match(journey.warnings.join(' '), /Legacy/)
  assert.deepEqual(input, before)
})

test('malformed draft entries, invalid count and duplicate terminal gameplay remain useful warnings', () => {
  const input = template(); input.configuration.normalCheckpointCount = 21
  input.checkpoints = [null, { checkpoint: 1, kind: { unsupported: true } }, { role: 'terminal' }, { role: 'terminal', kind: 'square' }]
  const journey = projectPreview(input)
  assert.match(journey.warnings.join(' '), /incomplete or unsupported/)
  assert.match(journey.warnings.join(' '), /one FinishPoint/)
  assert.deepEqual(journey.checkpoints.at(-1)!.gameplay, {})
})
