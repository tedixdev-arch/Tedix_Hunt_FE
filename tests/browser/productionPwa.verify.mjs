import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const files = await fs.readdir('dist/assets')
const chunks = files.filter(f => /^(index|mapbox)-.*\.js$/.test(f))
assert.equal(chunks.length, 2)
for (const name of chunks) assert.ok((await fs.stat(`dist/assets/${name}`)).size < 3 * 1024 * 1024)
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage(), errors = [], loaded = []
page.on('pageerror', e => errors.push(String(e)))
page.on('response', r => { if (chunks.some(c => r.url().endsWith(c))) loaded.push({ url: r.url(), status: r.status() }) })
try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  const cached = await page.evaluate(async () => { const names = await caches.keys(); return (await Promise.all(names.map(async name => (await (await caches.open(name)).keys()).map(r => r.url)))).flat() })
  for (const chunk of chunks) {
    assert.ok(loaded.some(r => r.url.endsWith(chunk) && r.status === 200), `loaded ${chunk}`)
    assert.ok(cached.some(url => url.includes(chunk)), `precached ${chunk}`)
  }
  assert.deepEqual(errors, [])
  await fs.writeFile('work/production-pwa-results.json', JSON.stringify({ chunks, loaded, errors, precached: true }, null, 2))
} finally { await browser.close() }
