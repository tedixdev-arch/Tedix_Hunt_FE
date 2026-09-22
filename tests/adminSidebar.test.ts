import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const consoleSource = () => readFile(new URL('../src/pages/AdminConsole.tsx', import.meta.url), 'utf8')

test('AdminShell uses grouped left navigation instead of horizontal tabs', async () => {
  const page = await consoleSource()

  assert.match(page, /<aside className=/)
  assert.match(page, /<nav aria-label="Admin sections"/)
  assert.doesNotMatch(page, /overflow-x-auto/)
  for (const group of ['Dashboard', 'Operations', 'Content', 'People', 'System', 'Account']) {
    assert.match(page, new RegExp(`label:'${group}'`))
  }
})

test('sidebar retains every existing Admin destination and marks the active item', async () => {
  const page = await consoleSource()
  const paths = [
    '/admin', '/admin/hunts', '/admin/alerts', '/admin/templates', '/admin/rewards',
    '/admin/users', '/admin/settings', '/admin/audit', '/admin/account',
  ]

  for (const path of paths) assert.match(page, new RegExp(`path:'${path.replaceAll('/', '\\/')}'`))
  assert.match(page, /const isActive=active===item\.id/)
  assert.match(page, /aria-current=\{isActive\?'page':undefined\}/)
})

test('sidebar collapse preference is read, written, and remains accessible', async () => {
  const page = await consoleSource()

  assert.match(page, /tedixhunt_admin_sidebar_collapsed/)
  assert.match(page, /window\.localStorage\.getItem\(sidebarPreferenceKey\)/)
  assert.match(page, /window\.localStorage\.setItem\(sidebarPreferenceKey,String\(collapsed\)\)/)
  assert.match(page, /aria-expanded=\{!collapsed\}/)
  assert.match(page, /aria-label=\{collapsed\?`\$\{item\.label\}/)
  assert.match(page, /title=\{collapsed\?item\.label:undefined\}/)
  assert.match(page, /onClick=\{\(\)=>setCollapsed\(value=>!value\)\}/)
})

test('Admin route definitions and guards remain unchanged', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const paths = [
    '/admin', '/admin/hunts', '/admin/alerts', '/admin/templates', '/admin/rewards',
    '/admin/users', '/admin/settings', '/admin/audit', '/admin/account',
  ]

  for (const path of paths) {
    const route = router.match(new RegExp(`path: '${path.replaceAll('/', '\\/')}',[\\s\\S]{0,180}?\\n  }`))?.[0] ?? ''
    assert.match(route, /element: <RequireAdmin>/, `${path} must still use RequireAdmin`)
  }
})

test('Organizer Applications is the only real action-required sidebar badge', async () => {
  const page = await consoleSource()

  assert.match(page, /organizerApplicationsApi\.list\('pending'\)/)
  assert.match(page, /item\.id === 'organizer-applications' \? pendingOrganizerApplications : 0/)
  assert.match(page, /pendingCount > 0 && <span aria-label=\{pendingLabel\}/)
  assert.match(page, /pendingCount > 99 \? '99\+' : pendingCount/)
  assert.match(page, /collapsed\?`\$\{item\.label\}\$\{pendingCount \? `, \$\{pendingLabel\}` : ''\}`:undefined/)
  assert.match(page, /catch \{\s*if \(active\) setPendingOrganizerApplications\(0\)/)
  assert.doesNotMatch(page, /item\.id === '(?:alerts|templates)' \? pending/)
})

test('Organizer application decisions notify AdminShell to refresh its count', async () => {
  const [page, applications] = await Promise.all([
    consoleSource(),
    readFile(new URL('../src/pages/AdminOrganizerApplications.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /addEventListener\(organizerApplicationsPendingChangedEvent, loadPendingCount\)/)
  assert.match(page, /removeEventListener\(organizerApplicationsPendingChangedEvent, loadPendingCount\)/)
  assert.match(applications, /notifyOrganizerApplicationsPendingChanged\(\)\s*await loadApplications/)
})
