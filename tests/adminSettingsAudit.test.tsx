import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AdminAuditLogPage, AdminSettingsPage } from '../src/pages/AdminSettingsAudit'
import type { PlatformSetting } from '../src/services/api/operations'

const mocks = vi.hoisted(() => ({ settings: vi.fn(), updateSettings: vi.fn(), audit: vi.fn() }))
vi.mock('../src/pages/AdminConsole', () => ({ AdminShell: ({ children }: { children: unknown }) => <div>{children as never}</div> }))
vi.mock('../src/services/api/operations', () => ({ adminOperationsApi: mocks }))

const radius: PlatformSetting = { key: 'checkpoints.defaultRadiusMeters', group: 'checkpoints', label: 'Default detection radius', help: 'Applied on save.', kind: 'integer', unit: 'm', min: 5, max: 500, value: 25, defaultValue: 25, customized: false, updatedAt: null, updatedByUserId: null }
const checkIn: PlatformSetting = { key: 'gameplay.organizerCheckInEnabled', group: 'gameplay', label: 'Organizers may confirm arrival', help: 'GPS fallback.', kind: 'boolean', value: true, defaultValue: true, customized: false, updatedAt: null, updatedByUserId: null }
let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.resetAllMocks()
  mocks.settings.mockResolvedValue({ settings: [radius, checkIn] })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })
const render = async (node: JSX.Element) => act(async () => root.render(<MemoryRouter>{node}</MemoryRouter>))
const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent === text)!
async function setNumber(selector: string, value: string) {
  await act(async () => { const el = container.querySelector<HTMLInputElement>(selector)!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })) })
}

test('settings show defaults, save only changed values and report the audit record', async () => {
  mocks.updateSettings.mockResolvedValue({ changed: ['checkpoints.defaultRadiusMeters'], settings: [{ ...radius, value: 40, customized: true, updatedAt: '2026-11-04T10:00:00Z' }, checkIn] })
  await render(<AdminSettingsPage />)
  expect(container.textContent).toContain('Default detection radius')
  expect(container.textContent).toContain('Default: 25 m.')
  expect(container.textContent).toContain('Default: On.')
  expect(container.textContent).toContain('Email and SMS delivery are not configured')
  expect(button('Saved').disabled).toBe(true)
  await setNumber('#setting-checkpoints-defaultRadiusMeters', '40')
  await act(async () => button('Save 1 change').click())
  expect(mocks.updateSettings).toHaveBeenCalledWith({ 'checkpoints.defaultRadiusMeters': 40 })
  expect(container.textContent).toContain('Recorded in the Audit Log')
})

test('settings refuse out-of-range values before calling the API', async () => {
  await render(<AdminSettingsPage />)
  await setNumber('#setting-checkpoints-defaultRadiusMeters', '900')
  await act(async () => button('Save 1 change').click())
  expect(mocks.updateSettings).not.toHaveBeenCalled()
  expect(container.textContent).toContain('must be between 5 and 500')
})

test('audit log lists events with actor, details and filters', async () => {
  mocks.audit.mockResolvedValue({ nextCursor: null, events: [{ id: 'e1', occurredAt: '2026-11-04T10:00:00Z', actor: { userId: 'u1', label: 'admin@tedixhunt.local', roles: ['admin'] }, action: 'settings.updated', category: 'settings', targetType: 'platform_settings', targetId: null, summary: 'Changed Default detection radius', details: { changes: [{ key: 'checkpoints.defaultRadiusMeters', from: 25, to: 40 }] } }] })
  await render(<AdminAuditLogPage />)
  expect(mocks.audit).toHaveBeenCalledWith({ category: '', actor: '', q: '', cursor: undefined })
  expect(container.textContent).toContain('Changed Default detection radius')
  expect(container.textContent).toContain('admin@tedixhunt.local (admin)')
  expect(container.textContent).toContain('checkpoints.defaultRadiusMeters: 25 → 40')
})
