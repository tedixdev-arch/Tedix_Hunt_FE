import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const before = process.argv.includes('--before')
const output = `docs/evidence/c1-5a/${before ? 'before' : 'after'}`
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []; page.on('pageerror', e => errors.push(e.message))
const url = 'http://127.0.0.1:5173/tests/browser/contentVisual.html'
const results = []
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 960 }); await page.goto(url)
  await page.getByRole('button', { name: 'Edit with Preview', exact: true }).waitFor()
  const shot = async name => {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow at ${width}`)
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) })
    await page.waitForTimeout(150)
    await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true })
  }
  if (!before) {
    const geometry = await page.evaluate(() => {
      const content = document.querySelector('[aria-label="Content"]')
      const type = content.querySelector('[aria-label="Content type"]')
      const category = content.querySelector('[aria-label="Exercise category"]')
      const editor = content.querySelector('[aria-label="Library exercise draft"]')
      const canvas = editor.querySelector('.challenge-canvas')
      const mode = editor.querySelector('.challenge-mode')
      const rect = (el) => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height } }
      return { type:rect(type), category:rect(category), editor:rect(editor), canvas:rect(canvas), mode:rect(mode), collapsed:!content.querySelector('details').open,
        labelsAbove: [type, category].every(el => el.getBoundingClientRect().top > el.parentElement.getBoundingClientRect().top + 16) }
    })
    assert.ok(geometry.collapsed && geometry.labelsAbove)
    assert.ok(geometry.editor.width <= 720)
    assert.ok(geometry.canvas.width <= 340)
    assert.ok(Math.abs(geometry.canvas.x + geometry.canvas.width / 2 - geometry.editor.x - geometry.editor.width / 2) < 2)
    assert.ok(geometry.mode.width <= 360)
    if (width >= 640) assert.equal(geometry.type.y, geometry.category.y)
    else assert.ok(geometry.category.y > geometry.type.y + geometry.type.height)
  }
  await shot('default')
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
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  const starter = page.locator('details').filter({ has: page.locator('summary', { hasText: /^Starter/ }) })
  assert.equal(await starter.getAttribute('open'), null); await shot('library')
  await page.goto(url + '?template=1'); await page.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
  if (!before) {
    const template = await page.evaluate(() => {
      const canvas = document.querySelector('.challenge-canvas')
      const mode = document.querySelector('.challenge-mode')
      const button = mode.querySelector('button')
      return { maxWidth: getComputedStyle(canvas).maxWidth, canvasWidth: canvas.getBoundingClientRect().width,
        modeWidth: mode.getBoundingClientRect().width, parentWidth: mode.parentElement.getBoundingClientRect().width,
        padding: getComputedStyle(mode).paddingTop, height: getComputedStyle(button).minHeight,
        weight: getComputedStyle(button).fontWeight, shadow: getComputedStyle(canvas).boxShadow }
    })
    assert.equal(template.maxWidth, '390px')
    assert.ok(Math.abs(template.modeWidth - template.parentWidth) < 2, 'Template retains full-width mode selector')
    assert.equal(template.padding, '5px')
    assert.equal(template.height, '48px')
    assert.equal(template.weight, '700')
    if (width >= 640) { assert.equal(template.canvasWidth, 390); assert.notEqual(template.shadow, 'none') }
  }
  await shot('template-preview')
  await page.getByRole('button', { name: 'Complex / LaTeX', exact: true }).click(); await shot('template-latex')
  results.push({ width, overflow: false, sharedEditor: true, draftProtection: true, honestPreparation: true })
}
assert.deepEqual(errors, [])
await writeFile(`${output}/results.json`, JSON.stringify({ capturedAt: new Date().toISOString(), results, errors }, null, 2))
await browser.close()
console.log('Content creation verification passed')
