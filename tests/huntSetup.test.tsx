import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { CreatorTemplateEditorPage } from '../src/pages/CreatorStudio'
const api = vi.hoisted(() => ({ create: vi.fn(), createVersion: vi.fn(), get: vi.fn(), submit: vi.fn() }))
const map = vi.hoisted(() => ({ props: null as any }))
const geo = vi.hoisted(() => ({ countries: vi.fn(), search: vi.fn(), get: vi.fn(), regions: vi.fn(), cities: vi.fn(), resolveCity: vi.fn() }))
vi.mock('../src/services/api/creatorTemplates', async original => ({ ...await original<typeof import('../src/services/api/creatorTemplates')>(), creatorTemplatesApi: api }))
vi.mock('../src/services/api/geography', () => ({ geographyApi: geo }))
vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <div /> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: (props: any) => { map.props = props; return <div data-testid="actual-route-map" /> } }))
const city = { id: '11111111-1111-4111-8111-111111111111', name: 'Paris', countryCode: 'FR', countryDisplayName: 'France', administrativeContext: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, active: true }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubEnv('VITE_DEPLOYMENT_ENVIRONMENT', 'development'); vi.stubEnv('VITE_API_BASE_URL', 'https://tedixhunt-be-dev.anainfo.ai')
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  geo.countries.mockResolvedValue({ countries: [{ code: 'FR', displayName: 'France' }, { code: 'DE', displayName: 'Germany' }] }); geo.search.mockResolvedValue({ localities: [city, city] }); geo.get.mockResolvedValue(city)
  geo.regions.mockImplementation(async countryCode => ({ regions: [{ countryCode, admin1Code: '11', displayName: 'Île-de-France' }], regionLabel: 'State / Region', metadataStatus: 'ready', nextAfter: null })); geo.cities.mockResolvedValue({ cities: [{ ...city, geographicId: '123', admin1Code: '11', regionDisplayName: 'Île-de-France', regionStatus: 'resolved', localityId: city.id }], nextAfter: null }); geo.resolveCity.mockResolvedValue({ geographicId: '123', localityId: city.id, registeredActive: true, nextAction: 'bind_locality' })
  api.create.mockImplementation(async (content, category, localityId) => ({ key: content.key, version: 1, status: 'draft', category, content, localityId, localitySnapshot: localityId ? city : null }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })
async function render(url = '/create?category=local') { await act(async () => root.render(<MemoryRouter initialEntries={[url]}><CreatorTemplateEditorPage /></MemoryRouter>)) }
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!
async function click(text: string) { await act(async () => button(text).click()) }
async function change(selector: string, value: string) { await act(async () => { const el = container.querySelector(selector)!; Object.getOwnPropertyDescriptor(el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(el,value); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) }) }
function record(category: 'local' | 'universal' | undefined = 'local', positioned = false): any { return { key: 'owned', version: 1, status: 'draft', category, content: { key: 'owned', version: 1, displayName: 'Adventure', theme: 'Mixed', mission: { name: 'Our story' }, configuration: { normalCheckpointCount: 1, checkpointPositions: positioned ? [{ checkpointNumber: 1, name: 'Museum', latitude: 48.8, longitude: 2.3, radiusMeters: 15 }] : [] }, scoring: { model: 'platform' }, checkpoints: [{ checkpoint: 1 }, { role: 'terminal' }] } } }

