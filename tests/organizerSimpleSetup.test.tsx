import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { CustomHuntEditorPage } from '../src/pages/CustomHuntEditor'
import { LocalSetupFoundation } from '../src/features/organizer/LocalSetupFoundation'
import { OrganizerSetupChoicePage } from '../src/pages/OrganizerSetupFlow'

vi.mock('../src/pages/OrganizerFlow', () => ({ OrganizerHeader: () => <header>Organizer</header> }))

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

test.each(['', '&mode=independent'])('Local foundation blocks discovery and writes until eligible geography exists (%s)', async mode => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected request'))
  const container = document.createElement('div')
  const root = createRoot(container)
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={[`/organizer/hunts/new/setup?setup=local${mode}`]}><LocalSetupFoundation /></MemoryRouter>))
    expect([...container.querySelectorAll('ol li')].map(item => item.textContent)).toEqual(['1.Location', '2.Choose Hunt', '3.Configure Event', '4.Review'])
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain('Location')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Location selection is not available yet')
    expect(container.querySelectorAll('select')).toHaveLength(3)
    expect(container.querySelector('fieldset')?.disabled).toBe(true)
    const button = container.querySelector('button')!
    expect(button.disabled).toBe(true)
    await act(async () => button.click())
    expect(fetch).not.toHaveBeenCalled()
    expect(container.textContent).not.toMatch(/My challenge|Map simulation|Publish Hunt|Create link/)
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/organizer')
  } finally {
    await act(async () => root.unmount())
    fetch.mockRestore()
  }
})

test.each(['', '?mode=independent'])('main CTA opens the usable existing builder (%s)', async mode => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No session in test'))
  const container = document.createElement('div')
  const root = createRoot(container)
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={[`/organizer/hunts/new${mode}`]}><Routes>
      <Route path="/organizer/hunts/new" element={<OrganizerSetupChoicePage />} />
      <Route path="/organizer/hunts/new/setup" element={<CustomHuntEditorPage />} />
    </Routes></MemoryRouter>))
    const link = [...container.querySelectorAll('a')].find(item => item.textContent === 'Set the Hunt')!
    expect(link.getAttribute('href')).toBe(`/organizer/hunts/new/setup${mode}`)
    await act(async () => link.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })))
    expect(container.textContent).toContain('General Setup')
    expect(container.querySelector('input:not(:disabled)')).not.toBeNull()
    expect(container.querySelector('#local-location-unavailable')).toBeNull()
    expect(container.querySelector('[aria-label="Hunt setup progress"]')).toBeNull()
  } finally {
    await act(async () => root.unmount())
    fetch.mockRestore()
  }
})

test('the former Local query parameter cannot expose the unfinished foundation', async () => {
  const container = document.createElement('div')
  const root = createRoot(container)
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={['/organizer/hunts/new/setup?setup=local&mode=independent']}><CustomHuntEditorPage /></MemoryRouter>))
    expect(container.textContent).toContain('General Setup')
    expect(container.querySelector('#local-location-unavailable')).toBeNull()
  } finally { await act(async () => root.unmount()) }
})
