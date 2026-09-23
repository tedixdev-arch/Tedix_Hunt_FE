import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('homepage presents the participant game entry actions', async () => {
  const home = await readProjectFile('src/pages/HomePage.tsx')

  assert.match(home, /GAME ON\./)
  assert.doesNotMatch(home, /Something's about to happen\./)
  assert.doesNotMatch(home, /Yours city is waiting\./)
  assert.match(home, /to="\/join"[\s\S]{0,400}Join a Hunt/)
  assert.match(home, /to="\/discover"[\s\S]{0,400}Try a short Hunt/)
  assert.doesNotMatch(home, /See how it works/)
  assert.doesNotMatch(home, /Professional access →/)
  assert.match(home, /to="\/login-workspace"[\s\S]{0,400}Organizer · Creator · Admin →/)
  assert.doesNotMatch(home, /Organizer workspace|Creator Studio|Admin sign in/)
})

test('public login workspace keeps every existing professional sign-in route reachable', async () => {
  const [home, access, router] = await Promise.all([
    readProjectFile('src/pages/HomePage.tsx'),
    readProjectFile('src/pages/ProfessionalAccess.tsx'),
    readProjectFile('src/routes/router.tsx'),
  ])

  assert.match(home, /to="\/login-workspace"/)
  assert.match(router, /path: '\/login-workspace',[\s\S]{0,100}element: <LoginWorkspacePage \/>/)
  assert.match(router, /path: '\/workspaces',[\s\S]{0,100}element: <WorkspaceSelectorPage \/>/)
  assert.match(router, /path: '\/professional-access',[\s\S]{0,100}element: <Navigate replace to="\/login-workspace" \/>/)
  for (const route of ['/organizer/sign-in', '/creator/sign-in', '/admin/sign-in']) {
    assert.match(access, new RegExp(`signInTo: '${route}'`))
    assert.match(router, new RegExp(`path: '${route}'`))
  }
})
