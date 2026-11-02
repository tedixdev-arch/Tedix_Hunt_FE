import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/cua/lib/node_modules/playwright/index.mjs')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(String(error)))
const button = name => page.getByRole('button', { name, exact: true })
try {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://127.0.0.1:5173/tests/browser/creatorCompletion.html?type=universal')
    const nav = page.getByRole('navigation', { name: 'Creator sections', exact: true })
    await nav.waitFor()
    assert.deepEqual(await nav.getByRole('button').allTextContents(), ['Template Setup', 'Checkpoints & Challenges', 'Advanced', 'Review & Submit'])
    assert.equal(await nav.getByRole('button', { name: 'Advanced', exact: true }).getAttribute('aria-expanded'), 'false')
    await page.getByLabel('Template name', { exact: true }).fill(`Navigation ${width}`)
    for (const name of ['Template Setup', 'Checkpoints & Challenges', 'Advanced', 'Review & Submit']) {
      await nav.getByRole('button', { name, exact: true }).click()
      assert.equal(await nav.getByRole('button', { name, exact: true }).getAttribute('aria-current'), 'page')
      if (name === 'Checkpoints & Challenges' || name === 'Advanced') {
        const features = page.getByRole('navigation', { name: 'Hunt Features', exact: true })
        assert.equal(await features.getByRole('button').count(), name === 'Advanced' ? 3 : 4)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}: ${name} overflows`)
    }
    await button('Save draft').click()
    await page.waitForFunction(() => window.fixtureCalls.filter(call => call.method === 'version').length === 1)
    await nav.getByRole('button', { name: 'Advanced', exact: true }).click()
    await page.locator('nav[aria-label="Hunt Features"]').getByRole('button').filter({ hasText: 'Mission History' }).click()
    await button('Create new').click()
    await page.getByLabel('Component name', { exact: true }).fill('Unfinished history')
    await nav.getByRole('button', { name: 'Template Setup', exact: true }).click()
    await nav.getByRole('button', { name: 'Advanced', exact: true }).click()
    assert.equal(await page.getByLabel('Component name', { exact: true }).inputValue(), 'Unfinished history')
    const features = page.getByRole('navigation', { name: 'Hunt Features', exact: true })
    for (const label of ['Mission History', 'Results Display']) {
      await features.getByRole('button').filter({ hasText: label }).click()
      await button('Use Signal default').click()
      const selection = page.getByRole('combobox', { name: 'Approved component', exact: true })
      const index = Math.min(1, await selection.locator('option').count() - 1)
      await selection.selectOption({ index })
      await nav.getByRole('button', { name: 'Template Setup', exact: true }).click()
      await nav.getByRole('button', { name: 'Advanced', exact: true }).click()
      assert.equal(await selection.inputValue(), String(index))
    }
    await features.getByRole('button').filter({ hasText: 'Special Awards' }).click()
    await page.getByLabel('Award name', { exact: true }).fill('Unfinished award')
    await page.getByLabel('Winning rule and tie-breaker', { exact: true }).fill('Pending rule')
    await nav.getByRole('button', { name: 'Template Setup', exact: true }).click()
    await nav.getByRole('button', { name: 'Advanced', exact: true }).click()
    assert.equal(await page.getByLabel('Award name', { exact: true }).inputValue(), 'Unfinished award')
    assert.equal(await page.getByLabel('Winning rule and tie-breaker', { exact: true }).inputValue(), 'Pending rule')
    assert.equal(await page.evaluate(() => window.fixtureCalls.filter(call => call.method === 'version').length), 1)
    await nav.getByRole('button', { name: 'Review & Submit', exact: true }).focus()
    await page.keyboard.press('Enter')
    assert.equal(await nav.getByRole('button', { name: 'Review & Submit', exact: true }).getAttribute('aria-current'), 'page')
    await nav.getByRole('button', { name: 'Checkpoints & Challenges', exact: true }).click()
    await page.locator('nav[aria-label="Hunt Features"]').getByRole('button').filter({ hasText: 'Next Checkpoint / Navigation' }).click()
    await button('Continue').click()
    await page.waitForFunction(() => document.activeElement?.id === 'creator-review-heading')
    console.log(`PASS ${width}px: navigation, overflow, keyboard, prototype retention, one draft save`)
  }
  assert.deepEqual(errors, [])
} finally { await browser.close() }
