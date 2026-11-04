import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ContentPicker } from '../src/features/creator/content/ContentPicker'
import { ContentSelection } from '../src/features/creator/content/ContentSelection'
import { ContentStudio } from '../src/features/creator/content/ContentStudio'
import { initialFilters, starterContent, type ContentRecord } from '../src/features/creator/content/catalog'
import { PersonalChallengeAuthoring } from '../src/features/creator/exercises/PersonalChallengeAuthoring'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
import { applyExerciseDrafts } from '../src/features/creator/exercises/templateExercises'
vi.mock('../src/features/creator/content/catalog', async original => {
  const catalog = await original<typeof import('../src/features/creator/content/catalog')>()
  const source = catalog.starterContent[0]
  const second = { ...source, id: 'fixture-second-record', exercise: { ...structuredClone(source.exercise), id: 'fixture-second-exercise', title: 'Another pair exercise', instructions: 'Different source question' } }
  return { ...catalog, starterContent: [...catalog.starterContent, second] }
})
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }) } }))
let container: HTMLDivElement, root: Root, router: ReturnType<typeof createMemoryRouter>
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open') } })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); router?.dispose(); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function mount(element: React.ReactNode) { router = createMemoryRouter([{ path: '/', element }]); await act(async () => root.render(<RouterProvider router={router} />)) }
const button = (label: string) => [...container.querySelectorAll('button')].find(b => b.textContent === label || b.getAttribute('aria-label') === label)!
async function click(label: string) { expect(button(label), label).toBeDefined(); await act(async () => button(label).click()) }
async function change(label: string, value: string) {
  if (!container.querySelector(`[aria-label="${label}"]`)) {
    const pencil = [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.getAttribute('aria-label') === `Edit ${label}`)
    if (pencil) await act(async () => pencil.click())
  }
  const node = container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement | HTMLTextAreaElement
  await act(async () => { Object.getOwnPropertyDescriptor(node instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLTextAreaElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event(node instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true })) })
}
const duplicate: ContentRecord = { ...starterContent[0], id: 'fixture-second-record', exercise: { ...structuredClone(starterContent[0].exercise), id: 'fixture-second-exercise', title: 'Another pair exercise', instructions: 'Different source question' } }
test('picker selects distinct records of the same mechanic, searches instructions and previews without assignment', async () => {
  const select = vi.fn()
  const items = [starterContent[0], duplicate]
  await mount(<ContentPicker section="Personal Challenges" items={items} onSelect={select} />)
  await click('Try example: Another pair exercise')
  expect(select).toHaveBeenCalledWith(duplicate)
  expect(select.mock.calls[0][0].id).not.toBe(items[0].id)
  expect(container.textContent).not.toContain('Unclassified')
  await click('Preview Another pair exercise')
  expect(container.querySelector('dialog')?.textContent).toContain('Different source question')
  await click('Close exercise preview')
  const search = container.querySelector('input[type="search"]')!
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(search, 'Different source question'); search.dispatchEvent(new Event('input', { bubbles: true })) })
  expect(button(`Try example: ${items[0].exercise.title}`)).toBeUndefined()
  expect(button('Try example: Another pair exercise')).toBeDefined()
})
test('Template Predefined uses compact allocation and retains publication guard and custom draft across modes', async () => {
  let current: AuthoringDraft
  const mutate = vi.fn(), before = structuredClone(starterContent)
  function Harness() { const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' }); current = draft; return <PersonalChallengeAuthoring value={{}} draft={draft} onDraftChange={setDraft} onChange={mutate} /> }
  await mount(<Harness />)
  expect(container.querySelector('[aria-label="Content exercise picker"]')).toBeNull()
  expect(container.querySelector('[aria-label="Challenge allocation"]')).not.toBeNull()
  await change('Personal Challenge', starterContent[0].mechanic)
  expect(current!.exercise).toEqual(starterContent[0].exercise)
  expect(current!.exercise).not.toBe(starterContent[0].exercise)
  expect(button('Apply challenge')).toBeUndefined()
  expect(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': current! }).checkpoints[0].customExercises).toBeUndefined()
  await click('Create Your Own'); await change('Title', 'My independent draft')
  const draftId = current!.custom!.id
  await click('Predefined'); await click('Create Your Own')
  expect(current!.custom!.title).toBe('My independent draft'); expect(current!.custom!.id).toBe(draftId)
  expect(mutate).not.toHaveBeenCalled(); expect(starterContent).toEqual(before)
})
test('section switches retain drafts and never display a mismatched editor', async () => {
  await mount(<ContentStudio active />); await change('Title', 'Unsaved personal title')
  await click('Edit Card 1')
  const card = container.querySelector('[role="group"][aria-label="Edit Card 1"] textarea')!
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(card, 'Preserved pair card'); card.dispatchEvent(new Event('input', { bubbles: true })) })
  await click('Done'); await click('Complex / LaTeX'); await click('Edit with Preview')
  await change('Content type', 'Team Challenges')
  expect(container.querySelector('[aria-label="Team Challenge authoring"]')).not.toBeNull()
  expect(container.querySelector('[aria-label="Personal Challenge authoring"]')).toBeNull()
  await change('Content type', 'Navigation Hints')
  expect(container.querySelector('[aria-label="Library exercise draft"]')).toBeNull()
  await change('Content type', 'Personal Challenges')
  if (!container.querySelector('textarea[aria-label="Title"]')) await click('Edit Title'); expect((container.querySelector('[aria-label="Title"]') as HTMLTextAreaElement).value).toBe('Unsaved personal title')
  expect(container.textContent).toContain('Preserved pair card')
  await click('Discard session draft')
  if (!container.querySelector('textarea[aria-label="Title"]')) await click('Edit Title'); expect((container.querySelector('[aria-label="Title"]') as HTMLTextAreaElement).value).toBe('Unsaved personal title')
  vi.mocked(window.confirm).mockReturnValue(true); await click('Discard session draft')
  if (!container.querySelector('textarea[aria-label="Title"]')) await click('Edit Title'); expect((container.querySelector('[aria-label="Title"]') as HTMLTextAreaElement).value).not.toBe('Unsaved personal title')
})
test('Mathematics hierarchy is conditional, uses supplied associations and resets descendants', async () => {
  const items: ContentRecord[] = [{ ...starterContent[0], curriculum: [
    { category: 'Mathematics', grade: 5, main: 'Algebra', unitId: 'fixture-unit-a', lessonId: 'fixture-lesson-a' },
    { category: 'Mathematics', grade: 6, main: 'Geometry', unitId: 'fixture-unit-b', lessonId: 'fixture-lesson-b' },
  ] }]
  function Harness() { const [filters, setFilters] = useState(initialFilters); return <ContentSelection filters={filters} onChange={setFilters} items={items} /> }
  await mount(<Harness />)
  expect(container.querySelector('[aria-label="Grade"]')).toBeNull()
  await change('Content category', 'Mathematics')
  const select = (label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement
  expect([...select('Grade').options].map(o => o.value)).toEqual(['Mix', '5', '6'])
  expect(select('Main').disabled).toBe(true)
  await change('Grade', '5'); expect([...select('Main').options].map(o => o.value)).toEqual(['Mix', 'Algebra'])
  await change('Main', 'Algebra'); await change('Unit', 'fixture-unit-a'); await change('Lesson', 'fixture-lesson-a')
  await change('Grade', '6')
  expect(select('Main').value).toBe('Mix'); expect(select('Unit').value).toBe(''); expect(select('Lesson').value).toBe('')
  await change('Content category', 'History'); expect(select('Grade')).toBeNull()
})
test('absent curriculum leaves the Mathematics hierarchy visible without invented options', async () => {
  await mount(<ContentSelection filters={{ ...initialFilters, category: 'Mathematics' }} onChange={() => {}} items={starterContent} />)
  for (const label of ['Grade', 'Main', 'Unit', 'Lesson']) {
    const select = container.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement
    expect(select.disabled).toBe(true); expect(select.options).toHaveLength(1)
  }
  expect(container.textContent).toContain('unavailable levels await the curriculum catalog')
})

test('Create Your Own preserves retained selected-record draft compatibility and confirmation', async () => {
  let current: AuthoringDraft
  const mutate = vi.fn(), sourcesBefore = structuredClone(starterContent)
  let restoreSelection: () => void
  const first = starterContent[0], second = starterContent.find(item => item.id === 'fixture-second-record')!
  expect(first.mechanic).toBe(second.mechanic)
  function Harness() {
    const [draft, setDraft] = useState<AuthoringDraft>({ source: 'saved', assignment: 'predefined' })
    current = draft
    restoreSelection = () => setDraft({ ...draft, source: 'example', emptySelection: false, copySelectedExample: true, exercise: structuredClone(second.exercise) })
    return <PersonalChallengeAuthoring value={{ checkpoint: 1 }} draft={draft} onDraftChange={setDraft} onChange={mutate} />
  }
  await mount(<Harness />)
  await change('Personal Challenge', first.mechanic); await click('Create Your Own')
  await change('Title', 'My unsaved first exercise')
  await click('Apply challenge')
  const assigned = structuredClone(current!.appliedCustom!)
  const oldDraft = structuredClone(current!.custom!)
  await click('Predefined'); await act(async () => restoreSelection())
  const beforeCancel = structuredClone(current!)
  const assignedBeforeCopy = applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': current! })
  await click('Create Your Own') // Cancel replacement.
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('independent copy of the selected exercise'))
  expect(current!).toEqual(beforeCancel)
  await click('Resume previous draft')
  expect(current!.custom).toEqual(oldDraft)
  await click('Predefined')
  expect(current!.exercise!.id).toBe(second.exercise.id)
  vi.mocked(window.confirm).mockReturnValue(true)
  await click('Create Your Own')
  expect(current!.source).toBe('custom')
  expect(current!.custom!.title).toBe(second.exercise.title)
  expect(current!.custom!.instructions).toBe(second.exercise.instructions)
  expect(current!.custom!.authored).toEqual(second.exercise.authored)
  expect(current!.custom!.id).not.toBe(oldDraft.id)
  expect(current!.custom!.id).not.toBe(second.exercise.id)
  expect(current!.custom!.authored).not.toBe(second.exercise.authored)
  expect(current!.custom!.authored!.activity).not.toBe(second.exercise.authored!.activity)
  expect(current!.assignment).toBe('custom')
  expect(current!.appliedCustom).toEqual(assigned)
  expect(applyExerciseDrafts([{ checkpoint: 1 }], { 'kind:0': current! })).toEqual(assignedBeforeCopy)
  await change('Title', 'Independent second edit')
  expect(current!.appliedCustom).toEqual(assigned)
  expect(starterContent).toEqual(sourcesBefore)
  expect(mutate).not.toHaveBeenCalled()
  const copiedId = current!.custom!.id
  await click('Predefined'); await click('Create Your Own') // Mode switching resumes the new draft.
  expect(current!.custom!.id).toBe(copiedId)
  expect(current!.custom!.title).toBe('Independent second edit')
})

test('Library keeps collapsed Starters separate from the server discovery view', async () => {
  const approved = { ...duplicate, id: 'approved-fixture', collection: { id: 'approved-exercises', name: 'Approved' }, approvalStatus: 'approved' as const }
  const pending = { ...approved, id: 'pending-fixture', approvalStatus: 'pending' as const, exercise: { ...approved.exercise, title: 'Pending exercise' } }
  await mount(<ContentPicker libraryView section="Personal Challenges" items={[starterContent[0], approved, pending]} />)
  expect(container.querySelector('details')?.open).toBe(false)
  expect(container.textContent).toContain('Starter (1 examples)')
  expect(container.textContent).not.toContain('Available Exercises')
  expect(container.textContent).not.toContain('1 approved exercises')
  expect(button('Preview Another pair exercise')).toBeUndefined()
  expect(button('Preview Pending exercise')).toBeUndefined()
  expect(container.textContent).not.toContain('Unclassified')
})
