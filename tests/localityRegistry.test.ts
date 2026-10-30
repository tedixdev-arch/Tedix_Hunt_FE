import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GeographyApi } from '../src/services/api/geography.ts'
import { ApiClient } from '../src/services/api/client.ts'
test('09 stored registry paths only; country-scoped encoded search and exact UUID read', async () => {
  const calls: string[] = []
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'creator', getRefreshToken: () => null, saveSession() {}, clearSession() {} }, async url => { calls.push(String(url)); return new Response('{}', { headers:{'content-type':'application/json'} }) })
  const api = new GeographyApi(client); await api.countries(); await api.search('RO',' Name & Town '); await api.get('exact/uuid')
  assert.deepEqual(calls,['https://api.test/api/geography/countries','https://api.test/api/geography/localities?countryCode=RO&q=Name+%26+Town','https://api.test/api/geography/localities/exact%2Fuuid'])
})
