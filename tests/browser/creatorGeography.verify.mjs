import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const results = [], errors = []
page.on('pageerror', error => errors.push(String(error)))
await fs.mkdir('work/creator-geography', { recursive: true })
try {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/huntSetup.html`)
    const setup = page.locator('#local-geography')
    const country = setup.getByLabel('Country *', { exact: true }), region = setup.getByLabel('Region *', { exact: true }), city = setup.getByLabel('City *', { exact: true })
    await country.waitFor()
    const boxes = await Promise.all([country.boundingBox(), region.boundingBox(), city.boundingBox()])
    if (width >= 640) assert.ok(boxes.every(box => box.y === boxes[0].y))
    else assert.ok(boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y)
    assert.equal(await city.isDisabled(), true)
    await country.selectOption('FR'); await region.selectOption('11'); await city.fill('Paris')
    const choice = setup.getByRole('button', { name: 'Paris · Île-de-France · France', exact: true })
    await choice.waitFor(); assert.equal(await choice.getAttribute('aria-pressed'), 'false')
    await choice.focus(); await page.keyboard.press('Enter')
    await setup.getByText('Selected city: Paris', { exact: true }).waitFor()
    const builder = page.locator('fieldset[aria-label="Template builder"]')
    assert.equal(await builder.isVisible(), false)
    await setup.getByRole('button', { name: 'Continue to Template builder', exact: true }).click()
    assert.equal(await builder.isVisible(), true)
    await country.selectOption('DE'); assert.equal(await city.inputValue(), ''); assert.equal(await region.inputValue(), '')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await setup.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `work/creator-geography/${width}.png` })
    results.push({ width, stacked: width < 640, keyboardSelection: true, continue: true, countryReset: true, overflow: false })
  }
  assert.deepEqual(errors, [])
  await fs.writeFile('work/creator-geography/results.json', JSON.stringify({ results, errors }, null, 2))
  console.log(JSON.stringify({ passed: results.length, results, errors }))
} finally { await browser.close() }