test('prototype opens builder immediately without any geography call or persistence', async () => {
  await render()
  expect([...container.querySelectorAll('#local-geography select')].map(el => (el as HTMLSelectElement).value)).toEqual(['Romania', 'Cluj', 'Cluj-Napoca'])
  await click('Continue to Template builder')
  expect(container.querySelector<HTMLFieldSetElement>('[aria-label="Template builder"]')!.disabled).toBe(false)
  expect(document.activeElement?.id).toBe('template-setup-heading')
  for (const call of Object.values(geo)) expect(call).not.toHaveBeenCalled()
  expect(api.create).not.toHaveBeenCalled()
  expect(container.querySelector('#checkpoint-positions')).toBeNull()
})
test('prototype labels never supply locality authority on save', async () => {
  await render(); await click('Continue to Template builder'); await change('#template-setup input', 'Cluj adventure'); await click('Save draft')
  expect(api.create).toHaveBeenCalledWith(expect.anything(), 'local')
  expect(JSON.stringify(api.create.mock.calls)).not.toContain('localitySnapshot')
})
test('saved draft content and canonical locality survive prototype continuation', async () => {
  const saved = { ...record('local', true), localityId: city.id, localitySnapshot: city }
  api.get.mockResolvedValue(saved)
  api.createVersion.mockImplementation(async (_, content) => ({ ...saved, version: 2, content }))
  await render('/create?template=owned'); await click('Continue to Template builder'); await change('#template-setup input', 'Edited adventure'); await click('Save draft')
  expect(api.createVersion.mock.calls[0][2]).toBeUndefined()
  expect(api.createVersion.mock.calls[0][1].configuration.checkpointPositions).toEqual(saved.content.configuration.checkpointPositions)
  expect(saved.localityId).toBe(city.id)
})
test('Universal continues without location selectors', async () => {
  await render('/create?category=universal'); await click('Continue to Template builder')
  expect(container.querySelectorAll('#local-geography select')).toHaveLength(0)
  for (const call of Object.values(geo)) expect(call).not.toHaveBeenCalled()
})

async function selectCity() { await click('Continue to Template builder') }

test('Universal needs no locality or educational controls and fresh drafts omit educational metadata', async () => {
  await render('/create?category=universal'); expect(container.querySelector('#local-geography input')).toBeNull(); expect(geo.countries).not.toHaveBeenCalled()
  await click('Continue to Template builder'); expect(container.textContent).not.toContain('Choose a country and city to continue.')
  expect(container.querySelectorAll('#local-geography select')).toHaveLength(0)
  expect(container.textContent).not.toMatch(/Curriculum|Grade/)
  await change('#template-setup input','Anywhere adventure'); await click('Save draft')
  const [content, category, localityId] = api.create.mock.calls[0]; expect(category).toBe('universal'); expect(localityId).toBeUndefined(); expect(content.configuration).not.toHaveProperty('curriculum'); expect(content.configuration).not.toHaveProperty('grade')
})
test('legacy templates retain existing flow and content without locality migration', async () => {
  const saved = record(undefined,true); delete saved.category; api.get.mockResolvedValue(saved)
  await render('/create?template=owned'); expect(container.querySelector('#hunt-setup-heading')).toBeNull(); expect(container.querySelector('#checkpoint-positions')).not.toBeNull(); expect(api.createVersion).not.toHaveBeenCalled(); expect(saved.localityId).toBeUndefined(); expect(saved.content.configuration.checkpointPositions[0]).toMatchObject({ latitude: 48.8, longitude: 2.3 })
})

