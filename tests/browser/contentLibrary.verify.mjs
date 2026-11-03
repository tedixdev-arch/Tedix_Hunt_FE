import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = [], mutations = [], measurements = []
page.on('pageerror', error => errors.push(String(error)))
page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()) })
const output = 'docs/evidence/content-library-c1'
await fs.mkdir(output, { recursive: true })
for (const width of [1440, 390, 320]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/tests/browser/creatorStudio.html')
  await page.getByRole('button', { name: 'Content', exact: true }).click()
  const content = page.getByRole('region', { name: 'Content Library' })
  await content.getByRole('button', { name: /^Preview / }).first().waitFor()
  assert.equal(await content.getByRole('button', { name: /^Preview / }).count(), 15)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  measurements.push({ width, overflow: false })
  await page.screenshot({ path: `${output}/content-${width}.png`, fullPage: true })
  // Every Starter uses the real shared renderer, opens without configuration errors and closes by Escape.
  for (let i = 0; i < 15; i++) {
    await content.getByRole('button', { name: /^Preview / }).nth(i).click()
    const dialog = page.getByRole('dialog')
    assert.equal(await dialog.getByRole('alert').count(), 0)
    assert.equal(await dialog.evaluate(node => node.scrollWidth > node.clientWidth), false)
    if (i === 0) {
      await dialog.getByRole('button', { name: 'Hint', exact: true }).click()
      await page.screenshot({ path: `${output}/preview-${width}.png` })
    }
    await page.keyboard.press('Escape')
  }
  await content.getByRole('button', { name: 'Team Challenges', exact: true }).click()
  await content.getByRole('button', { name: 'Preview Scrambled Word', exact: true }).waitFor()
  assert.equal(await content.getByRole('button', { name: /^Preview / }).count(), 7)
  for (let i = 0; i < 7; i++) {
    await content.getByRole('button', { name: /^Preview / }).nth(i).click()
    assert.equal(await page.getByRole('dialog').getByRole('alert').count(), 0)
    await page.keyboard.press('Escape')
  }
  await content.getByRole('button', { name: 'Navigation Hints', exact: true }).click()
  await content.getByText(/No standalone Starter records/).waitFor()
  await page.screenshot({ path: `${output}/empty-${width}.png` })
  await content.getByRole('button', { name: 'Personal Challenges', exact: true }).click()
  await content.getByLabel('Grade', { exact: true }).selectOption('5')
  await content.getByText(/No Starter examples match/).waitFor()
  await content.getByRole('button', { name: 'Reset filters' }).click()
  await content.getByRole('searchbox').fill('prime')
  assert.equal(await content.getByRole('button', { name: /^Preview / }).count(), 2)
  await page.getByRole('button', { name: '+ Create Template', exact: true }).click()
  assert.equal(await page.getByRole('dialog').getByRole('link', { name: /^Universal Template/ }).getAttribute('href'), '/create?category=universal')
  await page.keyboard.press('Escape')
}
assert.deepEqual(errors, []); assert.deepEqual(mutations, [])
await fs.writeFile(`${output}/results.json`, JSON.stringify({ measurements, errors, mutations, previewsPerViewport: 22 }, null, 2))
await browser.close()
