import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { UniversalLibrary } from '../src/features/creator/UniversalLibrary'
import { ApiError } from '../src/services/api/client'
import type { PublishedUniversal, PublishedUniversalDetail } from '../src/services/api/universalLibrary'

const api = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn() }))
vi.mock('../src/services/api/universalLibrary', () => ({ universalLibraryApi: api }))
const product: PublishedUniversal = {
  id: 'shared-identity', key: 'another-creators-story', displayName: 'Shared story', theme: 'Discovery',
  creator: { id: 'another-creator', name: 'Another Creator' },
  publishedReference: { templateId: 'shared-identity', version: 1 },
}
function detail(version = 1): PublishedUniversalDetail {
  return { ...product, publishedReference: { ...product.publishedReference, version }, content: {
    key: product.key, version, displayName: product.displayName, theme: product.theme,
    mission: { name: 'Approved mission', story: 'Approved story text <script>safe</script>' },
    configuration: { normalCheckpointCount: 1, summary: 'Approved summary' }, scoring: {},
    checkpoints: [{ role: 'normal', checkpoint: 1 }, { role: 'terminal' }],
  } }
}
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  api.list.mockResolvedValue({ items: [product] }); api.get.mockResolvedValue(detail())
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<UniversalLibrary />)) }
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === text)!.click()) }
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('F7-FE-06 cross-Creator approved product opens exact approved story and terminal content read-only', async () => {
  await render()
  expect(container.textContent).toContain('Another Creator · Published version 1')
  expect(api.get).not.toHaveBeenCalled()
  await click('View approved Template')
  expect(api.get).toHaveBeenCalledWith(product.key)
  expect(container.textContent).toContain('Approved mission')
  expect(container.textContent).toContain('Approved story text <script>safe</script>')
  expect(container.textContent).toContain('FinishPoint')
  expect(container.querySelector('script')).toBeNull()
  expect(container.querySelector('input,select,textarea,a')).toBeNull()
  expect(container.textContent).not.toContain('another-creator')
  expect(document.activeElement?.textContent).toBe('Shared story')
  expect(container.querySelectorAll('button')).toHaveLength(2)
})

test('F7-FE-06 current publication replaces stale list reference without history selection', async () => {
  api.get.mockResolvedValue(detail(3))
  await render(); await click('View approved Template')
  expect(container.textContent).toContain('Publication changed since the Library was loaded')
  expect(container.textContent).toContain('Published version 3')
  expect(container.textContent).not.toContain('Published version 1')
  expect(api.get).toHaveBeenCalledExactlyOnceWith(product.key)
})

test('F7-FE-06 never renders content inconsistent with the exact publication pin', async () => {
  api.get.mockResolvedValue({ ...detail(), content: { ...detail().content, version: 4, mission: 'PRIVATE CANDIDATE' } })
  await render(); await click('View approved Template')
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  expect(container.textContent).not.toContain('PRIVATE CANDIDATE')
})

test('F7-FE-06 loading and empty remain distinct from failed reads', async () => {
  const pending = deferred<{ items: PublishedUniversal[] }>(); api.list.mockReturnValue(pending.promise)
  await render(); expect(container.textContent).toContain('Loading Universal Library')
  await act(async () => pending.resolve({ items: [] }))
  expect(container.textContent).toContain('No approved Universal Templates are available')
})

test.each([401, 403])('F7-FE-06 %i refresh clears cached products and approved details', async status => {
  await render(); await click('View approved Template')
  api.list.mockRejectedValue(new ApiError('Denied', status, 'http'))
  await click('Refresh Library')
  expect(container.querySelector('[aria-label="Approved Universal Template"]')).toBeNull()
  expect(container.textContent).not.toContain('Shared story')
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  expect(container.textContent).not.toContain('No approved Universal Templates are available')
})

test.each([401, 403])('F7-FE-06 %i detail revocation clears list and content', async status => {
  await render(); api.get.mockRejectedValue(new ApiError('Denied', status, 'http'))
  await click('View approved Template')
  expect(container.textContent).not.toContain('Shared story')
  expect(container.querySelector('[aria-label="Approved Universal Template"]')).toBeNull()
})