function builder() { return container.querySelector<HTMLFieldSetElement>('[aria-label="Template builder"]')! }
test('existing Local saved locality unlocks editing without Continue even if registry lookup fails', async () => {
  api.get.mockResolvedValue({ ...record(), localityId:city.id, localitySnapshot:city }); geo.countries.mockRejectedValue(new Error('offline')); geo.get.mockRejectedValue(new Error('offline'))
  await render('/create?template=owned'); expect(builder().hidden).toBe(false); expect(builder().disabled).toBe(false); expect(button('Save draft').matches(':disabled')).toBe(false); expect(container.querySelector('#checkpoint-positions')).not.toBeNull()
  await change('#template-setup input','Saved draft remains editable'); expect((container.querySelector('#template-setup input') as HTMLInputElement).value).toBe('Saved draft remains editable')
})
test('saved Local missing locality stays editable during registry failure but cannot position checkpoints', async () => {
  api.get.mockResolvedValue(record()); geo.countries.mockRejectedValue(new Error('offline'))
  await render('/create?template=owned'); expect(builder().disabled).toBe(false); expect(builder().hidden).toBe(false); expect(button('Save draft').matches(':disabled')).toBe(false); expect(container.querySelector('#checkpoint-positions')).toBeNull()
  await click('Continue to Template builder'); expect(container.querySelector('#checkpoint-positions')).toBeNull(); expect(builder().disabled).toBe(false)
})
test('development preset preserves saved locality snapshots and never rebinds a draft', async () => {
  vi.stubEnv('VITE_DEVELOPMENT_LOCATION_PRESET', 'cluj')
  api.get.mockResolvedValue({ ...record(), localityId: city.id, localitySnapshot: city })
  await render('/create?template=owned')
  expect(geo.search).not.toHaveBeenCalled(); expect(container.querySelector<HTMLSelectElement>('[aria-label="City"]')!.value).toBe('Cluj-Napoca')
  await change('#template-setup input', 'Preserved Paris draft'); await click('Save draft'); expect(api.createVersion.mock.calls[0][2]).toBeUndefined()
})

for (const category of ['universal', 'local', undefined] as const) {
  test.each([
    { curriculum: 'math', grade: '10' },
    { curriculum: ' legacy / unknown ', grade: 'pre-school-v0' },
    { curriculum: { legacy: ['unmapped', 7] }, grade: null },
    {},
  ])(`${category ?? 'legacy'} preserves educational values and absence through save, reopen and revision: %j`, async education => {
    const original = record(category)
    if (category === undefined) delete original.category
    Object.assign(original.content.configuration, education, { legacyExtra: { keep: ['untouched'] } })
    if (category === 'local') Object.assign(original, { localityId: city.id, localitySnapshot: city })
    const untouched = structuredClone(original)
    let server = structuredClone(original)
    api.get.mockImplementation(async () => structuredClone(server))
    api.createVersion.mockImplementation(async (_key, content) => {
      server = { ...server, status: 'draft', version: content.version, content: structuredClone(content) }
      return structuredClone(server)
    })
    const preserved = (configuration: any) => {
      for (const key of ['curriculum', 'grade'] as const) {
        expect(Object.hasOwn(configuration, key)).toBe(Object.hasOwn(education, key))
        expect(configuration[key]).toEqual((education as any)[key])
      }
      expect(configuration.legacyExtra).toEqual(untouched.content.configuration.legacyExtra)
      expect(configuration.checkpointPositions).toEqual(untouched.content.configuration.checkpointPositions)
    }
    await render('/create?template=owned')
    expect(container.textContent).not.toMatch(/Curriculum|Grade/)
    await change('#template-setup input', 'Unrelated title edit'); await click('Save draft')
    expect(api.createVersion).toHaveBeenCalledTimes(1)
    preserved(api.createVersion.mock.calls[0][1].configuration)
    expect(server.content.displayName).toBe('Unrelated title edit')
    await act(async () => root.render(null))
    await render('/create?template=owned')
    expect(container.querySelector<HTMLInputElement>('#template-setup input')!.value).toBe('Unrelated title edit')
    if (category) {
      // Reopen an approved immutable version and create a separately reviewed draft.
      server.status = 'approved'
      if (category === 'local') server.localApproval = { independentEvidence: true, authority: 'approved', version: server.version }
      await act(async () => root.render(null))
      await render('/create?template=owned')
    }
    const previous = structuredClone(server)
    await change('#template-setup input', 'Next revision title'); await click('Save draft')
    expect(api.createVersion).toHaveBeenCalledTimes(2)
    expect(api.createVersion.mock.calls[1][1].version).toBe(previous.version + 1)
    expect(api.createVersion.mock.calls[1][2]).toBeUndefined()
    preserved(api.createVersion.mock.calls[1][1].configuration)
    preserved(previous.content.configuration)
    expect(server.localityId).toBe(original.localityId)
    expect(server.localitySnapshot).toEqual(original.localitySnapshot)
    expect(original).toEqual(untouched)
  })
}

