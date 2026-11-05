import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const actors = JSON.parse(await fs.readFile(process.env.C2C_ACTORS || 'work/review-actors.json', 'utf8'))
const output = process.env.C2E_EVIDENCE || 'docs/evidence/c2e-02'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage({ serviceWorkers: 'block' }); page.setDefaultTimeout(15000)
const endpoint = process.env.C2E_BACKEND_URL || 'http://127.0.0.1:3002', frontend = process.env.C2E_FRONTEND_URL || 'http://127.0.0.1:5173'
assert.match(endpoint, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/)
const errors = [], saves = [], results = []; let saveMutation
page.on('pageerror', error => errors.push(error.message)); page.on('dialog', dialog => dialog.accept())
await page.addInitScript(token => localStorage.setItem('tedix-hunt.session', JSON.stringify({ accessToken: token })), actors[1].token)
page.on('request', request => { if (request.method() === 'POST' && /\/api\/creator\/templates\/.*\/versions$/.test(new URL(request.url()).pathname)) saves.push(request.postDataJSON().content) })
// Forward HTTP calls to the disposable backend. No API response is synthesized.
await page.route('**/api/**', async route => { const url = new URL(route.request().url()); if (!url.pathname.startsWith('/api/')) return route.continue(); const post = route.request().method() === 'POST' && url.pathname.endsWith('/versions') && saveMutation ? { postData: JSON.stringify(saveMutation(route.request().postDataJSON())) } : {}; const response = await route.fetch({ url: endpoint + url.pathname + url.search, ...post }); await route.fulfill({ response }) })
const api = async (path, method = 'GET', body, actor = actors[1], status = 200) => {
 const response = await page.request.fetch(endpoint + path, { method, headers: { Authorization: `Bearer ${actor.token}` }, ...(body ? { data: body } : {}) })
 assert.equal(response.status(), status, `${method} ${path}: ${await response.text()}`); return response.json()
}
const click = async name => { if (name === 'Save draft') await page.getByRole('button', { name: 'Review & Submit', exact: true }).click(); return page.getByRole('button', { name, exact: true }).click() }
const feature = async name => { await page.getByRole('button', { name: 'Checkpoints & Challenges', exact: true }).click(); await page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name, exact: false }).click() }
const wait = () => page.locator('article:not([hidden])').getByText('Loading approved exercises…', { exact: true }).waitFor({ state: 'hidden' })
const shot = async name => { await page.evaluate(() => document.fonts.ready); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name); await page.screenshot({ path: `${output}/${name}.png`, fullPage: true }); const allocation = page.locator('article:not([hidden]) [aria-label="Challenge allocation"]'); if (await allocation.isVisible()) { const viewport = page.viewportSize(), box = await allocation.boundingBox(); await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, Math.ceil(box.height) + 250) }); await allocation.screenshot({ path: `${output}/${name}-allocation.png` }); await page.setViewportSize(viewport) }; const alert = page.getByRole('alert').first(); if (await alert.isVisible()) await alert.screenshot({ path: `${output}/${name}-error.png` }) }
const open = async key => { await page.goto(`${frontend}/tests/browser/templateAllocation.html?template=${encodeURIComponent(key)}`); await page.getByLabel('Template name', { exact: true }).waitFor(); await feature('Personal Challenge'); await wait() }
const save = async () => { await click('Save draft'); await page.getByText('Template version saved by the backend. Any edits made while saving remain unsaved.', { exact: true }).waitFor() }
const publish = async (type, title, extra = {}) => {
 const body = await page.evaluate(type => window.allocationFixture(type), type); body.exercise.title = title; Object.assign(body, extra)
 const item = await api('/api/creator/content', 'POST', body, actors[0], 201)
 await api(`/api/creator/content/${item.contentId}/revisions/${item.revisionId}/submit`, 'POST', {}, actors[0])
 await api(`/api/admin/content/review/${item.contentId}/revisions/${item.revisionId}/approve`, 'POST', {}, actors[2]); return item
}
try {
 await page.goto(`${frontend}/tests/browser/templateAllocation.html`); await page.waitForFunction(() => typeof window.allocationFixture === 'function')
 const specific = await publish('single-choice', 'Approved compass question'), alternate = await publish('tap-pair', 'Approved matching pairs')
 await publish('number-line', 'Only number line'); await publish('shared-final-key', 'Approved FinishPoint team key')
 await publish('single-choice', 'Wrong grade', { curriculum: { grade: '10' } })
 await publish('single-choice', 'Wrong category', { category: 'Science', curriculum: {} })
 await publish('single-choice', 'Local city question', { geography: { scope: 'city', countryCode: 'RO', geographicId: '683506' } })
 const otherCity = await publish('single-choice', 'Other city question', { geography: { scope: 'city', countryCode: 'RO', geographicId: '675810' } })
 let locality = await api('/api/geography/cities/683506/resolve', 'POST', {}); if (!locality.localityId) locality = await api('/api/geography/cities/683506/registration', 'POST', { create: true, reason: 'Disposable FE allocation verification' }, actors[2])
 const snapshot = await api(`/api/geography/localities/${locality.localityId}`)
 const make = async (key, category = 'universal') => {
  const content = { key, version: 1, displayName: 'Allocation field trip', theme: 'Mixed', mission: { name: 'Explore together' }, configuration: { category: 'Mathematics', grade: '9', normalCheckpointCount: 1, checkpointPositions: [], ...(category === 'local' ? { checkpointPositions: [{ checkpointNumber: 1, name: 'Checkpoint 1', latitude: snapshot.latitude, longitude: snapshot.longitude, radiusMeters: 20 }], finishPoint: { name: 'FinishPoint', latitude: snapshot.latitude, longitude: snapshot.longitude, radiusMeters: 20 } } : {}) }, scoring: { startingScore: 100 }, checkpoints: [{ checkpoint: 1, role: 'normal', marker: 'preserve route data' }, { role: 'terminal' }] }
  return api('/api/creator/templates', 'POST', { key, category, content, ...(category === 'local' ? { localityId: snapshot.id } : {}) }, actors[1], 201)
 }
 for (const width of [1440, 390, 320]) {
  const key = `c2e-visual-${width}-${Date.now()}`; await make(key); await page.setViewportSize({ width, height: 960 }); await open(key)
  await page.getByLabel('Personal Challenge', { exact: true }).selectOption('single-choice'); await page.locator('article:not([hidden])').getByText('Random matching exercise', { exact: true }).click(); await wait(); await shot(`random-before-save-${width}`)
  await page.getByText('Refine exercise pool', { exact: true }).click(); await shot(`random-pool-filters-${width}`)
  await save(); let record = await api(`/api/creator/templates/${key}`); const first = record.content.checkpoints[0]
  assert.equal(first.libraryAllocations.personal.mode, 'random'); assert.equal(first.libraryAllocations.personal.contentId, specific.contentId); assert.equal(first.libraryAllocations.personal.revisionId, specific.revisionId); assert.equal(first.customExercises.personal.title, specific.exercise.title)
  assert.equal(first.marker, 'preserve route data'); assert.equal(saves.at(-1).checkpoints[0].customExercises, undefined); assert.deepEqual(saves.at(-1).checkpoints[0].libraryAllocations.personal, { mode: 'random', filters: { type: 'single-choice' } })
  await feature('Personal Challenge'); await shot(`random-after-save-${width}`)
  await click('Choose another Random exercise'); await save(); assert.deepEqual(saves.at(-1).checkpoints[0].libraryAllocations.personal, { mode: 'random', filters: { type: 'single-choice' } }); assert.equal(saves.at(-1).checkpoints[0].customExercises, undefined)
  await open(key); await page.locator('article:not([hidden])').getByText('Choose specific exercise', { exact: true }).click(); await wait(); await shot(`specific-list-${width}`)
  assert.equal(await page.getByRole('button', { name: 'Select Wrong grade' }).count(), 0); assert.equal(await page.getByRole('button', { name: 'Select Wrong category' }).count(), 0); assert.equal(await page.getByRole('button', { name: 'Select Local city question' }).count(), 0)
  await click('Select Approved compass question'); await page.getByLabel('Playable exercise preview', { exact: true }).waitFor(); await shot(`specific-preview-${width}`); await save()
  assert.deepEqual(saves.at(-1).checkpoints[0].libraryAllocations.personal, { mode: 'specific', contentId: specific.contentId, revisionId: specific.revisionId })
  await open(key); await click('Checkpoint 2, FinishPoint'); await page.getByLabel('Personal Challenge', { exact: true }).selectOption('single-choice'); await page.locator('article:not([hidden])').getByText('Choose specific exercise', { exact: true }).click(); await wait()
  assert.equal(await page.getByRole('button', { name: 'Select Approved compass question', exact: true }).isDisabled(), true); await shot(`duplicate-personal-${width}`)
  await page.locator('article:not([hidden])').getByText('Random matching exercise', { exact: true }).click(); await click('Save draft'); await page.getByText(/There are not enough distinct Personal exercises/).waitFor(); await shot(`insufficient-random-pool-${width}`)
  await feature('Personal Challenge'); await page.getByLabel('Personal Challenge', { exact: true }).selectOption('number-pattern'); await wait(); await shot(`empty-random-pool-${width}`); await click('Save draft'); await page.getByText(/No approved exercises match this pool/).waitFor()
  await feature('Personal Challenge'); await page.getByLabel('Personal Challenge', { exact: true }).selectOption('tap-pair'); await save(); record = await api(`/api/creator/templates/${key}`)
  assert.equal(record.content.checkpoints[1].role, 'terminal'); assert.equal(record.content.checkpoints[1].checkpoint, undefined); assert.equal(record.content.checkpoints[1].libraryAllocations.personal.contentId, alternate.contentId)
  await feature('Team Challenge'); await click('Checkpoint 2, FinishPoint'); await page.getByLabel('Team Challenge', { exact: true }).selectOption('shared-final-key'); await page.locator('article:not([hidden])').getByText('Random matching exercise', { exact: true }).click(); await save(); await feature('Team Challenge'); await shot(`finishpoint-team-${width}`)
  record = await api(`/api/creator/templates/${key}`); const allocations = record.content.checkpoints.map(cp => cp.libraryAllocations)
  await page.getByRole('button', { name: 'Template Setup', exact: true }).click(); const name = page.getByLabel('Template name', { exact: true }); await name.fill(`Unrelated edit ${width}`); await save()
  record = await api(`/api/creator/templates/${key}`); assert.deepEqual(record.content.checkpoints.map(cp => cp.libraryAllocations), allocations)
  await open(key); await click('Create Your Own'); await shot(`create-your-own-${width}`); await click('Predefined'); assert.equal(await page.getByLabel('Personal Challenge', { exact: true }).inputValue(), 'single-choice'); await shot(`restored-specific-${width}`)
  // The saved pin remains exact after a newer Content draft is created.
  if (width === 1440) await api(`/api/creator/content/${specific.contentId}/revisions`, 'POST', { baseRevisionId: specific.revisionId }, actors[0], 201)
  assert.equal((await api(`/api/creator/templates/${key}`)).content.checkpoints[0].libraryAllocations.personal.revisionId, specific.revisionId)
  const localKey = key + '-local'; await make(localKey, 'local'); await open(localKey); await page.getByLabel('Personal Challenge', { exact: true }).selectOption('single-choice'); await page.locator('article:not([hidden])').getByText('Choose specific exercise', { exact: true }).click(); await wait()
  await page.getByRole('button', { name: 'Select Local city question', exact: true }).waitFor(); assert.equal(await page.getByRole('button', { name: 'Select Other city question', exact: true }).count(), 0); await shot(`local-eligibility-${width}`)
  await click('Select Local city question'); await save(); const localRecord = await api(`/api/creator/templates/${localKey}`); assert.equal(localRecord.localityId, snapshot.id); assert.equal(localRecord.content.checkpoints[0].customExercises.personal.title, 'Local city question')
  // Exercise each backend mismatch with the same real persistence endpoint.
  for (const [field, value, code] of [['category', 'Mixed', 'allocation_category_mismatch'], ['grade', '10', 'allocation_grade_mismatch']]) {
    const changed = structuredClone(localRecord.content); changed.version++; changed.configuration[field] = value; if (field === 'category') delete changed.configuration.grade
    const rejected = await api(`/api/creator/templates/${localKey}/versions`, 'POST', { content: changed }, actors[1], 400); assert.equal(rejected.error, code)
  }
  for (const [kind, mutate, expected] of [
    ['category', body => { body.content.configuration.category = 'Mixed'; delete body.content.configuration.grade; return body }, /exercise category must match/],
    ['grade', body => { body.content.configuration.grade = '10'; return body }, /exercise grade must match/],
    ['location', body => { const cp = body.content.checkpoints[0]; if (cp.customExercises) delete cp.customExercises.personal; cp.libraryAllocations.personal = { mode: 'specific', contentId: otherCity.contentId, revisionId: otherCity.revisionId }; return body }, /eligible for the Template’s saved location/],
  ]) {
    await feature('Personal Challenge'); await page.locator('article:not([hidden])').getByText('Choose specific exercise', { exact: true }).click(); await click('Select Local city question')
    saveMutation = mutate; await click('Save draft'); await page.getByRole('alert').filter({ hasText: expected }).waitFor(); await shot(`${kind}-mismatch-${width}`); saveMutation = undefined
    const retained = await api(`/api/creator/templates/${localKey}`); assert.equal(retained.version, localRecord.version)
  }
  await save(); await open(localKey); await page.getByLabel('Playable exercise preview', { exact: true }).waitFor()
  results.push({ width, realBackendSaveReload: true, specificExactRevision: true, randomResolvedOnSave: true, explicitReroll: true, unrelatedSaveKeepsPins: true, personalDuplicateDisabled: true, poolErrorsPreserveRetry: true, terminalPersonalTeam: true, localEligibility: true, overflow: false })
 }
 assert.deepEqual(errors, []); await fs.writeFile(`${output}/results.json`, JSON.stringify({ backend: 'a0826e8 (merged #121)', database: 'disposable PostgreSQL 17', results, browserErrors: errors, realVersionSaves: saves.length }, null, 2)); console.log(`Allocation real-backend browser workflow passed: ${results.length} widths, ${saves.length} real save requests.`)
} catch (error) { await page.screenshot({ path: 'work/allocation-browser-failure.png', fullPage: true }); console.error((await page.locator('body').innerText()).slice(-5000)); throw error } finally { await page.unrouteAll({ behavior: 'wait' }); await browser.close() }
