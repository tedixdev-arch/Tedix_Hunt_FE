import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = []
page.on('pageerror', error => errors.push(String(error)))
const feature = () => page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name: /Personal Challenge/ }).click()
const panel = () => page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
try {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/customPersistence.html`)
    await page.waitForFunction(() => !!window.fixtureCategory)
    for (const category of ['universal', 'local']) {
      await page.evaluate(category => window.fixtureCategory(category), category); await feature()
      assert.equal(await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).locator('option').count(), 16)
      assert.equal(await panel().locator('option[value="hidden-rule"]').count(), 0)
      assert.equal(await panel().getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
    }
    await page.evaluate(() => window.fixtureCategory()); await feature()
    const before = await page.evaluate(() => window.fixtureRecord())
    assert.match(await panel().textContent(), /Template type information is unavailable/)
    assert.equal(await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).count(), 0)
    assert.equal(await panel().getByRole('textbox', { name: 'Title', exact: true }).count(), 0)
    await panel().getByRole('button', { name: 'Edit existing challenges', exact: true }).click()
    assert.equal(await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).locator('option').count(), 8)
    await panel().getByRole('button', { name: 'Choose editor', exact: true }).click()
    await panel().getByRole('button', { name: 'Use modern challenge editor', exact: true }).click()
    assert.equal(await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).locator('option').count(), 16)
    assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), before)
    assert.equal(await page.evaluate(() => window.fixtureCalls.length), 0)
    await page.evaluate(() => window.fixtureReopen()); await feature()
    assert.match(await panel().textContent(), /Template type information is unavailable/)
    await page.evaluate(() => window.fixtureCategory(null)); await feature()
    assert.equal(await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).locator('option').count(), 8)
    assert.equal(await panel().getByRole('button', { name: 'Edit existing challenges', exact: true }).count(), 0)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    results.push({ width, modernOlderIdentifiers: true, localCategoryAuthoritative: true, missingCategoryUnresolved: true, explicitSessionChoices: true, assignmentsPreserved: true, reloadDoesNotInventProvenance: true, explicitNullCompatibility: true, overflow: false })
  }
  assert.deepEqual(errors, [])
  await fs.writeFile('docs/evidence/Personal_Challenge_Context_Browser_Results.json', JSON.stringify({ results, errors, backend: 'Mocked owner projections; actual Creator Studio components. Not authenticated FE–BE integration.' }, null, 2))
  console.log(JSON.stringify({ scenarios: results.length, errors }))
} finally { await browser.close() }
