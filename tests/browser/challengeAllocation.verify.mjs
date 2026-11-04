import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(), errors = [], results = []
page.on('pageerror', error => errors.push(String(error)))
await fs.mkdir('work/selection-browser', { recursive: true })
async function shot(name, width) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await page.setViewportSize({ width, height: Math.max(1000, await page.locator('main').evaluate(n => n.scrollHeight + 32)) })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `work/selection-browser/${name}-${width}.png` })
}
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('http://127.0.0.1:5173/tests/browser/challengeAllocation.html')
    const saved = await page.evaluate(() => window.fixtureRecord())
    const panel = page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
    assert.equal(await panel.getByRole('radio', { name: 'Random matching exercise', exact: true }).isChecked(), true)
    assert.equal(await panel.getByRole('button', { name: 'Refine exercise pool' }).getAttribute('aria-expanded'), 'false')
    assert.equal(await panel.getByLabel('Personal Challenge', { exact: true }).locator('option').count(), 16)
    await shot('default-random', width)
    await panel.getByRole('button', { name: 'Refine exercise pool' }).click()
    assert.equal(await panel.getByLabel('Allocation category').inputValue(), 'Mathematics')
    assert.equal(await panel.getByLabel('Geographic applicability').inputValue(), 'template')
    for (const name of ['Grade', 'Main', 'Unit', 'Lesson']) assert.equal(await panel.getByLabel(name, { exact: true }).isDisabled(), true)
    await shot('mathematics-expanded', width)
    await panel.getByRole('radio', { name: 'Choose specific exercise', exact: true }).check()
    await panel.getByText(/No approved exercise records/).waitFor()
    assert.equal(await panel.getByLabel('Approved exercise', { exact: true }).isDisabled(), true)
    await shot('specific-empty', width)
    await panel.getByRole('radio', { name: 'Random matching exercise', exact: true }).check()
    await panel.getByRole('button', { name: 'Refine exercise pool' }).click()
    await panel.getByLabel('Personal Challenge', { exact: true }).selectOption('tap-pair')
    await panel.getByRole('button', { name: 'Preview Starter demonstration' }).click()
    await panel.getByText(/Starter demonstration · May not match/).waitFor()
    await panel.getByRole('button', { name: 'Check answer', exact: true }).click()
    await panel.getByRole('button', { name: 'Reset', exact: true }).click()
    await shot('starter-demonstration', width)
    assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), saved)
    for (const type of await panel.getByLabel('Personal Challenge', { exact: true }).locator('option').evaluateAll(nodes => nodes.map(n => n.value).filter(Boolean))) {
      await panel.getByLabel('Personal Challenge', { exact: true }).selectOption(type)
      assert.equal(await panel.locator('textarea').count(), 0)
      assert.equal(await panel.getByLabel('Content exercise picker', { exact: true }).count(), 0)
      assert.equal(await panel.getByRole('button', { name: 'Apply challenge', exact: true }).count(), 0)
    }
    await panel.getByRole('button', { name: 'Create Your Own', exact: true }).click()
    assert.equal(await panel.getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
    await page.goto('http://127.0.0.1:5173/tests/browser/challengeAllocation.html?approved')
    await page.getByRole('radio', { name: 'Choose specific exercise', exact: true }).check()
    await page.getByLabel('Search approved exercises').fill('pair')
    await page.getByLabel('Approved exercise', { exact: true }).selectOption('fixture-approved')
    await page.getByRole('button', { name: 'Preview selected exercise' }).click()
    await shot('specific-selection-fixture', width)
    await page.getByRole('radio', { name: 'Random matching exercise', exact: true }).check()
    await page.getByRole('button', { name: 'Preview eligible approved exercise' }).waitFor()
    results.push({ width, mechanics: 15, overflow: false, assignmentsPreserved: true, specificFixture: true, honestEmptyState: true })
  }
  assert.deepEqual(errors, [])
  await fs.writeFile('work/selection-browser/results.json', JSON.stringify({ capturedAt: new Date().toISOString(), results, errors }, null, 2))
} finally { await browser.close() }
