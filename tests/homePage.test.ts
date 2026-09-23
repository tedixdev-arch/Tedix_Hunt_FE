import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readProjectFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('homepage presents the participant game entry actions', async () => {
  const home = await readProjectFile('src/pages/HomePage.tsx')

  assert.match(home, /Something's about to happen\./)
  assert.doesNotMatch(home, /Yours city is waiting\./)
  assert.match(home, /to="\/join"[\s\S]{0,400}Join a Hunt/)
  assert.match(home, /to="\/discover"[\s\S]{0,400}Try a short Hunt/)
  assert.doesNotMatch(home, /See how it works/)
  assert.equal(home.match(/Professional access →/g)?.length, 1)
  assert.doesNotMatch(home, /Organizer workspace|Creator Studio|Admin sign in/)
})

test('professional access keeps every existing sign-in route reachable', async () => {
  const [home, access, router] = await Promise.all([
    readProjectFile('src/pages/HomePage.tsx'),
    readProjectFile('src/pages/ProfessionalAccess.tsx'),
    readProjectFile('src/routes/router.tsx'),
  ])

  assert.match(home, /to="\/professional-access"/)
  assert.match(router, /path: '\/professional-access',[\s\S]{0,100}element: <ProfessionalAccessPage \/>/)
  for (const route of ['/organizer/sign-in', '/creator/sign-in', '/admin/sign-in']) {
    assert.match(access, new RegExp(`to: '${route}'`))
    assert.match(router, new RegExp(`path: '${route}'`))
  }
})
