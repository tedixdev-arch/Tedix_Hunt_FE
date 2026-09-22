import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { canAccessAdmin } from '../src/features/auth/access.ts'
import type { GlobalRole, PublicUser } from '../src/services/api/auth.ts'

function user(roles: GlobalRole[], legacyRole = 'admin'): PublicUser {
  return {
    id: 'user-1', email: 'user@example.test', name: 'Test User', roles,
    role: legacyRole, isGuest: false, tedixUserId: null, createdAt: '2026-09-22T00:00:00Z',
  }
}

test('Admin access uses only the authoritative roles array', () => {
  assert.equal(canAccessAdmin(user(['admin'])), true)
  assert.equal(canAccessAdmin(user(['participant', 'admin'], 'participant')), true)
  assert.equal(canAccessAdmin(user(['participant'])), false)
  assert.equal(canAccessAdmin(user([], 'admin')), false)
  assert.equal(canAccessAdmin(null), false)
})

test('Admin guard handles loading, unauthenticated, denied, and authorized sessions', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const guard = router.match(/function RequireAdmin[\s\S]*?\n}\n/)?.[0] ?? ''

  assert.match(guard, /if \(isBootstrapping\).*Loading…/)
  assert.match(guard, /if \(!user\).*<Navigate replace state=\{\{ from: location\.pathname }} to="\/admin\/sign-in"/)
  assert.match(guard, /if \(!canAccessAdmin\(user\)\).*Admin access required/)
  assert.match(guard, /return children/)
})

test('every Admin Console route, including nested routes, is protected', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const protectedRoutes = [
    '/admin', '/admin/reviews/template-1', '/admin/templates', '/admin/hunts',
    '/admin/rewards', '/admin/alerts', '/admin/users', '/admin/settings', '/admin/audit',
  ]

  for (const path of protectedRoutes) {
    const route = router.match(new RegExp(`path: '${path.replaceAll('/', '\\/')}',[\\s\\S]{0,180}?\\n  }`))?.[0] ?? ''
    assert.match(route, /element: <RequireAdmin>/, `${path} must use RequireAdmin`)
  }
})

test('Admin sign-in stays public for non-Admins and sends an existing Admin to the console', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const entry = router.match(/function AdminEntry[\s\S]*?\n}\n/)?.[0] ?? ''
  const signInRoute = router.match(/path: '\/admin\/sign-in',[\s\S]{0,100}?\n  }/)?.[0] ?? ''

  assert.match(entry, /canAccessAdmin\(user\) \? <Navigate replace to="\/admin" \/> : <ProfessionalSignInPage type="admin" \/>/)
  assert.match(signInRoute, /element: <AdminEntry \/>/)
  assert.doesNotMatch(signInRoute, /RequireAdmin/)
})

test('legacy verification redirects, fake 2FA is absent, and Admin logout uses shared session clearing', async () => {
  const [router, consolePage, provider] = await Promise.all([
    readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/AdminConsole.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/providers/AuthProvider.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(router, /path: '\/admin\/verify',[\s\S]{0,100}element: <Navigate replace to="\/admin\/sign-in" \/>/)
  assert.doesNotMatch(consolePage, /2FA verified/i)
  assert.match(consolePage, /<OrganizerHeader logoutTo="\/admin\/sign-in" showProfile\/>/)
  assert.match(provider, /const logout = useCallback\(async \(\) => \{ try \{ await authApi\.logout\(\) } finally \{ setUser\(null\) } }/)
})
