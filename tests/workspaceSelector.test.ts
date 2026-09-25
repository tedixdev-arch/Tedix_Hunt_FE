import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { ApiClient } from '../src/services/api/client.ts'
import { HuntContextsApi, type HuntContext } from '../src/services/api/huntContexts.ts'
import type { SessionStore } from '../src/services/api/session.ts'
import { contextualWorkspaceChoices } from '../src/features/auth/workspaceContexts.ts'

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
  assert.match(selectorComponent, /contextualWorkspaceChoices\(huntContexts\)/)
  assert.doesNotMatch(selectorComponent, /canAccessParticipant|canAccessSupervisor/)
})

test('Hunt contexts use the authenticated me endpoint', async () => {
  const calls: Array<{ url: string; authorization: string | null }> = []
  const session: SessionStore = {
    getAccessToken: () => 'same-session-token', getRefreshToken: () => null,
    saveSession: () => undefined, clearSession: () => undefined,
  }
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), authorization: new Headers(init?.headers).get('authorization') })
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } })
  }

  assert.deepEqual(await new HuntContextsApi(new ApiClient('https://api.example.test', session, fetcher)).list(), [])
  assert.deepEqual(calls, [{
    url: 'https://api.example.test/api/me/hunt-contexts',
    authorization: 'Bearer same-session-token',
  }])
})

test('context choices are derived only from each authoritative Hunt row', () => {
  const contexts: HuntContext[] = [
    { huntId: 'both', huntName: 'Signal: Cluj Napoca', huntStatus: 'active', participant: true, supervisor: true },
    { huntId: 'participant', huntName: 'City Quest', huntStatus: 'published', participant: true, supervisor: false },
    { huntId: 'supervisor', huntName: 'Forest Search', huntStatus: 'paused', participant: false, supervisor: true },
    { huntId: 'neither', huntName: 'No Access', huntStatus: 'draft', participant: false, supervisor: false },
  ]

  assert.deepEqual(contextualWorkspaceChoices(contexts).map(choice => [choice.role, choice.context.huntName]), [
    ['Participant', 'Signal: Cluj Napoca'],
    ['Supervisor', 'Signal: Cluj Napoca'],
    ['Participant', 'City Quest'],
    ['Supervisor', 'Forest Search'],
  ])
  assert.deepEqual(contextualWorkspaceChoices([]), [])
})

test('Hunt context UI loads independently, exposes retry and does not invent runtime links', async () => {
  const selector = await readProjectFile('src/pages/ProfessionalAccess.tsx')
  const selectorComponent = selector.slice(selector.indexOf('export function WorkspaceSelectorPage'), selector.indexOf('export function ProfessionalSignInPage'))

  assert.match(selectorComponent, /huntContextsApi\.list\(\)/)
  assert.match(selectorComponent, /Global workspaces/)
  assert.match(selectorComponent, /Your Hunts/)
  assert.match(selectorComponent, /context\.huntName/)
  assert.match(selectorComponent, /context\.huntStatus/)
  assert.match(selectorComponent, /No Hunt contexts are available yet\./)
  assert.match(selectorComponent, /We couldn't load your Hunt contexts\./)
  assert.match(selectorComponent, />Retry</)
  assert.match(selectorComponent, /Runtime coming next/)
  assert.doesNotMatch(selectorComponent, /to=\{?`?\/(participant|supervisor)/)
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
