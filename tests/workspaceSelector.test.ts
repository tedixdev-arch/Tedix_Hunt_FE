import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('logged-out workspace choices use the existing entry routes', async () => {
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')

  for (const [label, route] of [
    ['Participant', '/join'],
    ['Organizer', '/organizer/sign-in'],
    ['Creator', '/creator/sign-in'],
    ['Admin', '/admin/sign-in'],
  ]) {
    assert.match(selector, new RegExp(`label: '${label}'[\\s\\S]{0,180}signedOutTo: '${route}'`))
  }
  assert.doesNotMatch(selector, /label: 'Supervisor'/)
})

test('authenticated workspace choices use capabilities and direct destinations', async () => {
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')
  const selectorComponent = selector.slice(selector.indexOf('export function WorkspaceSelectorPage'), selector.indexOf('/** @deprecated'))

  for (const capability of ['canAccessParticipant', 'canAccessOrganizer', 'canAccessCreator', 'canAccessAdmin']) {
    assert.match(selector, new RegExp(`${capability}\\(user\\)`))
  }
  for (const route of ['/join', '/organizer', '/creator', '/admin']) {
    assert.match(selector, new RegExp(`signedInTo: '${route}'`))
  }
  assert.match(selector, /Not available for this account/)
  assert.match(selector, /aria-disabled="true"/)
  assert.doesNotMatch(selectorComponent, /loginParticipant|loginOrganizer|loginCreator|loginAdmin/)
})

test('professional header links each current workspace to the selector with route state', async () => {
  const header = await readProjectFile('src/pages/OrganizerFlow.tsx')
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')

  assert.match(header, /aria-label="Switch workspace"/)
  assert.match(header, /state=\{\{ from: location\.pathname \}\} to="\/workspaces"/)
  assert.match(selector, /startsWith\('\/organizer'\)[\s\S]{0,40}'Organizer'/)
  assert.match(selector, /startsWith\('\/creator'\)[\s\S]{0,40}'Creator'/)
  assert.match(selector, /startsWith\('\/admin'\)[\s\S]{0,40}'Admin'/)
  assert.match(selector, />Current</)
})
