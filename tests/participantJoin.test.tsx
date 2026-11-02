import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { AuthProvider } from '../src/app/providers/AuthProvider'
import { JoinHuntPage } from '../src/pages/ParticipantJoinFlow'
import { ParticipantReadinessPage } from '../src/pages/ParticipantReadinessPage'
import { sessionStore } from '../src/services/api'

const hunt = { huntId: 'hunt-1', name: 'A real Hunt', code: '7KPM4XQ2', status: 'published' }
const context = { huntId: hunt.huntId, participantId: 'stable-member', joinedAt: '2026-11-02', huntStatus: 'published', templateVersion: 1, enrollmentPolicy: 'organizer_invitation', proximityPolicy: 'unresolved', checkpoints: [] }
const user = { id: 'user-1', name: 'Player', email: null, roles: ['participant'], role: 'participant', isGuest: true }
let root: Root, host: HTMLDivElement
let calls: Array<{ path: string; body: unknown; authorization: string | null }>
let lookupStatus: number, enrollStatus: number, enrollError: string
let holdEnrollment: boolean, release: () => void
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  localStorage.clear(); sessionStore.clearSession(); calls = []
  lookupStatus = enrollStatus = 200; enrollError = ''; holdEnrollment = false
  vi.stubGlobal('fetch', vi.fn(async (input, init) => {
    const path = new URL(String(input)).pathname
    calls.push({ path, body: init?.body ? JSON.parse(init.body) : null, authorization: new Headers(init?.headers).get('authorization') })
    if (path.endsWith('/auth/me')) return json(user)
    if (path.includes('/hunt-access/')) return json(lookupStatus === 200 ? hunt : { error: 'not_found' }, lookupStatus)
    if (path.endsWith('/auth/guest') || path.endsWith('/participant/login')) return json({ user, tokens: { accessToken: 'guest-token' } })
    if (path.endsWith('/enroll')) {
      if (holdEnrollment) await new Promise<void>(resolve => { release = resolve })
      return json(enrollStatus === 200 ? context : { error: enrollError }, enrollStatus)
    }
    if (path.endsWith('/participants/me')) return json(context)
    throw new Error(`Unexpected endpoint ${path}`)
  }))
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals() })
async function mount(path = '/join', authenticated = false) {
  if (authenticated) sessionStore.saveSession({ accessToken: 'existing-token' })
  await act(async () => root.render(<AuthProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/join" element={<JoinHuntPage />} /><Route path="/join/:code" element={<JoinHuntPage />} /><Route path="/participant/setup" element={<ParticipantReadinessPage />} /></Routes></MemoryRouter></AuthProvider>))
}
async function submit(times = 1) { await act(async () => { for (let i = 0; i < times; i++) host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) }) }
async function input(id: string, value: string) { await act(async () => { const element = host.querySelector<HTMLInputElement>(`#${id}`)!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value); element.dispatchEvent(new Event('input', { bubbles: true })) }) }

