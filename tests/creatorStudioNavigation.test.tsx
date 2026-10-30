import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { router as applicationRouter } from '../src/routes/router'
import { ApiError } from '../src/services/api/client'
import type { PublicUser } from '../src/services/api/auth'

const library = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/universalLibrary', () => ({ universalLibraryApi: library }))
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
  mocks.api.list.mockResolvedValue([]); library.list.mockResolvedValue({ items: [] })
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

test('one primary action and direct empty list replace dashboard cards', async () => {
  await render()
  expect(container.querySelector('h1')?.textContent).toBe('Creator Studio')
  expect(container.textContent).toContain('Create and manage Hunt templates.')
  expect(container.querySelector('nav[aria-label="Creator Studio entries"]')).toBeNull()
  expect(container.textContent).toContain('No templates yet. Choose Create Template to get started.')
  expect(container.querySelector('details')?.textContent).toContain('Create Legacy Template')
  noMutations()
})

test('guided choices trap focus, cancel and restore the trigger without creating drafts', async () => {
  await render(); const trigger = await click('+ Create Template')
  const panel = container.querySelector('dialog')!
  expect(panel.textContent).toContain('Choose a template type')
  expect(document.activeElement).toBe(panel.querySelector('a'))
  expect(panel.querySelector('a')?.getAttribute('href')).toBe('/create?category=universal')
  const cancel = button('Cancel'); cancel.focus()
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
  await act(async () => cancel.dispatchEvent(tab))
  expect(tab.defaultPrevented).toBe(true); expect(document.activeElement).toBe(panel.querySelector('a'))
  const shift = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
  await act(async () => document.activeElement!.dispatchEvent(shift))
  expect(document.activeElement).toBe(cancel)
  await click('Local Template')
  expect(panel.textContent).toContain('Create a Local Template')
  expect(document.activeElement).toBe(button('Start from an approved Universal'))
  expect(panel.querySelector('a')?.getAttribute('href')).toBe('/create?category=local')
  await click('← Back to template types')
  expect(panel.textContent).toContain('Choose a template type')
  await act(async () => panel.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(container.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  noMutations()
})

test('Local approved origin opens the existing Library only on selection', async () => {
  await render(); await click('+ Create Template'); await click('Local Template')
  expect(library.list).not.toHaveBeenCalled()
  await click('Start from an approved Universal')
  expect(container.querySelector('dialog')).toBeNull()
  expect(library.list).toHaveBeenCalledTimes(1)
  noMutations()
})

test('browser history back and forward restores choices and cancellation returns to Studio', async () => {
  await render(); const trigger = await click('+ Create Template'); await click('Local Template')
  await act(async () => router.navigate(-1))
  expect(container.querySelector('dialog')?.textContent).toContain('Choose a template type')
  await act(async () => router.navigate(1))
  expect(container.querySelector('dialog')?.textContent).toContain('Create a Local Template')
  await click('Cancel')
  expect(container.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger)
  noMutations()
})

test('owned list loading, retry and records remain reachable', async () => {
  let resolve!: (value: unknown[]) => void
  mocks.api.list.mockReturnValueOnce(new Promise(done => { resolve = done }))
  await render(); expect(container.textContent).toContain('Loading Creator Templates…')
  await click('+ Create Template'); await click('Cancel')
  await act(async () => resolve([{ key: 'owned', status: 'draft', version: 3, content: { displayName: 'Owned legacy', theme: 'City', configuration: { normalCheckpointCount: 2 } } }]))
  expect(container.querySelector('a[href="/create?template=owned"]')?.textContent).toBe('Edit template')
  expect(button('Delete')).toBeDefined(); expect(container.textContent).toContain('Version 3')
  noMutations()
})

test.each([[401, 'session has expired'], [403, 'not authorized'], [500, 'Failed to load']] as const)('list error %s retains guidance and supports retry', async (status, text) => {
  mocks.api.list.mockRejectedValueOnce(new ApiError('Failed to load', status, 'http')).mockResolvedValue([])
  await render(); expect(container.querySelector('[role="alert"]')?.textContent).toContain(text)
  await click('+ Create Template'); await click('Cancel'); await click('Retry')
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

test('Universal creation is a direct shared-editor link without mutation', async () => {
  await render()
  await click('+ Create Template')
  expect(container.querySelector('a[href="/create?category=universal"]')?.textContent).toContain('Universal Template')
  noMutations()
})

test('Library opens inline on demand and history removes it without authoring mutations', async () => {
  await render(); expect(library.list).not.toHaveBeenCalled()
  await click('Browse Universal Library'); expect(library.list).toHaveBeenCalledTimes(1)
  expect(container.textContent).toContain('No approved Universal Templates are available.')
  await act(async () => router.navigate(-1)); expect(container.querySelector('section[aria-label="Universal Library"]')).toBeNull()
  noMutations()
})
