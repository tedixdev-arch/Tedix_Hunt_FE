import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AdminTemplateReviewsApi, type AdminTemplateReview } from '../src/services/api/adminTemplateReviews.ts'
import { ApiClient } from '../src/services/api/client.ts'
import type { SessionStore } from '../src/services/api/session.ts'

const session: SessionStore = { getAccessToken: () => 'admin-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }
const review: AdminTemplateReview = {
  key: 'exact/template', version: 4, status: 'submitted', origin: 'creator', creator: { id: 'creator-1', name: 'Ada Creator', email: 'ada@example.test' },
  content: {
    key: 'exact/template', version: 4, displayName: 'Exact submitted artifact', theme: 'Geography', mission: 'Review me',
    configuration: { durationMinutes: 75, normalCheckpointCount: 1, participantInstructions: 'Follow the marked route.', checkpointPositions: [{ checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }] },
    scoring: { model: 'points', events: [{ event: 'correctAnswer', points: 100 }] },
    checkpoints: [{ checkpointNumber: 1, name: 'Museum cipher', challenge: { prompt: 'Decode the inscription.', answer: 'CLUJ', hints: ['Read every second letter.'], solution: 'Take the even-positioned letters.' } }],
  },
}

test('Admin Template Review client uses the verified authenticated backend contracts', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const responses: unknown[] = [{ templates: [review] }, review, { ...review, status: 'approved' }, { ...review, status: 'changes_requested' }]
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(responses.shift()), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const api = new AdminTemplateReviewsApi(new ApiClient('https://api.example.test', session, fetcher))
  assert.deepEqual(await api.list(), [review]); await api.get(review.key); await api.approve(review.key); await api.requestChanges(review.key)
  assert.deepEqual(calls.map(call => [call.init?.method, call.url]), [
    ['GET', 'https://api.example.test/api/admin/templates/review'],
    ['GET', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate'],
    ['POST', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate/approve'],
    ['POST', 'https://api.example.test/api/admin/templates/review/exact%2Ftemplate/request-changes'],
  ])
  assert.equal(calls[2].init?.body, undefined)
  assert.equal(calls[3].init?.body, undefined)
  calls.forEach(call => assert.equal(new Headers(call.init?.headers).get('authorization'), 'Bearer admin-token'))
})

test('malformed review list envelopes fail instead of becoming a mock or empty list', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify([review]), { status: 200, headers: { 'content-type': 'application/json' } })
  const api = new AdminTemplateReviewsApi(new ApiClient('https://api.example.test', session, fetcher))
  await assert.rejects(api.list(), /Invalid Template review response/)
})

