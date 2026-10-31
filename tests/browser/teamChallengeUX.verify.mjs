import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(); page.setDefaultTimeout(10000)
const errors = [], results = [], output = 'docs/evidence/team-challenge-ux'
page.on('pageerror', e => errors.push(String(e))); page.on('dialog', d => d.accept())
await fs.mkdir(output, { recursive: true })
const panel = () => page.getByRole('region', { name: 'Team Challenge authoring', exact: true })
const feature = () => page.getByRole('navigation', { name: 'Hunt Features', exact: true }).getByRole('button', { name: /Team Challenge/ }).click()
const canvas = () => panel().getByLabel('Mobile challenge canvas', { exact: true })
async function layout() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('main').scrollWidth > innerWidth), false, 'page overflow')
  assert.equal(await panel().evaluate(n => n.scrollWidth > n.clientWidth), false, 'editor overflow')
}
async function shot(name, focus = canvas()) { await layout(); await focus.evaluate(n => n.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.screenshot({ path: `${output}/${name}.png` }) }
async function save() { await page.getByRole('button', { name: 'Save draft', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Template version saved by the backend' }).waitFor() }
async function solve(e, captureName) {
  const d = e.interaction, a = e.answer, play = canvas()
  await play.getByRole('button', { name: 'Check team answer', exact: true }).click(); assert.match(await play.textContent(), new RegExp(e.feedback.incorrect))
  if (e.type === 'distributed-information' || e.type === 'assemble-machine') await play.getByRole('button', { name: (d.options ?? d.frequencies).find(x => x.id === (a.optionId ?? a.frequencyId)).text, exact: true }).click()
  else if (e.type === 'shared-final-key') { for (const id of a.order) await play.getByRole('button', { name: `Add ${d.contributions.find(x => x.id === id).digits}`, exact: true }).click(); await play.getByRole('textbox', { name: 'Combined key', exact: true }).fill(a.code) }
  else if (e.type === 'filter-noise') { for (const id of a.trustedSignalIds) await play.getByRole('checkbox', { name: d.signals.find(x => x.id === id).text, exact: true }).check() }
  else await play.getByRole('textbox', { name: e.type === 'scrambled-word' ? 'Reconstructed word' : 'Team answer', exact: true }).fill(a.word ?? a.value)
  await play.getByRole('button', { name: 'Check team answer', exact: true }).click(); assert.match(await play.textContent(), new RegExp(e.feedback.correct))
  if (captureName) await shot(captureName, play.getByLabel('Shared team objective', { exact: true }))
  await play.getByRole('button', { name: 'Reset simulation', exact: true }).click(); assert.equal(await play.getByRole('status').count(), 0)
}
try {
  for (const width of [1440, 768, 390, 320]) for (const type of ['scrambled-word','distributed-information','hypothesis','assemble-machine','clue-synthesis','filter-noise','shared-final-key']) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/teamChallengeUX.html`)
    await page.getByRole('button', { name: 'Continue to Hunt builder', exact: true }).click()
    await page.getByRole('textbox', { name: 'Template name', exact: true }).fill('Team adventure'); await save(); const original = await page.evaluate(() => window.fixtureRecord())
    await feature(); const selector = panel().getByRole('combobox', { name: 'Team Challenge', exact: true }); assert.equal(await selector.locator('option').count(), 8); await selector.selectOption(type)
    if (type === 'distributed-information') await shot(`team-selector-${width}`, panel())
    const example = await page.evaluate(type => window.examples.find(e => e.type === type), type)
    assert.equal(await canvas().count(), 1); assert.equal(await panel().getByRole('button', { name: 'Test Challenge', exact: true }).count(), 0); assert.equal(await panel().getByRole('button', { name: 'Edit Title', exact: true }).count(), 0)
    await solve(example); await shot(`${type}-predefined-${width}`); assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), original)
    await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click(); assert.equal(await panel().getByRole('button', { name: 'Edit with Preview', exact: true }).getAttribute('aria-pressed'), 'true')
    const pencil = panel().getByRole('button', { name: 'Edit Title', exact: true }); await pencil.focus(); await page.keyboard.press('Enter')
    const field = panel().getByRole('group', { name: 'Edit Title', exact: true }).getByRole('textbox'); assert.equal(await field.evaluate(n => n === document.activeElement), true); await field.fill(`Our ${type}`); await page.keyboard.press('Escape'); assert.equal(await pencil.evaluate(n => n === document.activeElement), true)
    if (type === 'distributed-information') {
      const perspective = panel().getByRole('combobox', { name: 'Player perspective', exact: true }), privateView = panel().getByLabel('Private player information', { exact: true })
      assert.match(await privateView.textContent(), /not red/); assert.equal((await privateView.textContent()).includes('not blue'), false)
      await perspective.selectOption('1'); assert.match(await privateView.textContent(), /not blue/); assert.equal((await privateView.textContent()).includes('not red'), false)
      await panel().getByRole('button', { name: 'Edit Player information 2', exact: true }).click(); await panel().getByRole('group', { name: 'Edit Player information 2', exact: true }).getByRole('textbox').fill('The safe door is not blue. Discuss with Player A.'); await shot(`distributed-information-pencil-${width}`); await page.keyboard.press('Escape')
    }
    if (type === 'shared-final-key') { await panel().getByRole('button', { name: 'Edit Shared objective', exact: true }).click(); await panel().getByRole('group', { name: 'Edit Shared objective', exact: true }).getByRole('textbox').fill('Arrange from smallest to largest.'); await shot(`shared-final-key-pencil-${width}`); await page.keyboard.press('Escape') }
    await panel().getByRole('button', { name: 'Step by Step', exact: true }).click(); const guide = panel().getByRole('region', { name: 'Guided Team Challenge editor', exact: true }); await guide.getByRole('textbox', { name: 'Title', exact: true }).fill(`Guided ${type}`); await guide.getByRole('button', { name: 'Next', exact: true }).click(); await shot(`${type}-guided-${width}`, guide); await guide.getByRole('button', { name: 'Back', exact: true }).click(); await panel().getByRole('button', { name: 'Edit with Preview', exact: true }).click(); assert.match(await canvas().textContent(), /Guided/)
    await panel().getByRole('button', { name: 'Apply Team Challenge', exact: true }).click(); await save(); const saved = await page.evaluate(() => window.fixtureRecord()), e = saved.content.checkpoints[0].customExercises.team
    assert.equal(e.title, `Guided ${type}`); assert.equal(e.owner.version, 2); assert.deepEqual(saved.content.checkpoints.slice(1), original.content.checkpoints.slice(1))
    await solve(e, ['distributed-information', 'shared-final-key'].includes(type) ? `${type}-success-${width}` : undefined); await shot(`${type}-simulation-${width}`); assert.deepEqual(await page.evaluate(() => window.fixtureRecord()), saved)
    const checkpoints = page.getByLabel('Checkpoint selector', { exact: true }); await checkpoints.getByRole('button', { name: 'Checkpoint 2', exact: true }).click(); await checkpoints.getByRole('button', { name: 'Checkpoint 1', exact: true }).click(); assert.match(await canvas().textContent(), /Guided/)
    await page.evaluate(() => window.fixtureReopen()); await feature(); assert.match(await canvas().textContent(), /Guided/)
    await page.getByLabel('Checkpoint selector', { exact: true }).getByRole('button', { name: /FinishPoint/ }).click(); await panel().getByRole('combobox', { name: 'Team Challenge', exact: true }).selectOption('shared-final-key'); await panel().getByRole('button', { name: 'Create Your Own', exact: true }).click(); await panel().getByRole('button', { name: 'Apply Team Challenge', exact: true }).click(); await save(); const terminalSaved = await page.evaluate(() => window.fixtureRecord()); assert.equal(terminalSaved.content.checkpoints.at(-1).customExercises.team.type, 'shared-final-key'); assert.deepEqual(terminalSaved.content.checkpoints[0].customExercises.team.interaction, e.interaction); await layout()
    if (type === 'shared-final-key') await shot(`finishpoint-${width}`)
    results.push({ width, type, predefinedImmutable: true, independentCustom: true, defaultPreview: true, keyboardPencil: true, sharedGuidedState: true, successFailureReset: true, saveReloadRevision: true, checkpointRetention: true, finishPoint: true, overflow: false })
  }
  assert.deepEqual(errors, []); await fs.writeFile(`${output}/results.json`, JSON.stringify({ scenarios: results.length, results, errors, backend: 'Mocked Template API; real Creator Studio components. No authenticated backend E2E or live multiplayer.' }, null, 2)); console.log(JSON.stringify({ scenarios: results.length, errors }))
} finally { await browser.close() }
