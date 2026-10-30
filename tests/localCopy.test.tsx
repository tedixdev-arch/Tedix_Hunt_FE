import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { UseUniversalAsLocal } from '../src/features/creator/UseUniversalAsLocal'
import { ApiError } from '../src/services/api/client'
const api = vi.hoisted(() => ({ fromUniversal: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
const source = { id: 'source-id', key: 'other-creator', displayName: 'Shared', theme: 'City', creator: { id: 'other', name: 'Other' }, publishedReference: { templateId: 'source-id', version: 2 }, content: {} } as any
let root: Root, container: HTMLDivElement
function Location() { return <output>{useLocation().search}</output> }
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function click(text: string) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent === text)!.click()) }
async function setup() { await act(async () => root.render(<MemoryRouter><UseUniversalAsLocal source={source} /><Location /></MemoryRouter>)); await click('Use as Local Template'); await act(async () => { const input = container.querySelector('input')!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'own-local'); input.dispatchEvent(new Event('input', { bubbles: true })) }) }
async function submit() { await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))) }
test('07 copies exact inspected cross-Creator publication once and opens independent server identity', async () => {
  let resolve!: (value: any) => void; api.fromUniversal.mockReturnValue(new Promise(done => resolve = done)); await setup(); await submit(); await submit()
  expect(api.fromUniversal).toHaveBeenCalledExactlyOnceWith('other-creator', 'own-local', source.publishedReference)
  await act(async () => resolve({ key: 'server-local', version: 1, status: 'draft', category: 'local', sourceTemplateId: 'source-id' }))
  expect(container.querySelector('output')!.textContent).toBe('?template=server-local'); expect(source.publishedReference.version).toBe(2)
})
test.each([['stale_published_reference',409],['not_found',404],['forbidden',403],['auth',401],['unknown',500]])('07 blocks retry on %s until refresh/reselection or owned recovery', async (error,status) => {
  api.fromUniversal.mockRejectedValue(new ApiError('Failed',status as number,'http',{error})); await setup(); await submit(); await submit(); expect(api.fromUniversal).toHaveBeenCalledTimes(1); expect(container.querySelector('[role=alert]')).not.toBeNull()
})
test.each([400,409])('07 invalid request or duplicate key %s keeps destination editable', async status => {
  api.fromUniversal.mockRejectedValue(new ApiError('Failed',status,'http',{error: 'template_key_conflict'})); await setup(); await submit(); expect(container.querySelector('input')!.disabled).toBe(false)
})
