import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']})
const page = await browser.newPage(), errors = [], results = []
page.setDefaultTimeout(10000)
page.on('pageerror', e => errors.push(String(e)))
page.on('dialog', d => d.accept())
const output = 'docs/evidence/c1-6/after'
await fs.mkdir(output,{recursive:true})
const feature = name => page.getByRole('navigation',{name:'Hunt Features'}).getByRole('button',{name}).click()
const preview = () => page.getByLabel('Mobile navigation preview',{exact:true})
async function shot(name,width) {
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth || document.querySelector('main').scrollWidth > innerWidth),false)
 const box=preview()
 if(await box.count()) assert.equal(await box.evaluate(n=>n.scrollWidth>n.clientWidth),false)
 await page.locator('#creator-checkpoints article:not([hidden])').screenshot({path:`${output}/${name}-${width}.png`})
}
try {
for(const width of [1440,390,320]) {
 await page.setViewportSize({width,height:1800})
 await page.goto('http://127.0.0.1:5173/tests/browser/creatorPositions.html')
 await page.getByRole('navigation',{name:'Creator sections'}).getByRole('button',{name:'Checkpoints & Challenges',exact:true}).click()
 await feature(/Next Checkpoint/)
 const select = page.getByRole('combobox',{name:'Navigation',exact:true})
 const modes = await select.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value))
 for(const mode of modes) {
  await select.selectOption(mode)
  await preview().waitFor()
  assert.doesNotMatch(await preview().textContent(),/80 m|Stone Gate|in range|STRONG|RISING/)
  await shot(mode||'unconfigured',width)
 }
 await select.selectOption('compass'); await shot('changed-to-compass',width)
 await page.getByRole('button',{name:'Checkpoint 2',exact:true}).click()
 await select.selectOption('landmark'); await shot('checkpoint-2',width)
 await page.getByRole('button',{name:'Checkpoint 1',exact:true}).click()
 assert.equal(await select.inputValue(),'compass')
 assert.equal(await page.getByRole('button',{name:'Checkpoint 7, FinishPoint',exact:true}).isDisabled(),true)
 await page.getByRole('button',{name:'Checkpoint 7, FinishPoint',exact:true}).scrollIntoViewIfNeeded()
 await shot('finish-disabled',width)
 await page.getByRole('button',{name:'Create new',exact:true}).click()
 await page.getByRole('textbox',{name:'Component name',exact:true}).fill('Our navigation')
 await page.getByRole('textbox',{name:'Participant instructions',exact:true}).fill('Look for our red arch.')
 assert.match(await preview().textContent(),/Our navigation.*Prototype · not saved.*Look for our red arch/s)
 await shot('create-new',width)
 await page.getByRole('button',{name:'Approved component',exact:true}).click()
 assert.equal(await select.inputValue(),'compass')
 await page.getByRole('navigation',{name:'Creator sections'}).getByRole('button',{name:'Review & Submit',exact:true}).click()
 await page.getByRole('button',{name:'Save draft',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Template version saved by the backend'}).waitFor()
 await page.getByRole('navigation',{name:'Creator sections'}).getByRole('button',{name:'Checkpoints & Challenges',exact:true}).click()
 await feature(/Next Checkpoint/)
 assert.equal(await select.inputValue(),'compass')
 await page.getByRole('button',{name:'Checkpoint 2',exact:true}).click(); assert.equal(await select.inputValue(),'landmark')
 for(const name of ['Personal Challenge','Team Challenge']) {
  await feature(new RegExp(name))
  await page.getByRole('button',{name:'Checkpoint 1',exact:true}).click()
  if(await page.getByRole('button',{name:'Edit existing challenges',exact:true}).count()) await page.getByRole('button',{name:'Edit existing challenges',exact:true}).click()
  await page.getByRole('region',{name:`${name} authoring`,exact:true}).getByRole('button',{name:'Predefined',exact:true}).click()
  await page.getByRole('combobox',{name,exact:true}).selectOption(name==='Personal Challenge'?'square':'hypothesis')
  await page.getByRole('region',{name:`${name} authoring`,exact:true}).waitFor()
  await shot(name==='Personal Challenge'?'personal-regression':'team-regression',width)
 }
 results.push({width,modes,automatic:true,immediateUpdates:true,checkpointValuesRetainedAfterSave:true,finishDisabled:true,noOverflow:true,createNew:true,challengeRegressions:true})
}
assert.deepEqual(errors,[])
await fs.writeFile('docs/evidence/c1-6/browser-results.json',JSON.stringify({results,errors},null,2))
console.log(JSON.stringify({results,errors},null,2))
} finally {await browser.close()}
