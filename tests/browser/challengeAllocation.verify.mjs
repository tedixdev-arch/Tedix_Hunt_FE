import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = [], results = []
page.on('pageerror', error => errors.push(String(error)))
await fs.mkdir('work/allocation-browser', { recursive: true })
try {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('http://127.0.0.1:5173/tests/browser/challengeAllocation.html')
    const saved = await page.evaluate(() => window.fixtureRecord())
    const panel = page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
    assert.equal(await panel.getByRole('radio', { name: 'Random from Library', exact: true }).isChecked(), true)
    assert.equal(await panel.getByLabel('Allocation category').count(), 0)
    assert.equal(await panel.getByLabel('Personal Challenge', { exact: true }).locator('option').count(), 16)
    await panel.getByRole('radio', { name: 'Use filters', exact: true }).check()
    assert.deepEqual(await panel.getByLabel('Allocation category').locator('option').allTextContents(), ['Starter', 'Mathematics', 'History', 'Science', 'Mixed'])
    assert.equal(await panel.getByLabel('Content country', { exact: true }).inputValue(), '')
    for (const category of ['Mathematics', 'History', 'Science', 'Mixed', 'starter-preset']) {
      await panel.getByLabel('Allocation category').selectOption(category)
      assert.equal(await panel.getByLabel('Grade', { exact: true }).count(), 0)
    }
    for (const type of await panel.getByLabel('Personal Challenge', { exact: true }).locator('option').evaluateAll(nodes => nodes.map(n => n.value).filter(Boolean))) {
      await panel.getByLabel('Personal Challenge', { exact: true }).selectOption(type)
      assert.equal(await panel.getByLabel('Content exercise picker', { exact: true }).count(), 0)
      assert.equal(await panel.getByLabel('Mobile challenge canvas', { exact: true }).count(), 0)
      assert.equal(await panel.getByRole('button', { name: 'Apply challenge', exact: true }).count(), 0)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.equal(await panel.evaluate(node => node.scrollWidth > node.clientWidth), false)
    await panel.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `work/allocation-browser/filters-${width}.png` })
    await panel.getByLabel('Content country', { exact: true }).selectOption('RO')
    await panel.getByLabel('Content region', { exact: true }).selectOption('CJ')
    await panel.getByLabel('Find content city', { exact: true }).fill('Cluj')
    await panel.getByLabel('Content city', { exact: true }).selectOption('actual-city')
    const library = page.getByRole('region', { name: 'Content Library', exact: true })
    assert.equal(await library.locator('details').first().getAttribute('open'), null)
    await library.getByText('Available Exercises', { exact: true }).waitFor()
    await panel.getByRole('radio', { name: 'Random from Library', exact: true }).check()
    await page.screenshot({ path: `work/allocation-browser/random-${width}.png` })
    const after = await page.evaluate(() => window.fixtureRecord())
    assert.deepEqual(after, saved)
    assert.equal(JSON.stringify(after).includes('starter-preset'), false)
    results.push({ width, mechanics: 15, overflow: false, assignmentsPreserved: true })
  }
  assert.deepEqual(errors, [])
  await fs.writeFile('work/allocation-browser/results.json', JSON.stringify({ results, errors }, null, 2))
} finally { await browser.close() }
