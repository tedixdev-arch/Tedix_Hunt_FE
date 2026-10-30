import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AdminTemplateReviewDetailPage } from '../src/pages/AdminTemplateReviews'

const api = vi.hoisted(() => ({ get: vi.fn(), approve: vi.fn(), requestChanges: vi.fn(), list: vi.fn().mockResolvedValue([]) }))
vi.mock('../src/services/api/adminTemplateReviews.ts', () => ({ adminTemplateReviewsApi: api }))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'admin', roles: ['admin'] } }) }))
vi.mock('../src/pages/AdminConsole.tsx', () => ({ AdminShell: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
vi.mock('../src/components/HuntMapPreview', () => ({ HuntMapInspection: () => <div /> }))

test('Admin review renders object mission/story/metadata and terminal gameplay without changing approval flow', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const review = { key: 'signal-new', version: 2, status: 'submitted', creator: { name: 'Creator', email: 'creator@example.test' }, content: {
    displayName: 'Signal draft', theme: 'Signal', mission: { name: 'Restore', briefing: 'Saved story', signal: 'SIGNAL', finishLocation: 'Fictional wall', metadata: { provenance: 'Saved provenance' } }, configuration: { normalCheckpointCount: 6, checkpointPositions: [] }, scoring: { startingScore: 500 }, checkpoints: [...Array.from({ length: 6 }, (_, index) => ({ checkpoint: index + 1, role: 'normal' })), { role: 'terminal', kind: 'radial', teamKind: 'clue-synthesis', solutionSteps: ['Saved terminal solution'] }],
  } }
  api.get.mockResolvedValue(review); api.approve.mockResolvedValue({ ...review, status: 'approved' })
  const container = document.createElement('div'); document.body.append(container)
  const root = createRoot(container)
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={['/admin/reviews/signal-new']}><Routes><Route path="/admin/reviews/:key" element={<AdminTemplateReviewDetailPage />} /></Routes></MemoryRouter>))
    expect(container.textContent).toContain('Saved story')
    expect(container.textContent).toContain('Saved provenance')
    expect(container.textContent).toContain('Saved terminal solution')
    expect(container.textContent).not.toContain('[object Object]')
    expect([...container.querySelectorAll('h4')].at(-1)?.textContent).toBe('FinishPoint')
    const approve = [...container.querySelectorAll('button')].find(button => button.textContent === 'Approve template')!
    expect(approve.disabled).toBe(false)
    await act(async () => approve.click())
    expect(api.approve).toHaveBeenCalledWith('signal-new', undefined)
    expect(container.textContent).toContain('Template approved')
  } finally { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() }
})
