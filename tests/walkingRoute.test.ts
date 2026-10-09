import assert from 'node:assert/strict'
import { test } from 'node:test'
import { walkingDestinations, calculateWalkingRoute, walkingDistance, walkingDuration } from '../src/features/creator/walkingRoute.ts'

const point = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const finishPoint = { name: 'Wall', latitude: 46.78, longitude: 23.64, radiusMeters: 17 }
const configuration = { normalCheckpointCount: 1, checkpointPositions: [point], finishPoint }
const response = { code: 'Ok', waypoints: [{}, {}], routes: [{ geometry: { type: 'LineString', coordinates: [[23.59, 46.77], [23.64, 46.78]] }, legs: [{}], distance: 1450, duration: 900 }] }

test('one and twenty checkpoints remain ordered with FinishPoint last and no starting point', () => {
  for (const count of [1, 20]) {
    const input = { ...configuration, normalCheckpointCount: count, checkpointPositions: Array.from({ length: count }, (_, i) => ({ ...point, checkpointNumber: i + 1 })) }
    const before = structuredClone(input)
    const destinations = walkingDestinations(input)
    assert.equal(destinations.length, count + 1)
    assert.deepEqual(destinations.map(p => p.label), [...Array.from({ length: count }, (_, i) => `CP${i + 1}`), 'FinishPoint'])
    assert.deepEqual(destinations.at(-1), { label: 'FinishPoint', latitude: finishPoint.latitude, longitude: finishPoint.longitude })
    assert.deepEqual(input, before)
  }
})

test('missing, duplicate, unordered and invalid geography is rejected without corrections', () => {
  const invalid = [
    { ...configuration, normalCheckpointCount: 0 }, { ...configuration, normalCheckpointCount: 21 }, { ...configuration, normalCheckpointCount: 1.5 },
    { ...configuration, normalCheckpointCount: 2 }, { ...configuration, checkpointPositions: [] },
    { ...configuration, normalCheckpointCount: 2, checkpointPositions: [point, point] },
    { ...configuration, normalCheckpointCount: 2, checkpointPositions: [{ ...point, checkpointNumber: 2 }, point] },
    { ...configuration, finishPoint: undefined },
    ...[NaN, Infinity, 91, '46', undefined].map(latitude => ({ ...configuration, checkpointPositions: [{ ...point, latitude }] })),
    ...[NaN, Infinity, 181, '23', undefined].map(longitude => ({ ...configuration, finishPoint: { ...finishPoint, longitude } })),
  ]
  for (const input of invalid) { const before = structuredClone(input); assert.throws(() => walkingDestinations(input)); assert.deepEqual(input, before) }
  assert.throws(() => walkingDestinations({ durationMinutes: 45 }), /checkpoint count/)
})

test('Mapbox walking response uses authoritative order and metrics without gameplay/scoring mutation', async t => {
  const input = { ...configuration, scoring: { solved: 20 }, finishPointGameplay: { role: 'terminal' }, checkpoints: [{ kind: 'challenge' }] }
  const before = structuredClone(input)
  let url = ''
  t.mock.method(globalThis, 'fetch', async (request: string) => { url = request; return new Response(JSON.stringify(response)) })
  const route = await calculateWalkingRoute(walkingDestinations(input), 'public-test-token')
  assert.match(url, /directions\/v5\/mapbox\/walking\/23.59,46.77;23.64,46.78\?/)
  assert.match(url, /overview=full/)
  assert.match(url, /geometries=geojson/)
  assert.deepEqual(route, { geometry: response.routes[0].geometry, distance: 1450, duration: 900 })
  assert.deepEqual(input, before)
})

test('walking estimates display meters/km and minutes/hours', () => {
  assert.equal(walkingDistance(450), '450 m'); assert.equal(walkingDistance(1450), '1.4 km')
  assert.equal(walkingDuration(900), '15 min'); assert.equal(walkingDuration(3660), '1 h 1 min')
  assert.equal(walkingDuration(3600), '1 h')
})

test('routing failures and unusable partial responses never invent metrics', async t => {
  const mock = t.mock.method(globalThis, 'fetch')
  const invalid = [{ code: 'NoRoute', routes: [] }, { ...response, routes: [{ ...response.routes[0], distance: null }] },
    { ...response, waypoints: [] }, { ...response, routes: [{ ...response.routes[0], legs: [] }] },
    { ...response, routes: [{ ...response.routes[0], geometry: { type: 'LineString', coordinates: [[200, 46], [23, 46]] } }] }]
  for (const body of invalid) {
    mock.mock.mockImplementation(async () => new Response(JSON.stringify(body)))
    await assert.rejects(calculateWalkingRoute(walkingDestinations(configuration), 'token'), /usable walking route/)
  }
  mock.mock.mockImplementation(async () => new Response('', { status: 401 }))
  await assert.rejects(calculateWalkingRoute(walkingDestinations(configuration), 'token'), /HTTP 401/)
  mock.mock.mockImplementation(async () => { throw new Error('offline') })
  await assert.rejects(calculateWalkingRoute(walkingDestinations(configuration), 'token'), /connection/)
  await assert.rejects(calculateWalkingRoute(walkingDestinations(configuration), ''), /MAPBOX_ACCESS_TOKEN/)
})
