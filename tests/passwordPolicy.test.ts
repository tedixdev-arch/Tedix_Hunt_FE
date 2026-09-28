import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { ApiError } from '../src/services/api/client.ts'
import { authErrorMessage, changePasswordErrorMessage } from '../src/features/auth/errors.ts'
import { adminUserManagementError } from '../src/features/auth/adminUserManagementErrors.ts'
import { meetsPasswordPolicy, PASSWORD_POLICY_MESSAGE, PASSWORD_REQUIREMENT_TEXT } from '../src/features/auth/passwordPolicy.ts'

test('shared password policy accepts and rejects the authoritative examples without transforming input', () => {
  for (const password of ['Test123!', 'abc12345#']) assert.equal(meetsPasswordPolicy(password), true, password)
  for (const password of ['password', 'password1', 'password!', '12345678!', 'Abc1!']) assert.equal(meetsPasswordPolicy(password), false, password)
  assert.equal(meetsPasswordPolicy(' Test123'), true, 'leading whitespace is a special character and must not be trimmed')
})

test('all existing password-establishment forms use the shared validator and requirement copy', async () => {
  const paths = [
    '../src/pages/ParticipantJoinFlow.tsx',
    '../src/pages/RegisteredOrganizerApplicationPage.tsx',
    '../src/pages/organizerApplicationForm.ts',
    '../src/pages/ProfessionalActivation.tsx',
    '../src/pages/AdminActivation.tsx',
    '../src/pages/AdminAccountSecurity.tsx',
    '../src/pages/AdminUsers.tsx',
  ]
  const sources = await Promise.all(paths.map(path => readFile(new URL(path, import.meta.url), 'utf8')))
  for (const [index, source] of sources.entries()) {
    assert.match(source, /passwordPolicy/, paths[index])
  }
  assert.match(sources[0], /mode === 'register' && !meetsPasswordPolicy\(password\)/)
  assert.doesNotMatch(sources[0], /mode === 'login' && !meetsPasswordPolicy/)
  assert.match(sources[2], /!meetsPasswordPolicy\(values\.password\)/)
  assert.match(sources[3], /!meetsPasswordPolicy\(password\)/)
  assert.match(sources[4], /!meetsPasswordPolicy\(password\)/)
  assert.match(sources[5], /!meetsPasswordPolicy\(newPassword\)/)
  assert.match(sources[6], /!meetsPasswordPolicy\(password\)/)
  for (const source of [sources[0], sources[1], sources[3], sources[4], sources[5], sources[6]]) {
    assert.match(source, /PASSWORD_REQUIREMENT_TEXT/)
  }
  assert.equal(PASSWORD_REQUIREMENT_TEXT, 'At least 8 characters, including a letter, a number, and a special character.')
})

test('confirmation is checked before policy in every form with confirmation', async () => {
  for (const path of [
    '../src/pages/organizerApplicationForm.ts',
    '../src/pages/ProfessionalActivation.tsx',
    '../src/pages/AdminActivation.tsx',
    '../src/pages/AdminAccountSecurity.tsx',
    '../src/pages/AdminUsers.tsx',
  ]) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8')
    assert.ok(source.indexOf('!==') < source.indexOf('!meetsPasswordPolicy'), path)
  }
})

test('password policy backend errors use safe consistent copy', () => {
  const errors = [
    new ApiError('raw database error', 400, 'bad_request', { code: 'password_policy_not_met' }),
    new ApiError('raw database error', 400, 'bad_request', { error: { code: 'password_policy_not_met' } }),
  ]
  for (const error of errors) {
    assert.equal(authErrorMessage(error, 'register'), PASSWORD_POLICY_MESSAGE)
    assert.equal(changePasswordErrorMessage(error), PASSWORD_POLICY_MESSAGE)
    assert.equal(adminUserManagementError(error), PASSWORD_POLICY_MESSAGE)
  }
})

test('login-only forms do not import or invoke the password-policy validator', async () => {
  for (const path of ['../src/features/auth/LoginScreen.tsx', '../src/pages/OrganizerFlow.tsx', '../src/pages/ProfessionalAccess.tsx']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /meetsPasswordPolicy|PASSWORD_POLICY_MESSAGE/, path)
  }
})
