import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const before = process.argv.includes('--before')
const output = `docs/evidence/c1-5/${before ? 'before' : 'after'}`
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []; page.on('pageerror', e => errors.push(e.message))
const url = 'http://127.0.0.1:5173/tests/browser/contentUnified.html'
const results = []
for (const width of [1440, 390, 320]) {
  await page.setViewportSize({ width, height: 960 }); await page.goto(url)
  await page.getByRole('button', { name: 'Edit with Preview', exact: true }).waitFor()
  const shot = async name => {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow at ${width}`)
    await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true })
  }
  await shot('default')
  if (before) {
    await page.getByRole('button', { name: 'Complex / LaTeX', exact: true }).click(); await shot('latex')
    await page.getByRole('button', { name: 'Team Challenges', exact: true }).click(); await shot('team')
    await page.getByRole('button', { name: 'Library', exact: true }).click(); await shot('library')
    continue
  }
  assert.equal(await page.getByLabel('Content type').inputValue(), 'Personal Challenges')
  assert.equal(await page.getByRole('button', { name: 'Add Exercise', exact: true }).count(), 1)
  assert.equal(await page.getByRole('button', { name: 'Apply challenge', exact: true }).count(), 0)
  await page.getByLabel('Exercise category').selectOption('Mathematics')
  await page.getByText('Classification & Location', { exact: true }).click()
  for (const label of ['Grade', 'Main', 'Unit', 'Lesson']) assert.equal(await page.getByLabel(label, { exact: true }).isDisabled(), true)
  assert.equal(await page.getByLabel('Content country').inputValue(), '')
  await shot('mathematics')
  await page.getByText('Classification & Location', { exact: true }).click()
  await page.getByLabel('Title', { exact: true }).fill('My reusable exercise')
  await shot('preview')
  await page.getByRole('button', { name: 'Complex / LaTeX', exact: true }).click(); await shot('latex')
  await page.getByRole('button', { name: 'Edit with Preview', exact: true }).click()
  assert.equal(await page.getByLabel('Title', { exact: true }).inputValue(), 'My reusable exercise')
  await page.getByRole('button', { name: 'Add Exercise', exact: true }).click()
  await page.getByText('Exercise prepared for this session. Not saved to Library.', { exact: true }).waitFor(); await shot('prepared')
  await page.getByLabel('Title', { exact: true }).fill('')
  assert.equal(await page.getByText('Exercise prepared for this session. Not saved to Library.', { exact: true }).count(), 0)
  await page.getByRole('button', { name: 'Add Exercise', exact: true }).click(); await page.getByRole('alert').last().waitFor(); await shot('validation')
  await page.getByLabel('Title', { exact: true }).fill('Retained exercise')
  page.once('dialog', d => d.dismiss()); await page.getByRole('link', { name: 'Leave Content' }).click()
  await page.getByLabel('Content type').selectOption('Team Challenges'); await shot('team')
  await page.getByLabel('Content type').selectOption('Navigation Hints')
  assert.equal(await page.getByRole('button', { name: 'Add Exercise', exact: true }).count(), 0)
  await page.getByLabel('Content type').selectOption('Personal Challenges')
  assert.equal(await page.getByLabel('Title', { exact: true }).inputValue(), 'Retained exercise')
  await page.getByRole('button', { name: 'My Content', exact: true }).click()
  const starter = page.locator('details').filter({ has: page.locator('summary', { hasText: /^Starter/ }) })
  assert.equal(await starter.getAttribute('open'), null); await shot('library')
  await page.goto(url + '?template=1'); await page.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
  await shot('template-preview')
  await page.getByRole('button', { name: 'Complex / LaTeX', exact: true }).click(); await shot('template-latex')
  results.push({ width, overflow: false, sharedEditor: true, draftProtection: true, honestPreparation: true })
}
assert.deepEqual(errors, [])
await writeFile(`${output}/results.json`, JSON.stringify({ capturedAt: new Date().toISOString(), results, errors }, null, 2))
await browser.close()
console.log('Content creation verification passed')
