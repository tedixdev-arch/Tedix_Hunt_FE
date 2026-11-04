import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const [actor]=JSON.parse(await fs.readFile(process.env.C2B_ACTORS || 'work/actors.json','utf8'))
const output=process.env.C2B_HIERARCHY_EVIDENCE || 'work/hierarchy-browser'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
const page=await browser.newPage();page.setDefaultTimeout(30000)
const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.addInitScript(token=>localStorage.setItem('tedix-hunt.session',JSON.stringify({accessToken:token})),actor.token)
let failure=false, release, pending=false
await page.route('**/api/**',async route=>{
 const path=new URL(route.request().url()).pathname+new URL(route.request().url()).search
 if(!path.startsWith('/api/'))return route.continue()
 if(path==='/api/geography/cities/683506'){
  if(failure)return route.fulfill({status:503,contentType:'application/json',body:'{"error":"catalog_unavailable"}'})
  if(pending)await new Promise(resolve=>{release=resolve})
 }
 const response=await route.fetch({url:'http://127.0.0.1:3002'+path});await route.fulfill({response})
})
const api=async(path,body)=>{const r=await page.request.fetch('http://127.0.0.1:3002'+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${actor.token}`},...(body?{data:body}:{})});assert.ok(r.ok(),`${r.status()} ${await r.text()}`);return r.json()}
const click=name=>page.getByRole('button',{name,exact:true}).click()
await page.goto('http://127.0.0.1:5173/tests/browser/contentPersistence.html')
await click('Add Exercise');await page.getByText('Saved to Library.',{exact:true}).waitFor()
const seed=(await api('/api/creator/content?limit=100')).items[0]
const scopes=[['Universal',{scope:'universal'}],['Romania',{scope:'country',countryCode:'RO'}],['Cluj',{scope:'region',countryCode:'RO',admin1Code:'13'}],['Other region',{scope:'region',countryCode:'RO',admin1Code:'23'}],['Exact city',{scope:'city',countryCode:'RO',geographicId:'683506'}],['Other city',{scope:'city',countryCode:'RO',geographicId:'675810'}]]
const saved=[], tag=`Hierarchy ${Date.now()} `
for(const [name,geography] of scopes)saved.push(await api('/api/creator/content',{exercise:{...seed.exercise,title:`${tag}${name}`},category:'Mathematics',curriculum:{subject:'math',grade:'7'},geography}))
const drafts=()=>page.getByRole('region',{name:'My drafts',exact:true})
const titles=()=>drafts().getByRole('heading',{level:4}).allTextContents()
const filterCity=async()=>{
 await page.getByLabel('Content country',{exact:true}).selectOption('RO')
 assert.equal(await page.getByLabel('Content region',{exact:true}).inputValue(),'')
 await page.getByLabel('Find content city',{exact:true}).fill('Cluj')
 await page.getByLabel('Content city',{exact:true}).selectOption('683506')
}
await click('View in Library');await page.getByRole('button',{name: `Edit ${tag}Exact city`,exact:true}).waitFor()
// Resolving a city must not change a restored editor's persisted classifications or create dirty edits.
await page.getByRole('button',{name: `Edit ${tag}Exact city`,exact:true}).click()
await page.getByText('Classification & Location',{exact:true}).click()
await page.waitForFunction(()=>document.querySelector('[aria-label="Content region"]')?.value==='13')
assert.equal(await page.getByLabel('Content city',{exact:true}).inputValue(),'683506')
assert.equal(await page.getByLabel('Grade',{exact:true}).inputValue(),'7')
await click('Save Changes');await page.getByText('Saved to Library.',{exact:true}).waitFor()
const restored=await api(`/api/creator/content/${saved[4].contentId}`)
assert.deepEqual(restored.geography,saved[4].geography);assert.deepEqual(restored.curriculum,saved[4].curriculum);assert.deepEqual(restored.exercise,saved[4].exercise)
await click('View in Library');await drafts().getByRole('heading',{name:`${tag}Exact city`,exact:true}).waitFor()
pending=true;await filterCity()
await page.waitForFunction(()=>document.querySelector('[aria-label="Content city"]')?.value==='683506')
assert.ok(!(await titles()).includes(`${tag}Cluj`));assert.ok(!(await titles()).includes(`${tag}Other region`))
const deadline=Date.now()+30000
while(!release){assert.ok(Date.now()<deadline,'City catalog request did not start');await page.waitForTimeout(10)}
release();pending=false
await drafts().getByRole('heading',{name:`${tag}Cluj`,exact:true}).waitFor()
const eligible=(await titles()).filter(t=>t.startsWith(tag)).sort()
assert.deepEqual(eligible,[`${tag}Universal`,`${tag}Romania`,`${tag}Cluj`,`${tag}Exact city`].sort())
await page.screenshot({path:`${output}/resolved.png`,fullPage:true})
// Retry a selected city with a failed catalog read: no stale region grants survive.
failure=true;await click('Reset filters');await filterCity()
await page.getByRole('alert').filter({hasText:'Saved city details unavailable.'}).waitFor()
const unresolved=(await titles()).filter(t=>t.startsWith(tag)).sort()
assert.deepEqual(unresolved,[`${tag}Universal`,`${tag}Romania`,`${tag}Exact city`].sort())
await page.screenshot({path:`${output}/unresolved.png`,fullPage:true})
await page.locator('summary').filter({hasText:/^Starter/}).click()
assert.ok(await page.getByRole('button',{name:/^Preview /}).count()>0)
assert.deepEqual(errors,[])
await fs.writeFile(`${output}/results.json`,JSON.stringify({backend:'merged C2a with disposable PostgreSQL 16',catalog:'read-only authoritative catalog endpoints with isolated fixture rows',eligible,unresolved,restoredClassifications:true,pendingResolutionExcludesRegions:true,starterPreserved:true,catalogFailure:'503 injected only for GET city; all content persists in PostgreSQL',errors},null,2))
await browser.close();console.log('Geographic hierarchy PostgreSQL/browser regressions passed')
