import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const output=process.env.C2C_CORRECTIONS_EVIDENCE || 'docs/evidence/c2c-02/corrections'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
const page=await browser.newPage(), errors=[],results=[];page.on('pageerror',e=>errors.push(e.message))
const labels={universal:'Universal',country:'Romania',region:'Cluj, Romania',city:'Cluj-Napoca, Cluj, Romania',fallback:'City 683506, Country RO (catalog details unavailable)'}
async function shot(name){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${output}/${name}.png`,fullPage:true})}
try{
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:1000})
 for(const [scope,label] of Object.entries(labels)){
  await page.goto(`http://127.0.0.1:5173/tests/browser/contentReviewCorrections.html?scope=${scope}`)
  await page.getByRole('button',{name:'Review Equivalent expressions',exact:true}).click()
  await page.getByLabel('Geographic applicability',{exact:true}).getByText(label,{exact:true}).waitFor()
  await shot(`${scope}-${width}`)
 }
 await page.getByRole('button',{name:'Request Changes',exact:true}).click()
 assert.equal(await page.getByRole('button',{name:'Approve',exact:true}).count(),0)
 await page.getByLabel('Review comment').fill('Please explain how the second pair is calculated.')
 await page.locator('form').scrollIntoViewIfNeeded();await shot(`feedback-${width}`)
 await page.getByRole('button',{name:'Cancel',exact:true}).click()
 await page.getByRole('button',{name:'Approve',exact:true}).waitFor();await page.getByRole('button',{name:'Request Changes',exact:true}).waitFor()
 assert.equal(await page.getByLabel('Review comment').count(),0)
 await page.getByRole('button',{name:'Approve',exact:true}).scrollIntoViewIfNeeded();await shot(`cancel-${width}`)
 results.push({width,geography:Object.keys(labels),approveHiddenDuringFeedback:true,cancelRestoresBothDecisions:true,overflow:false})
}
assert.deepEqual(errors,[]);await fs.writeFile(`${output}/results.json`,JSON.stringify({fixtures:'Deterministic canonical catalog and API fixtures; actual Admin shell, preview and decision components. No backend writes.',results,errors},null,2)+'\n');console.log('21 screenshots; all geography and decision assertions passed.')
}finally{await browser.close()}
