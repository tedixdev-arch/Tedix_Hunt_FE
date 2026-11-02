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
