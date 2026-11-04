import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ContentStudio } from '../src/features/creator/content/ContentStudio'
import { creatorContentApi } from '../src/services/api/creatorContent'
import { starterContent } from '../src/features/creator/content/catalog'
vi.mock('../src/services/api/geography', () => ({ geographyApi: { countries: async () => ({ countries: [] }) } }))
test('standalone editor reuses preview and LaTeX without assignment or source mutation', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const before = structuredClone(starterContent)
  const container = document.createElement('div'); document.body.append(container)
  const root = createRoot(container)
  const router = createMemoryRouter([{ path: '/', element: <ContentStudio active /> }])
  const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!
  try {
    await act(async () => root.render(<RouterProvider router={router} />))
    expect(button('Edit with Preview').getAttribute('aria-pressed')).toBe('true')
    expect(button('Apply challenge')).toBeUndefined()
    expect(button('Save')).toBeUndefined()
    await act(async () => button('Complex / LaTeX').click())
    expect(button('Complex / LaTeX').getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain('Unsaved session drafts')
    expect(starterContent).toEqual(before)
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    await act(async () => button('Discard session draft').click())
    expect(container.querySelector('[aria-label="Library exercise draft"]')).not.toBeNull()
    vi.mocked(window.confirm).mockReturnValue(true)
    await act(async () => button('Discard session draft').click())
    expect(container.querySelector('[aria-label="Library exercise draft"]')).not.toBeNull()
    expect(window.confirm).toHaveBeenCalled()
  } finally { act(() => root.unmount()); router.dispose(); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() }
})

test('classification is optional, supported grade saves and edits invalidate feedback', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const router = createMemoryRouter([{ path: '/', element: <ContentStudio active /> }, { path: '/away', element: <p>Away</p> }])
  const click = async (text: string) => { await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === text)!.click()) }
  const change = async (label: string, value: string) => {
    if (!host.querySelector(`[aria-label="${label}"]`)) {
    const pencil = [...host.querySelectorAll<HTMLButtonElement>('button')].find(b => b.getAttribute('aria-label') === `Edit ${label}`)
    if (pencil) await act(async () => pencil.click())
  }
  const field = host.querySelector(`[aria-label="${label}"]`) as HTMLSelectElement | HTMLTextAreaElement
    await act(async () => {
      Object.getOwnPropertyDescriptor(field instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLTextAreaElement.prototype, 'value')!.set!.call(field, value)
      field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
    })
  }
  vi.spyOn(creatorContentApi, 'create').mockImplementation(async body => ({ ...body, contentId: 'saved', revisionId: crypto.randomUUID(), ownerId: 'owner', version: 1, status: 'draft', createdAt: '', updatedAt: '' }))
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  try {
    await act(async () => root.render(<RouterProvider router={router} />))
    expect(host.querySelector('details')?.open).toBe(false)
    await click('Add Exercise')
    expect(host.textContent).toContain('Saved to Library.')
    await change('Exercise category', 'Mathematics')
    expect(host.textContent).not.toContain('Saved to Library.')
    expect(host.querySelector<HTMLSelectElement>('[aria-label="Grade"]')?.disabled).toBe(false)
    for (const label of ['Main', 'Unit', 'Lesson']) expect(host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)?.disabled).toBe(true)
    await act(async () => { void router.navigate('/away') })
    expect(confirm).toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/')
    await change('Title', '')
    await click('Save Changes')
    expect(host.querySelector('[role="alert"]')).not.toBeNull()
    expect(host.textContent).not.toContain('Saved to Library.')
    await change('Content type', 'Team Challenges')
    await click('Add Exercise')
    expect(host.textContent).toContain('Saved to Library.')
    await change('Content type', 'Navigation Hints')
    expect([...host.querySelectorAll('button')].some(b => b.textContent === 'Add Exercise')).toBe(false)
  } finally { act(() => root.unmount()); router.dispose(); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() }
})
