import { signalOverloadRouteProposal } from './fixtures/signalOverloadRouteProposal'
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
const api = vi.hoisted(() => ({ listStarters: vi.fn(), list: vi.fn(), get: vi.fn(), createStarterDraft: vi.fn(), createVersion: vi.fn(), create: vi.fn(), submit: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async importOriginal => ({ ...await importOriginal<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: (props: any) => { map.props = props; return <div aria-label="Shared Mapbox" /> } }))
let root: Root, container: HTMLDivElement
let record: CreatorTemplate
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.resetAllMocks()
  // jsdom lacks the browser dialog methods; simulate opening and closing the native dialog.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function () { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function () { this.removeAttribute('open') } })
  Element.prototype.scrollIntoView = vi.fn()
  record = { key: 'signal-cluj-new', version: 1, status: 'draft', content: {
    key: 'signal-cluj-new', version: 1, displayName: 'Signal starter', theme: 'Smart Theme (Signal)',
    mission: { name: 'Restore', signal: 'SIGNAL', briefing: 'Saved story', finishLocation: 'Fictional wall', metadata: { retain: ['unknown'] } },
    configuration: { normalCheckpointCount: 6, checkpointPositions: [] }, scoring: { startingScore: 500 },
    checkpoints: [...Array.from({ length: 6 }, (_, index) => ({ checkpoint: index + 1, role: 'normal', kind: 'square', navigationMode: 'none', correctAnswers: { x: '42' }, hint: 'Original hint', fictionalNavigation: { scope: 'puzzle-only', direction: 'NW', distance: '80 m' } })), { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis', navigationMode: 'none', teamAnswer: 'SIGNAL' }],
  } }
  api.listStarters.mockResolvedValue({ items: [{ key: 'signal-cluj-napoca', displayName: 'Signal: Cluj Napoca', description: 'Pre-filled story, challenges, scoring and researched route.', createdAt: null, creationPath: '/api/creator/templates/starters/signal-cluj-napoca' }, { key: 'signal-overload-cluj-napoca', displayName: 'Signal Overload - Cluj Napoca', description: 'Backend Overload description', createdAt: null, creationPath: '/api/creator/templates/starters/signal-overload-cluj-napoca' }] });
  api.list.mockResolvedValue([]); api.get.mockImplementation(async () => structuredClone(record))
  api.createVersion.mockImplementation(async (_, content) => { record = { ...record, version: content.version, content }; return structuredClone(record) })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal'); Reflect.deleteProperty(HTMLDialogElement.prototype, 'close'); vi.unstubAllGlobals() })
async function render(node: React.ReactNode) { await act(async () => root.render(node)) }
async function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent?.trim().startsWith(text) || button.getAttribute('aria-label')?.startsWith(text) || (text === 'Back' && button.getAttribute('aria-label') === 'Back to Create Template choices') || (text === 'Close' && button.getAttribute('aria-label') === 'Close template creation chooser'))!
  expect(button, text).toBeDefined(); await act(async () => button.click())
}
function Location() { return <p aria-label="Navigated location">{useLocation().search}</p> }

test('dashboard prevents repeat clicks and navigates to returned draft key without submission', async () => {
  let resolve!: (value: CreatorTemplate) => void
  api.createStarterDraft.mockReturnValue(new Promise(done => { resolve = done }))
  await render(<MemoryRouter initialEntries={['/creator']}><Routes><Route path="/creator" element={<CreatorStudioPage />} /><Route path="/create" element={<Location />} /></Routes></MemoryRouter>)
  await click('Create Template')
  await click('Start from Template')
  expect(api.createStarterDraft).not.toHaveBeenCalled()
  const starter = [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith('Signal: Cluj Napoca'))!
  await act(async () => { starter.click(); starter.click() })
  const button = [...container.querySelectorAll('button')].find(button => button.textContent?.startsWith('Signal: Cluj Napoca'))!
  expect(button.disabled).toBe(true)
  expect(container.querySelector('[role="status"]')?.textContent).toBe('Creating Template draft…')
  const back = [...container.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === 'Back to Create Template choices')!
  expect(back.disabled).toBe(true)
  await act(async () => back.click())
  expect(container.querySelector('#template-creation-title')?.textContent).toBe('Choose a starter Template')
  await act(async () => button.click())
  expect(api.createStarterDraft).toHaveBeenCalledTimes(1)
  await act(async () => resolve({ ...record, key: 'returned key&draft' }))
  expect(container.textContent).toContain('?template=returned%20key%26draft')
  expect(api.submit).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
})

test.each([401, 403, 409, 500])('dashboard displays starter error %s and allows manual retry', async status => {
  api.createStarterDraft.mockRejectedValue(new ApiError('Failure', status, 'http'))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template')
  await click('Start from Template'); await click('Signal: Cluj Napoca')
  expect(container.querySelector('[role="alert"]')).not.toBeNull()
  expect([...container.querySelectorAll('button')].find(button => button.textContent?.startsWith('Signal: Cluj Napoca'))?.disabled).toBe(false)
})

test('one creation CTA opens both options with accessible labels and closing creates nothing', async () => {
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  const trigger = [...container.querySelectorAll('button')].find(button => button.textContent === 'Create Template')!
  expect(container.querySelectorAll('[aria-haspopup="dialog"]')).toHaveLength(1)
  expect(container.textContent).not.toContain('Create Signal Cluj route draft')
  trigger.focus()
  await click('Create Template')
  const dialog = container.querySelector('dialog')!
  expect(dialog.open).toBe(true)
  expect(dialog.querySelector(`#${dialog.getAttribute('aria-labelledby')}`)?.textContent).toBe('Create Template')
  expect(dialog.querySelector(`#${dialog.getAttribute('aria-describedby')}`)?.textContent).toBe("Choose how you'd like to begin.")
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Close template creation chooser')
  for (const name of ['Start from scratch', 'Start from Template']) {
    const button = [...dialog.querySelectorAll('button')].find(button => button.textContent === name)!
    expect(dialog.querySelector(`#${button.getAttribute('aria-describedby')}`)?.textContent).toBeTruthy()
  }
  await click('Close')
  expect(container.querySelector('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  await click('Create Template')
  await act(async () => container.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(container.querySelector('dialog')).toBeNull()
  expect(api.createStarterDraft).not.toHaveBeenCalled()
  expect(api.create).not.toHaveBeenCalled()
})

test.each(['Close', 'Escape'])('starter view supports Back and %s without creating a draft', async control => {
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  const trigger = [...container.querySelectorAll('button')].find(button => button.textContent === 'Create Template')!
  trigger.focus()
  await click('Create Template')
  const dialog = container.querySelector('dialog')!
  const template = [...dialog.querySelectorAll('button')].find(button => button.textContent === 'Start from Template')!
  expect(dialog.querySelector('#template-starter-description')?.textContent).toBe('Choose an existing starter Template to customize.')
  await click('Start from Template')
  expect(container.querySelector('dialog')).toBe(dialog)
  expect(dialog.querySelector('#template-creation-title')?.textContent).toBe('Choose a starter Template')
  const starter = [...dialog.querySelectorAll('button')].find(button => button.textContent?.startsWith('Signal: Cluj Napoca'))!
  expect(document.activeElement?.getAttribute('aria-label')).toBe('Back to Create Template choices')
  expect(dialog.querySelector(`#${starter.getAttribute('aria-describedby')}`)?.textContent).toBe('Pre-filled story, challenges, scoring and researched route.')
  expect(dialog.textContent).not.toContain('Start from scratch')
  expect(api.createStarterDraft).not.toHaveBeenCalled()
  await click('Back')
  expect(dialog.querySelector('#template-creation-title')?.textContent).toBe('Create Template')
  expect(document.activeElement?.textContent).toBe('Start from Template')
  await click('Start from Template')
  if (control === 'Close') await click('Close')
  else await act(async () => dialog.dispatchEvent(new Event('cancel', { cancelable: true })))
  expect(container.querySelector('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
  await click('Create Template')
  expect(container.querySelector('#template-creation-title')?.textContent).toBe('Create Template')
  expect(api.createStarterDraft).not.toHaveBeenCalled()
  expect(api.create).not.toHaveBeenCalled()
})

test('Tab and Shift+Tab wrap inside both views, including while starter creation is pending', async () => {
  api.createStarterDraft.mockRejectedValue(new ApiError('Failure', 409, 'http'))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template')
  const close = container.querySelector<HTMLButtonElement>('[aria-label="Close template creation chooser"]')!
  const signal = [...container.querySelectorAll('button')].find(button => button.textContent === 'Start from Template')!
  const tab = async (shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true })
    await act(async () => document.activeElement!.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true)
  }
  close.focus(); await tab(true); expect(document.activeElement).toBe(signal)
  await tab(); expect(document.activeElement).toBe(close)
  await click('Start from Template')
  const back = [...container.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === 'Back to Create Template choices')!
  back.focus(); await tab(true); expect(document.activeElement?.textContent).toContain('Signal Overload - Cluj Napoca')
  await tab(); expect(document.activeElement).toBe(back)
  await click('Signal: Cluj Napoca')
  const check = [...container.querySelectorAll('button')].find(button => button.textContent === 'Check My Templates')!
  check.focus(); await tab(); expect(document.activeElement).toBe(back)
  api.createStarterDraft.mockReturnValue(new Promise(() => {}))
  await click('Signal: Cluj Napoca')
  close.focus(); await tab(); expect(document.activeElement).toBe(close)
  await tab(true); expect(document.activeElement).toBe(close)
})

test('scratch opens the unchanged generic editor without persisting a Template', async () => {
  await render(<MemoryRouter initialEntries={['/creator']}><Routes><Route path="/creator" element={<CreatorStudioPage />} /><Route path="/create" element={<CreatorTemplateEditorPage />} /></Routes></MemoryRouter>)
  await click('Create Template')
  await click('Start from scratch')
  expect(container.textContent).toContain('Template details')
  expect(container.querySelector('dialog')).toBeNull()
  expect(api.get).not.toHaveBeenCalled()
  expect(api.create).not.toHaveBeenCalled()
  expect(api.createStarterDraft).not.toHaveBeenCalled()
})

test('closing and reopening during Signal creation keeps both paths protected', async () => {
  let resolve!: (value: CreatorTemplate) => void
  api.createStarterDraft.mockReturnValue(new Promise(done => { resolve = done }))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template'); await click('Start from Template'); await click('Signal: Cluj Napoca')
  await click('Close'); await click('Create Template')
  for (const name of ['Start from scratch', 'Start from Template']) {
    expect([...container.querySelectorAll('button')].find(button => button.textContent === name)?.disabled).toBe(true)
    await click(name)
  }
  expect(api.createStarterDraft).toHaveBeenCalledTimes(1)
  await act(async () => resolve(record))
})

test('starter errors survive closing, offer checking drafts, and permit an explicit retry', async () => {
  api.createStarterDraft.mockRejectedValueOnce(new ApiError('Failure', 500, 'http')).mockResolvedValue(record)
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template'); await click('Start from Template'); await click('Signal: Cluj Napoca')
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Check your drafts before retrying')
  await click('Check My Templates')
  expect(api.list).toHaveBeenCalledTimes(2)
  expect(container.querySelector('dialog')).toBeNull()
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Check your drafts before retrying')
  await click('Create Template')
  expect(container.querySelector('dialog [role="alert"]')).not.toBeNull()
  await click('Start from Template'); await click('Signal: Cluj Napoca')
  expect(api.createStarterDraft).toHaveBeenCalledTimes(2)
})

test('My Templates preserves every status counter, card and existing editor link', async () => {
  const statuses = ['draft', 'changes_requested', 'submitted', 'approved'] as const
  api.list.mockResolvedValue(statuses.map(status => ({ ...record, key: `${status}&key`, status, content: { ...record.content, displayName: `${status} Template` } })))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  expect(container.querySelector('h2')?.textContent).toBe('My Templates')
  const queues = [...container.querySelectorAll('[aria-label="Template queues"] article')]
  expect(queues.map(queue => queue.firstElementChild?.textContent)).toEqual(['Drafts', 'Changes requested', 'Submitted', 'Approved'])
  expect(queues.every(queue => queue.lastElementChild?.textContent === '1')).toBe(true)
  const cards = [...container.querySelectorAll('[aria-label="Creator Templates"] article')]
  expect(cards).toHaveLength(4)
  cards.forEach((card, index) => {
    expect(card.querySelector('h2')?.textContent).toBe(`${statuses[index]} Template`)
    expect(card.querySelector('a')?.getAttribute('href')).toBe(`/create?template=${statuses[index]}%26key`)
    expect(card.querySelector('a')?.textContent).toBe(index < 2 ? 'Edit template' : 'View template')
  })
  await click('Create Template'); await click('Close')
  expect(container.querySelectorAll('[aria-label="Creator Templates"] article')).toHaveLength(4)
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

test.each([false, true])('Creator saves and reopens six authored positions and separate F (Overload: %s)', async overload => {
  record.content.routeResearch = { status: 'pending', physicalVerification: 'pending', walkingNavigation: 'pending', proposal: structuredClone(overload ? signalOverloadRouteProposal : signalClujRouteProposal), unknown: { preserve: true } }
  if (overload) record.content.displayName = 'Signal Overload - Cluj Napoca'
  record.content.starterSource = { key: 'signal-cluj-napoca', version: 1, checkpointsSha256: 'original' }
  record.content.fictionalNavigation = { scope: 'puzzle-only', active: false }
  for (const checkpoint of record.content.checkpoints as Record<string, unknown>[]) {
    checkpoint.personalChallenge = { question: 'Saved personal puzzle', answer: '42', hints: ['Personal hint'], solution: 'Personal solution' }
    checkpoint.teamChallenge = { question: 'Saved team puzzle', answer: 'SIGNAL', hints: ['Team hint'], solution: 'Team solution' }
  }
  if (overload) {
    const stages = ['ACCESS', 'TRACE', 'IDENTIFY', 'REPAIR', 'DECODE', 'LOCATE', 'RESTORE']
    record.content.checkpoints.forEach((entry, index) => Object.assign(entry as object, { storyStage: stages[index], teamRevelation: `Backend revelation ${index}`, nextDestination: `Backend destination ${index}` }))
  }
  const originalContent = structuredClone(record.content)
  const original = structuredClone(record.content.checkpoints)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(map.props).toMatchObject({ initialLatitude: 46.7712, initialLongitude: 23.6236, initialZoom: 14 })
  expect(container.querySelectorAll('[data-checkpoint]:not([data-checkpoint="F"])')).toHaveLength(6)
  expect(container.querySelector('[data-checkpoint="F"]')).not.toBeNull()
  expect(container.querySelectorAll('[aria-label="Ordered route candidates"] > li')).toHaveLength(0)
  await act(async () => container.querySelector<HTMLButtonElement>('[data-checkpoint="6"]')!.click())
  expect(map.props.cameraTarget).toBeUndefined()
  expect(map.props.positionPins.filter((point: any) => point.status !== 'reference')).toHaveLength(0)
  expect(api.createVersion).not.toHaveBeenCalled()
  for (let number = 1; number <= 6; number++) {
    await act(async () => (container.querySelector(`[data-checkpoint="${number}"]`) as HTMLButtonElement).click())
    await act(async () => map.props.onMapClick(46.7 + number / 1000, 23.6 + number / 1000))
    const card = container.querySelector('[aria-label="Selected checkpoint inspector"]')!
    await click('Edit')
    await inputValue(card.querySelector('input')!, `Real place ${number}`)
    await inputValue(card.querySelector('input[type="number"][max="500"]')!, '25')
    await click('Save changes')
    await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'Confirm position')!.click())
    expect(map.props.positionPins.every((point: any) => !point.selected)).toBe(true)
    await act(async () => container.querySelector<HTMLButtonElement>(`[data-checkpoint="${number}"]`)!.click())
    await act(async () => map.props.onMapClick(48, 25))
    await click('Undo')
    expect(map.props.positionPins.find((point: any) => point.checkpointNumber === number)).toMatchObject({ latitude: 46.7 + number / 1000, longitude: 23.6 + number / 1000, status: 'confirmed' })
    await click('Redo')
    expect(map.props.positionPins.find((point: any) => point.checkpointNumber === number).status).toBe('edited')
    await click('Undo')
    expect(map.props.positionPins.find((point: any) => point.checkpointNumber === number)?.name).toBe(`Real place ${number}`)
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
  expect(record.content.configuration.finishPoint).toEqual({ name: 'Real finish', latitude: 46.8, longitude: 23.7, radiusMeters: 15 })
  expect(record.content.checkpoints).toEqual(original)
  for (const key of ['mission', 'scoring', 'fictionalNavigation', 'starterSource', 'routeResearch']) expect(record.content[key]).toEqual(originalContent[key])
  expect(record.version).toBe(2)
  await act(async () => root.unmount()); root = createRoot(container)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(container.querySelectorAll('[aria-label="Ordered route candidates"] > li')).toHaveLength(0)
  await act(async () => container.querySelector<HTMLButtonElement>('[data-checkpoint="6"]')!.click())
  expect(map.props.positionPins.find((point: any) => point.checkpointNumber === 6)).toMatchObject({ name: 'Real place 6', selected: true })
  expect(map.props.positionPins).toHaveLength(7)
  expect(map.props.positionPins.every((point: any) => point.status === 'edited')).toBe(true)
  expect(map.props.positionPins[5].name).toBe('Real place 6')
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


test('hydration prefills seven research names and draft save cannot promote reference coordinates or name-only FinishPoint', async () => {
  record.content.routeResearch = { proposal: structuredClone(signalClujRouteProposal) }
  const original = structuredClone(record.content)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  const cards = [...container.querySelectorAll('[data-checkpoint] strong')]
  expect(cards.map(card => card.textContent)).toEqual(signalClujRouteProposal.candidates.map((candidate, index) => `${index === 6 ? 'FinishPoint' : `CP${index + 1}`} · ${candidate.landmark}`))
  expect(map.props.positionPins.map((point: any) => point.checkpointNumber)).toEqual([1, 2, 3, 4, 5, 6, 0])
  expect(map.props.positionPins.filter((point: any) => point.status !== 'reference')).toHaveLength(0)
  expect(map.props.finishPoint).toBeUndefined()
  await act(async () => map.props.onCheckpointSelect(6))
  expect(container.querySelector('[data-checkpoint="6"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(map.props.positionPins.filter((point: any) => point.status !== 'reference')).toHaveLength(0)
  await click('Save draft')
  expect(record.content.configuration.checkpointPositions).toEqual([])
  expect(record.content.configuration.finishPoint).toBeUndefined()
  expect(record.content.routeResearch).toEqual(original.routeResearch)
  expect(record.content.checkpoints).toEqual(original.checkpoints)
  expect(original.configuration.checkpointPositions).toEqual([])
  expect(api.submit).not.toHaveBeenCalled()
})


test('Overload is a distinct starter choice and opens its own returned draft', async () => {
  api.createStarterDraft.mockResolvedValue({ ...record, key: 'overload-owned' })
  await render(<MemoryRouter initialEntries={['/creator']}><Routes><Route path="/creator" element={<CreatorStudioPage />} /><Route path="/create" element={<Location />} /></Routes></MemoryRouter>)
  await click('Create Template'); await click('Start from Template')
  expect(container.textContent).toContain('Signal: Cluj Napoca')
  await click('Signal Overload - Cluj Napoca')
  expect(api.createStarterDraft).toHaveBeenCalledTimes(1)
  expect(api.createStarterDraft.mock.calls[0][0].key).toBe('signal-overload-cluj-napoca')
  expect(container.textContent).toContain('?template=overload-owned')
  expect(api.submit).not.toHaveBeenCalled()
})

test('unavailable Overload reports an error without invoking original Signal', async () => {
  api.createStarterDraft.mockRejectedValue(new ApiError('Missing', 404, 'http'))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template'); await click('Start from Template'); await click('Signal Overload - Cluj Napoca')
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('starter is unavailable')
  expect(api.createStarterDraft.mock.calls[0][0].key).toBe('signal-overload-cluj-napoca')
})

test('Overload shared map editor exposes reversed seven pins and separate F, and backend story preview', async () => {
  record.content.displayName = 'Signal Overload - Cluj Napoca'
  record.content.routeResearch = { proposal: signalOverloadRouteProposal }
  ;(record.content.checkpoints[0] as any).teamRevelation = 'Backend ACCESS revelation'
  ;(record.content.checkpoints[0] as any).nextDestination = { landmark: 'Backend next destination' }
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(map.props.positionPins).toHaveLength(7)
  expect(map.props.positionPins.map((point: any) => point.checkpointNumber)).toEqual([1, 2, 3, 4, 5, 6, 0])
  expect(map.props.positionPins[0].name).toContain('Tailors')
  expect(map.props.positionPins[6].name).toContain('Matthias')
  expect(map.props.positionPins.filter((point: any) => point.status !== 'reference')).toHaveLength(0)
  expect(map.props.finishPoint).toBeUndefined()
  expect(map.props.proposedSequence).toBeUndefined()
  expect(map.props.routeOverview).toBeUndefined()
  await feature('Personal Challenge')
  expect(container.querySelector('[aria-label="Checkpoint story preview"]')?.textContent).toContain('Backend ACCESS revelation')
  expect(container.textContent).toContain('Backend next destination')
})

test('catalog loading, error retry and empty states preserve navigation without fallback', async () => {
  let reject!: (reason: Error) => void
  api.listStarters.mockReturnValueOnce(new Promise((_, fail) => { reject = fail })).mockResolvedValueOnce({ items: [] })
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template'); await click('Start from Template')
  expect(container.querySelector('[role="status"]')?.textContent).toBe('Loading starter Templates…')
  expect(container.textContent).not.toContain('Signal: Cluj Napoca')
  await act(async () => reject(new Error('404')))
  expect(container.querySelector('dialog [role="alert"]')?.textContent).toContain('catalog may not be available yet')
  await click('Retry')
  expect(api.listStarters).toHaveBeenCalledTimes(2)
  expect(container.textContent).toContain('No starter Templates available.')
  await click('Back'); expect(container.textContent).toContain('Start from scratch')
  await click('Close'); expect(container.querySelector('dialog')).toBeNull()
})

test('backend names, descriptions, dates and order render inside selectable rows', async () => {
  const items = [
    { key: 'signal-cluj-napoca', displayName: 'Backend first', description: 'First description', createdAt: null, creationPath: '/api/creator/templates/starters/signal-cluj-napoca' },
    { key: 'signal-overload-cluj-napoca', displayName: 'Backend second', description: 'Second description', createdAt: '2026-10-12T00:00:00Z', creationPath: '/api/creator/templates/starters/signal-overload-cluj-napoca' },
    { key: 'unknown', displayName: 'Unknown', description: 'Unsupported', createdAt: 'invalid', creationPath: 'https://evil.test' },
  ]
  api.listStarters.mockResolvedValue({ items })
  api.createStarterDraft.mockReturnValue(new Promise(() => {}))
  await render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)
  await click('Create Template'); await click('Start from Template')
  const rows = [...container.querySelectorAll<HTMLButtonElement>('dialog li button')]
  expect(rows.map(row => row.querySelector('.font-bold')?.textContent)).toEqual(items.map(item => item.displayName))
  expect(rows.map(row => row.children[1].textContent)).toEqual(['-', '12 Oct 2026', '-'])
  expect(rows[0].textContent).toContain('First description')
  expect(rows[2].disabled).toBe(true)
  await act(async () => { rows[1].click(); rows[1].click() })
  expect(api.createStarterDraft).toHaveBeenCalledExactlyOnceWith(items[1])
})


test('resetting saved checkpoint and FinishPoint geography saves an incomplete draft without promoting references', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  record.content.routeResearch = { proposal: structuredClone(signalClujRouteProposal) }
  record.content.configuration.checkpointPositions = [{ checkpointNumber: 1, name: 'Custom arrival', latitude: 47, longitude: 24, radiusMeters: 31 }]
  record.content.configuration.finishPoint = { name: 'Custom finish', latitude: 48, longitude: 25, radiusMeters: 17 }
  const original = structuredClone(record.content)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  await click('Confirm position')
  await act(async () => container.querySelector<HTMLButtonElement>('[data-checkpoint="1"]')!.click())
  await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'Reset position')!.click())
  expect(map.props.positionPins[0].status).toBe('reference')
  expect(map.props.positionPins[0].name).toBe('Custom arrival')
  await act(async () => container.querySelector<HTMLButtonElement>('[data-checkpoint="F"]')!.click())
  await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'Reset position')!.click())
  expect(map.props.positionPins[6].name).toBe('Custom finish')
  expect(api.createVersion).not.toHaveBeenCalled()
  await click('Save draft')
  expect(api.createVersion).toHaveBeenCalledOnce()
  expect(record.content.configuration.checkpointPositions).toEqual([])
  expect(record.content.configuration.finishPoint).toBeUndefined()
  expect(record.content.routeResearch).toEqual(original.routeResearch)
  expect(record.content.checkpoints).toEqual(original.checkpoints)
})


test('Feature 2 keeps the standard nine-feature navigation and shell', async () => {
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  const editor = container.querySelector('[aria-label="Checkpoint position editor"]')!
  const article = editor.closest('article')!
  const navigation = article.previousElementSibling!
  expect(navigation.tagName).toBe('NAV')
  expect(navigation.querySelectorAll('button')).toHaveLength(9)
  expect(navigation.querySelector('button.border-emerald-500')!.textContent).toContain('Checkpoint Positions')
  expect(container.querySelector('.position-feature-navigation')).toBeNull()
  expect(container.querySelector('.max-w-6xl')).not.toBeNull()
  await feature('Personal Challenge')
  expect(container.querySelector('[aria-label="Checkpoint position editor"]')).toBeNull()
  expect(container.querySelector('.max-w-6xl')).not.toBeNull()
})

test('arrival notes edit existing research metadata and survive save/reopen', async () => {
  record.content.routeResearch = { proposal: structuredClone(signalClujRouteProposal), unknown: { preserve: true } }
  const research = structuredClone(record.content.routeResearch)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  await click('Edit')
  const notes = container.querySelector<HTMLTextAreaElement>('.position-inspector textarea')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(notes, 'Inspect the public standing area')
    notes.dispatchEvent(new Event('input', { bubbles: true }))
  })
  expect(api.createVersion).not.toHaveBeenCalled()
  await click('Save changes')
  await click('Save draft')
  expect((record.content.routeResearch as any).proposal.candidates[0].arrivalArea).toBe('Inspect the public standing area')
  expect((record.content.routeResearch as any).proposal.sources).toEqual((research as any).proposal.sources)
  await act(async () => root.unmount()); root = createRoot(container)
  await render(<MemoryRouter initialEntries={['/create?template=signal-cluj-new']}><CreatorTemplateEditorPage /></MemoryRouter>)
  await feature('Checkpoint Positions')
  expect(container.querySelector('.position-values')!.textContent).toContain('Inspect the public standing area')
})
