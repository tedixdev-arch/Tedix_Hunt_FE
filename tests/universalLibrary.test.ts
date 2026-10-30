import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { UniversalLibraryApi } from '../src/services/api/universalLibrary.ts'

test('F7-FE-06 uses only current C3/C5 Library GETs, with no private owner or history API', async () => {
  const calls: Array<{ url: string; method: string | undefined }> = []
  const client = new ApiClient('https://api.test', {
    getAccessToken: () => 'creator', getRefreshToken: () => null,
    saveSession: () => {}, clearSession: () => {},
  }, async (url, init) => {
    calls.push({ url: String(url), method: init?.method })
    return new Response(JSON.stringify({ items: [] }), { headers: { 'content-type': 'application/json' } })
  })
  const api = new UniversalLibraryApi(client)
  await api.list(); await api.get('shared/key?version=1')
  assert.deepEqual(calls, [
    { url: 'https://api.test/api/creator/universal-library', method: 'GET' },
    { url: 'https://api.test/api/creator/universal-library/shared%2Fkey%3Fversion%3D1', method: 'GET' },
  ])
})
