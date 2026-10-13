import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { CreatorTemplatesApi, type StarterTemplate } from '../src/services/api/creatorTemplates.ts'
import { formatStarterDate } from '../src/features/creator/starterDate.ts'
const session = { getAccessToken: () => 'creator-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }
const starter = (key: string): StarterTemplate => ({ key, displayName: key, description: 'Backend description', creationPath: `/api/creator/templates/starters/${key}` })
test('authenticated catalog preserves backend order and both supported creation endpoints', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const items = [starter('signal-cluj-napoca'), starter('signal-overload-cluj-napoca')]
  const api = new CreatorTemplatesApi(new ApiClient('https://api.test', session, async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(init?.method === 'GET' ? { items } : { key: 'owned-draft', status: 'draft' }), { headers: { 'content-type': 'application/json' } })
  }))
  assert.deepEqual((await api.listStarters()).items, items)
  for (const item of items) await api.createStarterDraft(item)
  assert.deepEqual(calls.map(call => call.url), ['https://api.test/api/creator/templates/starters', ...items.map(item => `https://api.test${item.creationPath}`)])
  assert.deepEqual(calls.map(call => call.init?.method), ['GET', 'POST', 'POST'])
  for (const call of calls) assert.equal(new Headers(call.init?.headers).get('Authorization'), 'Bearer creator-token')
  for (const creationPath of ['https://evil.test/path', '/api/creator/templates/starters/signal-cluj-napoca?publish=true', '/api/creator/templates/other']) await assert.rejects(api.createStarterDraft({ ...items[0], creationPath }))
  await assert.rejects(api.createStarterDraft(starter('unknown')))
  assert.equal(calls.length, 3)
})
test('catalog failures reject without a hardcoded fallback', async () => {
  const api = new CreatorTemplatesApi(new ApiClient('https://api.test', session, async () => new Response('{}', { status: 404 })))
  await assert.rejects(api.listStarters())
})
test('dates use UTC and invalid, missing and null values display exactly a dash', () => {
  assert.equal(formatStarterDate('2026-10-12T23:30:00-03:00'), '13 Oct 2026')
  assert.equal(formatStarterDate('2026-10-12T00:00:00Z'), '12 Oct 2026')
  for (const value of [null, undefined, '', 'invalid', '2026-02-30T00:00:00Z', '2026-10-12T00:00:00', '10/12/2026']) assert.equal(formatStarterDate(value), '-')
})
