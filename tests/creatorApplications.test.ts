import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { CreatorApplicationsApi } from '../src/services/api/creatorApplications.ts'
import { ApiClient } from '../src/services/api/client.ts'
import type { SessionStore } from '../src/services/api/session.ts'
import { toCreatorApplicationInput, validateCreatorApplication, type CreatorApplicationFormValues } from '../src/pages/creatorApplicationForm.ts'

const valid: CreatorApplicationFormValues = { name: 'Ada Creator', email: 'ada@example.test', password: 'Create123!', confirmPassword: 'Create123!' }
const session: SessionStore = { getAccessToken: () => 'admin-token', getRefreshToken: () => null, saveSession: () => {}, clearSession: () => {} }

test('Creator application validation uses the shared password policy and confirmation', () => {
  assert.match(validateCreatorApplication({ ...valid, password: 'weak', confirmPassword: 'weak' }).password ?? '', /at least 8 characters/i)
  assert.equal(validateCreatorApplication({ ...valid, confirmPassword: 'different' }).confirmPassword, 'Passwords do not match.')
  assert.deepEqual(validateCreatorApplication(valid), {})
})

test('Creator application sends only canonical identity and credential fields publicly', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify({ id: 'creator-app-1', status: 'pending', createdAt: '2026-09-28T00:00:00Z' }), { status: 201, headers: { 'content-type': 'application/json' } })
  }
  const input = toCreatorApplicationInput({ ...valid, name: '  Ada Creator ', email: ' ada@example.test ' })
  await new CreatorApplicationsApi(new ApiClient('https://api.example.test', session, fetcher)).create(input)
  assert.equal(calls[0].url, 'https://api.example.test/api/creator-applications')
  assert.equal(new Headers(calls[0].init?.headers).has('authorization'), false)
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), valid)
  for (const field of ['status', 'reviewedBy', 'reviewedAt', 'role']) assert.equal(field in input, false)
})

test('Admin Creator application review uses authenticated list and decision endpoints', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(String(url).endsWith('/approve') || String(url).endsWith('/reject') ? { application: {} } : []), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const api = new CreatorApplicationsApi(new ApiClient('https://api.example.test', session, fetcher))
  await api.list('pending'); await api.approve('app/1'); await api.reject('app/1')
  assert.deepEqual(calls.map(call => [call.init?.method, call.url]), [
    ['GET', 'https://api.example.test/api/creator-applications?status=pending'],
    ['POST', 'https://api.example.test/api/creator-applications/app%2F1/approve'],
    ['POST', 'https://api.example.test/api/creator-applications/app%2F1/reject'],
  ])
  calls.forEach(call => assert.equal(new Headers(call.init?.headers).get('authorization'), 'Bearer admin-token'))
})

test('Creator application entry, pending UX, and Admin review preserve both Creator flows', async () => {
  const [access, application, review, router, users, activation, organizer] = await Promise.all([
    readFile(new URL('../src/pages/ProfessionalAccess.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/CreatorApplicationPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/AdminCreatorApplications.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/AdminUsers.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/ProfessionalActivation.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/RegisteredOrganizerApplicationPage.tsx', import.meta.url), 'utf8'),
  ])
  assert.match(access, /to="\/creator\/apply">Apply to become a Creator/)
  for (const field of ['Name', 'Email', 'Password', 'Confirm password']) assert.match(application, new RegExp(`label="${field}"`))
  assert.match(application, /Application submitted/); assert.match(application, /Status: Pending/)
  assert.match(application, /Admin must approve/); assert.match(application, /sign in normally using the credentials/)
  assert.doesNotMatch(application, /activation token|activation URL|activation expiry|set your password after approval/i)
  assert.match(review, /Creator Applications/); assert.match(review, /'Approve'/); assert.match(review, />Reject</)
  assert.match(review, /credentials established during application/); assert.match(review, /Creator access was not granted/)
  assert.doesNotMatch(review, /activationToken|temporary password|password reset|activation link/i)
  assert.match(router, /path: '\/creator\/apply'/); assert.match(router, /path: '\/admin\/creator-applications'/)
  assert.match(router, /path: '\/creator\/activate'/); assert.match(router, /path: '\/creator\/sign-in'/)
  assert.match(users, /'admin', 'organizer', 'creator'/); assert.match(activation, /activateCreator/)
  assert.match(organizer, /Apply as a Registered Organizer/)
})
