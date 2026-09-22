import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { AdminUsersApi } from '../src/services/api/adminUsers.ts'
import { AuthApi } from '../src/services/api/auth.ts'
import { ApiClient, ApiError } from '../src/services/api/client.ts'
import type { SessionStore, SessionTokens } from '../src/services/api/session.ts'
import { provisioningErrorMessage } from '../src/features/auth/adminProvisioningErrors.ts'

class MemorySession implements SessionStore {
  tokens: SessionTokens | null = { accessToken: 'admin-access' }
  getAccessToken() { return this.tokens?.accessToken ?? null }
  getRefreshToken() { return this.tokens?.refreshToken ?? null }
  saveSession(tokens: SessionTokens) { this.tokens = tokens }
  clearSession() { this.tokens = null }
}

test('Admin users API lists and provisions Admins using authenticated requests', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = []
  const session = new MemorySession()
  const client = new ApiClient('https://api.example.test', session, async (input, init) => {
    requests.push({ url: String(input), init })
    return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  const api = new AdminUsersApi(client)
  await api.listAdmins()
  await api.provisionAdmin({ email: 'new@example.test', name: 'New Admin' })

  assert.equal(requests[0].url, 'https://api.example.test/api/admin/users?role=admin')
  assert.equal(requests[0].init?.method, 'GET')
  assert.equal(new Headers(requests[0].init?.headers).get('Authorization'), 'Bearer admin-access')
  assert.equal(requests[1].url, 'https://api.example.test/api/admin/users/admin')
  assert.equal(requests[1].init?.method, 'POST')
  assert.equal(new Headers(requests[1].init?.headers).get('Authorization'), 'Bearer admin-access')
})

test('activateAdmin posts publicly and stores the normal returned session', async () => {
  const session = new MemorySession()
  let request: { url: string; init?: RequestInit } | undefined
  const client = new ApiClient('https://api.example.test', session, async (input, init) => {
    request = { url: String(input), init }
    return new Response(JSON.stringify({ user: { id: '1' }, tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' } }), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  await new AuthApi(client, session).activateAdmin({ token: 'one-time-token', password: 'password1' })
  assert.equal(request?.url, 'https://api.example.test/api/auth/admin/activate')
  assert.equal(new Headers(request?.init?.headers).has('Authorization'), false)
  assert.deepEqual(session.tokens, { accessToken: 'new-access', refreshToken: 'new-refresh' })
})

test('provisioning conflict errors are safe', () => {
  assert.equal(provisioningErrorMessage(new ApiError('raw', 409, 'conflict', { code: 'admin_activation_already_pending' })), 'This Admin already has an active invitation. Use the existing activation link or wait for it to expire.')
  assert.equal(provisioningErrorMessage(new ApiError('raw', 409, 'conflict', { code: 'guest_promotion_not_allowed' })), 'Guest accounts cannot be promoted directly to Admin.')
})

test('Admin routes have the required public/protected boundaries', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  assert.match(router, /path: '\/admin\/users',[\s\S]{0,100}element: <RequireAdmin><AdminUsersPage \/><\/RequireAdmin>/)
  assert.match(router, /path: '\/admin\/activate',[\s\S]{0,100}element: <AdminActivationPage \/>/)
  assert.doesNotMatch(router, /<RequireAdmin><AdminActivationPage/)
})

test('provisioning and activation screens enforce E10 safeguards', async () => {
  const users = await readFile(new URL('../src/pages/AdminUsers.tsx', import.meta.url), 'utf8')
  const activation = await readFile(new URL('../src/pages/AdminActivation.tsx', import.meta.url), 'utf8')
  assert.match(users, /if \(submitting\.current\) return/)
  assert.match(users, /Admin access granted\./)
  assert.match(users, /This activation link is shown once/)
  assert.doesNotMatch(users, /localStorage|sessionStorage/)
  assert.match(activation, /new URLSearchParams\(search\)\.get\('token'\)/)
  assert.match(activation, /if \(!token\)/)
  assert.match(activation, /if \(password\.length < 8\)/)
  assert.match(activation, /if \(confirmPassword !== password\)/)
  assert.match(activation, /if \(submitting\.current\) return/)
  assert.equal((activation.match(/type="password"/g) ?? []).length, 2)
  assert.match(activation, /navigate\('\/admin', \{ replace: true \}\)/)
  assert.match(activation, /This activation link is invalid or has expired\./)
})
