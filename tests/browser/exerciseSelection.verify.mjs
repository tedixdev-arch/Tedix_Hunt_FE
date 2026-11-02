import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { feature, saveChallengeDraft } from './creatorNavigation.helpers.mjs'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.setDefaultTimeout(10000)
const errors = [], results = []
page.on('pageerror', error => errors.push(String(error)))
page.on('dialog', dialog => dialog.accept())
try {
  for (const width of [1440, 768, 390, 320]) for (const classification of ['personal', 'team']) for (const terminal of [false, true]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://127.0.0.1:5173/tests/browser/customPersistence.html')
    await page.waitForFunction(() => window.fixtureSelections)
    await page.evaluate(() => window.fixtureSelections())
    const original = await page.evaluate(() => window.fixtureRecord())
    const label = classification === 'personal' ? 'Personal' : 'Team'
    const open = async () => {
      await feature(page, new RegExp(`${label} Challenge`))
      if (terminal) await page.getByRole('button', { name: 'Checkpoint 7, FinishPoint', exact: true }).click()
    }
    await open()
    const panel = page.getByRole('region', { name: `${label} Challenge authoring`, exact: true })
    const title = `Retained ${classification} ${terminal ? 'finish' : 'normal'} ${width}`
    const pencil = panel.getByRole('button', { name: 'Edit Title', exact: true })
    if (await pencil.count()) {
      await pencil.click()
      await panel.getByRole('group', { name: 'Edit Title', exact: true }).getByRole('textbox').fill(title)
      await page.keyboard.press('Escape')
    } else await panel.getByLabel('Title', { exact: true }).fill(title)
    // Browsing read-only examples cannot replace an assigned custom challenge.
    await panel.getByRole('button', { name: 'Predefined', exact: true }).click()
    assert.match(await panel.getByLabel('Selected exercise assignment', { exact: true }).textContent(), /Custom (?:Team Challenge|challenge) assigned/)
    await panel.getByRole('button', { name: 'Create Your Own', exact: true }).click()
    assert.equal((await panel.textContent()).includes(title) || await panel.getByLabel('Title', { exact: true }).inputValue().catch(() => '') === title, true)
    await page.getByRole('navigation', { name: 'Creator sections' }).getByRole('button', { name: 'Advanced', exact: true }).click()
    await open()
    await panel.getByRole('button', { name: 'Apply challenge', exact: true }).click()
    assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), original)
    assert.equal(await page.evaluate(() => window.fixtureCalls.length), 0)
    await saveChallengeDraft(page)
    const saved = await page.evaluate(() => window.fixtureRecord())
    const index = terminal ? saved.content.checkpoints.length - 1 : 0
    assert.equal(saved.content.checkpoints[index].customExercises[classification].title, title)
    assert.equal(saved.content.checkpoints[index].customExercises[classification].owner.version, 4)
    for (let i = 0; i < saved.content.checkpoints.length; i++) if (i !== index) {
      for (const kind of ['personal', 'team']) assert.equal(saved.content.checkpoints[i].customExercises[kind].title, original.content.checkpoints[i].customExercises[kind].title)
    }
    await page.evaluate(() => window.fixtureReopen())
    await open()
    assert.equal((await panel.textContent()).includes(title) || await panel.getByLabel('Title', { exact: true }).inputValue().catch(() => '') === title, true)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    results.push({ width, classification, terminal, retained: true, exactVersion: 4 })
  }
  assert.deepEqual(errors, [])
  await fs.mkdir('work/exercise-selection-browser', { recursive: true })
  await fs.writeFile('work/exercise-selection-browser/results.json', JSON.stringify({ results, errors }, null, 2))
  console.log(JSON.stringify({ scenarios: results.length, errors }))
} finally { await browser.close() }
