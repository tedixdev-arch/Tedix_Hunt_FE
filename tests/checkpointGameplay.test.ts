import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createNormalGameplay, gameplayValidation, hydrateGameplay, serializeGameplay, supportedGameplay } from '../src/features/creator/checkpointGameplay.ts'
import { checkpointExercises } from '../src/data/templateOne.ts'
import { persistCreatorTemplate } from '../src/features/creator/templatePersistence.ts'
import { CreatorTemplatesApi } from '../src/services/api/creatorTemplates.ts'
import { ApiClient } from '../src/services/api/client.ts'
import type { CreatorTemplateContent, CreatorTemplate } from '../src/services/api/creatorTemplates.ts'

function content(checkpoints: unknown[] = [{ checkpoint: 1 }, { role: 'terminal' }]): CreatorTemplateContent {
  return { key: 'trail', version: 3, displayName: 'Trail', theme: 'City', mission: 'Go',
    configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 47, longitude: 24, radiusMeters: 30 }], finishPoint: { name: 'Wall', latitude: 47.1, longitude: 24.1, radiusMeters: 17 } },
    scoring: { startingScore: 500, finishPointPuzzle: 250, firstAttemptAccuracyEligibleCheckpoints: [1], custom: { preserved: true } }, checkpoints }
}

test('normal and terminal roles share exactly the BE #62 canonical vocabulary', () => {
  for (const field of ['kind', 'teamKind', 'navigationMode'] as const) {
    assert.deepEqual(supportedGameplay[field], [...new Set(checkpointExercises.map(entry => entry[field]))])
    for (const value of supportedGameplay[field]) {
      assert.equal(gameplayValidation(content([{ checkpoint: 1, [field]: value }, { role: 'terminal', [field]: value }]), true), '')
    }
    for (const role of ['normal', 'terminal']) {
      assert.match(gameplayValidation(content([{ checkpoint: 1 }, { role, [field]: 'invented' }])), /supported/)
    }
  }
})

test('N normal + one unnumbered terminal preserves geography and does not fabricate challenges', () => {
  for (const count of [1, 6, 20]) {
    const normal = createNormalGameplay(count)
    const entries = serializeGameplay(normal, count, { role: 'terminal', custom: { kept: true } })
    assert.equal(entries.length, count + 1)
    assert.deepEqual(entries.slice(0, count).map(entry => entry.checkpoint), Array.from({ length: count }, (_, index) => index + 1))
    assert.equal(entries[count].role, 'terminal')
    assert.equal('checkpoint' in entries[count], false)
    assert.equal('checkpointNumber' in entries[count], false)
    assert.equal('kind' in entries[count], false)
    if (count > 6) assert.equal('kind' in entries[6], false)
  }
  const value = content(); const before = structuredClone(value)
  assert.equal(gameplayValidation(value, true), '')
  assert.deepEqual(value, before)
})

test('submission rejects malformed numbering and terminal entries while allowing progressive drafts', () => {
  for (const entries of [[{ checkpoint: 1 }], [{ role: 'terminal' }], [{ checkpoint: 1 }, { checkpoint: 1 }, { role: 'terminal' }], [{ checkpoint: 2 }, { role: 'terminal' }], [{ checkpoint: 1, checkpointNumber: 2 }, { role: 'terminal' }]]) {
    assert.equal(gameplayValidation(content(entries)), '')
    assert.notEqual(gameplayValidation(content(entries), true), '')
  }
  for (const terminal of [{ role: 'terminal', checkpoint: 2 }, { role: 'terminal', checkpointNumber: 2 }]) {
    assert.match(gameplayValidation(content([{ checkpoint: 1 }, terminal])), /numbering/)
  }
  assert.match(gameplayValidation(content([{ checkpoint: 1 }, { role: 'terminal' }, { role: 'terminal' }])), /exactly one/)
})

test('hydrate by normal numbering rather than terminal position, preserve custom content and exact scoring', () => {
  const saved = content([{ role: 'terminal', kind: 'square', teamKind: 'hypothesis', navigationMode: 'none', custom: ['kept'] }, { checkpoint: 1, kind: 'radial', custom: ['normal'] }])
  const before = structuredClone(saved)
  const hydrated = hydrateGameplay(saved)
  assert.equal(hydrated.normal[0].kind, 'radial')
  hydrated.terminal!.kind = 'build-key'
  const next = { ...saved, checkpoints: serializeGameplay(hydrated.normal, 1, hydrated.terminal) }
  assert.deepEqual(next.scoring, saved.scoring)
  assert.deepEqual(next.configuration, saved.configuration)
  assert.deepEqual(next.checkpoints[1], { ...saved.checkpoints[0] as object, kind: 'build-key' })
  assert.deepEqual(saved, before)
})

test('old FE selection indexes map only explicit supported choices and preserve unrelated fields', () => {
  const saved = content([{ checkpointNumber: 1, personal: 2, team: 4, navigation: 6, custom: 'kept' }])
  const normal = hydrateGameplay(saved).normal[0]
  assert.deepEqual(normal, { ...saved.checkpoints[0] as object, checkpoint: 1, kind: 'square', teamKind: 'clue-synthesis', navigationMode: 'signal-strength' })
  assert.deepEqual(hydrateGameplay(content([{ checkpointNumber: 1 }])).normal[0], { checkpointNumber: 1, checkpoint: 1 })
  assert.equal(hydrateGameplay(saved).terminal, undefined)
})

test('draft version save/reload and submission send BE-compatible payloads with unchanged scoring', async () => {
  const calls: { url: string; body: any }[] = []
  const value = content([{ checkpoint: 1, kind: 'square' }, { role: 'terminal', teamKind: 'filter-noise', navigationMode: 'none' }])
  const record: CreatorTemplate = { key: value.key, version: 3, status: 'draft', content: value }
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }, async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : undefined })
    const next = calls[0].body.content
    return new Response(JSON.stringify({ ...record, version: next.version, content: next }), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  const api = new CreatorTemplatesApi(client)
  const changed = { ...value, checkpoints: [{ checkpoint: 1, kind: 'square' }, { role: 'terminal', teamKind: 'hypothesis', navigationMode: 'none' }] }
  const saved = await persistCreatorTemplate(api, changed, record)
  const loaded = await api.get(value.key)
  assert.deepEqual(loaded, saved)
  assert.equal(gameplayValidation(loaded.content, true), '')
  assert.deepEqual(loaded.content.scoring, value.scoring)
  assert.deepEqual(loaded.content.configuration, value.configuration)
  assert.deepEqual(calls[0].body, { content: { ...changed, version: 4 } })
  await api.submit(loaded.key, loaded.version)
  assert.deepEqual(calls[2].body, { version: 4 })
  assert.deepEqual(record.content, value)
})

test('legacy untyped non-geographic content retains its compatibility boundary unchanged', () => {
  const value = content([{ kind: 'historical-custom' }]); value.configuration = { durationMinutes: 45 } as any
  const before = structuredClone(value)
  assert.equal(gameplayValidation(value, true), '')
  assert.deepEqual(value, before)
})

test('unchanged canonical gameplay preserves saved entry order exactly', () => {
  const value = content([{ role: 'terminal', kind: 'radial', custom: true }, { checkpoint: 1, navigationMode: 'none', custom: true }])
  const hydrated = hydrateGameplay(value)
  assert.deepEqual(serializeGameplay(hydrated.normal, 1, hydrated.terminal, value.checkpoints), value.checkpoints)
})
