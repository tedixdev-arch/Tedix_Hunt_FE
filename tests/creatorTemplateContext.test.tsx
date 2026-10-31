import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorStudioPage } from '../src/pages/CreatorStudio'
import { ApiError } from '../src/services/api/client'
import { projection } from './fixtures/creatorTemplateProjections'

const api = vi.hoisted(() => ({ list: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  api.list.mockResolvedValue([])
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const render = async () => { await act(async () => root.render(<MemoryRouter><CreatorStudioPage /></MemoryRouter>)) }
const cards = () => [...container.querySelectorAll('[aria-label="Creator Templates"] article')]
const retry = async () => { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent === 'Retry')!.click()) }

test.each(['universal', 'local', null, undefined] as const)('explicit category %s never derives from Signal, city or geography', async category => {
  api.list.mockResolvedValue([projection(category)])
  await render()
  expect(cards()[0].textContent).toContain(`Type: ${category === 'universal' ? 'Universal' : category === 'local' ? 'Local' : category === null ? 'Legacy' : 'Unavailable'}`)
  expect(cards()[0].textContent).not.toContain('undefined checkpoints')
  expect(cards()[0].querySelector('a')?.getAttribute('href')).toBe(`/create?template=${category ?? 'legacy'}-draft`)
})

test.each([['draft', 'Draft'], ['submitted', 'Submitted'], ['changes_requested', 'Changes requested'], ['approved', 'Approved']] as const)('%s candidate remains separate from exact Local v1 approval', async (status, label) => {
  api.list.mockResolvedValue([projection('local', status, 3)])
  await render()
  expect(cards()[0].textContent).toContain(`Current candidate: ${label} · Version 3`)
  expect(cards()[0].textContent).toContain('Retained Local approval: Approved · Version 1')
  expect(cards()[0].textContent).toContain('Local suspension: None recorded.')
  expect(cards()[0].querySelector('a')?.textContent).toBe(['approved', 'changes_requested'].includes(status) ? 'Revise' : status === 'draft' ? 'Edit template' : 'View template')
})

test.each(['draft', 'submitted', 'changes_requested', 'approved'] as const)('Universal %s keeps older publication separate from candidate and review', async status => {
  const record = projection('universal', status, 4); record.submittedVersion = status === 'draft' ? null : 3; record.publishedVersion = 1
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Version 4')
  expect(cards()[0].textContent).toContain('Publication: Published version 1.')
  expect(cards()[0].textContent).not.toContain('Published version 4')
  expect(cards()[0].textContent).not.toContain('Published version 3')
  if (status !== 'draft') expect(cards()[0].textContent).toContain('Submitted for review: Version 3')
})

test('Universal draft v2 retains exact published v1', async () => {
  const record = projection('universal', 'draft', 2); record.publishedVersion = 1
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Current candidate: Draft · Version 2')
  expect(cards()[0].textContent).toContain('Publication: Published version 1.')
  expect(cards()[0].textContent).not.toContain('Submitted for review:')
})

test.each(['draft', 'submitted', 'changes_requested', 'approved'] as const)('Universal %s null publication means never published despite candidate status', async status => {
  const record = projection('universal', status, 3); record.publishedVersion = null
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Publication: Not yet published.')
  expect(cards()[0].textContent).not.toContain('Published version')
  expect(cards()[0].textContent).not.toContain('Submitted for review:')
})

test('missing Universal projection is unavailable, never inferred from approved candidate/submission', async () => {
  const record = projection('universal', 'approved', 4); record.submittedVersion = 3; delete record.publishedVersion
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Submitted for review: Version 3')
  expect(cards()[0].textContent).toContain('Publication: Publication information unavailable.')
  expect(cards()[0].textContent).not.toContain('Not yet published')
  expect(cards()[0].textContent).not.toContain('Published version')
})

test.each(['local', null] as const)('publication display does not change %s category behavior', async category => {
  const record = projection(category, 'approved'); record.publishedVersion = 99
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).not.toContain('Publication:')
  expect(cards()[0].textContent).not.toContain('Published version 99')
})

