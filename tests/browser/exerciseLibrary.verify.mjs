import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
page.setDefaultTimeout(10000)
const errors = [], results = []
page.on('pageerror', error => { errors.push(String(error)); console.log('PAGE ERROR:', String(error)) })
await fs.mkdir('work/exercise-library-browser', { recursive: true })
const feature = name => page.locator('nav').nth(1).getByRole('button', { name })
const panel = () => page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
const dialog = () => page.getByRole('dialog', { name: 'Exercise preview' })
async function solve(e) {
  const p = dialog(), d = e.data
  switch (e.type) {
    case 'tap-pair': {
      const cards = p.getByRole('button', { name: /Card \d+ face down/ })
      assert.equal(await cards.count(), 6)
      const grid = p.getByLabel('Tap and pair cards')
      for (let i = 0; i < d.left.length; i++) { await grid.locator('button').nth(i).click(); await grid.locator('button').nth(5 - i).click() }
      break
    }
    case 'true-false': await p.getByRole('button', { name: 'false', exact: true }).click(); break
    case 'single-choice': case 'shape-pattern': await p.getByRole('button', { name: d.answer, exact: true }).click(); break
    case 'multiple-choice': for (const answer of d.answers) await p.getByRole('checkbox', { name: answer, exact: true }).check(); break
    case 'number-line': await p.getByRole('slider').focus(); await page.keyboard.press('Home'); for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight'); break
    case 'match-columns': for (let i = 0; i < d.right.length; i++) await p.locator('select').nth(i).selectOption(d.right[i]); break
    case 'drag-drop':
      await p.getByText('2', { exact: true }).first().dragTo(p.getByText('Even', { exact: true }).first())
      assert.equal(await p.getByRole('combobox', { name: 'Target for 2', exact: true }).inputValue(), 'Even')
      for (let i = 0; i < d.assignments.length; i++) await p.getByRole('combobox', { name: `Target for ${d.items[i]}` }).selectOption(d.assignments[i]); break
    case 'fill-blank': for (let i = 0; i < d.answers.length; i++) await p.getByRole('textbox').nth(i).fill(d.answers[i]); break
    case 'sequence': case 'build-problem':
      for (const piece of d.order ?? d.construction) await p.getByRole('button', { name: piece, exact: true }).and(p.locator('button:not(:disabled)')).first().click(); break
    case 'find-mistake':
      await p.getByRole('radio').nth(d.mistake - 1).check(); await p.getByRole('button', { name: 'Check answer', exact: true }).click()
      assert.match(await p.textContent(), /Now explain/)
      await p.getByRole('button', { name: d.explanation, exact: true }).click(); break
    case 'rule-discovery': await p.getByRole('button', { name: d.rule, exact: true }).click(); await p.getByRole('textbox').fill(d.answer); break
    default: await p.getByRole('textbox').fill(d.answer)
  }
  await p.getByRole('button', { name: 'Check answer', exact: true }).click()
  assert.equal(await p.locator('[role="status"]').textContent(), e.correctFeedback)
}
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/tests/browser/exerciseLibrary.html')
  await feature(/Personal Challenge/).click()
  assert.equal(await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button').count(), 7)
  assert.match(await page.getByLabel('Checkpoint selector', { exact: true }).textContent(), /7 🚩/)
  const original = await page.evaluate(() => window.fixtureRecord())
  const prototypes = await page.evaluate(() => window.prototypes)
  for (const e of prototypes) {
    console.log(`Checking ${width}: ${e.type}`)
    await panel().getByRole('combobox', { name: 'Exercise catalog' }).selectOption(e.id)
    assert.equal(await page.getByRole('button', { name: 'Save draft', exact: true }).isDisabled(), false)
    const trigger = panel().getByRole('button', { name: 'Preview Exercise', exact: true })
    await trigger.click()
    const p = dialog(); await p.waitFor()
    assert.equal(await p.getByRole('button', { name: 'Close exercise preview' }).evaluate(node => document.activeElement === node), true)
    await p.getByRole('button', { name: 'Check answer', exact: true }).click()
    assert.equal(await p.locator('[role="status"]').textContent(), e.incorrectFeedback)
    await solve(e)
    await p.getByRole('button', { name: 'Hint', exact: true }).click(); assert.equal(await p.getByLabel('Exercise hint', { exact: true }).textContent(), e.hint)
    await p.getByRole('button', { name: 'Solution', exact: true }).click(); assert.equal(await p.getByLabel('Exercise solution', { exact: true }).textContent(), e.solution)
    await p.getByRole('button', { name: 'Reset', exact: true }).click(); assert.equal(await p.locator('[role="status"]').count(), 0)
    const overflow = await p.evaluate(p => p.scrollWidth > p.clientWidth)
    assert.equal(overflow, false, `${width}: ${e.type} dialog overflow`)
    if (e.type === 'find-mistake') await page.screenshot({ path: `work/exercise-library-browser/preview-${width}.png` })
    await p.getByRole('button', { name: 'Close exercise preview' }).focus(); await page.keyboard.press('Shift+Tab')
    assert.equal(await p.getByRole('button', { name: 'Reset', exact: true }).evaluate(node => document.activeElement === node), true)
    await page.keyboard.press('Tab'); await page.keyboard.press('Escape'); await p.waitFor({ state: 'detached' })
    assert.equal(await trigger.evaluate(node => document.activeElement === node), true)
    results.push({ width, type: e.type, passed: true })
  }
  await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click()
  await panel().getByLabel('Title', { exact: true }).fill('Unsaved independent title')
  await panel().getByRole('button', { name: 'Preview Exercise', exact: true }).click()
  assert.match(await dialog().textContent(), /Unsaved independent title/)
  await dialog().getByRole('button', { name: 'Close exercise preview' }).click()
  assert.equal(await panel().getByLabel('Title', { exact: true }).inputValue(), 'Unsaved independent title')
  await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: 'Checkpoint 2', exact: true }).click()
  await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click()
  await panel().getByLabel('Title', { exact: true }).fill('Checkpoint two draft')
  await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: 'Checkpoint 1', exact: true }).click()
  assert.equal(await panel().getByLabel('Title', { exact: true }).inputValue(), 'Unsaved independent title')
  await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: 'Checkpoint 7, FinishPoint', exact: true }).click()
  await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click()
  await panel().getByLabel('Title', { exact: true }).fill('FinishPoint draft')
  await feature(/Team Challenge/).click()
  const team = page.getByRole('region', { name: 'Team Challenge authoring', exact: true })
  await team.getByRole('button', { name: 'Create Your Own', exact: true }).click()
  assert.equal(await team.getByRole('combobox', { name: 'Exercise type' }).locator('option').count(), 7)
  await team.getByRole('combobox', { name: 'Exercise type' }).selectOption('filter-noise')
  assert.match(await team.textContent(), /Named signals/)
  await team.getByRole('button', { name: 'Preview Exercise', exact: true }).click(); assert.match(await dialog().textContent(), /EAST \/ EAST/)
  await page.keyboard.press('Escape')
  assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), original)
  assert.deepEqual(await page.evaluate(() => window.fixtureCalls), [])
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('main').scrollWidth > innerWidth)
  assert.equal(overflow, false, `${width}: authoring page overflow`)
}
assert.deepEqual(errors, [])
await fs.writeFile('work/exercise-library-browser/results.json', JSON.stringify({ scenarios: results.length, results, errors, backend: 'mocked fixture; no live FE–BE integration' }, null, 2))
console.log(JSON.stringify({ scenarios: results.length, widths: [1440, 768, 390, 320], errors }))
await browser.close()
