import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient, ApiError } from '../src/services/api/client.ts'
import { CreatorTemplatesApi, type CreatorTemplateContent } from '../src/services/api/creatorTemplates.ts'
import { editMissionStory, missionStoryFields, serializeMission } from '../src/features/creator/mission.ts'
import { hydratePersistedGeography, persistCreatorTemplate, creatorTemplateError } from '../src/features/creator/templatePersistence.ts'
import { hydrateGameplay, serializeGameplay, gameplayValidation } from '../src/features/creator/checkpointGameplay.ts'
import { buildGeographyConfiguration } from '../src/features/creator/checkpointGeography.ts'
import { projectPreview } from '../src/features/creator/participantPreview.ts'

const session = { getAccessToken: () => 'creator-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }

test('starter uses authenticated endpoint, deduplicates in-flight calls, and can retry after failure', async () => {
  let complete!: (response: Response) => void
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const api = new CreatorTemplatesApi(new ApiClient('https://api.test', session, async (url, init) => {
    calls.push({ url: String(url), init }); return new Promise(resolve => { complete = resolve })
  }))
  const first = api.createSignalClujDraft(), second = api.createSignalClujDraft()
  assert.equal(first, second); assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.test/api/creator/templates/starters/signal-cluj-napoca')
  assert.equal(calls[0].init?.method, 'POST')
  assert.equal(new Headers(calls[0].init?.headers).get('Authorization'), 'Bearer creator-token')
  assert.equal(calls[0].init?.body, undefined)
  complete(new Response(JSON.stringify({ key: 'new-draft', status: 'draft' }), { status: 201, headers: { 'content-type': 'application/json' } }))
  assert.equal((await first).key, 'new-draft')
  const failed = api.createSignalClujDraft()
  complete(new Response('{}', { status: 409, headers: { 'content-type': 'application/json' } }))
  await assert.rejects(failed, error => error instanceof ApiError && error.status === 409)
  const retry = api.createSignalClujDraft()
  complete(new Response('{}', { status: 500 }))
  await assert.rejects(retry); assert.equal(calls.length, 3)
})

test('starter authorization, conflict, network and server errors are actionable', () => {
  for (const [status, expected] of [[401, /sign in/], [403, /not authorized/], [409, /conflict/], [500, /Check your drafts/], [null, /Check your drafts/]] as const) {
    assert.match(creatorTemplateError(new ApiError('raw', status, 'http'), 'starter'), expected)
  }
})

test('object mission editing preserves all unknown metadata and legacy text remains readable', () => {
  const original = { name: 'Restore', briefing: 'Original story', signal: 'SIGNAL', finishLocation: 'Fictional wall', extra: { nested: [1, 2] }, flags: true }
  assert.deepEqual(missionStoryFields(original), [['name', 'Restore'], ['briefing', 'Original story'], ['signal', 'SIGNAL'], ['finishLocation', 'Fictional wall']])
  const edited = editMissionStory(original, 'briefing', 'Edited story')
  assert.deepEqual(edited, { ...original, briefing: 'Edited story' })
  assert.equal(original.briefing, 'Original story')
  assert.deepEqual(serializeMission(edited), edited)
  assert.deepEqual(missionStoryFields('Legacy'), [['name', 'Legacy']])
  assert.deepEqual(serializeMission('Legacy'), { name: 'Legacy' })
})

test('six normal checkpoints and terminal retain complete gameplay/story/scoring through edit, save, reload and preview', async () => {
  const payload = { kind: 'hidden-rule', teamKind: 'scrambled-word', navigationMode: 'none', correctAnswers: { x: '42' }, hint: 'Saved hint', solutionSteps: ['Saved solution'], teamAnswer: 'Saved answer', storyProblem: 'Saved story', fictionalNavigation: { scope: 'puzzle-only', direction: 'NW', distance: '80 m', navigationClue: 'Fictional clue' }, unknown: { future: ['metadata'] } }
  const content: CreatorTemplateContent = { key: 'new-draft', version: 1, displayName: 'Signal draft', theme: 'Signal', mission: { name: 'Restore', briefing: 'Story', metadata: { future: true } }, scoring: { startingScore: 500, unknown: { bonuses: [100] } }, routeResearch: { physicalVerification: 'pending' }, configuration: { normalCheckpointCount: 6, checkpointPositions: [], unknown: { preserve: true } }, checkpoints: [...Array.from({ length: 6 }, (_, i) => ({ ...structuredClone(payload), role: 'normal', checkpoint: i + 1 })), { ...structuredClone(payload), role: 'terminal' }] }
  const original = structuredClone(content)
  const geography = hydratePersistedGeography(content.configuration)
  assert.equal(geography.checkpointDrafts.length, 6)
  assert.ok(geography.checkpointDrafts.every(point => point.latitude === undefined && point.longitude === undefined))
  assert.equal(geography.verifiedPositions.size, 0)
  const placed = geography.checkpointDrafts.map((point, index) => ({ ...point, name: `Researched place ${index + 1}`, latitude: 46 + index / 100, longitude: 23 + index / 100 }))
  const gameplay = hydrateGameplay(content)
  gameplay.normal[0] = { ...gameplay.normal[0], kind: 'square' }
  const edited = { ...content, mission: editMissionStory(content.mission, 'briefing', 'Edited'), configuration: { ...content.configuration, ...buildGeographyConfiguration(6, placed), finishPoint: { name: 'Researched finish', latitude: 46.8, longitude: 23.6, radiusMeters: 20 } }, checkpoints: serializeGameplay(gameplay.normal, 6, gameplay.terminal, content.checkpoints) }
  let saved!: CreatorTemplateContent
  const record = { key: content.key, version: 1, status: 'draft' as const, content }
  const result = await persistCreatorTemplate({ create: async () => { throw new Error('Unexpected create') }, createVersion: async (_, next) => { saved = JSON.parse(JSON.stringify(next)); return { ...record, version: 2, content: saved } } }, edited, record)
  assert.deepEqual(content, original)
  assert.deepEqual(saved.checkpoints, edited.checkpoints)
  assert.deepEqual(saved.scoring, content.scoring)
  assert.deepEqual(saved.routeResearch, content.routeResearch)
  assert.deepEqual(saved.mission, edited.mission)
  assert.deepEqual(saved.configuration.unknown, content.configuration.unknown)
  assert.equal(gameplayValidation(saved, true), '')
  assert.equal((saved.checkpoints[6] as Record<string, unknown>).checkpoint, undefined)
  const reloaded = hydratePersistedGeography(result.content.configuration)
  assert.deepEqual(reloaded.checkpointDrafts, placed)
  assert.equal(reloaded.verifiedPositions.size, 0)
  const preview = projectPreview(result.content)
  assert.equal(preview.checkpoints.length, 7)
  assert.equal(preview.checkpoints[6].role, 'terminal')
  assert.equal(preview.checkpoints[6].position?.name, 'Researched finish')
  assert.equal(preview.checkpoints[0].position?.name, 'Researched place 1')
  assert.deepEqual(preview.checkpoints.map(point => point.gameplay), saved.checkpoints)
})
