import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createFinishPointDraft, finishPointValidation, isValidFinishPoint } from '../src/features/creator/finishPoint.ts'
import { CreatorTemplatesApi, type CreatorTemplateContent } from '../src/services/api/creatorTemplates.ts'
import { ApiClient } from '../src/services/api/client.ts'
import { persistCreatorTemplate } from '../src/features/creator/templatePersistence.ts'

const finishPoint = { name: ' City Wall ', latitude: 46.778123, longitude: 23.641234, radiusMeters: 17 }
const checkpoint = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const configuration = { normalCheckpointCount: 1, checkpointPositions: [checkpoint], finishPoint }

test('new FinishPoint has radius 5 and no invented coordinates', () => {
  assert.deepEqual(createFinishPointDraft(), { name: '', radiusMeters: 5 })
})

test('draft omission is allowed, geographic submission requires FinishPoint, legacy omission remains allowed', () => {
  const draft = { normalCheckpointCount: 1, checkpointPositions: [] }
  assert.equal(finishPointValidation(draft), '')
  assert.match(finishPointValidation(draft, true), /Place one FinishPoint/)
  assert.equal(finishPointValidation({ durationMinutes: 45 }, true), '')
  assert.equal(finishPointValidation(configuration, true), '')
})

test('inclusive coordinate, name and radius boundaries match BE #61', () => {
  for (const radiusMeters of [5, 500]) for (const [latitude, longitude] of [[-90, -180], [90, 180]]) {
    assert.equal(isValidFinishPoint({ ...finishPoint, latitude, longitude, radiusMeters, name: 'x'.repeat(100) }), true)
  }
})

test('invalid FinishPoints are rejected equally for drafts and submissions', () => {
  const invalid: unknown[] = [null, [], [finishPoint], {},
    ...[{ name: '' }, { name: '  ' }, { name: 'x'.repeat(101) }, { latitude: -91 }, { latitude: 91 }, { latitude: NaN }, { latitude: Infinity }, { longitude: -181 }, { longitude: 181 }, { longitude: '23' }, { radiusMeters: 4 }, { radiusMeters: 501 }, { radiusMeters: 5.5 }, { radiusMeters: NaN }, { radiusMeters: '5' }, { radiusMeters: undefined }, { checkpointNumber: 2 }, { mapbox_id: 'id' }].map(change => ({ ...finishPoint, ...change }))]
  for (const point of invalid) {
    assert.equal(isValidFinishPoint(point), false)
    assert.ok(finishPointValidation({ ...configuration, finishPoint: point }))
    assert.equal(finishPointValidation({ ...configuration, finishPoint: point }), finishPointValidation({ ...configuration, finishPoint: point }, true))
  }
})

test('saving emits exact FinishPoint shape, keeps checkpoints and count, and preserves immutable versions', async () => {
  const content: CreatorTemplateContent = { key: 'trail', version: 1, displayName: 'Trail', theme: 'City', mission: { name: 'Go' }, configuration, scoring: { model: 'platform' }, checkpoints: [{ checkpointNumber: 1 }] }
  const persisted = { key: 'trail', version: 1, status: 'draft' as const, content: structuredClone(content) }
  const before = structuredClone(persisted)
  Object.freeze(persisted.content.configuration.finishPoint)
  const next = { ...content, configuration: { ...content.configuration, finishPoint: { ...finishPoint, latitude: 47, radiusMeters: 5 } } }
  const calls: { url: string; body: unknown }[] = []
  const client = new ApiClient('https://api.test', undefined, async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) })
    return new Response(JSON.stringify({ ...persisted, version: 2, content: { ...next, version: 2 } }), { status: 200 })
  })
  const api = new CreatorTemplatesApi(client)
  await persistCreatorTemplate(api, next, persisted)
  assert.deepEqual(calls, [{ url: 'https://api.test/api/creator/templates/trail/versions', body: { content: { ...next, version: 2 } } }])
  assert.deepEqual(persisted, before)
  assert.deepEqual(next.configuration.checkpointPositions, [checkpoint])
  assert.equal(next.configuration.normalCheckpointCount, 1)
  assert.deepEqual(Object.keys(next.configuration.finishPoint).sort(), ['latitude', 'longitude', 'name', 'radiusMeters'])
  calls.length = 0
  await persistCreatorTemplate(api, persisted.content, persisted)
  assert.equal(calls.length, 0)
  await assert.rejects(persistCreatorTemplate(api, { ...content, configuration: { ...configuration, finishPoint: { ...finishPoint, radiusMeters: 4 } } }, persisted), /integer radius/)
  assert.equal(calls.length, 0)
})
