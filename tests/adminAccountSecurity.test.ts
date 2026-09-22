import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { ApiError } from '../src/services/api/client.ts'
import { changePasswordErrorMessage } from '../src/features/auth/errors.ts'

test('AuthProvider exposes changePassword and clears authentication after success', async () => {
  const provider = await readFile(new URL('../src/app/providers/AuthProvider.tsx', import.meta.url), 'utf8')

  assert.match(provider, /changePassword: \(input: ChangePasswordInput\) => Promise<void>/)
  assert.match(provider, /await authApi\.changePassword\(input\)[\s\S]*sessionStore\.clearSession\(\)[\s\S]*setUser\(null\)/)
  assert.match(provider, /loginAdmin, changePassword, logout/)
})

test('/admin/account uses the existing RequireAdmin guard', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')

  assert.match(router, /path: '\/admin\/account',[\s\S]{0,100}element: <RequireAdmin><AdminAccountSecurityPage \/><\/RequireAdmin>/)
})

test('account security form validates passwords, prevents duplicate submits, and redirects', async () => {
  const page = await readFile(new URL('../src/pages/AdminAccountSecurity.tsx', import.meta.url), 'utf8')

  assert.equal((page.match(/type="password"/g) ?? []).length, 3)
  assert.match(page, /if \(submitting\.current\) return/)
  assert.match(page, /if \(newPassword\.length < 8\)/)
  assert.match(page, /if \(confirmPassword !== newPassword\)/)
  assert.match(page, /disabled=\{isSubmitting\}/)
  assert.match(page, /navigate\('\/admin\/sign-in', \{ replace: true \}\)/)
  assert.doesNotMatch(page, /defaultValue=/)
})

test('change-password errors are safe and never expose backend or password values', () => {
  const secret = 'NeverShowThisPassword!'

  assert.equal(changePasswordErrorMessage(new ApiError(secret, 401, 'unauthorized')), 'Current password is incorrect.')
  assert.equal(changePasswordErrorMessage(new ApiError(secret, 400, 'bad_request')), 'Check the password requirements and try again.')
  assert.equal(changePasswordErrorMessage(new ApiError(secret, null, 'network')), 'Unable to change password. Please try again.')
  assert.equal(changePasswordErrorMessage(new Error(secret)), 'Unable to change password. Please try again.')
  for (const error of [
    new ApiError(secret, 401, 'unauthorized'),
    new ApiError(secret, 400, 'bad_request'),
    new ApiError(secret, 500, 'http'),
  ]) assert.equal(changePasswordErrorMessage(error).includes(secret), false)
})
