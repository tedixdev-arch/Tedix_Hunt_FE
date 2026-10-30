import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { AdminTemplateReviewsApi } from '../src/services/api/adminTemplateReviews.ts'
import { AdminLocalityProposalsApi } from '../src/services/api/adminLocalityProposals.ts'
const session = { getAccessToken: () => 'admin', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }
test('03/04/05 exact private reads and narrow decision bodies use actual routes', async () => {
  const calls: { url: string; init?: RequestInit }[] = []
  const client = new ApiClient('https://api.test', session, async (url, init) => { calls.push({ url: String(url), init }); return new Response(JSON.stringify({ proposals: [] }), { headers: { 'content-type': 'application/json' } }) })
  const templates = new AdminTemplateReviewsApi(client), proposals = new AdminLocalityProposalsApi(client)
  await templates.approved('a/b'); await templates.suspend('a/b', 2, 'Reason'); await proposals.list(); await proposals.decide('a/b', 'rejected', 'Independent reason')
  assert.deepEqual(calls.map(c => c.url), ['https://api.test/api/admin/templates/review/a%2Fb?view=approved', 'https://api.test/api/admin/templates/a%2Fb/suspend', 'https://api.test/api/admin/locality-proposals', 'https://api.test/api/admin/locality-proposals/a%2Fb/decision'])
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { version: 2, reason: 'Reason' }); assert.deepEqual(JSON.parse(String(calls[3].init?.body)), { decision: 'rejected', reason: 'Independent reason' })
  calls.forEach(c => assert.equal(new Headers(c.init?.headers).get('authorization'), 'Bearer admin'))
})
