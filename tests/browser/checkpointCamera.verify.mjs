// Real Mapbox GL camera/markers; network responses use fixture styles, not live imagery.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const output = process.env.SCREENSHOT_DIR || 'work/checkpoint-camera'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] })
const measurements = []
try {
  for (const width of [1280, 768, 390, 360, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 640 ? 2400 : 1400 }, hasTouch: true, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('https://api.mapbox.com/**', route => route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: 'fixture-background', type: 'background', paint: { 'background-color': route.request().url().includes('satellite') ? '#586358' : '#e8eeeb' } }] } }))
    await page.route('https://events.mapbox.com/**', route => route.fulfill({ json: {} }))
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/tests/browser/mapboxSearch.html')
    await page.getByRole('button', { name: /2\.Checkpoint Positions/ }).click()
    await page.waitForFunction(() => window.testMap?.isStyleLoaded())
    await page.locator('.position-map').scrollIntoViewIfNeeded()
    const select = number => page.locator(`[data-checkpoint="${number}"]`).click()
    const showAll = () => page.getByRole('button', { name: 'Show all checkpoints', exact: true }).click()
    const snapshot = () => page.evaluate(() => ({ camera: window.testMap.getCenter().toArray(), zoom: window.testMap.getZoom(), pins: window.testMarkers.filter(m => m.getElement().isConnected).map(m => ({ number: m.getElement().dataset.positionPin, coordinates: m.getLngLat().toArray(), confirmed: m.getElement().getAttribute('aria-label').includes('Creator-confirmed') })), selection: [...document.querySelectorAll('[data-checkpoint][aria-pressed="true"]')].map(el => el.dataset.checkpoint), undo: document.querySelector('[aria-label="Undo last position change"]').disabled, redo: document.querySelector('[aria-label="Redo last position change"]').disabled }))
    const original = await snapshot()
    await select('2'); await showAll()
    await page.waitForFunction(() => !window.testMap.isMoving())
    assert.deepEqual((await snapshot()).pins, original.pins)
    // Author coordinates deliberately through the existing map-click handler.
    for (const [number, longitude, latitude] of [['1', 23.5905, 46.7742], ['2', 23.596, 46.777], ['F', 23.599, 46.771]]) {
      await select(number)
      await page.evaluate(({ longitude, latitude }) => window.testMap.fire('click', { lngLat: { lng: longitude, lat: latitude }, originalEvent: { target: window.testMap.getCanvas() } }), { longitude, latitude })
      await page.getByRole('button', { name: 'Confirm position', exact: true }).click()
      assert.deepEqual((await snapshot()).selection, [])
    }
    for (const mode of ['Map', 'Satellite']) {
      await page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: mode, exact: true }).click()
      await page.waitForFunction(() => window.testMap.isStyleLoaded())
      const before = await snapshot()
      await page.evaluate(() => window.testMap.jumpTo({ center: [24, 47], zoom: 10 }))
      await select('1')
      await page.waitForFunction(() => !window.testMap.isMoving() && window.testMap.getZoom() >= 16)
      const after = await snapshot()
      assert.deepEqual(after.pins, before.pins)
      assert.equal(after.undo, before.undo); assert.equal(after.redo, before.redo)
      assert.deepEqual(after.selection, ['1'])
      const focused = await page.evaluate(() => {
        const pixel = window.testMap.project([23.5905, 46.7742])
        const map = document.querySelector('[aria-label="Map"]').getBoundingClientRect()
        const toolbar = document.querySelector('[role="toolbar"]').getBoundingClientRect()
        const search = document.querySelector('[role="combobox"]').parentElement.getBoundingClientRect()
        const pinTop = map.top + pixel.y - 44
        return { x: pixel.x, y: pixel.y, width: map.width, height: map.height, clear: pinTop > toolbar.bottom && pinTop > search.bottom, overflow: document.documentElement.scrollWidth > innerWidth, overlap: toolbar.left < search.right && toolbar.right > search.left && toolbar.bottom > search.top && toolbar.top < search.bottom }
      })
      assert.ok(focused.clear && !focused.overflow && !focused.overlap, JSON.stringify({ width, focused }))
      assert.ok(focused.x > 24 && focused.x < focused.width - 24 && focused.y < focused.height - 64)
      if ([1280, 390].includes(width)) await page.locator('.position-workspace').screenshot({ path: `${output}/${width}-${mode.toLowerCase()}-focus.png` })
      // Repeated selection recenters; references also navigate without editing.
      await select('1'); assert.deepEqual((await snapshot()).camera, after.camera)
      await select('3'); assert.deepEqual((await snapshot()).pins, before.pins)
      await select('F'); assert.deepEqual((await snapshot()).pins, before.pins)
      await showAll()
      await page.waitForFunction(() => !window.testMap.isMoving())
      const fitted = await page.evaluate(() => [['1', 23.5905, 46.7742], ['2', 23.596, 46.777], ['F', 23.599, 46.771]].map(([number, lng, lat]) => { const p = window.testMap.project([lng, lat]); return { number, x: p.x, y: p.y, width: window.testMap.getContainer().clientWidth, height: window.testMap.getContainer().clientHeight } }))
      assert.ok(fitted.every(p => p.x >= 23 && p.x <= p.width - 23 && p.y >= (p.width < 700 ? 253 : 149) && p.y <= p.height - 63), JSON.stringify(fitted))
      assert.deepEqual((await snapshot()).pins, before.pins)
      assert.deepEqual((await snapshot()).selection, ['F'])
      if ([1280, 390].includes(width)) await page.locator('.position-workspace').screenshot({ path: `${output}/${width}-${mode.toLowerCase()}-all.png` })
      measurements.push({ width, mode, focused, fitted })
    }
    assert.deepEqual(errors, [])
    assert.equal(await page.evaluate(() => window.testMaps.length), 1)
    await page.close()
    console.log(`${width}px: checkpoint/FinishPoint focus, unpositioned selection, overview, unchanged geography/history, reduced motion and overlay spacing passed in both modes`)
  }
  await writeFile(`${output}/measurements.json`, JSON.stringify({ mockedMapbox: true, measurements }, null, 2))
} finally { await browser.close() }
