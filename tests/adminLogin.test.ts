import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('admin sign-in uses real authentication and preserves creator authentication', async () => {
  const page = await readFile(new URL('../src/pages/ProfessionalAccess.tsx', import.meta.url), 'utf8')

  assert.match(page, /const \{ loginAdmin, loginCreator \} = useAuth\(\)/)
  assert.match(page, /const login=creator\?loginCreator:loginAdmin/)
  assert.match(page, /navigate\(creator\?'\/creator':'\/admin',\{replace:true\}\)/)
  assert.match(page, /setError\(authErrorMessage\(caught,'login'\)\)/)
  assert.match(page, /if\(submitting\.current\)return/)
  assert.match(page, /disabled=\{isSubmitting\}/)
  assert.doesNotMatch(page, /admin\/verify|Continue to 2FA|two-factor|verification code/i)
})

test('the legacy admin verification route redirects to admin sign-in', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')

  assert.match(router, /path: '\/admin\/verify',[\s\S]{0,100}element: <Navigate replace to="\/admin\/sign-in" \/>/)
})