const editor = (label: string) => [...container.querySelectorAll('label')].find(node => [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).map(child => child.textContent).join('') === label)?.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | undefined
async function edit(label: string, value: string) {
  await act(async () => {
    const node = editor(label)!
    Object.getOwnPropertyDescriptor(node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(node, value)
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
for (const category of ['universal', 'local', undefined] as const) {
  test(`${category ?? 'legacy'} has one Description editor; summary, Mission and Briefing round-trip independently`, async () => {
    let server = record(category)
    if (!category) delete server.category
    if (category === 'local') Object.assign(server, { localityId: city.id, localitySnapshot: city })
    server.content.configuration.summary = '  Existing description\nwith spacing  '
    server.content.configuration.briefing = 'Participant briefing, separate'
    server.content.mission = { name: 'Independent story', briefing: 'Mission briefing, separate' }
    const original = structuredClone(server)
    api.get.mockImplementation(async () => structuredClone(server))
    api.createVersion.mockImplementation(async (_key, content) => {
      server = { ...server, version: content.version, content: structuredClone(content) }
      return structuredClone(server)
    })
    await render('/create?template=owned')
    expect([...container.querySelectorAll('label')].filter(node => node.firstChild?.textContent === 'Description')).toHaveLength(1)
    expect(editor('Description')!.value).toBe(original.content.configuration.summary)
    expect(editor('Short description')).toBeUndefined()
    await edit('Template name', 'Unrelated title'); await click('Save draft')
    expect(server.content.configuration.summary).toBe(original.content.configuration.summary)
    await act(async () => root.render(null)); await render('/create?template=owned')
    expect(editor('Description')!.value).toBe(original.content.configuration.summary)
    await edit('Description', 'Edited description')
    await click('Continue'); await click('Continue')
    expect(editor('Hunt mission')).toBeUndefined(); expect(editor('Description')).toBeUndefined()
    expect(editor('Mission briefing')!.value).toBe('Mission briefing, separate')
    expect(editor('Participant briefing')!.value).toBe('Participant briefing, separate')
    await edit('Mission briefing', 'Edited mission briefing')
    await edit('Participant briefing', 'Edited participant briefing')
    // Navigation has not persisted any of these changes.
    expect(api.createVersion).toHaveBeenCalledTimes(1)
    expect(container.textContent).not.toContain('Save & continue')
    expect(button('Submit for Approval').disabled).toBe(true)
    await click('Save draft')
    expect(api.createVersion).toHaveBeenCalledTimes(2)
    expect(server.content.configuration.summary).toBe('Edited description')
    expect(server.content.configuration.briefing).toBe('Edited participant briefing')
    expect(server.content.mission).toEqual({ name: 'Independent story', briefing: 'Edited mission briefing' })
    expect(original.content.configuration.summary).toBe('  Existing description\nwith spacing  ')
    await act(async () => root.render(null)); await render('/create?template=owned')
    expect(editor('Description')!.value).toBe('Edited description')
  })
}

test.each(['Personal Challenge', 'Team Challenge'])('%s Apply challenge updates only working content and keeps Save draft separate', async name => {
  await render('/create?category=universal'); await click('Continue to Template builder')
  const feature = [...container.querySelectorAll<HTMLButtonElement>('nav[aria-label="Hunt Features"] button')].find(node => node.textContent?.includes(name))!
  await act(async () => feature.click())
  await click('Create Your Own'); await click('Apply challenge')
  expect(container.querySelector('[aria-label="Selected exercise assignment"]')!.textContent).toBe(name === 'Team Challenge' ? 'Custom Team Challenge assigned' : 'Custom challenge assigned · Save draft to keep your changes')
  expect(button('Save draft')).toBeDefined()
  expect(api.create).not.toHaveBeenCalled(); expect(api.createVersion).not.toHaveBeenCalled(); expect(api.submit).not.toHaveBeenCalled()
})
