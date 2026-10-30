// Mocked Mapbox HTTP responses; real Chromium events and Mapbox GL camera/styles/markers.
// VITE_MAPBOX_ACCESS_TOKEN=test-public-token npm run dev
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/mapboxSearch.verify.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const screenshotDir = process.env.SCREENSHOT_DIR || 'work/checkpoint-map-screenshots'
await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] })
const target = [23.5905, 46.7742]
const camera = page => page.evaluate(() => ({ center: window.testMap.getCenter().toArray(), zoom: window.testMap.getZoom(), bearing: window.testMap.getBearing(), pitch: window.testMap.getPitch() }))
const pins = page => page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); return window.testMarkers.filter(marker => marker.getElement().isConnected).map(marker => ({ number: marker.getElement().dataset.positionPin, coordinates: marker.getLngLat().toArray(), confirmed: marker.getElement().getAttribute('aria-label').includes('Creator-confirmed') })).sort((a, b) => a.number.localeCompare(b.number)) })
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 0.0001, `${actual} != ${expected}`) }
const searchInput = page => page.getByRole('combobox', { name: 'Search locations' })
const confirm = page => page.getByRole('button', { name: 'Confirm position', exact: true })
const undo = page => page.getByRole('button', { name: 'Undo last position change', exact: true })
const redo = page => page.getByRole('button', { name: 'Redo last position change', exact: true })
const modeButton = (page, mode) => page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: mode, exact: true })
try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: true })
    page.setDefaultTimeout(10000)
    console.log(`${width}px: starting browser verification`)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    let failRetrieve = false
    let retrieveCount = 0
    await page.route('https://api.mapbox.com/**', async route => {
      const url = route.request().url()
      if (url.includes('/styles/')) {
        const satellite = url.includes('satellite-streets')
        return route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: satellite ? 'mock-satellite' : 'mock-map', type: 'background', paint: { 'background-color': satellite ? '#586358' : '#e8eeeb' } }] } })
      }
      if (url.includes('/suggest')) return route.fulfill({ json: { suggestions: [{ mapbox_id: 'statue', name: 'Statuia Mihai Viteazul', full_address: 'Piața Mihai Viteazu, Cluj-Napoca' }] } })
      if (url.includes('/retrieve')) {
        retrieveCount++
        await new Promise(resolve => setTimeout(resolve, 350))
        return failRetrieve ? route.fulfill({ status: 403, json: {} }) : route.fulfill({ json: { features: [{ geometry: { type: 'Point', coordinates: target } }] } })
      }
      return route.fulfill({ json: {} })
    })
    await page.route('https://events.mapbox.com/**', route => route.fulfill({ json: {} }))
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/tests/browser/mapboxSearch.html')
    await page.locator('#checkpoint-positions').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => window.testMap?.isStyleLoaded())
    const original = await camera(page)
    const originalPins = await pins(page)
    for (const interaction of ['mouse', 'keyboard', 'touch', 'option-keyboard', 'blur']) {
      await page.locator('[data-checkpoint="2"]').click()
      // Begin each search far away, so unchanged camera cannot pass the check.
      await page.evaluate(() => window.testMap.jumpTo({ center: [24, 47], zoom: 10 }))
      const before = await pins(page)
      const count = retrieveCount
      await searchInput(page).fill('Statuia Mihai Viteazul, Cluj-Napoca')
      await page.getByRole('listbox').waitFor()
      const suggestion = page.getByRole('option').getByRole('button')
      if (interaction === 'mouse') await suggestion.click()
      else if (interaction === 'touch') await suggestion.tap()
      else if (interaction === 'option-keyboard') { await searchInput(page).press('Tab'); await suggestion.press('Enter') }
      else {
        await searchInput(page).press('ArrowDown'); await searchInput(page).press('Enter')
        if (interaction === 'blur') {
          await page.waitForFunction(() => document.querySelector('[role="combobox"]').readOnly)
          await modeButton(page, 'Satellite').focus()
        }
      }
      await page.getByRole('status').filter({ hasText: 'Location selected.' }).waitFor()
      await page.waitForFunction(target => { const map = window.testMap; const center = map.getCenter(); return Math.abs(center.lng - target[0]) < 0.0001 && Math.abs(center.lat - target[1]) < 0.0001 && Math.abs(map.getZoom() - 16) < 0.0001 && !map.isMoving() }, target)
      console.log(`${width}px: ${interaction} search completed`)
      const searched = await camera(page)
      near(searched.center[0], target[0]); near(searched.center[1], target[1]); near(searched.zoom, 16)
      assert.equal(retrieveCount, count + 1)
      assert.deepEqual(await pins(page), before)
      assert.equal(await page.locator('[data-checkpoint="2"]').getAttribute('aria-pressed'), 'true')
      assert.equal(await undo(page).isDisabled(), true)
      await page.waitForTimeout(200)
      assert.deepEqual(await camera(page), searched)
    }
    assert.deepEqual(await pins(page), originalPins)
    assert.notDeepEqual((await camera(page)).center, original.center)

    let placementCount = 0
    async function place() {
      await page.locator('.mapboxgl-canvas').scrollIntoViewIfNeeded()
      const canvas = await page.locator('.mapboxgl-canvas').boundingBox()
      placementCount++
      // Distinct empty locations: clicking an existing pin explicitly selects it.
      await page.mouse.click(canvas.x + canvas.width * (0.6 + placementCount % 7 * 0.04), canvas.y + canvas.height * (0.65 + placementCount % 5 * 0.05))
    }
    // Confirm CP2 and FinishPoint; inert subsequent clicks and history across deselection.
    for (const number of ['2', 'F']) {
      await page.locator(`[data-checkpoint="${number}"]`).click()
      await place()
      if (number === 'F') {
        await page.getByRole('button', { name: 'Edit', exact: true }).click()
        await page.locator('.position-inspector input').first().fill('FinishPoint')
        await page.getByRole('button', { name: 'Save changes', exact: true }).click()
      }
      const authored = await pins(page)
      await confirm(page).click()
      assert.equal(await page.locator('[data-checkpoint][aria-pressed="true"]').count(), 0)
      const confirmed = await pins(page)
      assert.ok(confirmed.find(pin => pin.number === number).confirmed, `${number}: expected confirmed marker`)
      console.log(`${width}px: ${number} confirmed/deselected`)
      assert.deepEqual(confirmed.map(pin => pin.coordinates), authored.map(pin => pin.coordinates))
      await place(); assert.deepEqual(await pins(page), confirmed)
      await undo(page).click(); await redo(page).click()
      assert.deepEqual(await pins(page), confirmed)
    }
    await page.locator('[data-checkpoint="2"]').click()
    await page.evaluate(() => window.testMap.jumpTo({ bearing: 25, pitch: 30 }))
    const cameraBeforeStyles = await camera(page)
    const pinsBeforeStyles = await pins(page)
    for (const mode of ['Satellite', 'Map']) {
      console.log(`${width}px: switching to ${mode}`)
      await modeButton(page, mode).click()
      await page.waitForFunction(expected => window.testMap.isStyleLoaded() && window.testMap.getStyle().layers[0].id === expected, mode === 'Map' ? 'mock-map' : 'mock-satellite')
      assert.deepEqual(await camera(page), cameraBeforeStyles)
      assert.deepEqual(await pins(page), pinsBeforeStyles)
      assert.equal(await page.locator('[data-checkpoint="2"]').getAttribute('aria-pressed'), 'true')
      assert.equal(await page.evaluate(() => window.testMaps.length), 1)
      assert.equal(await page.locator('[data-position-pin]').count(), 7)
      const geometry = await page.locator('[role="toolbar"]').evaluate(toolbar => {
        const rect = toolbar.getBoundingClientRect()
        const buttons = [...toolbar.querySelectorAll('button')].map(button => button.getBoundingClientRect())
        const search = document.querySelector('[role="combobox"]').getBoundingClientRect()
        return { overflow: toolbar.scrollWidth > toolbar.clientWidth, inViewport: rect.left >= 0 && rect.right <= innerWidth, overlap: rect.left < search.right && rect.right > search.left && rect.bottom > search.top && rect.top < search.bottom, buttonsContained: buttons.every(button => button.left >= rect.left && button.right <= rect.right + 1) }
      })
      assert.deepEqual(geometry, { overflow: false, inViewport: true, overlap: false, buttonsContained: true })
      if (width !== 320) await page.screenshot({ path: `${screenshotDir}/${width === 1280 ? 'desktop' : 'mobile'}-${mode.toLowerCase()}.png`, fullPage: true })
      await place()
      assert.equal((await pins(page)).find(pin => pin.number === '2').confirmed, false)
      await undo(page).click(); assert.deepEqual(await pins(page), pinsBeforeStyles)
      await redo(page).click(); await undo(page).click()
      assert.deepEqual(await pins(page), pinsBeforeStyles)
      // Real pointer dragging of the selected pin in each style.
      await page.locator('.mapboxgl-canvas').scrollIntoViewIfNeeded()
      const marker = await page.locator('[data-position-pin="2"]').boundingBox()
      const canvas = await page.locator('.mapboxgl-canvas').boundingBox()
      const from = { x: marker.x + marker.width / 2, y: marker.y + marker.height / 2 }
      const to = { x: Math.min(canvas.x + canvas.width - 20, from.x + 35), y: Math.min(canvas.y + canvas.height - 20, from.y + 25) }
      await page.mouse.move(from.x, from.y); await page.mouse.down()
      await page.mouse.move(to.x, to.y, { steps: 8 }); await page.mouse.up()
      assert.notDeepEqual(await pins(page), pinsBeforeStyles)
      assert.equal((await pins(page)).find(pin => pin.number === '2').confirmed, false)
      await undo(page).click(); assert.deepEqual(await pins(page), pinsBeforeStyles)
      await page.getByRole('button', { name: 'Deselect', exact: true }).click()
      await searchInput(page).fill('statuia')
      await page.getByRole('option').getByRole('button').tap()
      await page.getByRole('status').filter({ hasText: 'Location selected.' }).waitFor()
      await page.waitForFunction(target => { const map = window.testMap; const center = map.getCenter(); return Math.abs(center.lng - target[0]) < 0.0001 && Math.abs(center.lat - target[1]) < 0.0001 && Math.abs(map.getZoom() - 16) < 0.0001 && !map.isMoving() }, target)
      const result = await camera(page)
      near(result.center[0], target[0]); near(result.center[1], target[1])
      assert.deepEqual(await pins(page), pinsBeforeStyles)
      assert.equal(await page.locator('[data-checkpoint][aria-pressed="true"]').count(), 0)
      await page.locator('[data-checkpoint="2"]').click()
      await page.evaluate(options => window.testMap.jumpTo(options), { center: cameraBeforeStyles.center, zoom: cameraBeforeStyles.zoom, bearing: cameraBeforeStyles.bearing, pitch: cameraBeforeStyles.pitch })
    }
    failRetrieve = true
    await searchInput(page).fill('statuia')
    await page.getByRole('option').getByRole('button').click()
    await modeButton(page, 'Map').focus()
    await page.getByRole('status').filter({ hasText: 'Mapbox search authorization failed.' }).waitFor()
    assert.deepEqual(await camera(page), cameraBeforeStyles)
    assert.deepEqual(await pins(page), pinsBeforeStyles)
    assert.equal(await searchInput(page).getAttribute('readonly'), null)
    assert.deepEqual(errors, [])
    console.log(`${width}px: mouse/keyboard/touch/blur search, stable real camera, confirm/deselect/history, style/camera/pins, both-mode search/placement, visible errors and toolbar overflow passed. Mapbox API/styles mocked.`)
    await page.close()
  }
} finally { await browser.close() }
