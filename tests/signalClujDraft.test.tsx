import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorStudioPage, CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
import { ParticipantPreview } from '../src/features/creator/ParticipantPreview'
import type { CreatorTemplate } from '../src/services/api/creatorTemplates'
import { ApiError } from '../src/services/api/client'

const map = vi.hoisted(() => ({ props: {} as any }))
const api = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), createSignalClujDraft: vi.fn(), createVersion: vi.fn(), create: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', () => ({ creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: (props: any) => { map.props = props; return <div aria-label="Shared Mapbox" /> } }))
let root: Root, container: HTMLDivElement
let record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.clearAllMocks()
  Element.prototype.scrollIntoView = vi.fn()
  record = { key: 'signal-cluj-new', version: 1, status: 'draft', content: {
    key: 'signal-cluj-new', version: 1, displayName: 'Signal starter', theme: 'Smart Theme (Signal)',
    mission: { name: 'Restore', signal: 'SIGNAL', briefing: 'Saved story', finishLocation: 'Fictional wall', metadata: { retain: ['unknown'] } },
    configuration: { normalCheckpointCount: 6, checkpointPositions: [] }, scoring: { startingScore: 500 },
    checkpoints: [...Array.from({ length: 6 }, (_, index) => ({ checkpoint: index + 1, role: 'normal', kind: 'square', navigationMode: 'none', correctAnswers: { x: '42' }, hint: 'Original hint', fictionalNavigation: { scope: 'puzzle-only', direction: 'NW', distance: '80 m' } })), { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis', navigationMode: 'none', teamAnswer: 'SIGNAL' }],
  } }
  api.list.mockResolvedValue([]); api.get.mockImplementation(async () => structuredClone(record))
  api.createVersion.mockImplementation(async (_, content) => { record = { ...record, version: content.version, content }; return structuredClone(record) })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render(node: React.ReactNode) { await act(async () => root.render(node)) }
async function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith(text))!
  expect(button, text).toBeDefined(); await act(async () => button.click())
}
function Location() { return <p aria-label="Navigated location">{useLocation().search}</p> }

test('dashboard prevents repeat clicks and navigates to returned draft key without submission', async () => {
  let resolve!: (value: CreatorTemplate) => void
  api.createSignalClujDraft.mockReturnValue(new Promise(done => { resolve = done }))
  await render(<MemoryRouter initialEntries={['/creator']}><Routes><Route path="/creator" element={<CreatorStudioPage />} /><Route path="/create" element={<Location />} /></Routes></MemoryRouter>)
  await click('Create Signal Cluj route draft')
  const button = [...container.querySelectorAll('button')].find(button => button.textContent === 'Creating Signal Cluj draft…')!
  expect(button.disabled).toBe(true)
  await act(async () => button.click())
  expect(api.createSignalClujDraft).toHaveBeenCalledTimes(1)
  await act(async () => resolve({ ...record, key: 'returned key&draft' }))
  expect(container.textContent).toContain('?template=returned%20key%26draft')
  expect(api.submit).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
})

test.each([401, 403, 409, 500])('dashboard displays starter error %s and allows manual retry', async status => {
  api.createSignalClujDraft.mockRejectedValue(new ApiError('Failure', status, 'http'))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Signal Cluj route draft')
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  expect([...container.querySelectorAll('button')].find(button => button.textContent === 'Create Signal Cluj route draft')?.disabled).toBe(false)
})

test('editor hydrates and edits mission strings, preserves metadata and all gameplay, saves and reopens unplaced geography', async () => {
  const original = structuredClone(record.content.checkpoints)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await click('3. Mission template & story')
  const briefing = [...container.querySelectorAll('textarea')].find(input => input.value === 'Saved story')!
  expect(briefing.value).toBe('Saved story')
  expect(container.textContent).not.toContain('[object Object]')
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(briefing, 'Edited story')
    briefing.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await click('Save draft')
  expect(api.createVersion).toHaveBeenCalledTimes(1)
  expect(record.content.mission).toEqual({ name: 'Restore', signal: 'SIGNAL', briefing: 'Edited story', finishLocation: 'Fictional wall', metadata: { retain: ['unknown'] } })
  expect(record.content.checkpoints).toEqual(original)
  expect(record.content.configuration.checkpointPositions).toEqual([])
  expect(api.submit).not.toHaveBeenCalled()
  // A fresh mount exercises saved hydration rather than relying on editor state.
  await act(async () => root.unmount()); root = createRoot(container)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await click('3. Mission template & story')
  expect([...container.querySelectorAll('textarea')].some(input => input.value === 'Edited story')).toBe(true)
  expect(container.textContent).toContain('not saved proof of field verification')
})

