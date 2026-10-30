// Actual Signal Template fixture, real Mapbox GL camera and markers; fixture HTTP styles.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const output = process.env.SCREENSHOT_DIR || 'work/reference-checkpoint-camera'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] })
const measurements = []
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} != ${expected}`)
try {
  for (const width of [1280, 768, 390, 360, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 640 ? 2400 : 1400 }, hasTouch: true })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('https://api.mapbox.com/**', route => route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: 'fixture-background', type: 'background', paint: { 'background-color': route.request().url().includes('satellite') ? '#586358' : '#e8eeeb' } }] } }))
    await page.route('https://events.mapbox.com/**', route => route.fulfill({ json: {} }))
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/tests/browser/mapboxSearch.html')
    await page.locator('#checkpoint-positions').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => window.testMap?.isStyleLoaded())
    const select = number => page.locator(`[data-checkpoint="${number}"]`).click()
    const showAll = () => page.getByRole('button', { name: 'Show all checkpoints', exact: true }).click()
    const idle = () => page.waitForFunction(() => !window.testMap.isMoving())
    const away = () => page.evaluate(() => window.testMap.jumpTo({ center: [24, 47], zoom: 10 }))
    const state = () => page.evaluate(() => ({ pins: window.testMarkers.filter(m => m.getElement().isConnected).map(m => ({ number: m.getElement().dataset.positionPin, coordinates: m.getLngLat().toArray(), label: m.getElement().getAttribute('aria-label') })), undo: document.querySelector('[aria-label="Undo last position change"]').disabled, redo: document.querySelector('[aria-label="Redo last position change"]').disabled }))
    const original = await state()
    assert.equal(original.pins.length, 7)
    assert.ok(original.pins.every(p => p.label.includes('Reference position')))
    assert.ok(original.pins.find(p => p.number === '1').label.includes("Tailors' Tower"))
    assert.ok(original.pins.find(p => p.number === '3').label.includes('Saint George statue'))
    const pixels = () => page.evaluate(() => {
      const map = window.testMap, rect = map.getContainer().getBoundingClientRect()
      const controls = [...document.querySelectorAll('[role="toolbar"], [role="combobox"]')].map(el => el.getBoundingClientRect())
      return { center: map.getCenter().toArray(), zoom: map.getZoom(), width: rect.width, height: rect.height,
        points: window.testMarkers.filter(m => m.getElement().isConnected).map(m => { const p = map.project(m.getLngLat()), pin = m.getElement().getBoundingClientRect(); return { number: m.getElement().dataset.positionPin, x: p.x, y: p.y, visible: pin.left >= rect.left && pin.right <= rect.right && pin.top >= rect.top && pin.bottom <= rect.bottom && controls.every(c => pin.right <= c.left || pin.left >= c.right || pin.bottom <= c.top || pin.top >= c.bottom) } }) }
    })
    for (const mode of ['Map', 'Satellite']) {
      const beforeMode = await page.evaluate(() => ({ center: window.testMap.getCenter().toArray(), zoom: window.testMap.getZoom() }))
      await page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: mode, exact: true }).click()
      await page.waitForFunction(() => window.testMap.isStyleLoaded())
      assert.deepEqual(await page.evaluate(() => ({ center: window.testMap.getCenter().toArray(), zoom: window.testMap.getZoom() })), beforeMode)
      for (const number of ['3', '3', '1', 'F']) {
        await away(); await select(number); await idle()
        const focused = await pixels()
        assert.ok(focused.zoom >= 16 && focused.zoom <= 17)
        assert.ok(Math.abs(focused.center[0] - 24) > 0.1 && Math.abs(focused.center[1] - 47) > 0.1)
        const reference = original.pins.find(p => p.number === number)
        const target = await page.evaluate(() => {
          const map = window.testMap, width = map.getContainer().clientWidth, height = map.getContainer().clientHeight
          return map.unproject([width / 2, ((width < 700 ? 254 : 150) + height - 64) / 2]).toArray()
        })
        near(target[0], reference.coordinates[0]); near(target[1], reference.coordinates[1])
        assert.ok(focused.points.find(p => p.number === number).visible, JSON.stringify(focused))
        assert.deepEqual(await state(), original)
        assert.equal(await page.getByRole('button', { name: 'Confirm position', exact: true }).isDisabled(), true)
        if (number === '3') {
          measurements.push({ width, mode, action: 'CP3', ...focused })
          if ([1280, 390].includes(width)) await page.locator('.position-workspace').screenshot({ path: `${output}/${width}-${mode.toLowerCase()}-cp3.png` })
        }
      }
      for (let repeat = 0; repeat < 2; repeat++) {
        await away(); await showAll(); await idle()
        const fitted = await pixels()
        assert.ok(fitted.points.every(p => p.visible), JSON.stringify({ width, mode, fitted }))
        assert.equal(fitted.points.length, 7)
        assert.deepEqual(await state(), original)
        assert.equal(await page.locator('[data-checkpoint="F"]').getAttribute('aria-pressed'), 'true')
        measurements.push({ width, mode, action: 'Show all', ...fitted })
        if ([1280, 390].includes(width)) await page.locator('.position-workspace').screenshot({ path: `${output}/${width}-${mode.toLowerCase()}-all.png` })
      }
    }
    assert.deepEqual(errors, [])
    assert.equal(await page.evaluate(() => window.testMaps.length), 1)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.close()
    console.log(`${width}px: CP3 repeat, CP1, FinishPoint, seven-location Show all repeat, unchanged references/history, style preservation and visible markers passed in both modes`)
  }
  await writeFile(`${output}/measurements.json`, JSON.stringify({ mockedMapboxHTTP: true, realMapboxGL: true, measurements }, null, 2))
} finally { await browser.close() }
