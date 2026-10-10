import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient, ApiError } from '../src/services/api/client.ts'
import { CreatorTemplatesApi, type CreatorTemplate, type CreatorTemplateContent } from '../src/services/api/creatorTemplates.ts'
import { creatorTemplateError, hydratePersistedGeography, normalizeTemplateKey, persistCreatorTemplate, templateContentEqual } from '../src/features/creator/templatePersistence.ts'
import type { SessionStore, SessionTokens } from '../src/services/api/session.ts'
import { buildGeographyConfiguration, updateCheckpointDraft } from '../src/features/creator/checkpointGeography.ts'

class Session implements SessionStore {
  getAccessToken() { return 'creator-token' }
  getRefreshToken() { return null }
  saveSession(_tokens: SessionTokens) {}
  clearSession() {}
}

const position = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
const content: CreatorTemplateContent = {
  key: 'cluj-algebra-trail', version: 1, displayName: 'Cluj Algebra Trail', theme: 'City', mission: { name: 'Solve it' },
  configuration: { normalCheckpointCount: 1, checkpointPositions: [position] }, scoring: { model: 'platform' }, checkpoints: [{ checkpointNumber: 1 }],
}
const record: CreatorTemplate = { key: content.key, version: 1, status: 'draft', content }

function api(responses: unknown[]) {
  const calls: Array<{ url: string, init?: RequestInit }> = []
  const client = new ApiClient('https://api.test', new Session(), async (url, init) => {
    calls.push({ url: String(url), init })
    const next = responses.shift()
    return next instanceof Response ? next : new Response(JSON.stringify(next), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  return { api: new CreatorTemplatesApi(client), calls }
}

test('Creator Template client matches the existing backend lifecycle request contracts', async () => {
  const setup = api([[record], record, record, { ...record, version: 2 }, { ...record, status: 'submitted' }])
  await setup.api.list(); await setup.api.get(record.key); await setup.api.create(content); await setup.api.createVersion(record.key, { ...content, version: 2 }); await setup.api.submit(record.key, 2)
  assert.deepEqual(setup.calls.map(call => [call.init?.method, call.url]), [
    ['GET', 'https://api.test/api/creator/templates'], ['GET', 'https://api.test/api/creator/templates/cluj-algebra-trail'],
    ['POST', 'https://api.test/api/creator/templates'], ['POST', 'https://api.test/api/creator/templates/cluj-algebra-trail/versions'],
    ['POST', 'https://api.test/api/creator/templates/cluj-algebra-trail/submit'],
  ])
  // Existing BE POST /api/creator/templates contract: identity key plus complete v1 content.
  assert.deepEqual(JSON.parse(String(setup.calls[2].init?.body)), { key: content.key, content })
  // Existing BE POST /api/creator/templates/:key/versions contract: complete next-version content.
  assert.deepEqual(JSON.parse(String(setup.calls[3].init?.body)), { content: { ...content, version: 2 } })
  // Existing BE POST /api/creator/templates/:key/submit contract: exact latest persisted version.
  assert.deepEqual(JSON.parse(String(setup.calls[4].init?.body)), { version: 2 })
})

test('first completion creates v1 and accepts backend identity as authority', async () => {
  const authoritative = { ...record, key: 'backend-key', content: { ...content, key: 'backend-key' } }
  let received: CreatorTemplateContent | undefined
  const result = await persistCreatorTemplate({ create: async value => { received = value; return authoritative }, createVersion: async () => { throw new Error('not expected') } }, content, null)
  assert.equal(received?.version, 1)
  assert.equal(result.key, 'backend-key')
  assert.equal(result.content.key, 'backend-key')
})

test('changed drafts create sequential immutable versions while unchanged content creates none', async () => {
  let creates = 0, versions = 0
  const fake = { create: async () => { creates++; return record }, createVersion: async (key: string, next: CreatorTemplateContent) => { versions++; assert.equal(key, record.key); assert.equal(next.key, record.key); assert.equal(next.version, 2); return { ...record, version: 2, content: next } } }
  assert.equal(await persistCreatorTemplate(fake, { ...content }, record), record)
  const changed = await persistCreatorTemplate(fake, { ...content, displayName: 'Renamed after creation', key: 'must-not-change' }, record)
  assert.equal(creates, 0); assert.equal(versions, 1); assert.equal(changed.content.key, record.key); assert.equal(changed.version, 2)
  assert.equal(templateContentEqual({ ...content }, content), true)
})

test('Template keys are readable slugs and geography contains only the BE #59 fields', () => {
  assert.equal(normalizeTemplateKey(' Cluj Álgebră Trail! '), 'cluj-algebra-trail')
  assert.deepEqual(Object.keys(content.configuration.checkpointPositions[0]), ['checkpointNumber', 'name', 'latitude', 'longitude', 'radiusMeters'])
  assert.equal(JSON.stringify(content.configuration).includes('x'), false)
})

test('persisted positions hydrate unchanged without inventing verification or safety completion', () => {
  const configuration = { normalCheckpointCount: 1, checkpointPositions: [position] }
  const hydrated = hydratePersistedGeography(configuration)

  assert.deepEqual(hydrated.checkpointDrafts, [position])
  assert.notEqual(hydrated.checkpointDrafts[0], position)
  assert.equal(hydrated.verifiedPositions.size, 0)
  assert.equal(hydrated.routeSafety.size, 0)
  assert.equal(hydrated.verifiedPositions.has(position.checkpointNumber), false)
})

test('duplicate, invalid, authorization and session failures have actionable safe messages', () => {
  assert.match(creatorTemplateError(new ApiError('raw', 409, 'conflict'), 'save'), /key is already in use/)
  assert.match(creatorTemplateError(new ApiError('raw', 400, 'bad_request'), 'save'), /content or key is invalid/)
  assert.match(creatorTemplateError(new ApiError('raw', 403, 'http'), 'save'), /not authorized/)
  assert.match(creatorTemplateError(new ApiError('raw', 401, 'unauthorized'), 'submit'), /session has expired/)
})

test('editing and saving hydrated geography creates a version without mutating the saved Template', async () => {
  const persisted = structuredClone(record)
  const before = structuredClone(persisted)
  Object.freeze(persisted.content.configuration.checkpointPositions[0])
  Object.freeze(persisted.content.configuration.checkpointPositions)
  const hydrated = hydratePersistedGeography(persisted.content.configuration)
  const edited = updateCheckpointDraft(hydrated.checkpointDrafts, hydrated.verifiedPositions, 1, { latitude: 47, longitude: 24, radiusMeters: 5 })
  const next = { ...persisted.content, configuration: buildGeographyConfiguration(1, edited.drafts) }
  const setup = api([{ ...persisted, version: 2, content: { ...next, version: 2 } }])
  await persistCreatorTemplate(setup.api, next, persisted)
  assert.deepEqual(persisted, before)
  assert.deepEqual(hydrated.checkpointDrafts, [position])
  assert.equal(setup.calls.length, 1)
  assert.equal(setup.calls[0].url, 'https://api.test/api/creator/templates/cluj-algebra-trail/versions')
  assert.deepEqual(JSON.parse(String(setup.calls[0].init?.body)), { content: { ...next, version: 2 } })
  assert.deepEqual(next.configuration, { normalCheckpointCount: 1, checkpointPositions: [{ ...position, latitude: 47, longitude: 24, radiusMeters: 5 }] })
})
