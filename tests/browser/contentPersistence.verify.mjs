import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const actors=JSON.parse(await fs.readFile(process.env.C2B_ACTORS || 'work/actors.json','utf8'))
const dir=process.env.C2B_EVIDENCE || 'docs/evidence/c2b'
await fs.mkdir(`${dir}/after`,{recursive:true}); await fs.mkdir(`${dir}/before`,{recursive:true})
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
const page=await browser.newPage(); page.setDefaultTimeout(30000)
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
let slow=false, failure=null, posts=0
const endpoint='http://127.0.0.1:3002'
await page.addInitScript(token=>localStorage.setItem('tedix-hunt.session',JSON.stringify({accessToken:token})),actors[0].token)
await page.route('**/api/**',async route=>{
 const req=route.request(),path=new URL(req.url()).pathname+new URL(req.url()).search
 if (!path.startsWith('/api/')) return route.continue()
 if (req.method()==='POST' && path==='/api/creator/content') posts++
 if (slow && ['POST','PUT'].includes(req.method())) await new Promise(r=>setTimeout(r,600))
 if (failure && ['POST','PUT'].includes(req.method()) && path.startsWith('/api/creator/content')) { if (failure==='network') return route.abort(); return route.fulfill({status:failure,contentType:'application/json',body:'{"error":"fixture-injected-error"}'}) }
 const response=await route.fetch({url:endpoint+path});await route.fulfill({response})
})
const api=async(path,method='GET',body,actor=actors[0])=>{
 const r=await page.request.fetch(endpoint+path,{method,headers:{Authorization:`Bearer ${actor.token}`},...(body?{data:body}:{})});assert.ok(r.ok(),`${method} ${path} ${r.status()} ${await r.text()}`);return r.json()
}
const click=name=>page.getByRole('button',{name,exact:true}).click()
const go=()=>page.goto('http://127.0.0.1:5173/tests/browser/contentPersistence.html')
const title=async text=>{await page.getByRole('button',{name:'Edit Title',exact:true}).click();await page.getByLabel('Title',{exact:true}).fill(text);await page.keyboard.press('Escape')}
const shot=async name=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${name}`);await page.screenshot({path:`${dir}/after/${name}.png`,fullPage:true})}
const results=[], runId=Date.now()
for(const width of [1440,390,320]) {
 await page.setViewportSize({width,height:960})
 await page.goto('http://127.0.0.1:5174/tests/browser/contentUnified.html');await page.getByRole('button',{name:'Add Exercise',exact:true}).waitFor();await page.screenshot({path:`${dir}/before/create-${width}.png`,fullPage:true});await click('Library');await page.screenshot({path:`${dir}/before/library-${width}.png`,fullPage:true})
 await go();await page.getByRole('button',{name:'Add Exercise',exact:true}).waitFor();await shot(`create-${width}`)
 const name=`C2b browser ${width} ${Date.now()}`
 await title(name);await page.getByLabel('Exercise category',{exact:true}).selectOption('Mathematics');await page.getByText('Classification & Location',{exact:true}).click();await page.getByLabel('Grade',{exact:true}).selectOption('7')
 await page.getByLabel('Content country',{exact:true}).selectOption('RO');await page.getByLabel('Content region',{exact:true}).selectOption('13');await page.getByLabel('Find content city',{exact:true}).fill('Cluj');await page.getByLabel('Content city',{exact:true}).selectOption('683506')
 slow=true;const beforePosts=posts;await click('Add Exercise');await page.getByRole('button',{name:'Saving…',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Saving…',exact:true}).isDisabled(),true);await shot(`saving-${width}`);await page.getByText('Saved to Library.',{exact:true}).waitFor();slow=false;assert.equal(posts,beforePosts+1);await shot(`confirmation-${width}`)
 await click('View in Library');await page.getByRole('button',{name:`Edit ${name}`,exact:true}).waitFor();await shot(`library-${width}`)
 await page.reload();await click('Library');await page.getByText('Loading drafts…',{exact:true}).waitFor({state:'hidden'});while (!await page.getByRole('button',{name:`Edit ${name}`,exact:true}).count()) { await click('Load more drafts'); await page.getByText('Loading drafts…',{exact:true}).waitFor({state:'hidden'}) } await page.getByRole('button',{name:`Edit ${name}`,exact:true}).click();await page.getByRole('button',{name:'Save Changes',exact:true}).waitFor();await page.getByText('Classification & Location',{exact:true}).click();assert.equal(await page.getByLabel('Grade',{exact:true}).inputValue(),'7');assert.equal(await page.getByLabel('Content city',{exact:true}).inputValue(),'683506');await shot(`reopen-${width}`)
 const list=await api('/api/creator/content?limit=100');const saved=list.items.find(r=>r.exercise.title===name);assert.ok(saved)
 await title(name+' revised');await click('Save Changes');await page.getByText('Saved to Library.',{exact:true}).waitFor();await shot(`revision-${width}`)
 const revised=await api(`/api/creator/content/${saved.contentId}`);assert.equal(revised.version,2);assert.notEqual(revised.revisionId,saved.revisionId);assert.deepEqual((await api(`/api/creator/content/${saved.contentId}/revisions/${saved.revisionId}`)).exercise,saved.exercise)
 // Competing real write produces a genuine stale-revision 409.
 await api(`/api/creator/content/${saved.contentId}`,'PUT',{exercise:{...revised.exercise,title:name+' remote'},category:revised.category,curriculum:revised.curriculum,geography:revised.geography,baseRevisionId:revised.revisionId})
 await title(name+' local');await click('Save Changes');await page.getByRole('button',{name:'Reload saved version',exact:true}).waitFor();await shot(`conflict-${width}`)
 await page.getByRole('button',{name:'Edit Title',exact:true}).click();assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),name+' local');await page.keyboard.press('Escape');await click('Reload saved version');await page.getByRole('button',{name:'Edit Title',exact:true}).click();assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),name+' remote');await page.getByLabel('Title',{exact:true}).fill('');await page.keyboard.press('Escape');await click('Save Changes');await page.getByRole('alert').first().waitFor();await shot(`validation-${width}`)
 results.push({width,realPostgres:true,created:saved.contentId,revisions:3,overflow:false})
}
// Actual shared editor saves and reloads each supported mechanic through PostgreSQL.
for(const [section,label,mechanics] of [
 ['Personal Challenges','Personal Challenge',['tap-pair','single-choice','multiple-choice','true-false','memory-card','number-line','match-columns','drag-drop','fill-blank','sequence','find-mistake','build-problem','number-pattern','shape-pattern','rule-discovery']],
 ['Team Challenges','Team Challenge',['scrambled-word','hypothesis','assemble-machine','clue-synthesis','filter-noise','distributed-information','shared-final-key']]
]) {
 await go();await page.getByLabel('Content type',{exact:true}).selectOption(section)
 for(const mechanic of mechanics){console.log(section,mechanic);await page.getByLabel(label,{exact:true}).selectOption(mechanic);await title(`Round trip ${mechanic} ${runId}`);await click(await page.getByRole('button',{name:'Save Changes',exact:true}).count()?'Save Changes':'Add Exercise');await page.getByText('Saved to Library.',{exact:true}).waitFor();const latest=(await api('/api/creator/content?limit=100')).items.find(r=>r.exercise.title===`Round trip ${mechanic} ${runId}`);assert.ok(latest);assert.deepEqual((await api(`/api/creator/content/${latest.contentId}`)).exercise,latest.exercise);results.push({mechanic,realPostgres:true})}
}
const seed=(await api('/api/creator/content?limit=100')).items.find(r=>r.exercise.classification==='personal')
for(let i=0;i<22;i++)await api('/api/creator/content','POST',{exercise:{...seed.exercise,title:`Pagination ${runId} ${i}`},category:null,curriculum:{},geography:{scope:'universal'}})
await go();await click('Library');await page.getByRole('button',{name:'Load more drafts',exact:true}).waitFor();await click('Load more drafts');await page.getByRole('region',{name:'My drafts',exact:true}).locator('li').nth(20).waitFor()
const other=await api('/api/creator/content?limit=100','GET',undefined,actors[1]);assert.equal(other.items.length,0)
const own=await api('/api/creator/content?limit=1');assert.equal(own.items.length,1);assert.ok(own.nextAfter);const next=await api(`/api/creator/content?limit=1&after=${own.nextAfter}`);assert.notEqual(next.items[0].contentId,own.items[0].contentId)
// Explicit fault injection is confined to error UX checks; no successful save is mocked.
await go();await title('Keep on failure')
for(const status of [400,401,403,404,413,500,'network']){failure=status;await click('Add Exercise');await page.getByRole('alert').first().waitFor();assert.equal(await page.getByText('Saved to Library.',{exact:true}).count(),0);assert.ok(await page.getByRole('button',{name:'Add Exercise',exact:true}).isEnabled())}failure=null
assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/results.json`,JSON.stringify({backend:'merged C2a, local disposable PostgreSQL 16',results,ownership:true,keysetPagination:true,injectedFailures:[400,401,403,404,413,500,'network'],errors},null,2));await browser.close();console.log('C2b real PostgreSQL browser checks passed')
