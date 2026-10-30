import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/app/providers/AuthProvider'
import { sessionStore, type PublicUser } from '../src/services/api'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
function user(id: string): PublicUser {
  return { id, name: id, email: `${id}@test`, roles: ['participant'], role: 'participant', isGuest: false, tedixUserId: null, createdAt: '2026-10-30' }
}
const tokens = (id: string) => ({ accessToken: `${id}-access`, refreshToken: `${id}-refresh` })
const payload = (id: string) => ({ user: user(id), tokens: tokens(id) })
const credentials = (id: string) => ({ email: `${id}@test`, password: 'password' })
const passwordInput = { currentPassword: 'password', newPassword: 'new-password' }
const outcome = <T,>(promise: Promise<T>) => promise.then(value => ({ status: 'fulfilled', value } as const), error => ({ status: 'rejected', error } as const))
let root: Root, container: HTMLDivElement, auth: ReturnType<typeof useAuth>
let calls: Array<{ url: string; init?: RequestInit; response: ReturnType<typeof deferred<Response>> }>
function Probe() { auth = useAuth(); return <span>{auth.user?.id ?? 'anonymous'}</span> }
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  sessionStore.clearSession()
  calls = []
  vi.stubGlobal('fetch', (url: unknown, init?: RequestInit) => {
    const response = deferred<Response>()
    calls.push({ url: String(url), init, response })
    return response.promise
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  for (const call of calls.filter(call => call.url.endsWith('/logout'))) call.response.resolve(json({ success: true }))
  act(() => root.unmount())
  container.remove()
  sessionStore.clearSession()
  vi.unstubAllGlobals()
})
async function mount(id?: string) {
  if (id) sessionStore.saveSession(tokens(id))
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  if (id) await act(async () => { calls[0].response.resolve(json(user(id))) })
}
async function login(id: string) {
  let result!: ReturnType<typeof outcome<PublicUser>>
  const index = calls.length
  await act(async () => { result = outcome(auth.loginParticipant(credentials(id))) })
  return { result, index }
}
async function finishLogin(request: Awaited<ReturnType<typeof login>>, id: string) {
  await act(async () => { calls[request.index].response.resolve(json(payload(id))); await request.result })
}
function expectIdentity(id?: string) {
  expect(container.textContent).toBe(id ?? 'anonymous')
  expect(sessionStore.getAccessToken()).toBe(id ? tokens(id).accessToken : null)
  expect(sessionStore.getRefreshToken()).toBe(id ? tokens(id).refreshToken : null)
}

for (const first of ['A', 'B']) {
  test(`latest intended login B owns credentials and displayed identity when ${first} completes first`, async () => {
    await mount('original')
    const a = await login('A')
    const b = await login('B')
    if (first === 'A') {
      await finishLogin(a, 'A')
      expectIdentity('original')
      expect((await a.result).status).toBe('rejected')
      await finishLogin(b, 'B')
    } else {
      await finishLogin(b, 'B')
      expectIdentity('B')
      await finishLogin(a, 'A')
    }
    expectIdentity('B')
    expect((await a.result).status).toBe('rejected')
    expect((await b.result).status).toBe('fulfilled')
  })
}

test('logout while login is pending prevents both stored and displayed restoration', async () => {
  await mount('original')
  const a = await login('A')
  let logout!: ReturnType<typeof outcome<void>>
  const logoutIndex = calls.length
  await act(async () => { logout = outcome(auth.logout()) })
  expectIdentity()
  await finishLogin(a, 'A')
  await act(async () => { calls[logoutIndex].response.resolve(json({ success: true })); await logout })
  expect((await a.result).status).toBe('rejected')
  expectIdentity()
})

test('external session replacement prevents pending login from changing credentials or displayed identity', async () => {
  await mount('original')
  const a = await login('A')
  sessionStore.clearSession()
  sessionStore.saveSession(tokens('replacement'))
  await finishLogin(a, 'A')
  expect((await a.result).status).toBe('rejected')
  expect(sessionStore.getAccessToken()).toBe(tokens('replacement').accessToken)
  // Direct storage writes do not themselves update provider UI; stale completion must not either.
  expect(container.textContent).toBe('original')
})

