import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inspectHuntGeography } from '../src/components/huntMapGeography.ts'

const cp = { checkpointNumber: 1, name: 'Submitted museum', latitude: 0, longitude: 0, radiusMeters: 30 }
const configuration = { normalCheckpointCount: 2, checkpointPositions: [cp, { ...cp, checkpointNumber: 2, name: 'Library', longitude: 1 }], finishPoint: { name: 'Wall', latitude: 1, longitude: 1, radiusMeters: 17 } }
test('projects exactly the saved numbered geography without mutation or editing flags', () => {
  const before = structuredClone(configuration)
  const result = inspectHuntGeography(configuration)
  assert.deepEqual(result.checkpoints, configuration.checkpointPositions)
  assert.deepEqual(result.finishPoint, configuration.finishPoint)
  assert.equal(result.warning, undefined)
  assert.deepEqual(configuration, before)
  assert.notEqual(result.checkpoints[0], cp)
  assert.notEqual(result.finishPoint, configuration.finishPoint)
  assert.equal(result.checkpoints.length, 2)
})
test('invalid and legacy artifacts warn without repair, sorting or location substitution', () => {
  for (const value of [{}, { ...configuration, finishPoint: undefined }, { ...configuration, normalCheckpointCount: 3 },
    { ...configuration, checkpointPositions: [...configuration.checkpointPositions].reverse() },
    ...[null, { ...cp, name: 5 }, { ...cp, latitude: NaN }, { ...cp, longitude: 181 }, { ...cp, radiusMeters: 0 }, { ...cp, radiusMeters: 5.5 }, { ...cp, checkpointNumber: 2 }].map(point => ({ ...configuration, checkpointPositions: [point, configuration.checkpointPositions[1]] })),
    { ...configuration, finishPoint: { ...configuration.finishPoint, radiusMeters: 501 } }]) {
    const before = structuredClone(value)
    const result = inspectHuntGeography(value)
    assert.match(result.warning!, /missing or invalid/)
    assert.deepEqual(result.checkpoints, [])
    assert.equal(result.finishPoint, undefined)
    assert.deepEqual(value, before)
  }
})
