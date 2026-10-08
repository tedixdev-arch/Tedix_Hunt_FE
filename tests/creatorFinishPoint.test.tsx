import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'

vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => null }))

const mocks = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), createVersion: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: mocks }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: ({ onMapClick }: any) => <button type="button" onClick={() => onMapClick(47, 24)}>Place map point</button> }))
vi.mock('../src/features/creator/RouteEditor', () => ({ RouteEditor: (props: any) => <button type="button" onClick={() => {
  props.onVerifiedChange(new Set([1])); props.onSafetyChange(new Set(['a', 'b', 'c', 'd', 'e', 'f']))
  props.onConfigurationChange({ normalCheckpointCount: 1, checkpointPositions: props.drafts })
}}>Verify saved route</button> }))

const finishPoint = { name: ' City Wall ', latitude: 46.778123, longitude: 23.641234, radiusMeters: 17 }
const checkpoint = { checkpointNumber: 1, name: 'Museum', latitude: 46.77, longitude: 23.59, radiusMeters: 30 }
let record: CreatorTemplate
let container: HTMLDivElement
let root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  Element.prototype.scrollIntoView = vi.fn()
  Object.values(mocks).forEach(mock => mock.mockReset())
  record = { key: 'trail', version: 3, status: 'draft', content: {
    key: 'trail', version: 3, displayName: 'Trail', theme: 'City', mission: 'Go',
    configuration: { normalCheckpointCount: 1, checkpointPositions: [checkpoint], finishPoint, customSetting: 'preserved', summary: '', category: '', ageRange: '', durationMinutes: 45, language: '', participants: '', teamSize: '', format: '', environment: '', equipment: '', difficulty: '', briefing: '' },
    scoring: { model: 'platform', selections: { final: 1 }, extra: 'preserved' }, checkpoints: [{ checkpointNumber: 1, name: 'Museum', personal: 0, team: 0, navigation: 0, extra: 'preserved' }],
  } }
  mocks.get.mockImplementation(async () => structuredClone(record))
  mocks.createVersion.mockImplementation(async (key, content) => ({ key, content, version: content.version, status: 'draft' }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render() { await act(async () => root.render(<MemoryRouter initialEntries={['/create?template=trail']}><CreatorTemplateEditorPage /></MemoryRouter>)) }
async function click(text: string) {
  const button = /^\d\.$/.test(text) ? container.querySelectorAll('nav')[1].querySelectorAll('button')[Number(text.slice(0, -1)) - 1] : Array.from(container.querySelectorAll('button')).findLast(item => item.textContent?.includes(text))!
  expect(button, text).toBeDefined()
  await act(async () => button.click())
}
function change(selector: string, value: string) {
  act(() => {
    const element = container.querySelector(selector)!
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function verify() {
  await click('2.')
  await click('Verify saved route')
  await click('Save & continue')
}
async function save() {
  await click('9.')
  await click('Complete Hunt Features')
}
test('Feature 6 hydration and saving preserve settings, checkpoints and immutable versions', async () => {
  const before = structuredClone(record)
  await render(); await verify(); await click('6.')
  expect(container.querySelector('section[aria-label="FinishPoint placement"]')).not.toBeNull()
  expect((container.querySelector('input[maxlength="100"]') as HTMLInputElement).value).toBe(finishPoint.name)
  expect((container.querySelector('input[type="number"][min="5"]') as HTMLInputElement).value).toBe('17')
  await click('Place map point'); await save()
  expect(mocks.createVersion).toHaveBeenCalledTimes(1)
  const content = mocks.createVersion.mock.calls[0][1]
  expect(content.version).toBe(4)
  expect(content.configuration.finishPoint).toEqual({ ...finishPoint, latitude: 47, longitude: 24 })
  expect(content.configuration.checkpointPositions).toEqual([checkpoint])
  expect(content.configuration.normalCheckpointCount).toBe(1)
  expect(content.configuration.customSetting).toBe('preserved')
  expect(content.checkpoints).toEqual(record.content.checkpoints)
  expect(content.scoring).toEqual(record.content.scoring)
  expect(record).toEqual(before)
  await click('Complete Hunt Features')
  expect(mocks.createVersion).toHaveBeenCalledTimes(1)
})
test('invalid FinishPoint blocks persistence and geographic validation', async () => {
  await render(); await verify(); await click('6.')
  change('input[type="number"][min="5"]', '4')
  await save()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(container.textContent).toContain('integer radius from 5 to 500')
  const validate = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Run template validation')!
  expect(validate.disabled).toBe(true)
})
test('missing geographic FinishPoint is not defaulted on loading or draft save', async () => {
  delete record.content.configuration.finishPoint
  await render(); await verify(); await save()
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Place one FinishPoint in Feature 6')
  await click('6.')
  expect((container.querySelector('input[type="number"][min="5"]') as HTMLInputElement).value).toBe('5')
  expect(mocks.submit).not.toHaveBeenCalled()
})
test('legacy non-geographic drafts load and save without introducing geographic defaults', async () => {
  record.content.configuration = { ...record.content.configuration } as any
  delete (record.content.configuration as any).normalCheckpointCount
  delete (record.content.configuration as any).checkpointPositions
  delete record.content.configuration.finishPoint
  await render(); await save()
  expect(container.textContent).not.toContain('Place one FinishPoint in Feature 6')
  expect(mocks.createVersion).not.toHaveBeenCalled()
  expect(mocks.get).toHaveBeenCalledWith('trail')
})
