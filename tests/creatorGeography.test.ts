import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { buildGeographyConfiguration, createCheckpointDrafts, isGeographyComplete, isValidCheckpoint, resizeCheckpointDrafts, updateCheckpointDraft } from '../src/features/creator/checkpointGeography.ts'

const valid = { checkpointNumber: 1, name: 'Museum entrance', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }

test('unpositioned normal checkpoints have no invented coordinates or FinishPoint', () => {
  const drafts = createCheckpointDrafts(2, ['One', 'Two'])
  assert.deepEqual(drafts, [
    { checkpointNumber: 1, name: 'One', radiusMeters: 30 },
    { checkpointNumber: 2, name: 'Two', radiusMeters: 30 },
  ])
  assert.equal(JSON.stringify(drafts).includes('FinishPoint'), false)
})

test('map placement maps only backend geography fields into Template content', () => {
  const configuration = buildGeographyConfiguration(1, [{ ...valid, ignoredViewport: 14 } as typeof valid])
  assert.deepEqual(configuration, { normalCheckpointCount: 1, checkpointPositions: [valid] })
  assert.deepEqual(Object.keys(configuration.checkpointPositions[0]), ['checkpointNumber', 'name', 'latitude', 'longitude', 'radiusMeters'])
  assert.equal(JSON.stringify(configuration).includes('zoom'), false)
})

test('count changes preserve in-range positions, add unpositioned drafts, and remove out-of-range positions', () => {
  const increased = resizeCheckpointDrafts([valid], 3, ['One', 'Two', 'Three'])
  assert.deepEqual(increased[0], valid)
  assert.equal('latitude' in increased[1], false)
  assert.equal('longitude' in increased[2], false)
  assert.deepEqual(resizeCheckpointDrafts(increased, 1, ['One']), [valid])
})

test('radius, name and coordinate validity gate verification and completion', () => {
  assert.equal(isValidCheckpoint({ ...valid, name: '' }), false)
  assert.equal(isValidCheckpoint({ ...valid, radiusMeters: 9 }), false)
  assert.equal(isValidCheckpoint({ ...valid, radiusMeters: 501 }), false)
  assert.equal(isValidCheckpoint({ ...valid, latitude: 91 }), false)
  assert.equal(isValidCheckpoint(valid), true)
  assert.equal(isGeographyComplete([valid], new Set([1]), 6, 6), true)
  assert.equal(isGeographyComplete([valid], new Set(), 6, 6), false)
  assert.equal(isGeographyComplete([valid], new Set([1]), 5, 6), false)
})

test('repositioning, radius changes and name changes invalidate verification', () => {
  for (const change of [{ latitude: 46.8 }, { radiusMeters: 50 }, { name: 'New name' }]) {
    const result = updateCheckpointDraft([valid], new Set([1]), 1, change)
    assert.equal(result.verified.has(1), false)
  }
})

test('Leaflet tiles are isolated and use visible OpenStreetMap attribution', () => {
  const tiles = readFileSync(new URL('../src/features/creator/mapTiles.ts', import.meta.url), 'utf8')
  const editor = readFileSync(new URL('../src/features/creator/RouteEditor.tsx', import.meta.url), 'utf8')
  assert.match(tiles, /tile\.openstreetmap\.org/)
  assert.match(tiles, /OpenStreetMap/)
  assert.match(editor, /prototypeMapTiles\.attribution/)
  assert.doesNotMatch(editor, /tile\.openstreetmap\.org/)
  assert.doesNotMatch(editor, /\bx\b.*%|\by\b.*%/)
})
