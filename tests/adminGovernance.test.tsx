import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminTemplateReviewsPage, AdminTemplateReviewDetailPage } from '../src/pages/AdminTemplateReviews'
import type { AdminTemplateReview } from '../src/services/api/adminTemplateReviews'
const api = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), approve: vi.fn(), requestChanges: vi.fn(), approved: vi.fn(), suspend: vi.fn() }))
vi.mock('../src/services/api/adminTemplateReviews.ts', () => ({ adminTemplateReviewsApi: api }))
vi.mock('../src/pages/AdminConsole.tsx', () => ({ AdminShell: ({ children }: any) => <main>{children}</main> }))
vi.mock('../src/components/TedixMap', () => ({ TedixMap: () => <div /> }))
vi.mock('../src/app/providers/AuthProvider', () => ({ useAuth: () => ({ user: { id: 'admin', roles: ['admin', 'creator'] } }) }))
let root: Root, container: HTMLDivElement
export const fixture = (category?: 'universal' | 'local'): AdminTemplateReview => ({ key: category ?? 'legacy', category, version: 3, status: 'submitted', origin: 'creator', creator: { id: 'creator', name: 'Ada', email: 'ada@test' }, content: { key: category ?? 'legacy', version: 3, displayName: category ?? 'Legacy', theme: 'City', mission: 'Exact story v3', configuration: { normalCheckpointCount: 1, checkpointPositions: [{ checkpointNumber: 1, name: 'Saved pin', latitude: 46, longitude: 23, radiusMeters: 30 }], finishPoint: { name: 'Saved finish', latitude: 46.1, longitude: 23.1, radiusMeters: 20 } }, checkpoints: [{ answer: 'exact v3 answer' }], scoring: { points: 10 } } })
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); api.list.mockResolvedValue([fixture('universal'), fixture('local'), fixture()]); api.get.mockResolvedValue(fixture('universal')) })
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
async function render(path = '/admin/templates') { await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/templates" element={<AdminTemplateReviewsPage />} /><Route path="/admin/reviews/:key" element={<AdminTemplateReviewDetailPage />} /></Routes></MemoryRouter>)) }
const button = (name: string) => [...container.querySelectorAll('button')].find(node => node.textContent === name)!
async function click(name: string) { await act(async () => button(name).click()) }
test('01 mixed queue filters locally and exact selected GET owns inspection', async () => {
  await render(); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('universal'); expect(api.list).toHaveBeenCalledWith()
  await act(async () => ([...container.querySelectorAll('a')].find(a => a.textContent === 'Local')!).click())
  expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('local'); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).not.toContain('universal')
  api.get.mockResolvedValue({ ...fixture('local'), content: { ...fixture('local').content, mission: 'Pinned v3, candidate v8 is private' } })
  await act(async () => container.querySelector<HTMLAnchorElement>('a[href*="/admin/reviews/local"]')!.click())
  expect(api.get).toHaveBeenCalledWith('local'); expect(container.textContent).toContain('Pinned v3'); expect(container.textContent).toContain('Submitted version 3')
})
test('01 Universal omits geography, Legacy remains selectable', async () => {
  await render('/admin/reviews/universal'); expect(container.textContent).not.toContain('Saved geography'); expect(container.textContent).not.toContain('Saved pin')
  await act(async () => ([...container.querySelectorAll('a')].find(a => a.textContent === 'Legacy')!).click()); expect(container.querySelector('[aria-label="Review queue"]')?.textContent).toContain('Legacy')
})
test('01 empty and ambiguous missing inspection have readable recovery', async () => {
  const { ApiError } = await import('../src/services/api/client'); api.list.mockResolvedValue([]); api.get.mockRejectedValue(new ApiError('not_found', 404, 'http'))
  await render('/admin/reviews/gone'); expect(container.textContent).toContain('No items awaiting review'); expect(container.textContent).toContain('may have changed'); expect(button('Refresh inspection')).toBeTruthy()
})
