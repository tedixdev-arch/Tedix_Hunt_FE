import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ContentStudio } from '../src/features/creator/content/ContentStudio'
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
