import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const results = []
await fs.mkdir('work/prototype-location', { recursive: true })
try {
  for (const width of [1440, 390, 320]) for (const role of ['creator', 'organizer']) {
    const page = await browser.newPage({ viewport: { width, height: 950 } })
    const geography = [], errors = [], mutations = []
    page.on('pageerror', error => errors.push(String(error)))
    page.on('request', request => {
      if (/^\/api\/.*geography/.test(new URL(request.url()).pathname)) geography.push(request.url())
      if (request.method() !== 'GET') mutations.push(request.url())
    })
    // Fail any unexpected API use; the prototype must work even with an unavailable backend.
    await page.route(/^https?:\/\/[^/]+\/api\//, route => route.abort())
    await page.goto(`http://127.0.0.1:5173/tests/browser/prototypeLocation.html${role === 'organizer' ? '?organizer' : ''}`)
    const location = page.getByRole('region', { name: 'Prototype location' })
    await location.waitFor()
    assert.deepEqual(await location.locator('select').evaluateAll(nodes => nodes.map(node => node.value)), ['Romania', 'Cluj', 'Cluj-Napoca'])
    assert.equal(await page.getByText(/Loading choices|missing.region|No approved Hunts/).count(), 0)
    await page.getByRole('button', { name: role === 'creator' ? 'Continue to Template builder' : 'Choose Hunt', exact: true }).click()
    if (role === 'creator') {
      await page.getByRole('heading', { name: 'Template Setup', exact: true }).waitFor()
      assert.equal(await page.getByRole('group', { name: 'Template builder', exact: true }).isEnabled(), true)
    } else {
      await page.getByRole('heading', { name: 'Choose your adventure' }).waitFor()
      await page.getByText('No approved Hunts are available for this prototype location.', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'Back', exact: true }).click()
      assert.equal(await page.getByRole('button', { name: 'Choose Hunt', exact: true }).isEnabled(), true)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.deepEqual(geography, []); assert.deepEqual(mutations, []); assert.deepEqual(errors, [])
    await page.screenshot({ path: `work/prototype-location/${role}-${width}.png`, fullPage: true })
    results.push({ role, width, preselected: true, transition: 'passed', geographyCalls: geography.length, mutations: mutations.length, horizontalOverflow: false })
    await page.close()
  }
  await fs.writeFile('work/prototype-location/results.json', JSON.stringify(results, null, 2) + '\n')
  console.log(JSON.stringify(results))
} finally { await browser.close() }
