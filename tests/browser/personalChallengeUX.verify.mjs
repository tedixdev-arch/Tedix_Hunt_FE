import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = [], output = 'docs/evidence/personal-challenge-ux'
page.on('pageerror', error => errors.push(String(error))); page.on('dialog', dialog => dialog.accept())
await fs.mkdir(output, { recursive: true })
const panel = () => page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
const feature = () => page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name: /Personal Challenge/ }).click()
const choose = type => panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).selectOption(type)
async function layout() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('main').scrollWidth > innerWidth), false, 'page overflow')
  assert.equal(await panel().evaluate(node => node.scrollWidth > node.clientWidth), false, 'editor overflow')
}
async function shot(name, focus = panel()) {
  await layout(); await focus.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.screenshot({ path: `${output}/${name}.png` })
}
async function save() { await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor() }
async function solve(e) {
  const play = panel().locator(`[aria-label="${e.type} interactive exercise"]`), d = e.interaction, a = e.answer
  if (e.type === 'tap-pair') {
    const cards = play.getByLabel('Tap and pair cards').getByRole('button')
    for (const pair of a.pairs) { await cards.nth(d.left.findIndex(x => x.id === pair.leftId)).click(); await cards.nth(d.left.length + [...d.right].reverse().findIndex(x => x.id === pair.rightId)).click() }
  } else if (e.type === 'single-choice') await play.getByRole('button', { name: d.options.find(x => x.id === a.optionId).text, exact: true }).click()
  else for (const answer of a.values) await play.getByRole('textbox').nth(d.blanks.findIndex(x => x.id === answer.blankId)).fill(answer.value)
  await play.getByRole('button', { name: 'Check answer', exact: true }).click(); assert.equal(await play.getByRole('status').textContent(), e.feedback.correct)
  await play.getByRole('button', { name: 'Hint', exact: true }).click(); await play.getByRole('button', { name: 'Solution', exact: true }).click()
  await play.getByRole('button', { name: 'Reset', exact: true }).click(); assert.equal(await play.getByRole('status').count(), 0)
}
try {
  for (const width of [1440, 768, 390, 320]) for (const type of ['tap-pair', 'single-choice', 'fill-blank']) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/personalChallengeUX.html`)
    await page.getByRole('combobox', { name: 'Country *', exact: true }).selectOption('FR')
    await page.getByRole('textbox', { name: 'City *', exact: true }).fill('Paris')
    await page.getByRole('button', { name: 'Paris · Île-de-France · France', exact: true }).click()
    await page.getByRole('button', { name: 'Continue to Hunt builder', exact: true }).click()
    await page.getByRole('textbox', { name: 'Template name', exact: true }).fill('My city adventure')
    await save(); const initial = await page.evaluate(() => window.fixtureRecord())
    assert.deepEqual(initial.content.checkpoints, [...Array.from({ length: 6 }, (_, i) => ({ checkpoint: i + 1 })), { role: 'terminal' }])
    assert.equal(JSON.stringify(initial).includes('Signal'), false); assert.deepEqual(initial.content.configuration.checkpointPositions, [])
    await feature()
    if (type === 'tap-pair') {
      await shot(`clean-local-${width}`)
      const selector = panel().getByRole('combobox', { name: 'Personal Challenge', exact: true })
      const values = await selector.locator('option').evaluateAll(nodes => nodes.map(n => n.value))
      assert.equal(values.length, 16); assert.equal(new Set(values).size, 16); assert.equal(values.includes('hidden-rule'), false)
      await selector.focus(); await shot(`modern-selector-${width}`)
    }
    await choose(type)
    assert.equal(await panel().getByRole('button', { name: 'Test Challenge', exact: true }).count(), 0)
    assert.equal(await panel().getByRole('button', { name: /^Edit / }).count(), 0)
    const example = await page.evaluate(type => window.examples.find(e => e.type === type), type)
    await solve(example); assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), initial)
    await shot(`${type}-predefined-${width}`, panel().getByLabel('Mobile challenge canvas', { exact: true }))
    await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click()
    assert.equal(await panel().getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
    await panel().getByRole('textbox', { name: 'Title', exact: true }).fill(`My ${type} game`)
    const key = type === 'tap-pair' ? 'Card' : type === 'single-choice' ? 'Option' : 'Question'
    const pencil = panel().getByRole('button', { name: `Edit ${key} 1`, exact: true })
    await pencil.focus(); await page.keyboard.press('Enter')
    const editor = panel().getByRole('group', { name: `Edit ${key} 1`, exact: true })
    const field = editor.getByRole('textbox')
    assert.equal(await field.evaluate(node => document.activeElement === node), true)
    const text = type === 'fill-blank' ? 'The answer is ___.' : 'An edited card'
    await field.fill(text)
    if (type === 'single-choice') await editor.getByRole('radio', { name: 'Correct answer', exact: true }).check()
    await shot(`${type}-pencil-${width}`, editor)
    await page.keyboard.press('Escape'); assert.equal(await pencil.evaluate(node => document.activeElement === node), true)
    await shot(`${type}-visual-${width}`, panel().getByRole('button', { name: 'Edit with Preview', exact: true }))
    const add = type === 'tap-pair' ? 'Add pair' : type === 'single-choice' ? 'Add option' : 'Add blank'
    await panel().getByRole('button', { name: add, exact: true }).click()
    assert.equal(await panel().getByRole('button', { name: 'Play', exact: true }).isDisabled(), true)
    const count = type === 'fill-blank' ? 3 : 4
    await panel().getByRole('button', { name: `Edit ${key} ${count}`, exact: true }).click()
    await panel().getByRole('button', { name: `${type === 'tap-pair' ? 'Remove pair' : type === 'single-choice' ? 'Remove option' : 'Remove question'} ${count}`, exact: true }).click()
    assert.equal(await panel().getByRole('button', { name: 'Play', exact: true }).isEnabled(), true)
    await panel().getByRole('button', { name: 'Step by Step', exact: true }).click()
    await shot(`${type}-guided-${width}`, panel().getByRole('region', { name: 'Guided challenge editor', exact: true }))
    await panel().getByRole('button', { name: 'Next', exact: true }).click(); await panel().getByRole('button', { name: 'Back', exact: true }).click()
    await panel().getByRole('button', { name: 'Edit with Preview', exact: true }).click()
    assert.match(await panel().getByLabel('Mobile challenge canvas', { exact: true }).textContent(), new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    await panel().getByRole('button', { name: 'Apply to Hunt', exact: true }).click(); await save()
    const saved = await page.evaluate(() => window.fixtureRecord()), e = saved.content.checkpoints[0].customExercises.personal
    assert.equal(e.type, type); assert.equal(e.title, `My ${type} game`); assert.equal(e.owner.version, 2)
    assert.deepEqual(saved.content.checkpoints.slice(1), initial.content.checkpoints.slice(1))
    await panel().getByRole('button', { name: 'Play', exact: true }).click(); await solve(e)
    await shot(`${type}-play-${width}`, panel().getByLabel('Mobile challenge canvas', { exact: true }))
    assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), saved)
    await panel().getByRole('button', { name: 'Edit', exact: true }).click()
    const checkpoints = page.getByLabel('Checkpoint selector', { exact: true })
    await checkpoints.getByRole('button', { name: 'Checkpoint 2', exact: true }).click(); await checkpoints.getByRole('button', { name: 'Checkpoint 1', exact: true }).click()
    assert.equal(await panel().getByRole('textbox', { name: 'Title', exact: true }).inputValue(), e.title)
    await page.evaluate(() => window.fixtureReopen()); await feature()
    assert.equal(await panel().getByRole('textbox', { name: 'Title', exact: true }).inputValue(), e.title)
    assert.match(await panel().getByLabel('Mobile challenge canvas', { exact: true }).textContent(), /The answer is ___\.|An edited card/)
    await layout(); results.push({ width, type, cleanLocal: true, immediatePlay: true, pencilKeyboardAndFocus: true, itemEditingAndRemoval: true, sharedGuidedDraft: true, simulationIsolated: true, saveReload: true, checkpointRetention: true, overflow: false })
  }
  assert.deepEqual(errors, [])
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ scenarios: results.length, results, errors, backend: 'Mocked Template operations; actual Creator Studio and engine components. Not authenticated FE–BE integration.' }, null, 2))
  console.log(JSON.stringify({ scenarios: results.length, errors }))
} finally { await browser.close() }
