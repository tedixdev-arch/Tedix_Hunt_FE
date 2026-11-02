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

test('catalog requests preserve region/source IDs and cursors; explicit resolve sends an empty body', async () => {
  const calls: { url: string; method?: string; body?: BodyInit | null }[] = []
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'creator', getRefreshToken: () => null, saveSession() {}, clearSession() {} }, async (url, init) => {
    calls.push({ url: String(url), method: init?.method, body: init?.body }); return new Response('{}', { headers: { 'content-type': 'application/json' } })
  })
  const api = new GeographyApi(client)
  await api.regions('RO'); await api.regions('RO', '13'); await api.cities('RO', ' Cluj ', '13'); await api.cities('RO', 'Cluj', '13', '681290'); await api.resolveCity('681290')
  assert.deepEqual(calls.map(c => c.url), [
    'https://api.test/api/geography/regions?countryCode=RO&limit=50',
    'https://api.test/api/geography/regions?countryCode=RO&limit=50&after=13',
    'https://api.test/api/geography/cities?countryCode=RO&admin1Code=13&q=Cluj&limit=20',
    'https://api.test/api/geography/cities?countryCode=RO&admin1Code=13&q=Cluj&limit=20&after=681290',
    'https://api.test/api/geography/cities/681290/resolve',
  ])
  assert.equal(calls[4].method, 'POST'); assert.equal(calls[4].body, '{}')
})