test('suspension of prior authority remains visible after a replacement approval', async () => {
  const record = projection('local', 'approved', 3)
  record.localApproval!.version = 3; record.localApprovedVersion = 3
  record.localSuspension = { version: 1, at: '2026-10-29T00:00:00Z', byUserId: 'private-admin', reason: '<unsafe route>' }
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Retained Local approval: Approved · Version 3')
  expect(cards()[0].textContent).toContain('Suspended · Version 1 — <unsafe route>')
  expect(cards()[0].textContent).not.toContain('private-admin')
  expect(cards()[0].querySelector('unsafe')).toBeNull()
})

test('integrity exceptions never fall back to latest or raw approval pointer', async () => {
  const record = projection('local', 'approved', 9)
  record.localApproval = { version: 999, authority: 'integrity_exception', independentEvidence: false, localityBound: false }
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Integrity restriction — approval version cannot be resolved.')
  expect([...cards()[0].querySelectorAll('dl > div')].find(row => row.textContent?.startsWith('Retained Local approval:'))?.textContent).not.toContain('Version 9')
})

test('historical authority states missing evidence and binding without claiming availability', async () => {
  const record = projection('local', 'approved')
  record.localApprovedVersion = null
  record.localApproval = { version: 1, authority: 'historical', independentEvidence: false, localityBound: false }
  api.list.mockResolvedValue([record]); await render()
  expect(cards()[0].textContent).toContain('Historical authority · Version 1')
  expect(cards()[0].textContent).toContain('Independent review evidence missing. Stored locality binding missing.')
})

test('missing optional Local projections remain unknown; explicit none is distinguished', async () => {
  const missing = projection('local'); delete missing.localApproval; delete missing.localSuspension; delete missing.localApprovedVersion
  const none = projection('local'); none.key = 'no-authority'; none.localApprovedVersion = null
  none.localApproval = { version: null, authority: 'none', independentEvidence: false, localityBound: false }
  api.list.mockResolvedValue([missing, none]); await render()
  expect(cards()[0].textContent).toContain('Retained Local approval: Context unavailable.')
  expect(cards()[0].textContent).toContain('Local suspension: Context unavailable.')
  expect(cards()[1].textContent).toContain('Retained Local approval: None.')
})

test('loading, empty and failed list are distinct; retry recovers', async () => {
  let resolve!: (value: []) => void
  api.list.mockReturnValueOnce(new Promise(done => { resolve = done }))
  await render(); expect(container.textContent).toContain('Loading Creator Templates…')
  expect(container.textContent).not.toContain('No templates yet.')
  await act(async () => resolve([])); expect(container.textContent).toContain('No templates yet.')
})

test.each([[401, 'sign in again'], [403, 'not authorized'], [404, 'could not be found'], [400, 'could not be loaded'], [409, 'could not be loaded'], [500, 'Failure']] as const)('list error %s is private, retryable and has no false empty result', async (status, message) => {
  api.list.mockRejectedValueOnce(new ApiError('Failure', status, 'http'))
  await render()
  expect(container.querySelector('[role="alert"]')?.textContent).toContain(message)
  expect(cards()).toHaveLength(0); expect(container.textContent).not.toContain('No templates yet.')
  api.list.mockResolvedValue([projection('local')]); await retry(); expect(cards()).toHaveLength(1)
})

test('late responses cannot restore private approval context after a revoked request', async () => {
  let resolve!: (value: ReturnType<typeof projection>[]) => void
  api.list.mockRejectedValueOnce(new ApiError('Failure', 500, 'http'))
    .mockReturnValueOnce(new Promise(done => { resolve = done }))
    .mockRejectedValueOnce(new ApiError('Revoked', 403, 'http'))
  await render()
  const button = [...container.querySelectorAll('button')].find(b => b.textContent === 'Retry')!
  await act(async () => { button.click(); button.click() })
  expect(container.textContent).toContain('not authorized')
  await act(async () => resolve([projection('local')]))
  expect(cards()).toHaveLength(0); expect(container.textContent).not.toContain('Retained Local approval')
})