test('F7-FE-06 unavailable/private/Local/evidence-free detail stays missing with no owner fallback', async () => {
  await render(); api.get.mockRejectedValue(new ApiError('Missing', 404, 'http'))
  await click('View approved Template')
  expect(container.textContent).toContain('no longer available')
  expect(container.querySelector('[aria-label="Approved Universal Template"]')).toBeNull()
  expect(api.get).toHaveBeenCalledExactlyOnceWith(product.key)
  api.list.mockResolvedValue({ items: [] }); await click('Refresh Library')
  expect(container.textContent).toContain('No approved Universal Templates are available')
})

test('F7-FE-06 failed refresh exposes retry and preserves no stale approved artifact', async () => {
  await render(); await click('View approved Template')
  api.list.mockRejectedValue(new Error('Network unavailable')); await click('Refresh Library')
  expect(container.textContent).toContain('could not be refreshed')
  expect(container.querySelector('[aria-label="Approved Universal Template"]')).toBeNull()
  api.list.mockResolvedValue({ items: [product] }); await click('Refresh Library')
  expect(container.textContent).toContain('Shared story')
})

test('F7-FE-06 stale detail response cannot restore content after Library refresh', async () => {
  const pending = deferred<PublishedUniversalDetail>(); api.get.mockReturnValue(pending.promise)
  await render(); await click('View approved Template')
  api.list.mockResolvedValue({ items: [] }); await click('Refresh Library')
  await act(async () => pending.resolve(detail()))
  expect(container.querySelector('[aria-label="Approved Universal Template"]')).toBeNull()
  expect(container.textContent).not.toContain('Shared story')
})

test('F7-FE-06 switching products rejects out-of-order approved detail', async () => {
  const next = { ...product, id: 'next', key: 'next', displayName: 'Next story', publishedReference: { templateId: 'next', version: 2 } }
  api.list.mockResolvedValue({ items: [product, next] })
  const old = deferred<PublishedUniversalDetail>(); api.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ ...detail(2), ...next, content: { ...detail(2).content, key: next.key } })
  await render()
  const buttons = [...container.querySelectorAll('button')].filter(button => button.textContent === 'View approved Template')
  await act(async () => buttons[0].click()); await act(async () => buttons[1].click())
  await act(async () => old.resolve(detail()))
  expect(container.querySelector('[aria-label="Approved Universal Template"] h3')?.textContent).toBe('Next story')
})

test('F7-FE-06 invalid/evidence-free publication projection fails closed instead of inferring from status', async () => {
  api.list.mockResolvedValue({ items: [{ ...product, publishedReference: undefined, status: 'approved', version: 8 }] })
  await render()
  expect(container.textContent).not.toContain('Shared story')
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
})

test('F7-FE-06 null attribution and long content stay semantic and keyboard reachable', async () => {
  api.list.mockResolvedValue({ items: [{ ...product, creator: { id: 'another-creator', name: null }, displayName: 'Long '.repeat(50) }] })
  await render()
  expect(container.textContent).toContain('By Creator · Published version 1')
  const view = [...container.querySelectorAll('button')].find(button => button.textContent === 'View approved Template')!
  act(() => view.focus()); expect(document.activeElement).toBe(view)
})

test('F7-FE-06 approved content display uses only product attribution and content fields', async () => {
  const extra = { email: 'PRIVATE_EMAIL', reviewer: 'PRIVATE_REVIEWER', status: 'draft', version: 9, reviewNotes: 'PRIVATE_NOTES' }
  api.list.mockResolvedValue({ items: [{ ...product, ...extra, creator: { ...product.creator, email: 'PRIVATE_EMAIL' } }] })
  api.get.mockResolvedValue({ ...detail(), ...extra })
  await render(); await click('View approved Template')
  for (const value of ['PRIVATE_EMAIL', 'PRIVATE_REVIEWER', 'PRIVATE_NOTES', 'Published version 9']) expect(container.textContent).not.toContain(value)
  expect(container.textContent).toContain('Published version 1')
})
