import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = [], output = 'docs/evidence/personal-visual-editors'
page.on('pageerror', e => errors.push(String(e))); page.on('dialog', d => d.accept())
await fs.mkdir(output, { recursive: true })
const panel = () => page.getByRole('region', { name: 'Personal Challenge authoring', exact: true })
const btn = name => panel().getByRole('button', { name, exact: true })
const feature = () => page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name: /Personal Challenge/ }).click()
const play = () => panel().locator('[aria-label$="interactive exercise"]:visible')
async function save() { await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor() }
async function pencil(label, value, numeric = false) {
  const trigger = btn(`Edit ${label}`); await trigger.focus(); await page.keyboard.press('Enter')
  const field = panel().getByRole('group', { name: `Edit ${label}`, exact: true }).getByRole(numeric ? 'spinbutton' : 'textbox')
  assert.equal(await field.evaluate(n => n === document.activeElement), true)
  await field.fill(String(value)); await page.keyboard.press('Escape'); assert.equal(await trigger.evaluate(n => n === document.activeElement), true)
}
async function layout() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'page overflow')
  assert.equal(await panel().evaluate(n => n.scrollWidth > n.clientWidth), false, 'panel overflow')
}
async function shot(name) { await layout(); const target = panel().getByLabel('Mobile challenge canvas', { exact: true }).filter({ visible: true }); await target.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/${name}.png` }) }
async function solve(e) {
  const p = play(), d = e.interaction, a = e.answer
  const select = (name, id) => p.getByRole('combobox', { name, exact: true }).selectOption(id)
  const click = name => p.getByRole('button', { name, exact: true }).click()
  await click('Check answer'); assert.equal(await p.locator('[role="status"]').textContent(), e.feedback.incorrect)
  switch (e.type) {
    case 'true-false': await click(a.value ? 'True' : 'False'); break
    case 'memory-card': await p.getByRole('textbox', { name: 'Recalled answer' }).fill(a.value); await p.getByRole('button', { name: 'Reveal recall card', exact: true }).click(); assert.equal(await p.getByLabel('Recall card answer').textContent(), d.card); break
    case 'number-line': await p.getByRole('slider').focus(); await page.keyboard.press('Home'); if (a.target !== d.min) await p.getByRole('slider').fill(String(a.target)); break
    case 'multiple-choice': for (const id of a.optionIds) await p.getByRole('checkbox', { name: d.options.find(x => x.id === id).text, exact: true }).check(); break
    case 'match-columns': for (const pair of a.pairs) await select(d.left.find(x => x.id === pair.leftId).text, pair.rightId); break
    case 'drag-drop': await p.locator('[draggable=true]').first().dragTo(p.locator('[class*=border-dashed]').nth(d.targets.findIndex(x => x.id === a.assignments[0].targetId))); for (const placement of a.assignments) await select(`Target for ${d.items.find(x => x.id === placement.itemId).text}`, placement.targetId); break
    case 'sequence': case 'build-problem': { const items = d.elements ?? d.pieces; for (const id of a.order ?? a.construction) { const i = items.findIndex(x => x.id === id); await click(`${i + 1}. ${items[i].text}`) } break }
    case 'find-mistake': await click(d.steps.find(x => x.id === a.stepId).text); await click('Check answer'); await click(d.explanations.find(x => x.id === a.explanationId).text); break
    case 'number-pattern': await p.getByRole('textbox', { name: 'Missing term' }).fill(String(a.value)); break
    case 'shape-pattern': await click(d.shapes.find(x => x.id === a.shapeId).text); break
    case 'rule-discovery': await click(d.rules.find(x => x.id === a.ruleId).text); await p.getByRole('textbox', { name: `Predicted output for ${d.predictionInput}` }).fill(String(a.predictedOutput)); break
  }
  await click('Check answer'); assert.equal(await p.locator('[role="status"]').textContent(), e.feedback.correct)
  await click('Reset'); assert.equal(await p.locator('[role="status"]').count(), 0)
}
async function edit(type, e) {
  const d = e.interaction, a = e.answer
  const choose = (label, value) => panel().getByRole('combobox', { name: label, exact: true }).selectOption(value)
  await pencil('Title', `Visual ${type}`)
  switch (type) {
    case 'true-false': await pencil('Statement', 'A square has four sides.'); await btn(a.value ? 'False' : 'True').click(); break
    case 'memory-card': await pencil('Recall card', 'Recall this blue triangle'); await pencil('Accepted recall answer', 'blue triangle'); await pencil('Reveal delay (milliseconds)', 1000, true); break
    case 'number-line': await pencil('Instructions', 'Place the marker on the correct tick.'); await pencil('Maximum', d.max + d.step, true); await pencil('Correct value', a.target === d.min ? d.min + d.step : d.min, true); break
    case 'multiple-choice': await pencil('Option 1', 'Edited choice'); await panel().getByRole('checkbox', { name: 'Correct answer', exact: true }).nth(0).setChecked(!a.optionIds.includes(d.options[0].id)); if (a.optionIds.length === 1 && a.optionIds[0] === d.options[0].id) await panel().getByRole('checkbox', { name: 'Correct answer', exact: true }).nth(1).check(); break
    case 'match-columns': await pencil('Left card 1', 'Edited matching card'); await choose('Match for Edited matching card', d.right.find(x => x.id !== a.pairs[0].rightId).id); break
    case 'drag-drop': await pencil('Item 1', 'Edited movable item'); await choose('Place Edited movable item', d.targets.find(x => x.id !== a.assignments[0].targetId).id); break
    case 'sequence': await pencil('Sequence item 1', 'Edited sequence card'); await btn('Move answer position 1 down').click(); break
    case 'find-mistake': await pencil('Step 1', 'Edited worked step'); await choose('Incorrect step', d.steps.find(x => x.id !== a.stepId).id); await choose('Correct explanation', d.explanations.find(x => x.id !== a.explanationId).id); break
    case 'build-problem': await pencil('Piece 1', 'Edited construction piece'); await btn('Move answer position 1 down').click(); break
    case 'number-pattern': await pencil('Term 1', d.terms[0].value + 1, true); await pencil('Missing number', a.value + 1, true); break
    case 'shape-pattern': await pencil('Shape 1', 'Edited shape'); await choose('Missing shape', d.shapes.find(x => x.id !== a.shapeId).id); break
    case 'rule-discovery': await pencil('Example 1 output', d.examples[0].output + 1, true); await choose('Correct rule', d.rules.find(x => x.id !== a.ruleId).id); await pencil('Predicted output', a.predictedOutput + 1, true); break
  }
}
try {
  for (const width of [1440, 768, 390, 320]) for (const type of ['true-false','memory-card','number-line','multiple-choice','match-columns','drag-drop','sequence','find-mistake','build-problem','number-pattern','shape-pattern','rule-discovery']) {
    console.log(width, type)
    await page.setViewportSize({ width, height: 1000 }); await page.goto(`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/personalVisualEditors.html`)
    await page.getByRole('button', { name: 'Continue to Hunt builder', exact: true }).click()
    await page.getByRole('textbox', { name: 'Template name', exact: true }).fill('Visual mechanics'); await save(); const initial = await page.evaluate(() => window.fixtureRecord())
    await feature(); const selector = panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }); assert.equal(await selector.locator('option').count(), 16); await selector.selectOption(type)
    assert.equal(await btn('Edit Title').count(), 0)
    const example = await page.evaluate(type => window.examples.find(e => e.type === type), type)
    await btn('Create Your Own').click(); assert.equal(await btn('Edit with Preview').getAttribute('aria-pressed'), 'true')
    await btn('Apply to Hunt').click(); await save()
    const baseline = await page.evaluate(() => window.fixtureRecord().content.checkpoints[0].customExercises.personal)
    await edit(type, baseline); await shot(`${type}-edit-${width}`)
    await btn('Step by Step').click()
    for (let i = 0; i < 4; i++) await btn('Next').click()
    assert.equal(await play().count(), 1)
    await btn('Edit with Preview').click(); assert.match(await panel().textContent(), new RegExp(`Visual ${type}`))
    await btn('Apply to Hunt').click(); await save()
    const saved = await page.evaluate(() => window.fixtureRecord()), e = saved.content.checkpoints[0].customExercises.personal
    assert.notDeepEqual(e.answer, baseline.answer); assert.equal(e.title, `Visual ${type}`)
    assert.deepEqual(saved.content.checkpoints.slice(1), initial.content.checkpoints.slice(1))
    await btn('Play').click(); await solve(e); await shot(`${type}-play-${width}`); assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), saved)
    // A local attempt survives switching modes; no attempt data enters persistence.
    await btn('Step by Step').click(); await btn('Edit with Preview').click()
    const checkpoints = page.getByLabel('Checkpoint selector', { exact: true }); await checkpoints.getByRole('button', { name: 'Checkpoint 2', exact: true }).click(); await checkpoints.getByRole('button', { name: 'Checkpoint 1', exact: true }).click()
    assert.match(await panel().textContent(), new RegExp(`Visual ${type}`))
    await page.evaluate(() => window.fixtureReopen()); await feature(); assert.match(await panel().textContent(), new RegExp(`Visual ${type}`))
    if (type === 'true-false') {
      await page.evaluate(() => { window.fixtureApprove(); window.fixtureReopen() }); await feature(); await pencil('Title', 'Revised approved challenge'); await save()
      const revised = await page.evaluate(() => window.fixtureRecord()); assert.equal(revised.content.version, saved.content.version + 1); assert.equal(revised.status, 'draft'); assert.deepEqual(revised.content.checkpoints[0].customExercises.personal.answer, e.answer)
      await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: /FinishPoint/ }).click(); await panel().getByRole('combobox', { name: 'Personal Challenge', exact: true }).selectOption(type); await btn('Create Your Own').click(); await btn('Apply to Hunt').click(); await save(); assert.equal(await page.evaluate(() => window.fixtureRecord().content.checkpoints.at(-1).customExercises.personal.type), type)
    }
    await layout(); results.push({ width, type, visualContentAndAnswer: true, guided: true, incorrectAndCorrect: true, reset: true, pencilKeyboardFocus: true, checkpoint: true, saveReload: true, overflow: false })
  }
  // Consume a mocked from-Universal result through the actual Local editor, then revise independently.
  const source = await page.evaluate(() => window.fixtureRecord())
  await page.evaluate(() => { window.fixtureCopyToLocal(); window.fixtureReopen() }); await feature()
  const copied = await page.evaluate(() => window.fixtureRecord())
  assert.equal(copied.category, 'local'); assert.notEqual(copied.content.checkpoints[0].customExercises.personal.id, source.content.checkpoints[0].customExercises.personal.id)
  await pencil('Title', 'Local-only revision'); await save(); await page.evaluate(() => window.fixtureReopen()); await feature()
  assert.match(await panel().textContent(), /Local-only revision/); assert.deepEqual(await page.evaluate(() => window.fixtureCopySource()), source)
  assert.deepEqual(errors, [])
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ scenarios: results.length, results, errors, copy: 'Mocked destination-owned from-Universal result, edited and reloaded without source mutation', backend: 'Mocked API; real Creator Studio, persistence adapters and exercise renderer. No authenticated BE E2E.' }, null, 2)); console.log(JSON.stringify({ scenarios: results.length, errors }))
} finally { await browser.close() }
