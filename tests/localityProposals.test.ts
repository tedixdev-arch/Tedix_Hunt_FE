import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LocalityProposalsApi } from '../src/services/api/localityProposals.ts'
import { ApiClient } from '../src/services/api/client.ts'
test('10 own history has no owner selector and POST strips client authority/provider fields', async () => {
  const calls: any[] = []
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'creator', getRefreshToken: () => null, saveSession() {}, clearSession() {} }, async (url, init) => { calls.push({ url: String(url), body: init?.body, auth: new Headers(init?.headers).get('Authorization') }); return new Response('{}', { headers: { 'content-type': 'application/json' } }) })
  const api = new LocalityProposalsApi(client)
  await api.mine()
  const input = { countryCode: 'RO', name: 'Town', administrativeContext: 'County', latitude: 46, longitude: 23, explanation: 'A missing registered settlement', evidenceReference: 'Official gazetteer edition 2026 entry 12' }
  await api.submit({ ...input, creatorUserId: 'other', status: 'approved', localityId: 'invented', provider: 'mapbox' } as any)
  assert.equal(calls[0].url, 'https://api.test/api/geography/locality-proposals/mine')
  assert.equal(calls[1].url, 'https://api.test/api/geography/locality-proposals')
  assert.deepEqual(JSON.parse(calls[1].body), input)
  assert.equal(calls[1].auth, 'Bearer creator')
})
