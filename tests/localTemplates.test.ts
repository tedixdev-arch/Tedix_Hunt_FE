import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { CreatorTemplatesApi } from '../src/services/api/creatorTemplates.ts'
test('07 exact C4 envelope, encoded source and unchanged server provenance', async () => {
  const calls: any[] = [], response = { key: 'local', version: 1, status: 'draft', category: 'local', sourceTemplateId: 'source', sourceVersion: 2 }
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'creator', getRefreshToken: () => null, saveSession() {}, clearSession() {} }, async (url, init) => { calls.push([String(url), JSON.parse(init!.body as string)]); return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } }) })
  const result = await new CreatorTemplatesApi(client).fromUniversal('source/key', 'local', { templateId: 'source', version: 2 })
  assert.deepEqual(calls, [['https://api.test/api/creator/templates/from-universal/source%2Fkey', { key: 'local', publishedReference: { templateId: 'source', version: 2 } }]])
  assert.deepEqual(result, response)
})
