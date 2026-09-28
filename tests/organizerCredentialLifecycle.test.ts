import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('obsolete application activation route, API, component, and helper are removed', async () => {
  const [router, auth, provider] = await Promise.all([
    readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/services/api/auth.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/providers/AuthProvider.tsx', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(router, /path: '\/organizer\/activate'/)
  assert.doesNotMatch(auth, /\/api\/auth\/organizer\/activate'/)
  assert.doesNotMatch(provider, /activateOrganizerApplication/)
  await assert.rejects(readFile(new URL('../src/pages/OrganizerApplicationActivation.tsx', import.meta.url)))
  await assert.rejects(readFile(new URL('../src/features/auth/organizerActivationErrors.ts', import.meta.url)))
})

test('direct Organizer and Creator activation routes and APIs remain unchanged', async () => {
  const [router, auth, activation] = await Promise.all([
    readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/services/api/auth.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/ProfessionalActivation.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(router, /path: '\/organizer\/activate-direct',[\s\S]{0,100}element: <DirectOrganizerActivationPage \/>/)
  assert.match(router, /path: '\/creator\/activate',[\s\S]{0,100}element: <CreatorActivationPage \/>/)
  assert.match(auth, /activateDirectOrganizer[\s\S]{0,150}'\/api\/auth\/organizer\/activate-direct'/)
  assert.match(auth, /activateCreator[\s\S]{0,150}'\/api\/auth\/creator\/activate'/)
  assert.match(activation, /activateDirectOrganizer/)
  assert.match(activation, /activateCreator/)
})

test('Organizer normal sign-in remains unchanged', async () => {
  const signIn = await readFile(new URL('../src/pages/OrganizerFlow.tsx', import.meta.url), 'utf8')
  assert.match(signIn, /loginOrganizer\(\{ email: email\.trim\(\), password \}\)/)
})