test('participant preview renders object story and keeps fictional directions out of walking guidance', async () => {
  record.content.configuration.checkpointPositions = Array.from({ length: 6 }, (_, index) => ({ checkpointNumber: index + 1, name: `Real destination ${index + 1}`, latitude: 46.77 + index / 100, longitude: 23.6, radiusMeters: 20 }))
  await render(<ParticipantPreview content={record.content} onExit={vi.fn()} />)
  expect(container.textContent).toContain('Saved story')
  expect(container.textContent).not.toContain('[object Object]')
  await click('Start preview')
  expect(container.textContent).toContain('Real destination 1')
  expect(container.textContent).not.toContain('NW')
  expect(container.textContent).not.toContain('80 m')
  await click('Simulate arrival'); await click('Inspect Personal Challenge')
  expect(container.textContent).toContain('not real walking guidance')
  expect(container.querySelector('[aria-label="Saved checkpoint configuration"]')?.textContent).toContain('puzzle-only')
})

async function feature(name: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent?.includes(name))!
  expect(button).toBeDefined(); await act(async () => button.click())
}
async function inputValue(input: HTMLInputElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

test('Creator places six normal points and FinishPoint using the shared map, saves, reloads and previews persisted names', async () => {
  record.content.routeResearch = { status: 'pending', physicalVerification: 'pending', walkingNavigation: 'pending', proposal: structuredClone(signalClujRouteProposal), unknown: { preserve: true } }
  record.content.starterSource = { key: 'signal-cluj-napoca', version: 1, checkpointsSha256: 'original' }
  record.content.fictionalNavigation = { scope: 'puzzle-only', active: false }
  for (const checkpoint of record.content.checkpoints as Record<string, unknown>[]) {
    checkpoint.personalChallenge = { question: 'Saved personal puzzle', answer: '42', hints: ['Personal hint'], solution: 'Personal solution' }
    checkpoint.teamChallenge = { question: 'Saved team puzzle', answer: 'SIGNAL', hints: ['Team hint'], solution: 'Team solution' }
  }
  const originalContent = structuredClone(record.content)
  const original = structuredClone(record.content.checkpoints)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(container.querySelectorAll('[data-checkpoint]')).toHaveLength(6)
  expect(container.querySelectorAll('[aria-label="Ordered route candidates"] > li')).toHaveLength(7)
  await click('CP6 ·')
  expect(map.props.cameraTarget).toMatchObject({ latitude: 46.7683841, longitude: 23.5955112 })
  expect(map.props.checkpoints).toHaveLength(0)
  expect(api.createVersion).not.toHaveBeenCalled()
  for (let number = 1; number <= 6; number++) {
    await act(async () => (container.querySelector(`[data-checkpoint="${number}"]`) as HTMLButtonElement).click())
    await act(async () => map.props.onMapClick(46.7 + number / 1000, 23.6 + number / 1000))
    const card = container.querySelector(`[data-checkpoint="${number}"]`)!.closest('article')!
    await inputValue(card.querySelector('input')!, `Real place ${number}`)
    await inputValue(card.querySelector('input[type="number"]')!, '25')
    expect(map.props.checkpoints.find((point: any) => point.checkpointNumber === number)?.name).toBe(`Real place ${number}`)
  }
  await feature('Final Checkpoint')
  const finishName = [...container.querySelectorAll('input')].find(input => input.parentElement?.textContent === 'FinishPoint name')!
  await inputValue(finishName, 'Real finish')
  await act(async () => map.props.onMapClick(46.8, 23.7))
  expect(map.props.finishPoint?.name).toBe('Real finish')
  await click('Save draft')
  expect(api.createVersion, container.querySelector('[role="alert"]')?.textContent ?? '').toHaveBeenCalledTimes(1)
  expect(record.content.configuration.checkpointPositions).toHaveLength(6)
  expect(record.content.configuration.checkpointPositions[5]).toEqual({ checkpointNumber: 6, name: 'Real place 6', latitude: 46.706, longitude: 23.606, radiusMeters: 25 })
  expect(record.content.configuration.finishPoint).toEqual({ name: 'Real finish', latitude: 46.8, longitude: 23.7, radiusMeters: 5 })
  expect(record.content.checkpoints).toEqual(original)
  for (const key of ['mission', 'scoring', 'fictionalNavigation', 'starterSource', 'routeResearch']) expect(record.content[key]).toEqual(originalContent[key])
  expect(record.version).toBe(2)
  await act(async () => root.unmount()); root = createRoot(container)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(container.querySelectorAll('[aria-label="Ordered route candidates"] > li')).toHaveLength(7)
  await click('CP6 ·')
  expect(map.props.landmarkReference.name).toBe('Reformed Church — exterior')
  expect(map.props.checkpoints).toHaveLength(6)
  expect(map.props.checkpoints.every((point: any) => point.verified === false)).toBe(true)
  expect(map.props.checkpoints[5].name).toBe('Real place 6')
  await feature('Final Checkpoint')
  expect(map.props.finishPoint.name).toBe('Real finish')
  await click('Preview full journey'); await click('Start preview')
  expect(container.textContent).toContain('Real place 1')
  expect(map.props.cameraTarget.latitude).toBe(46.701)
  expect(map.props.landmarkReference).toBeUndefined()
  expect(record.content.routeResearch).toEqual(originalContent.routeResearch)
  expect(api.createVersion).toHaveBeenCalledTimes(1)
  expect(api.submit).not.toHaveBeenCalled()
})
