import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('public login workspace offers exactly the professional entry choices', async () => {
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')
  const loginSelector = selector.slice(selector.indexOf('export function LoginWorkspacePage'), selector.indexOf('export function WorkspaceSelectorPage'))

  assert.match(loginSelector, /Choose your workspace/)
  for (const [label, route] of [
    ['Organizer', '/organizer/sign-in'],
    ['Creator', '/creator/sign-in'],
    ['Admin', '/admin/sign-in'],
  ]) {
    assert.match(selector, new RegExp(`label: '${label}'[\\s\\S]{0,180}signInTo: '${route}'`))
  }
  assert.doesNotMatch(loginSelector, /Participant|Supervisor/)
})

test('authenticated selector redirects signed-out users and shows only available global capabilities', async () => {
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')
  const selectorComponent = selector.slice(selector.indexOf('export function WorkspaceSelectorPage'), selector.indexOf('export function ProfessionalSignInPage'))

  assert.match(selectorComponent, /if \(!user\) return <Navigate replace to="\/login-workspace" \/>/)
  for (const capability of ['canAccessOrganizer', 'canAccessCreator', 'canAccessAdmin']) {
    assert.match(selectorComponent, new RegExp(`${capability}[\\s\\S]{0,160}user`))
  }
  assert.match(selectorComponent, /professionalWorkspaces\.filter/)
  assert.match(selectorComponent, /Switch workspace/)
  assert.doesNotMatch(selectorComponent, /Participant|Supervisor|Not available for this account|aria-disabled/)
})

test('professional header explicitly links each current workspace to the selector with route state', async () => {
  const header = await readProjectFile('src/pages/OrganizerFlow.tsx')
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')

  assert.match(header, /aria-label=\{`Switch workspace: \$\{currentWorkspace\}`\}/)
  assert.match(header, /Switch Workspace: /)
  assert.match(header, /state=\{\{ from: location\.pathname \}\} to="\/workspaces"/)
  assert.match(selector, /startsWith\('\/organizer'\)[\s\S]{0,40}'Organizer'/)
  assert.match(selector, /startsWith\('\/creator'\)[\s\S]{0,40}'Creator'/)
  assert.match(selector, /startsWith\('\/admin'\)[\s\S]{0,40}'Admin'/)
  assert.match(selector, />Current</)
})
