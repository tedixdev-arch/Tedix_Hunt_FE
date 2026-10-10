import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { HuntsApi } from '../src/services/api/hunts.ts'
import type { SessionStore } from '../src/services/api/session.ts'
import { templateInput } from '../src/pages/generalSetup.ts'

const session: SessionStore = {
  getAccessToken: () => 'test-access', getRefreshToken: () => null,
  saveSession: () => undefined, clearSession: () => undefined,
}
const configuration = { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Persisted CP1', latitude: 0, longitude: 0, radiusMeters: 5 }], finishPoint: { name: 'Persisted terminal', latitude: 1, longitude: 1, radiusMeters: 30 } }
const snapshot = { key: 'trail', version: 2, displayName: 'Original trail', theme: 'History', configuration }

test('existing Hunt GET and Template selection response preserve complete snapshot geography without FE manufacture', async () => {
  const calls: Array<{ url: string; method: string; body: unknown }> = []
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined })
    return new Response(JSON.stringify({ id: 'saved-hunt', templateKey: 'trail', templateVersion: 2, templateSnapshot: snapshot }), { headers: { 'Content-Type': 'application/json' } })
  }
  const api = new HuntsApi(new ApiClient('https://api.example.test', session, fetcher))
  const saved = await api.getHunt('saved-hunt')
  assert.deepEqual(saved.templateSnapshot, snapshot)
  assert.deepEqual(saved.templateSnapshot?.configuration, configuration)
  assert.equal(saved.templateVersion, 2)
  const selected = await api.updateDraft('saved-hunt', templateInput('trail'))
  assert.deepEqual(selected.templateSnapshot, snapshot)
  assert.deepEqual(calls, [
    { url: 'https://api.example.test/api/hunts/saved-hunt', method: 'GET', body: undefined },
    { url: 'https://api.example.test/api/hunts/saved-hunt', method: 'PATCH', body: { templateKey: 'trail' } },
  ])
  assert.equal('checkpointNames' in selected.templateSnapshot!, false)
})

test('older snapshot response remains unchanged when geography is absent', async () => {
  const legacy = { key: 'trail', version: 1, displayName: 'Old trail', theme: 'History', checkpointNames: ['Legacy CP'] }
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({ id: 'saved-hunt', templateKey: 'trail', templateVersion: 1, templateSnapshot: legacy }), { headers: { 'Content-Type': 'application/json' } })
  const api = new HuntsApi(new ApiClient('https://api.example.test', session, fetcher))
  const saved = await api.getHunt('saved-hunt')
  assert.deepEqual(saved.templateSnapshot, legacy)
  assert.equal(saved.templateSnapshot?.configuration, undefined)
})
