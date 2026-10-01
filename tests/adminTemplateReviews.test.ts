import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { AdminTemplateReviewsApi, type AdminTemplateReview } from '../src/services/api/adminTemplateReviews.ts'
import { ApiClient } from '../src/services/api/client.ts'
import type { SessionStore } from '../src/services/api/session.ts'

const session: SessionStore = { getAccessToken: () => 'admin-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }
const review: AdminTemplateReview = {
  key: 'exact/template', version: 9, submittedVersion: 4, status: 'submitted', createdBy: 'Creator',
  content: { key: 'exact/template', version: 4, displayName: 'Exact submitted artifact', theme: 'Geography', mission: 'Review me', configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }] }, scoring: {}, checkpoints: [{}] },
}

test('Admin Template Review client uses the verified authenticated backend contracts', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const responses: unknown[] = [[review], review, { ...review, status: 'approved' }, { ...review, status: 'changes_requested' }]
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(responses.shift()), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const api = new AdminTemplateReviewsApi(new ApiClient('https://api.example.test', session, fetcher))
  await api.list(); await api.get(review.key); await api.approve(review.key); await api.requestChanges(review.key, { notes: 'Clarify checkpoint safety.' })
  assert.deepEqual(calls.map(call => [call.init?.method, call.url]), [
    ['GET', 'https://api.example.test/api/admin/templates/review'],
    ['GET', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate'],
    ['POST', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate/approve'],
    ['POST', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate/request-changes'],
  ])
  assert.equal(calls[2].init?.body, undefined)
  assert.deepEqual(JSON.parse(String(calls[3].init?.body)), { notes: 'Clarify checkpoint safety.' })
  calls.forEach(call => assert.equal(new Headers(call.init?.headers).get('authorization'), 'Bearer admin-token'))
})

test('review UI keeps backend state authoritative across loading, failure, retry, empty and decisions', async () => {
  const source = await readFile(new URL('../src/pages/AdminTemplateReviews.tsx', import.meta.url), 'utf8')
  assert.match(source, /Submitted version \{review\.submittedVersion\}/)
  assert.match(source, /Version under review/)
  assert.doesNotMatch(source, /Signal: Cluj Napoca|version \+ 1|Reject template/)
  assert.match(source, /Loading submitted Templates/)
  assert.match(source, /No Creator Templates are awaiting review/)
  assert.match(source, />Retry</)
  assert.match(source, /setResult\(response\)/)
  assert.match(source, /if \(saving \|\| !review\) return/)
  assert.match(source, /disabled=\{saving \|\|/)
  assert.match(source, /role="alert"/)
})

test('exact persisted geographic configuration is rendered without mock x/y conversion', async () => {
  const source = await readFile(new URL('../src/pages/AdminTemplateReviews.tsx', import.meta.url), 'utf8')
  for (const field of ['normalCheckpointCount', 'checkpointPositions', 'latitude', 'longitude', 'radiusMeters']) assert.match(source, new RegExp(field))
  assert.doesNotMatch(source, /\bposition\.x\b|\bposition\.y\b|latest|resubmit|revision/i)
})
