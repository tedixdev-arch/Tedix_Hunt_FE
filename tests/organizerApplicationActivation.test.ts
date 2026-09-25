import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { organizerActivationErrorMessage } from '../src/features/auth/organizerActivationErrors.ts'
import { AuthApi } from '../src/services/api/auth.ts'
import { ApiClient, ApiError } from '../src/services/api/client.ts'
import type { SessionStore, SessionTokens } from '../src/services/api/session.ts'

class MemorySession implements SessionStore {
  tokens: SessionTokens | null = null
  saved: SessionTokens[] = []
  getAccessToken() { return this.tokens?.accessToken ?? null }
  getRefreshToken() { return this.tokens?.refreshToken ?? null }
  saveSession(tokens: SessionTokens) { this.tokens = tokens; this.saved.push(tokens) }
  clearSession() { this.tokens = null }
}

test('application Organizer activation uses its public backend contract and saves only the returned session', async () => {
  const session = new MemorySession()
  let request: { url: string; init?: RequestInit } | undefined
  const client = new ApiClient('https://api.example.test', session, async (input, init) => {
    request = { url: String(input), init }
    return new Response(JSON.stringify({ user: { id: 'organizer-1' }, tokens: { accessToken: 'access', refreshToken: 'refresh' } }), { status: 200, headers: { 'content-type': 'application/json' } })
  })

  await new AuthApi(client, session).activateOrganizerApplication({ token: 'application-token', password: 'password1' })

  assert.equal(request?.url, 'https://api.example.test/api/auth/organizer/activate')
  assert.equal(request?.init?.method, 'POST')
  assert.equal(new Headers(request?.init?.headers).has('Authorization'), false)
  assert.deepEqual(JSON.parse(String(request?.init?.body)), { token: 'application-token', password: 'password1' })
  assert.deepEqual(session.saved, [{ accessToken: 'access', refreshToken: 'refresh' }])
  assert.doesNotMatch(JSON.stringify(session.saved), /application-token/)
})

test('application and direct Organizer activation remain distinct routes and contracts', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const auth = await readFile(new URL('../src/services/api/auth.ts', import.meta.url), 'utf8')

  assert.match(router, /path: '\/organizer\/activate',[\s\S]{0,100}element: <OrganizerApplicationActivationPage \/>/)
  assert.match(router, /path: '\/organizer\/activate-direct',[\s\S]{0,100}element: <DirectOrganizerActivationPage \/>/)
  assert.match(auth, /activateOrganizerApplication[\s\S]{0,150}'\/api\/auth\/organizer\/activate'/)
  assert.match(auth, /activateDirectOrganizer[\s\S]{0,150}'\/api\/auth\/organizer\/activate-direct'/)
})

test('application activation page validates without persisting its token and enters the Organizer workspace', async () => {
  const page = await readFile(new URL('../src/pages/OrganizerApplicationActivation.tsx', import.meta.url), 'utf8')

  assert.match(page, /new URLSearchParams\(search\)\.get\('token'\)/)
  assert.match(page, /activateOrganizerApplication\(\{ token, password \}\)/)
  assert.match(page, /if \(!token\)/)
  assert.match(page, /if \(password\.length < 8\)/)
  assert.match(page, /if \(confirmPassword !== password\)/)
  assert.match(page, /navigate\('\/organizer', \{ replace: true \}\)/)
  assert.match(page, /to="\/organizer\/registered"/)
  assert.match(page, /to="\/organizer\/apply"/)
  assert.doesNotMatch(page, /localStorage|sessionStorage/)
})

test('application activation errors are safe and specific', () => {
  const apiError = (kind: 'bad_request' | 'unauthorized' | 'conflict', code: string) => new ApiError('internal detail', 400, kind, { code })
  assert.equal(organizerActivationErrorMessage(apiError('unauthorized', 'invalid_activation_token')), 'This activation link is invalid.')
  assert.equal(organizerActivationErrorMessage(apiError('bad_request', 'activation_token_expired')), 'This activation link has expired.')
  assert.equal(organizerActivationErrorMessage(apiError('conflict', 'activation_token_used')), 'This activation link has already been used and is no longer valid.')
  assert.equal(organizerActivationErrorMessage(apiError('bad_request', 'invalid_password')), 'That password was not accepted. Check the requirements and try again.')
  assert.equal(organizerActivationErrorMessage(new Error('database unavailable')), 'We couldn\'t activate your Organizer account. Please try again.')
})

test('existing direct activation and Organizer sign-in are not repurposed', async () => {
  const direct = await readFile(new URL('../src/pages/ProfessionalActivation.tsx', import.meta.url), 'utf8')
  const signIn = await readFile(new URL('../src/pages/OrganizerFlow.tsx', import.meta.url), 'utf8')

  assert.match(direct, /activateDirectOrganizer/)
  assert.doesNotMatch(direct, /activateOrganizerApplication/)
  assert.match(signIn, /loginOrganizer\(\{ email: email\.trim\(\), password \}\)/)
})
