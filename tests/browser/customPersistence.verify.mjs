import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = []
page.on('pageerror', error => errors.push(String(error)))
await fs.mkdir('work/custom-persistence-browser', { recursive: true })
const feature = name => page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name })
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/tests/browser/customPersistence.html')
  await page.waitForFunction(() => window.exercises?.length === 22)
  const exercises = await page.evaluate(() => window.exercises)
  for (const e of exercises) {
    await page.evaluate(type => window.fixtureLoad(type), e.type)
    await feature(e.classification === 'personal' ? /Personal Challenge/ : /Team Challenge/).click()
    const panel = page.getByRole('region', { name: `${e.classification === 'personal' ? 'Personal' : 'Team'} Challenge authoring`, exact: true })
    const title = `Edited ${e.type} at ${width}`
    await panel.getByLabel('Title', { exact: true }).fill(title)
    const personal = e.classification === 'personal'
    const trigger = panel.getByRole('button', { name: personal ? 'Test Challenge' : 'Preview Exercise', exact: true }); await trigger.click()
    const dialog = personal ? panel.locator(`[aria-label="${e.type} interactive exercise"]`) : page.getByRole('dialog', { name: 'Exercise preview' })
    await dialog.waitFor()
    if (!personal) assert.match(await dialog.textContent(), new RegExp(e.type))
    if (!personal) assert.equal(await dialog.getByRole('button', { name: 'Close exercise preview' }).evaluate(node => document.activeElement === node), true)
    await dialog.getByRole('button', { name: 'Check answer', exact: true }).click()
    assert.equal(await dialog.locator('[role="status"]').textContent(), e.feedback.incorrect)
    const d = e.interaction, a = e.answer
    const setText = async text => dialog.getByRole('textbox').fill(String(text))
    const choose = async name => dialog.getByRole('button', { name, exact: true }).click()
    switch (e.type) {
      case 'tap-pair': {
        const buttons = dialog.getByLabel('Tap and pair cards').getByRole('button')
        for (const pair of a.pairs) { await buttons.nth(d.left.findIndex(x => x.id === pair.leftId)).click(); await buttons.nth(d.left.length + [...d.right].reverse().findIndex(x => x.id === pair.rightId)).click() }
        break
      }
      case 'match-columns': for (const pair of a.pairs) await dialog.getByRole('combobox').nth(d.left.findIndex(x => x.id === pair.leftId)).selectOption(pair.rightId); break
      case 'single-choice': case 'distributed-information': await choose(d.options.find(x => x.id === a.optionId).text); break
      case 'true-false': await choose(a.value ? 'True' : 'False'); break
      case 'memory-card': case 'hypothesis': case 'clue-synthesis': await setText(a.value); break
      case 'multiple-choice': for (const id of a.optionIds) await dialog.getByRole('checkbox', { name: d.options.find(x => x.id === id).text, exact: true }).check(); break
      case 'number-line': await dialog.getByRole('slider').focus(); await page.keyboard.press('Home'); for (let i = 0; i < (a.target - d.min) / d.step; i++) await page.keyboard.press('ArrowRight'); break
      case 'drag-drop': for (const assignment of a.assignments) await dialog.getByRole('combobox').nth(d.items.findIndex(x => x.id === assignment.itemId)).selectOption(assignment.targetId); break
      case 'fill-blank': for (const answer of a.values) await dialog.getByRole('textbox').nth(d.blanks.findIndex(x => x.id === answer.blankId)).fill(answer.value); break
      case 'sequence': case 'build-problem': case 'shared-final-key': {
        const items = d.elements ?? d.pieces ?? d.contributions
        for (const id of a.order ?? a.construction) { const i = items.findIndex(x => x.id === id); await choose(`${i + 1}. ${items[i].text ?? items[i].digits}`) }
        if (e.type === 'shared-final-key') await setText(a.code)
        break
      }
      case 'find-mistake': await choose(d.steps.find(x => x.id === a.stepId).text); await choose('Check answer'); assert.match(await dialog.textContent(), /Now explain/); await choose(d.explanations.find(x => x.id === a.explanationId).text); break
      case 'number-pattern': await setText(a.value); break
      case 'shape-pattern': await choose(d.shapes.find(x => x.id === a.shapeId).text); break
      case 'rule-discovery': await choose(d.rules.find(x => x.id === a.ruleId).text); await setText(a.predictedOutput); break
      case 'scrambled-word': await setText(a.word); break
      case 'assemble-machine': { const frequency = d.frequencies.find(x => x.id === a.frequencyId); await choose(`${frequency.text} (${frequency.value})`); break }
      case 'filter-noise': for (const id of a.trustedSignalIds) await dialog.getByRole('checkbox', { name: d.signals.find(x => x.id === id).text, exact: true }).check(); break
    }
    await choose('Check answer'); assert.equal(await dialog.locator('[role="status"]').textContent(), e.feedback.correct)
    await dialog.getByRole('button', { name: 'Hint', exact: true }).click(); assert.equal(await dialog.getByLabel('Exercise hint 1', { exact: true }).textContent(), e.hints[0])
    await dialog.getByRole('button', { name: 'Solution', exact: true }).click(); assert.equal(await dialog.getByLabel('Exercise solution', { exact: true }).textContent(), e.solution)
    await dialog.getByRole('button', { name: 'Reset', exact: true }).click(); assert.equal(await dialog.locator('[role="status"]').count(), 0)
    assert.equal(await dialog.evaluate(node => node.scrollWidth > node.clientWidth), false)
    if (personal) await panel.getByRole('button', { name: 'Return to Edit', exact: true }).click()
    else {
      await dialog.getByRole('button', { name: 'Close exercise preview' }).focus(); await page.keyboard.press('Shift+Tab')
      assert.equal(await dialog.getByRole('button', { name: 'Reset', exact: true }).evaluate(node => document.activeElement === node), true)
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' }); assert.equal(await trigger.evaluate(node => document.activeElement === node), true)
    }
    await page.getByRole('button', { name: 'Save draft', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor()
    const saved = await page.evaluate(() => window.fixtureRecord())
    const output = saved.content.checkpoints[0].customExercises[e.classification]
    assert.equal(output.title, title); assert.equal(output.owner.version, 4)
    assert.deepEqual(output.interaction, e.interaction); assert.deepEqual(output.answer, e.answer); assert.deepEqual(output.hints, e.hints)
    await page.evaluate(() => window.fixtureReopen())
    await feature(e.classification === 'personal' ? /Personal Challenge/ : /Team Challenge/).click()
    assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
    await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: 'Checkpoint 2', exact: true }).click()
    await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: 'Checkpoint 1', exact: true }).click()
    assert.equal(await panel.getByLabel('Title', { exact: true }).inputValue(), title)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    if (e.type === 'rule-discovery') await page.screenshot({ path: `work/custom-persistence-browser/editor-${width}.png` })
    results.push({ width, mechanic: e.type, passed: true })
  }
}
assert.deepEqual(errors, [])
await fs.writeFile('work/custom-persistence-browser/results.json', JSON.stringify({ scenarios: results.length, results, errors, backend: 'Mocked Template operations, real Creator Studio and preview components; not live FE–BE integration.' }, null, 2))
console.log(JSON.stringify({ scenarios: results.length, widths: [1440, 768, 390, 320], errors }))
await browser.close()
