import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/app/providers/AuthProvider'
const api = vi.hoisted(() => ({ bootstrapSession: vi.fn(), loginParticipant: vi.fn(), logout: vi.fn() }))
vi.mock('../src/services/api', () => ({ authApi: api, sessionStore: { clearSession: vi.fn() } }))
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
let root: Root, container: HTMLDivElement, auth: ReturnType<typeof useAuth>
function Probe() { auth = useAuth(); return <span>{auth.user?.id ?? 'anonymous'}</span> }
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.resetAllMocks()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const credentials = { email: 'user@test', password: 'password' }

test('late bootstrap cannot replace a new login in AuthProvider', async () => {
  const bootstrap = deferred<null>()
  api.bootstrapSession.mockReturnValue(bootstrap.promise)
  api.loginParticipant.mockResolvedValue({ user: { id: 'new-user' } })
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  await act(async () => { await auth.loginParticipant(credentials) })
  await act(async () => { bootstrap.resolve(null) })
  expect(container.textContent).toBe('new-user')
})

test('logout clears displayed identity immediately and late logout failure preserves new login', async () => {
  api.bootstrapSession.mockResolvedValue({ id: 'old-user' })
  const logout = deferred<void>()
  api.logout.mockReturnValue(logout.promise)
  api.loginParticipant.mockResolvedValue({ user: { id: 'new-user' } })
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  let result!: Promise<void>
  await act(async () => { result = auth.logout(); void result.catch(() => undefined) })
  expect(container.textContent).toBe('anonymous')
  await act(async () => { await auth.loginParticipant(credentials) })
  await act(async () => { logout.reject(new Error('offline')); await result.catch(() => undefined) })
  expect(container.textContent).toBe('new-user')
})

test('late bootstrap success cannot restore displayed identity after logout', async () => {
  const bootstrap = deferred<{ id: string }>()
  api.bootstrapSession.mockReturnValue(bootstrap.promise)
  api.logout.mockResolvedValue(undefined)
  await act(async () => root.render(<AuthProvider><Probe /></AuthProvider>))
  await act(async () => { await auth.logout() })
  await act(async () => { bootstrap.resolve({ id: 'old-user' }) })
  expect(container.textContent).toBe('anonymous')
})
