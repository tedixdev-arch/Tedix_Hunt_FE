import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorStudioPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate, CreatorTemplateStatus } from '../src/services/api/creatorTemplates'
import { ApiError } from '../src/services/api/client'

const api = vi.hoisted(() => ({ list: vi.fn(), delete: vi.fn(), createSignalClujDraft: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement
const template = (status: CreatorTemplateStatus, key: string = status): CreatorTemplate => ({
  key, status, version: 1, content: { key, version: 1, displayName: `Named ${status} "Trail"`, theme: 'City', mission: 'Story', configuration: { normalCheckpointCount: 1, checkpointPositions: [] }, scoring: {}, checkpoints: [] },
})
const records = [template('draft'), template('changes_requested'), template('submitted'), template('approved')]
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.resetAllMocks()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function () { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function () { this.removeAttribute('open') } })
  api.list.mockResolvedValue(structuredClone(records))
  api.delete.mockResolvedValue(undefined)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)) }
const button = (text: string, scope: ParentNode = container) => [...scope.querySelectorAll<HTMLButtonElement>('button')].find(item => item.textContent === text)!
async function click(text: string, scope: ParentNode = container) { await act(async () => button(text, scope).click()) }
const cards = () => [...container.querySelectorAll<HTMLElement>('[aria-label="Creator Templates"] article')]
const counts = () => [...container.querySelectorAll('[aria-label="Template queues"] article')].map(card => card.lastElementChild?.textContent)
async function open() { const trigger = button('Delete', cards()[0]); trigger.focus(); await act(async () => trigger.click()); return trigger }
async function key(key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })
  await act(async () => document.activeElement!.dispatchEvent(event)); return event
}

test.each(['draft', 'changes_requested'] as const)('%s has Edit and secondary Delete actions', async status => {
  api.list.mockResolvedValue([template(status)])
  await render()
  expect(button('Delete', cards()[0])).toBeDefined()
  expect(cards()[0].querySelector('a')?.textContent).toBe('Edit template')
  expect(cards()[0].querySelector('a')?.getAttribute('href')).toBe(`/create?template=${status}`)
  expect(api.delete).not.toHaveBeenCalled()
})
test.each(['submitted', 'approved'] as const)('%s retains View and has no Delete', async status => {
  api.list.mockResolvedValue([template(status)])
  await render()
  expect(button('Delete', cards()[0])).toBeUndefined()
  expect(cards()[0].querySelector('a')?.textContent).toBe('View template')
})