test('manual entry starts empty, shows resolved name before guest authentication, then enrolls', async () => {
  await mount(); expect(host.querySelector<HTMLInputElement>('#hunt-code')?.value).toBe('')
  await input('hunt-code', hunt.code); await submit()
  expect(host.textContent).toContain(hunt.name); expect(calls.some(c => c.path.endsWith('/auth/guest'))).toBe(false)
  await submit(); expect(host.textContent).toContain("You're in!")
  expect(calls.find(c => c.path.endsWith('/enroll'))).toMatchObject({ body: { accessCode: hunt.code }, authorization: 'Bearer guest-token' })
  expect(host.textContent).not.toContain('Team Aurora')
})
test('invitation URL resolves without code entry and reuses authenticated identity', async () => {
  await mount(`/join/${hunt.code}`, true)
  expect(host.querySelector('#hunt-code')).toBeNull(); expect(host.querySelector('#participant-name')).toBeNull()
  await submit(); expect(host.textContent).toContain("You're in!")
  expect(calls.some(c => c.path.endsWith('/auth/guest'))).toBe(false)
  expect(calls.find(c => c.path.endsWith('/enroll'))?.authorization).toBe('Bearer existing-token')
})
test('known membership rejoins without invitation or guest creation and refetches progress', async () => {
  localStorage.setItem(`tedix-hunt.entry.${user.id}`, JSON.stringify({ huntId: hunt.huntId, name: hunt.name }))
  await mount('/join', true); await submit()
  expect(calls.find(c => c.path.endsWith('/enroll'))?.body).toEqual({})
  expect(calls.some(c => c.path.endsWith('/participants/me'))).toBe(true)
  expect(calls.some(c => c.path.includes('/hunt-access/'))).toBe(false)
})
test('pending enrollment prevents duplicate submissions and premature success', async () => {
  holdEnrollment = true; await mount(`/join/${hunt.code}`, true); await submit(2)
  expect(calls.filter(c => c.path.endsWith('/enroll'))).toHaveLength(1)
  expect(host.textContent).not.toContain("You're in!")
  expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true)
  await act(async () => release()); expect(host.textContent).toContain("You're in!")
})
for (const [status, code, message] of [[404, 'not_found', "This invitation isn't valid"], [409, 'hunt_capacity_exceeded', 'This Hunt is full.'], [409, 'invalid_hunt_state', 'no longer accepting players'], [401, 'unauthorized', 'session has expired']] as const) {
  test(`enrollment ${code} stays in join with safe recovery`, async () => {
    enrollStatus = status; enrollError = code; await mount(`/join/${hunt.code}`, true); await submit()
    expect(host.textContent).toContain(message); expect(host.textContent).not.toContain("You're in!")
    expect(host.textContent).not.toContain(code)
  })
}
test('invalid/disabled/rotated lookup does not authenticate or enroll', async () => {
  lookupStatus = 404; await mount(`/join/${hunt.code}`)
  expect(host.textContent).toContain("This invitation isn't valid"); expect(calls).toHaveLength(1)
})
test('lookup network failure offers retry through the same Join Hunt action', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('offline'))
  await mount(`/join/${hunt.code}`); expect(host.textContent).toContain("Couldn't connect. Try again.")
  await submit(); expect(host.textContent).toContain(hunt.name)
})
test('expired guest is never silently replaced', async () => {
  localStorage.setItem('tedix-hunt.expired-guest', 'true'); await mount(`/join/${hunt.code}`); await submit()
  expect(calls.some(c => c.path.endsWith('/auth/guest'))).toBe(false)
  expect(host.querySelector('#participant-email')).not.toBeNull()
})
test('single column entry uses full width controls and phone sized tap targets', async () => {
  await mount(`/join/${hunt.code}`)
  expect(host.querySelector('form')?.className).toContain('space-y-4')
  expect(host.querySelector('button[type="submit"]')?.className).toContain('min-h-16 w-full')
  expect(host.querySelector('h1')?.className).toContain('break-words')
})
test('account sign in preserves the resolved invitation and enrolls before navigation', async () => {
  await mount(`/join/${hunt.code}`)
  await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === 'Sign in')!.click())
  await input('participant-email', 'player@example.test'); await input('participant-password', 'password')
  await submit()
  expect(calls.find(c => c.path.endsWith('/participant/login'))?.body).toEqual({ email: 'player@example.test', password: 'password' })
  expect(calls.find(c => c.path.endsWith('/enroll'))?.body).toEqual({ accessCode: hunt.code })
  expect(host.textContent).toContain(hunt.name); expect(host.textContent).toContain("You're in!")
})
test('enrollment network retry reuses the newly authenticated guest', async () => {
  const realFetch = vi.mocked(fetch).getMockImplementation()!
  let failed = false
  vi.mocked(fetch).mockImplementation(async (url, init) => {
    if (String(url).endsWith('/enroll') && !failed) { failed = true; throw new TypeError('offline') }
    return realFetch(url, init)
  })
  await mount(`/join/${hunt.code}`); await submit()
  expect(host.textContent).toContain("Couldn't connect. Try again.")
  await submit(); expect(host.textContent).toContain("You're in!")
  expect(calls.filter(c => c.path.endsWith('/auth/guest'))).toHaveLength(1)
})
