// Mocked Search Box API; real Chromium focus/touch events and Mapbox GL camera.
// Run with VITE_MAPBOX_ACCESS_TOKEN=test-public-token npm run dev.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader'] })
const page = await browser.newPage({viewport:{width:1280,height:1000},hasTouch:true})
await page.route('https://api.mapbox.com/**',async route => {
 const url=route.request().url()
 if(url.includes('/styles/')) return route.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#e8eeeb'}}]}})
 if(url.includes('/suggest')) return route.fulfill({json:{suggestions:[{mapbox_id:'statue',name:'Statuia lui Mihai Viteazul',full_address:'Cluj-Napoca'}]}})
 if(url.includes('/retrieve')) { await new Promise(resolve=>setTimeout(resolve,150)); return route.fulfill({json:{features:[{geometry:{coordinates:[23.5905,46.7742]}}]}}) }
 return route.fulfill({json:{}})
})
await page.goto('http://127.0.0.1:5173/tests/browser/mapboxSearch.html')
await page.getByRole('button',{name:/2\.Checkpoint Positions/}).click()
await page.locator('.mapboxgl-canvas').waitFor()
await page.waitForTimeout(800)
for(const mode of ['keyboard','touch']) {
 await page.locator('[data-checkpoint="1"]').click()
 const before=await page.locator('.position-values').innerText()
 const search=page.getByRole('combobox',{name:'Search locations'})
 await search.fill('Statuia lui Mihai Viteazul, Cluj-Napoca')
 await page.getByRole('listbox').waitFor()
 if(mode==='keyboard') { await search.press('ArrowDown'); await search.press('Enter') }
 else await page.getByRole('option').getByRole('button').tap()
 await page.getByRole('status').filter({hasText:'Location selected.'}).waitFor()
 await page.waitForTimeout(1800)
 const camera=await page.evaluate(()=>({center:window.testMap.getCenter().toArray(),zoom:window.testMap.getZoom()}))
 assert.ok(Math.abs(camera.center[0]-23.5905)<0.0001 && Math.abs(camera.center[1]-46.7742)<0.0001)
 assert.ok(Math.abs(camera.zoom-16)<0.01)
 assert.equal(await page.locator('.position-values').innerText(),before)
 assert.equal(await page.locator('[data-checkpoint="1"]').getAttribute('aria-pressed'),'true')
 assert.equal(await page.getByRole('button',{name:'Undo last position change'}).isDisabled(),true)
 const canvas=await page.locator('.mapboxgl-canvas').boundingBox()
 await page.mouse.click(canvas.x+canvas.width*0.7,canvas.y+canvas.height*0.65)
 assert.notEqual(await page.locator('.position-values').innerText(),before)
 await page.getByRole('button',{name:'Undo last position change'}).click()
 assert.equal(await page.locator('.position-values').innerText(),before)
 await page.waitForTimeout(500)
 assert.deepEqual(await page.evaluate(()=>window.testMap.getCenter().toArray()),camera.center)
 console.log(`${mode}: camera center/zoom, unchanged selection/data/history, placement and Undo passed (mocked API, real Mapbox GL)`)
}
await browser.close()
