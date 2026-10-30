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

test('08/09 scratch Local and locality omission, explicit UUID and null are exact sibling envelopes', async () => {
  const calls: any[] = []
  const client = new ApiClient('https://api.test', { getAccessToken: () => 'creator', getRefreshToken: () => null, saveSession() {}, clearSession() {} }, async (url, init) => { calls.push([String(url), JSON.parse(init!.body as string)]); return new Response('{}', { headers: { 'content-type': 'application/json' } }) })
  const api = new CreatorTemplatesApi(client), content = { key: 'local', version: 1, displayName: 'Local' } as any
  await api.create(content, 'local'); await api.create(content, 'local', 'uuid'); await api.createVersion('local',content); await api.createVersion('local',content,'uuid'); await api.createVersion('local',content,null)
  assert.deepEqual(calls.map(call => call[1]), [{ key:'local',content,category:'local' },{ key:'local',content,category:'local',localityId:'uuid' },{content},{content,localityId:'uuid'},{content,localityId:null}])
  for (const [,body] of calls) { assert.equal('sourceTemplateId' in body, false); assert.equal('localitySnapshot' in body, false) }
})
