import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = [], confirmations = []
let allowReplacement = true
page.on('pageerror', e => errors.push(String(e)))
page.on('dialog', async dialog => { if (dialog.type() === 'confirm') { confirmations.push(dialog.message()); if (!allowReplacement) return dialog.dismiss() } await dialog.accept() })
await fs.mkdir('work/exercise-selection-browser', { recursive: true })
for (const width of [1440, 768, 390, 320]) for (const classification of ['personal', 'team']) for (const terminal of [false, true]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/tests/browser/customPersistence.html')
  await page.waitForFunction(() => window.fixtureSelections)
  await page.evaluate(() => window.fixtureSelections())
  const previous = await page.evaluate(() => window.fixtureRecord())
  const open = async () => {
    await page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name: classification === 'personal' ? /Personal Challenge/ : /Team Challenge/ }).click()
    if (terminal) await page.getByRole('button', { name: 'Checkpoint 7, FinishPoint', exact: true }).click()
  }
  await open()
  const panel = page.getByRole('region', { name: `${classification === 'personal' ? 'Personal' : 'Team'} Challenge authoring`, exact: true })
  const state = panel.getByLabel('Selected exercise assignment', { exact: true })
  const title = `${width} retained ${classification} ${terminal ? 'FinishPoint' : 'checkpoint'}`
  await panel.getByLabel('Title', { exact: true }).fill(title)
  const confirmsBeforeViewing = confirmations.length
  await panel.getByRole('button', { name: 'Predefined', exact: true }).click()
  assert.equal(await state.textContent(), 'Saving: Custom exercise')
  await panel.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
  assert.equal(confirmations.length, confirmsBeforeViewing)
  await panel.getByRole('button', { name: 'Predefined', exact: true }).click()
  allowReplacement = false
  await panel.getByRole('button', { name: 'Use predefined assignment', exact: true }).click()
  assert.equal(await state.textContent(), 'Saving: Custom exercise')
  allowReplacement = true
  await panel.getByRole('button', { name: 'Use predefined assignment', exact: true }).click()
  await panel.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
  assert.equal(await state.textContent(), 'Saving: Predefined assignment')
  await panel.getByRole('combobox', { name: 'Exercise type', exact: true }).selectOption(classification === 'personal' ? 'true-false' : 'hypothesis')
  assert.equal(await state.textContent(), 'Saving: Predefined assignment')
  await panel.getByRole('combobox', { name: 'Exercise type', exact: true }).selectOption(classification === 'personal' ? 'single-choice' : 'distributed-information')
  assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor()
  const saved = await page.evaluate(() => window.fixtureRecord()), i = terminal ? 6 : 0
  assert.equal(saved.version, 4)
  assert.equal(saved.content.checkpoints[i].customExercises[classification], undefined)
  const other = classification === 'personal' ? 'team' : 'personal'
  assert.deepEqual(saved.content.checkpoints[i].customExercises[other].interaction, previous.content.checkpoints[i].customExercises[other].interaction)
  assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
  assert.equal(await state.textContent(), 'Saving: Predefined assignment')
  // Exact persisted selection is submitted, while the unsaved inactive variant remains in the editor session.
  await page.getByRole('button', { name: 'Submit version to Admin', exact: true }).click()
  const calls = await page.evaluate(() => window.fixtureCalls)
  assert.deepEqual(calls.at(-1), { method: 'submit', key: saved.key, version: 4 })
  await page.evaluate(() => window.fixtureReopen())
  // Submitted records are read-only; reopen the pre-submission artifact as an editable fixture for the inverse transition.
  await page.evaluate(() => { window.fixtureSelections() })
  await open()
  await panel.getByRole('button', { name: 'Predefined', exact: true }).click()
  await panel.getByRole('button', { name: 'Use predefined assignment', exact: true }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor()
  await page.evaluate(() => window.fixtureReopen()); await open()
  assert.equal(await panel.getByLabel('Title', { exact: true }).count(), 0)
  await panel.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  if (classification === 'team') await panel.getByRole('combobox', { name: 'Exercise type', exact: true }).selectOption('distributed-information')
  await panel.getByLabel('Title', { exact: true }).fill(title)
  await panel.getByRole('button', { name: 'Use this custom exercise', exact: true }).click()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor()
  await page.evaluate(() => window.fixtureReopen()); await open()
  assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
  assert.equal(await state.textContent(), 'Saving: Custom exercise')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  if (classification === 'personal' && terminal) { await state.scrollIntoViewIfNeeded(); await page.screenshot({ path: `work/exercise-selection-browser/selection-${width}.png` }) }
  results.push({ width, classification, terminal, passed: true })
}
assert.deepEqual(errors, [])
await fs.writeFile('work/exercise-selection-browser/results.json', JSON.stringify({ scenarios: results.length, results, errors, backend: 'Mocked Template operations; real Creator Studio components. No live database integration claimed.' }, null, 2))
console.log(JSON.stringify({ scenarios: results.length, errors }))
await browser.close()
