import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { buildSha } from '../src/buildInfo.ts'

test('buildSha falls back to development outside a Vite build', () => {
  assert.equal(buildSha, 'development')
})

test('CI generates a full-SHA version marker and passes the SHA to both dev builds', async () => {
  const workflow = await readFile(new URL('../.github/workflows/frontend.yml', import.meta.url), 'utf8')
  const testJob = workflow.match(/  test:\n([\s\S]*?)\n  deploy-dev:/)?.[1] ?? ''
  const deployDevJob = workflow.match(/  deploy-dev:\n([\s\S]*?)\n  deploy-production:/)?.[1] ?? ''

  for (const job of [testJob, deployDevJob]) {
    assert.match(job, /printf '\{"commit":"%s"\}\\n' "\$GITHUB_SHA" > public\/version\.json/)
    assert.match(job, /VITE_BUILD_SHA: \$\{\{ github\.sha \}\}/)
    assert.match(job, /VITE_API_BASE_URL: https:\/\/tedixhunt-be-dev\.anainfo\.ai/)
  }
})

test('PWA activates updates, removes old precaches, and excludes the version marker', async () => {
  const config = await readFile(new URL('../vite.config.ts', import.meta.url), 'utf8')

  assert.match(config, /registerType: 'autoUpdate'/)
  assert.match(config, /cleanupOutdatedCaches: true/)
  assert.match(config, /globIgnores: \['\*\*\/version\.json'\]/)
  assert.doesNotMatch(config, /globPatterns: \[[^\]]*json/)
})

test('the public version marker has a safe local-build fallback', async () => {
  const version = JSON.parse(await readFile(new URL('../public/version.json', import.meta.url), 'utf8')) as { commit: string }
  assert.deepEqual(version, { commit: 'development' })
})

test('current routes, including the public organizer application route, remain in place', async () => {
  const router = await readFile(new URL('../src/routes/router.tsx', import.meta.url), 'utf8')
  const paths = [...router.matchAll(/path: '([^']+)'/g)].map((match) => match[1])

  assert.ok(paths.length >= 30, 'expected the existing route table to remain intact')
  assert.ok(paths.includes('/organizer/apply'))
  assert.match(router, /path: '\/organizer\/apply',[\s\S]{0,100}element: <RegisteredOrganizerApplicationPage \/>/)
})