for (const status of [200, 500]) {
  test(`late password-change ${status} after account switch preserves new credentials and displayed user`, async () => {
    await mount('original')
    let change!: ReturnType<typeof outcome<void>>
    const index = calls.length
    await act(async () => { change = outcome(auth.changePassword(passwordInput)) })
    const b = await login('B')
    await finishLogin(b, 'B')
    await act(async () => { calls[index].response.resolve(json({ message: 'Changed' }, status)); await change })
    expect((await change).status).toBe('rejected')
    expectIdentity('B')
  })

  test(`late password-change ${status} after logout cannot restore credentials or displayed identity`, async () => {
    await mount('original')
    let change!: ReturnType<typeof outcome<void>>, logout!: ReturnType<typeof outcome<void>>
    const index = calls.length
    await act(async () => { change = outcome(auth.changePassword(passwordInput)) })
    const logoutIndex = calls.length
    await act(async () => { logout = outcome(auth.logout()) })
    expectIdentity()
    await act(async () => { calls[index].response.resolve(json({ message: 'Changed' }, status)); await change })
    await act(async () => { calls[logoutIndex].response.resolve(json({ success: true })); await logout })
    expect((await change).status).toBe('rejected')
    expectIdentity()
  })
}

test('password success while a newer login is still pending must not invalidate that login', async () => {
  await mount('original')
  let change!: ReturnType<typeof outcome<void>>
  const index = calls.length
  await act(async () => { change = outcome(auth.changePassword(passwordInput)) })
  const b = await login('B')
  await act(async () => { calls[index].response.resolve(json({ message: 'Changed' })); await change })
  expect((await change).status).toBe('rejected')
  expectIdentity('original')
  await finishLogin(b, 'B')
  expectIdentity('B')
})

test('successful password change in its current session still clears credentials and displayed user', async () => {
  await mount('original')
  let change!: ReturnType<typeof outcome<void>>
  const index = calls.length
  await act(async () => { change = outcome(auth.changePassword(passwordInput)) })
  await act(async () => { calls[index].response.resolve(json({ message: 'Changed' })); await change })
  expect((await change).status).toBe('fulfilled')
  expectIdentity()
})

test('failed password change in its current session preserves credentials and displayed user', async () => {
  await mount('original')
  let change!: ReturnType<typeof outcome<void>>
  const index = calls.length
  await act(async () => { change = outcome(auth.changePassword(passwordInput)) })
  await act(async () => { calls[index].response.resolve(json({}, 500)); await change })
  expect((await change).status).toBe('rejected')
  expectIdentity('original')
})

test('late bootstrap failure cannot replace a new login in AuthProvider', async () => {
  sessionStore.saveSession(tokens('original'))
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  const b = await login('B')
  await finishLogin(b, 'B')
  await act(async () => { calls[0].response.resolve(json({}, 401)) })
  expectIdentity('B')
})

test('late logout failure preserves the new login and its displayed identity', async () => {
  await mount('original')
  let logout!: ReturnType<typeof outcome<void>>
  const index = calls.length
  await act(async () => { logout = outcome(auth.logout()) })
  expectIdentity()
  const b = await login('B')
  await finishLogin(b, 'B')
  await act(async () => { calls[index].response.resolve(json({}, 500)); await logout })
  expectIdentity('B')
})

test('late bootstrap success cannot restore displayed identity after logout', async () => {
  sessionStore.saveSession(tokens('original'))
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  let logout!: ReturnType<typeof outcome<void>>
  const index = calls.length
  await act(async () => { logout = outcome(auth.logout()) })
  await act(async () => { calls[0].response.resolve(json(user('original'))); calls[index].response.resolve(json({ success: true })); await logout })
  expectIdentity()
})
