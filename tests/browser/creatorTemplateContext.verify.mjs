import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = [], mutations = [], measurements = []
page.on('pageerror', e => errors.push(String(e)))
page.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) mutations.push(r.url()) })
await fs.mkdir('work/template-context-browser', { recursive: true })
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/tests/browser/creatorTemplateContext.html')
  const list = page.getByRole('region', { name: 'Creator Templates' })
  await list.locator('article').first().waitFor()
  assert.equal(await list.locator('article').count(), 3)
  for (const text of ['Type: Universal', 'Type: Local', 'Type: Legacy', 'Current candidate: Submitted · Version 3', 'Current candidate: Draft · Version 2', 'Publication: Published version 1.', 'Retained Local approval: Approved · Version 1', 'Suspended · Version 1']) {
    assert.equal((await list.textContent()).includes(text), true)
  }
  const edit = list.getByRole('link', { name: 'Edit template' })
  await edit.focus(); await page.keyboard.press('Tab')
  const deleteButton = list.getByRole('button', { name: 'Delete', exact: true })
  assert.equal(await deleteButton.evaluate(n => document.activeElement === n), true)
  await page.keyboard.press('Tab')
  assert.equal(await list.getByRole('link', { name: 'View template' }).first().evaluate(n => document.activeElement === n), true)
  await page.keyboard.press('Shift+Tab')
  assert.equal(await deleteButton.evaluate(n => document.activeElement === n), true)
  const measure = await list.evaluate(n => ({ width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth || n.scrollWidth > n.clientWidth }))
  assert.equal(measure.overflow, false); measurements.push(measure)
  await list.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `work/template-context-browser/list-${width}.png`, fullPage: true })
}
assert.deepEqual(errors, []); assert.deepEqual(mutations, [])
console.log(JSON.stringify({ measurements, errors, mutations }))
await browser.close()
