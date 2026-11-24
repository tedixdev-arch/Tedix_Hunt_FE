import assert from 'node:assert/strict'
import { test } from 'node:test'
import { pointsWithoutChallenge } from '../src/features/creator/challengeCoverage.ts'

test('lists checkpoints and the FinishPoint with neither a Personal nor a Team challenge', () => {
  const checkpoints = [
    { checkpoint: 1, libraryAllocations: { personal: { mode: 'specific' } } },
    { checkpoint: 2 },
    { checkpoint: 3, customExercises: { team: { type: 'scrambled-word' } } },
    { role: 'terminal' },
  ]
  assert.deepEqual(pointsWithoutChallenge(checkpoints), ['Checkpoint 2', 'FinishPoint'])
  assert.deepEqual(pointsWithoutChallenge([]), [])
  assert.deepEqual(pointsWithoutChallenge([null, { role: 'terminal', customExercises: { personal: {} } }]), ['Checkpoint 1'])
})
