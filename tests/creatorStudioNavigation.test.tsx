import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { router as applicationRouter } from '../src/routes/router'
import { ApiError } from '../src/services/api/client'
import type { PublicUser } from '../src/services/api/auth'

const mocks = vi.hoisted(() => ({
  auth: { user: null as PublicUser | null, isBootstrapping: false },
  api: { list: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn(), delete: vi.fn(), createStarterDraft: vi.fn(), listStarters: vi.fn() },
}))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => mocks.auth }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: mocks.api }))
vi.mock('../src/pages/OrganizerFlow', async original => ({ ...await original<typeof import('../src/pages/OrganizerFlow')>(), OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement, router: ReturnType<typeof createMemoryRouter>
const creator = { id: 'creator', roles: ['creator'], isGuest: false } as PublicUser
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  mocks.auth.user = creator; mocks.auth.isBootstrapping = false
  mocks.api.list.mockResolvedValue([])
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function () { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function () { this.removeAttribute('open') } })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); router?.dispose(); container.remove(); vi.unstubAllGlobals() })
async function render(path = '/creator') {
  router = createMemoryRouter([
    { path: '/creator', element: applicationRouter.routes.find(route => route.path === '/creator')!.element },
    { path: '/creator/sign-in', element: <p>Creator sign in</p> },
  ], { initialEntries: [path] })
  await act(async () => root.render(<RouterProvider router={router} />))
}
const button = (label: string) => [...container.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent?.startsWith(label))!
async function click(label: string) { const target = button(label); target.focus(); await act(async () => target.click()); return target }
function noMutations() {
  for (const key of ['create', 'createVersion', 'submit', 'delete', 'createStarterDraft', 'listStarters'] as const) expect(mocks.api[key]).not.toHaveBeenCalled()
}

test('four entries are discoverable; My Templates focuses the existing empty owned list', async () => {
  await render()
  expect([...container.querySelectorAll('nav[aria-label="Creator Studio entries"] button')].map(node => node.firstElementChild?.textContent)).toEqual(['Mechanics Library', 'My Templates', 'Create Universal Template', 'Create Local Template'])
  await click('My Templates')
  expect(document.activeElement?.id).toBe('my-templates')
  expect(container.textContent).toContain('No persisted Creator Templates yet.')
  expect(container.textContent).toContain('legacy, unclassified creation')
  noMutations()
})

test('Mechanics Library is read-only and separates configuration, simulation and future runtime', async () => {
  await render(); const trigger = await click('Mechanics Library')
  const panel = container.querySelector('dialog')!
  expect(panel.open).toBe(true)
  expect(panel.querySelector('input,select,textarea,a')).toBeNull()
  expect(panel.querySelectorAll('button')).toHaveLength(1)
  for (const text of ['Authorable / configurable now', 'Previewable now', 'Planned runtime behavior', '1–20', 'FinishPoint', 'Personal Challenges', 'Team Challenges', 'Compass + Distance', 'manually simulated', 'Hints and scoring']) expect(panel.textContent).toContain(text)
  expect(document.activeElement).toBe(button('← Back'))
  for (const shiftKey of [true, false]) {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true })
    await act(async () => document.activeElement!.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true); expect(document.activeElement).toBe(button('← Back'))
  }
  // Escape dispatches cancel on a native modal dialog.
  await act(async () => panel.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(container.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  noMutations()
})

test.each(['Universal', 'Local'])('%s creation opens a truthful staged destination and Back restores focus', async type => {
  await render(); const trigger = await click(`Create ${type} Template`)
  const panel = container.querySelector('dialog')!
  expect(panel.textContent).toContain('This workflow is not available yet.')
  if (type === 'Universal') expect(panel.textContent).toContain('F7-FE-03')
  else for (const text of ['Start from an approved Universal Template.', 'Start from scratch.', 'no Universal source is required', 'separate review']) expect(panel.textContent).toContain(text)
  expect(panel.querySelectorAll('button')).toHaveLength(1)
  expect(router.state.location.pathname).toBe('/creator')
  await click('← Back'); expect(container.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  noMutations()
})

test('browser history back and forward open and close guidance without mutation', async () => {
  await render(); const trigger = await click('Mechanics Library')
  await act(async () => router.navigate(-1))
  expect(container.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  await act(async () => router.navigate(1))
  expect(container.querySelector('dialog')?.textContent).toContain('Mechanics Library')
  noMutations()
})

test('owned list loading, retry and records remain reachable', async () => {
  let resolve!: (value: unknown[]) => void
  mocks.api.list.mockReturnValueOnce(new Promise(done => { resolve = done }))
  await render(); expect(container.textContent).toContain('Loading Creator Templates…')
  await click('My Templates'); await click('Mechanics Library'); await click('← Back')
  await act(async () => resolve([{ key: 'owned', status: 'draft', version: 3, content: { displayName: 'Owned legacy', theme: 'City', configuration: { normalCheckpointCount: 2 } } }]))
  expect(container.querySelector('a[href="/create?template=owned"]')?.textContent).toBe('Edit template')
  expect(button('Delete')).toBeDefined(); expect(container.textContent).toContain('Version 3')
  noMutations()
})

test.each([[401, 'session has expired'], [403, 'not authorized'], [500, 'Failed to load']] as const)('list error %s retains guidance and supports retry', async (status, text) => {
  mocks.api.list.mockRejectedValueOnce(new ApiError('Failed to load', status, 'http')).mockResolvedValue([])
  await render(); expect(container.querySelector('[role="alert"]')?.textContent).toContain(text)
  await click('Create Local Template'); await click('← Back'); await click('Retry')
  expect(mocks.api.list).toHaveBeenCalledTimes(2); expect(container.querySelector('[role="alert"]')).toBeNull()
  noMutations()
})

test.each([null, { ...creator, roles: ['participant'] }, { ...creator, roles: [], isGuest: true }])('guard denies unauthenticated, revoked or guest access to deep-linked guidance', async user => {
  mocks.auth.user = user as PublicUser | null
  await render('/creator?studio=local')
  expect(router.state.location.pathname).toBe('/creator/sign-in')
  expect(container.textContent).toBe('Creator sign in'); expect(mocks.api.list).not.toHaveBeenCalled(); noMutations()
})

test('session bootstrap does not expose Creator content or fetch Templates', async () => {
  mocks.auth.isBootstrapping = true
  await render('/creator?studio=mechanics')
  expect(container.textContent).toBe('Loading…'); expect(mocks.api.list).not.toHaveBeenCalled(); noMutations()
})