test('confirmation names the selected Template and Cancel sends no request and restores focus', async () => {
  await render(); const trigger = await open()
  const dialog = container.querySelector('dialog')!
  expect(dialog.open).toBe(true)
  expect(dialog.querySelector(`#${dialog.getAttribute('aria-labelledby')}`)?.textContent).toBe('Delete Template?')
  expect(dialog.querySelector(`#${dialog.getAttribute('aria-describedby')}`)?.textContent).toContain('Are you sure you want to permanently delete "Named draft "Trail""?')
  expect(dialog.textContent).toContain('This action cannot be undone.')
  expect(document.activeElement).toBe(button('Cancel'))
  await click('Cancel')
  expect(container.querySelector('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  expect(api.delete).not.toHaveBeenCalled()
})

test('Tab wraps both ways, Escape cancels and restores focus without deletion', async () => {
  await render(); const trigger = await open()
  expect((await key('Tab', true)).defaultPrevented).toBe(true)
  expect(document.activeElement).toBe(button('Delete Template'))
  expect((await key('Tab')).defaultPrevented).toBe(true)
  expect(document.activeElement).toBe(button('Cancel'))
  // Browsers dispatch cancel on a native modal dialog when Escape is pressed.
  await act(async () => container.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(container.querySelector('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  expect(api.delete).not.toHaveBeenCalled()
})

test('confirmation sends the selected key once, keeps cards while pending and refreshes cards and counters', async () => {
  const selected = template('draft', 'key /?#&é')
  api.list.mockResolvedValueOnce([selected, ...records.slice(1)]).mockResolvedValueOnce(records.slice(1))
  let resolve!: () => void
  api.delete.mockReturnValue(new Promise<void>(done => { resolve = done }))
  await render(); await open()
  const confirm = button('Delete Template')
  await act(async () => { confirm.click(); confirm.click() })
  expect(api.delete).toHaveBeenCalledExactlyOnceWith(selected.key)
  expect(button('Deleting…').disabled).toBe(true)
  expect(container.querySelector('dialog [role="status"]')?.textContent).toBe('Deleting Template…')
  expect(cards()).toHaveLength(4); expect(counts()).toEqual(['1', '1', '1', '1'])
  expect(api.list).toHaveBeenCalledTimes(1)
  expect((await key('Tab')).defaultPrevented).toBe(true)
  expect(document.activeElement).toBe(button('Cancel'))
  await act(async () => resolve())
  expect(container.querySelector('dialog')).toBeNull()
  expect(api.list).toHaveBeenCalledTimes(2)
  expect(cards()).toHaveLength(3); expect(counts()).toEqual(['0', '1', '1', '1'])
  expect(cards().map(card => card.querySelector('h2')?.textContent)).toEqual(records.slice(1).map(item => item.content.displayName))
  expect(document.activeElement?.textContent).toBe('My Templates')
})

test.each([
  [401, 'unauthorized', 'sign in again'], [403, 'forbidden', 'not authorized'],
  [404, 'not_found', 'not found or is no longer owned'],
  [409, 'template_not_deletable', 'current status'], [409, 'template_in_use', 'protected dependencies'],
  [409, 'unknown_conflict', 'Deletion could not be confirmed'], [500, 'server_error', 'Deletion could not be confirmed'],
] as const)('failure %s %s retains the card and counters, displays an action and allows cancel', async (status, code, message) => {
  api.delete.mockRejectedValue(new ApiError('Failure', status, 'http', { error: code }))
  await render(); const trigger = await open(); await click('Delete Template')
  expect(container.querySelector('dialog [role="alert"]')?.textContent).toContain(message)
  expect(button('Delete Template').disabled).toBe(false)
  expect(cards()).toHaveLength(4); expect(counts()).toEqual(['1', '1', '1', '1'])
  expect(api.list).toHaveBeenCalledTimes(1)
  await click('Cancel'); expect(document.activeElement).toBe(trigger)
})

test('transient failure permits an explicit retry', async () => {
  api.delete.mockRejectedValueOnce(new ApiError('Network', null, 'network')).mockResolvedValueOnce(undefined)
  await render(); await open(); await click('Delete Template')
  expect(cards()).toHaveLength(4)
  expect(container.querySelector('dialog [role="alert"]')?.textContent).toContain('retry')
  api.list.mockResolvedValue(records.slice(1))
  await click('Delete Template')
  expect(api.delete).toHaveBeenCalledTimes(2)
  expect(cards()).toHaveLength(3)
})

test('Cancel during a pending request cannot allow a second DELETE; a later failure remains actionable', async () => {
  let reject!: (error: Error) => void
  api.delete.mockReturnValue(new Promise((_, fail) => { reject = fail }))
  await render(); await open(); await click('Delete Template'); await click('Cancel')
  expect(container.querySelector('dialog')).toBeNull()
  expect(button('Delete', cards()[0]).disabled).toBe(true)
  await click('Delete', cards()[0])
  expect(api.delete).toHaveBeenCalledTimes(1)
  await act(async () => reject(new ApiError('Network', null, 'network')))
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Deletion could not be confirmed')
  expect(cards()).toHaveLength(4)
  expect(button('Delete', cards()[0]).disabled).toBe(false)
})

test('refresh failure after confirmed deletion keeps existing cards and Retry only reloads the list', async () => {
  api.list.mockResolvedValueOnce(records).mockRejectedValueOnce(new ApiError('Network', null, 'network')).mockResolvedValueOnce(records.slice(1))
  await render(); await open(); await click('Delete Template')
  expect(container.querySelector('dialog')).toBeNull()
  expect(cards()).toHaveLength(4)
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  await click('Retry')
  expect(api.delete).toHaveBeenCalledTimes(1)
  expect(cards()).toHaveLength(3); expect(counts()[0]).toBe('0')
})

test('creation chooser still opens both paths after cancellation', async () => {
  await render(); await open(); await click('Cancel'); await click('Create Template')
  expect(button('Start from scratch')).toBeDefined()
  await click('Start from Template')
  expect(button('Signal: Cluj Napoca')).toBeDefined()
  expect(api.createSignalClujDraft).not.toHaveBeenCalled()
  await click('Close')
  expect(api.delete).not.toHaveBeenCalled()
})

test('confirmed deletion preserves other cards while the authoritative refresh is pending', async () => {
  let refresh!: (records: CreatorTemplate[]) => void
  api.list.mockResolvedValueOnce(records).mockReturnValueOnce(new Promise(done => { refresh = done }))
  await render(); await open(); await click('Delete Template')
  expect(container.querySelector('dialog')).toBeNull()
  expect(cards()).toHaveLength(4)
  expect(counts()).toEqual(['1', '1', '1', '1'])
  expect(button('Delete', cards()[0]).disabled).toBe(true)
  expect(container.querySelector('[aria-label="Creator Templates"]')?.getAttribute('aria-busy')).toBe('true')
  await act(async () => refresh(records.slice(1)))
  expect(cards()).toHaveLength(3)
  expect(counts()).toEqual(['0', '1', '1', '1'])
  expect(button('Delete', cards()[0]).disabled).toBe(false)
})
