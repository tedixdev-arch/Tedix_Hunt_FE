import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { OrganizerApplicationsApi, type OrganizerApplicationInput } from '../src/services/api/organizerApplications.ts'
import type { SessionStore } from '../src/services/api/session.ts'
import { toOrganizerApplicationInput, validateOrganizerApplication, type ApplicationFormValues } from '../src/pages/organizerApplicationForm.ts'

const validValues: ApplicationFormValues = {
  name: 'Ada Lovelace', email: 'ada@example.test', organizationName: 'Code School',
  organizationType: 'school', reason: 'To help young people explore their city.', phone: '',
}

test('organizer application posts canonical input publicly and maps an empty phone to null', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const session: SessionStore = {
    getAccessToken: () => 'existing-private-token', getRefreshToken: () => null,
    saveSession: () => {}, clearSession: () => {},
  }
  const fetcher: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify({ id: 'app-1', ...JSON.parse(String(init?.body)), status: 'pending', createdAt: '2026-09-19T00:00:00Z' }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  }
  const input = toOrganizerApplicationInput(validValues)
  await new OrganizerApplicationsApi(new ApiClient('https://api.example.test', session, fetcher)).create(input)
  assert.equal(calls[0].url, 'https://api.example.test/api/organizer-applications')
  assert.equal(calls[0].init?.method, 'POST')
  assert.equal(new Headers(calls[0].init?.headers).has('authorization'), false)
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)) as OrganizerApplicationInput, { ...validValues, phone: null })
  assert.equal(input.organizationType, 'school')
})

test('required application fields reject empty values while a valid form passes', () => {
  assert.deepEqual(validateOrganizerApplication(validValues), {})
  const errors = validateOrganizerApplication({ name: ' ', email: 'invalid', organizationName: '', organizationType: '', reason: '', phone: '' })
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'organizationName', 'organizationType', 'reason'].sort())
})

test('application UI includes submission safeguards, safe outcomes, and no organizer redirect', async () => {
  const page = await readFile(new URL('../src/pages/RegisteredOrganizerApplicationPage.tsx', import.meta.url), 'utf8')
  assert.match(page, /if \(submitting\.current\) return/)
  assert.match(page, /disabled=\{isSubmitting\}/)
  assert.match(page, /Submitting…/)
  assert.match(page, /Application submitted/)
  assert.match(page, /pending review/)
  assert.match(page, /Please check the application details and try again\./)
  assert.match(page, /We couldn't submit your application\. Please try again\./)
  assert.doesNotMatch(page, /navigate\(['"]\/organizer['"]/)
})

test('Organizer access keeps Sign in destination and links Apply to its public route', async () => {
  const organizerFlow = await readFile(new URL('../src/pages/OrganizerFlow.tsx', import.meta.url), 'utf8')
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  assert.match(organizerFlow, /to="\/organizer\/registered">Sign in/)
  assert.match(organizerFlow, /to="\/organizer\/apply">Apply as a Registered Organizer/)
  assert.match(router, /path: '\/organizer\/apply'[\s\S]*RegisteredOrganizerApplicationPage/)
  assert.doesNotMatch(router, /path: '\/organizer\/apply'[\s\S]{0,100}<RequireOrganizer>/)
})
