import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless:true, args:['--no-sandbox','--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ reducedMotion:'reduce' }); page.setDefaultTimeout(12000)
const output='docs/evidence/hunt-setup', errors=[], results=[]
let acceptCity=true, message=''
await fs.mkdir(output,{recursive:true}); page.on('pageerror',e=>errors.push(String(e))); page.on('dialog',async dialog=>{ if(dialog.type()==='beforeunload') return dialog.accept(); message=dialog.message(); return acceptCity ? dialog.accept() : dialog.dismiss() })
await page.route('https://api.mapbox.com/**', route => route.fulfill({json: route.request().url().includes('/styles/') ? {version:8,sources:{},layers:[{id:'mock-background',type:'background',paint:{'background-color':'#e8eeeb'}}]} : {}}))
const url=(query='')=>`${process.env.TEDIX_BROWSER_URL || 'http://127.0.0.1:5173'}/tests/browser/huntSetup.html${query}`
const setup=()=>page.locator('#local-geography')
const builder=()=>page.locator('fieldset[aria-label="Hunt builder"]')
const feature=name=>page.getByRole('navigation',{name:'Hunt Features',exact:true}).getByRole('button',{name:new RegExp(name)}).click()
async function layout(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth || document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth),false,'horizontal overflow')}
async function shot(name,locator=setup()){await locator.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await layout();if(await locator.getAttribute('id') === 'checkpoint-positions') { assert.equal(await page.locator('.position-toolbar button').evaluateAll(nodes=>nodes.every(node=>{const r=node.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===node})),true,'toolbar controls must not be covered') };await page.screenshot({path:`${output}/${name}.png`})}
async function camera(){return page.evaluate(()=>({lat:window.fixtureMap.getCenter().lat,lng:window.fixtureMap.getCenter().lng,zoom:window.fixtureMap.getZoom()}))}
async function mapReady(){await page.locator('.mapboxgl-canvas').waitFor();await page.waitForFunction(()=>window.fixtureMap?.isStyleLoaded())}
function close(a,b){assert.ok(Math.abs(a-b)<.001,`${a} close to ${b}`)}
try {
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(url());await setup().waitFor();assert.equal(await builder().isVisible(),false);assert.equal(await builder().evaluate(el=>el.disabled),true)
  await shot(`local-${width}`);await setup().getByRole('button',{name:'Continue to Hunt builder'}).click();await setup().getByRole('alert').waitFor();assert.equal(await page.locator('#checkpoint-positions').count(),0)
  await setup().getByLabel('Country *',{exact:true}).selectOption('FR');await setup().getByLabel('City *',{exact:true}).fill('Paris')
  const option=setup().getByRole('button',{name:'Paris · Île-de-France · France',exact:true});await option.waitFor();assert.equal(await option.count(),1);await shot(`selection-${width}`)
  await option.focus();await page.keyboard.press('Enter');assert.equal(await builder().isVisible(),false);await setup().getByRole('button',{name:'Continue to Hunt builder'}).click();await mapReady();assert.equal(await builder().isVisible(),true);assert.equal(await page.evaluate(()=>document.activeElement?.id),'template-setup-heading')
  close((await camera()).lat,48.8566);close((await camera()).lng,2.3522);close((await camera()).zoom,12)
  await shot(`city-map-${width}`,page.locator('#checkpoint-positions'))
  await page.evaluate(()=>window.fixtureMap.jumpTo({center:[3,51],zoom:9}));await feature('Personal Challenge');await feature('Number of Checkpoints');await mapReady();close((await camera()).lat,51);close((await camera()).zoom,9)
  await page.getByRole('button',{name:'Recenter map',exact:true}).click();await page.waitForFunction(()=>Math.abs(window.fixtureMap.getCenter().lat-48.8566)<.001);await shot(`recenter-${width}`,page.locator('#checkpoint-positions'))
  await page.getByRole('textbox',{name:'Template name',exact:true}).fill('Paris adventure');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Template version saved by the backend'}).waitFor()
  const record=await page.evaluate(()=>window.fixtureRecord());assert.equal(record.localityId,'11111111-1111-4111-8111-111111111111');assert.equal('curriculum' in record.content.configuration,false);assert.equal('grade' in record.content.configuration,false);assert.deepEqual(record.content.configuration.checkpointPositions,[])
  await page.goto(url('?mode=universal'));await setup().waitFor();assert.equal(await setup().getByLabel('City *',{exact:true}).count(),0);assert.equal(await setup().getByLabel('Curriculum (optional)',{exact:true}).isDisabled(),true);await setup().getByRole('button',{name:'Continue to Hunt builder'}).click();await shot(`universal-${width}`)
  await page.goto(url('?existing'));await mapReady();assert.equal(await builder().isVisible(),true);const bounds=await page.evaluate(()=>window.fixtureMap.getBounds().toArray());assert.ok(bounds[0][0]<=2.3212&&bounds[1][0]>=2.3376);assert.ok(bounds[0][1]<=48.8606&&bounds[1][1]>=48.8656)
  await shot(`existing-route-${width}`,page.locator('#checkpoint-positions'))
  const before=await page.evaluate(()=>window.fixtureRecord().content.configuration);message=''
  acceptCity=false;await setup().getByLabel('Country *',{exact:true}).selectOption('DE');assert.equal(await setup().getByLabel('Country *',{exact:true}).inputValue(),'FR');assert.match(message,/positions will stay/)
  acceptCity=true;await setup().getByLabel('Country *',{exact:true}).selectOption('DE');await setup().getByLabel('City *',{exact:true}).fill('Berlin');await setup().getByRole('button',{name:'Berlin · Berlin · Germany',exact:true}).click();await mapReady();close((await camera()).lat,52.52)
  await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Template version saved by the backend'}).waitFor();assert.deepEqual((await page.evaluate(()=>window.fixtureRecord())).content.configuration.checkpointPositions,before.checkpointPositions)
  for(const query of ['?existing&offline','?existing&missing&offline']) {
   await page.goto(url(query));await setup().waitFor();assert.equal(await builder().isVisible(),true);assert.equal(await builder().evaluate(el=>el.disabled),false);assert.equal(await page.getByRole('textbox',{name:'Template name',exact:true}).isEditable(),true)
   if(query.includes('missing')) { assert.equal(await page.locator('#checkpoint-positions').count(),0);await setup().getByRole('button',{name:'Continue to Hunt builder'}).click();assert.equal(await builder().isVisible(),true) }
  }
  results.push({width,overflow:false,localSetup:true,universalSetup:true,cityCentered:true,manualCameraPreserved:true,recenter:true,checkpointAndFinishBounds:true,cityChangeConfirmation:true,coordinatesPreserved:true,explicitContinueGate:true,continueFocus:true,savedDraftRegistryRecovery:true})
 }
 assert.deepEqual(errors,[]);await fs.writeFile(`${output}/results.json`,JSON.stringify({mode:'Real React components and Mapbox GL; fixture API/registry and intercepted background style; no authenticated BE integration or live tiles',results,errors},null,2));console.log(JSON.stringify({passed:results.length,widths:results.map(r=>r.width),screenshots:24,errors}))
}finally{await browser.close()}
