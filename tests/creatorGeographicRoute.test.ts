import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { signalCheckpointNames } from '../src/data/organizerTemplates.ts'
import { createRouteCheckpoints, hasValidGeography, isRouteComplete } from '../src/features/creator/routeCheckpoints.ts'

const studio = readFileSync(new URL('../src/pages/CreatorStudio.tsx', import.meta.url), 'utf8')
const map = readFileSync(new URL('../src/features/creator/CheckpointMap.tsx', import.meta.url), 'utf8')
const tiles = readFileSync(new URL('../src/maps/tileProvider.ts', import.meta.url), 'utf8')

test('normal route drafts use geographic data and never invent Signal coordinates', () => {
  const checkpoints = createRouteCheckpoints(['One', 'Two', 'Three', 'Four'])
  assert.equal(checkpoints.length, 4)
  assert.deepEqual(checkpoints[0], { name: 'One', latitude: null, longitude: null, radiusMeters: 30 })
  assert.equal('x' in checkpoints[0], false)
  assert.equal('y' in checkpoints[0], false)
  assert.doesNotMatch(studio.slice(studio.indexOf('function RouteEditor'), studio.indexOf('function CheckpointEditor')), /\.x\b|\.y\b|clientX|clientY/)
})

test('map clicks pass plain latitude and longitude into the checkpoint model', () => {
  assert.match(map, /onPosition\(event\.latlng\.lat, event\.latlng\.lng\)/)
  assert.match(studio, /\{ \.\.\.item, latitude, longitude \}/)
  assert.doesNotMatch(studio, /setPoints\([^\n]*latlng/)
})

test('only configured normal checkpoints render in Feature 2', () => {
  assert.match(studio, /createRouteCheckpoints\(normalCheckpointNames\(checkpointCount\)\)/)
  assert.match(map, /checkpoints\.map/)
  assert.doesNotMatch(map, /FinishPoint/)
  assert.match(studio, /FinishPoint is configured separately in Feature 6/)
})

test('verification requires valid coordinates, every point, and every safety check', () => {
  const points = createRouteCheckpoints(['One', 'Two'])
  assert.equal(hasValidGeography(points[0]), false)
  assert.equal(isRouteComplete(points, new Set([0, 1]), 6, 6), false)

  const placed = points.map((point, index) => ({ ...point, latitude: 46.77 + index / 100, longitude: 23.62, radiusMeters: 30 }))
  assert.equal(isRouteComplete(placed, new Set([0]), 6, 6), false)
  assert.equal(isRouteComplete(placed, new Set([0, 1]), 5, 6), false)
  assert.equal(isRouteComplete(placed, new Set([0, 1]), 6, 6), true)
  assert.match(studio, /disabled=\{!verified\.has\(index\) && !hasValidGeography\(point\)\}/)
})

test('checkpoint count changes remount the route and invalidate completion', () => {
  assert.match(studio, /<RouteEditor key=\{checkpointCount\}/)
  assert.match(studio, /setCheckpointCount\(count\); setRouteSafe\(false\)/)
})

test('Leaflet uses isolated OpenStreetMap prototype tiles with visible attribution', () => {
  assert.match(map, /MapContainer/)
  assert.match(map, /prototypeTileProvider\.attribution/)
  assert.doesNotMatch(map, /tile\.openstreetmap\.org/)
  assert.match(tiles, /tile\.openstreetmap\.org/)
  assert.match(tiles, />OpenStreetMap</)
})

test('existing Signal canonical runtime data is unchanged', () => {
  assert.deepEqual(signalCheckpointNames, ['Matthias Rex Statue', 'Stone Gate', 'Clock Tower', 'Fountain Court', 'Lantern Lane', 'North Passage', 'City Wall · FinishPoint'])
})
