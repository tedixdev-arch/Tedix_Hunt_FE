import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const actors=JSON.parse(await fs.readFile(process.env.C2C_ACTORS || 'work/review-actors.json','utf8'))
const output=process.env.C2D_EVIDENCE || 'docs/evidence/c2d-02'
await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
const page=await browser.newPage({serviceWorkers:'block'});page.setDefaultTimeout(15000)
const endpoint='http://127.0.0.1:3002',errors=[],requests=[],results=[]
let fail=false
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
await page.addInitScript(token=>localStorage.setItem('tedix-hunt.session',JSON.stringify({accessToken:token})),actors[1].token)
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url());if(!url.pathname.startsWith('/api/'))return route.continue();requests.push({method:req.method(),path:url.pathname+url.search});if(fail&&url.pathname==='/api/creator/content/approved')return route.fulfill({status:503,contentType:'application/json',body:'{"error":"temporary"}'});const response=await route.fetch({url:endpoint+url.pathname+url.search});await route.fulfill({response})})
const api=async(path,method='GET',body,actor=actors[0],status=200)=>{const r=await page.request.fetch(endpoint+path,{method,headers:{Authorization:`Bearer ${actor.token}`},...(body?{data:body}:{})});assert.equal(r.status(),status,`${method} ${path}: ${await r.text()}`);return r.json()}
const click=name=>page.getByRole('button',{name,exact:true}).click()
const shot=async name=>{await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name);await page.screenshot({path:`${output}/${name}.png`,fullPage:true})}
const wait=()=>page.getByText('Loading exercises…',{exact:true}).waitFor({state:'hidden'})
const publish=async body=>{const r=await api('/api/creator/content','POST',body,actors[0],201);await api(`/api/creator/content/${r.contentId}/revisions/${r.revisionId}/submit`,'POST',{});await api(`/api/admin/content/review/${r.contentId}/revisions/${r.revisionId}/approve`,'POST',{},actors[2]);return r}
try{
await page.goto('http://127.0.0.1:5173/tests/browser/approvedContent.html')
await page.waitForFunction(()=>window.approvedFixture)
const types=['tap-pair','single-choice','true-false','memory-card','number-line','multiple-choice','match-columns','drag-drop','fill-blank','sequence','find-mistake','build-problem','number-pattern','shape-pattern','rule-discovery','scrambled-word','distributed-information','hypothesis','assemble-machine','clue-synthesis','filter-noise','shared-final-key']
const saved=[]
for(const type of types){const body=await page.evaluate(type=>window.approvedFixture(type),type);body.exercise.title=`Shared ${type}`;saved.push(await publish(body))}
for(const [label,geography] of [['Universal',{scope:'universal'}],['Country',{scope:'country',countryCode:'RO'}],['Region',{scope:'region',countryCode:'RO',admin1Code:'13'}],['City',{scope:'city',countryCode:'RO',geographicId:'683506'}],['Other region',{scope:'region',countryCode:'RO',admin1Code:'23'}],['Other city',{scope:'city',countryCode:'RO',geographicId:'675810'}]]){const body=await page.evaluate(()=>window.approvedFixture('single-choice'));body.exercise.title=`Eligibility ${label}`;body.geography=geography;await publish(body)}
const original=saved[1];const draft=await api(`/api/creator/content/${original.contentId}/revisions`,'POST',{baseRevisionId:original.revisionId},actors[0],201);assert.notEqual(draft.revisionId,original.revisionId)
const discovered=await api('/api/creator/content/approved?limit=100', 'GET',undefined,actors[1]);assert.equal(discovered.items.find(i=>i.contentId===original.contentId).revisionId,original.revisionId)
const exact=await api(`/api/creator/content/approved/${original.contentId}/revisions/${original.revisionId}`,'GET',undefined,actors[1]);assert.deepEqual(exact.exercise,original.exercise)
await api(`/api/creator/content/${original.contentId}`,'GET',undefined,actors[1],404)
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:960});await page.goto('http://127.0.0.1:5173/tests/browser/approvedContent.html');await click('Content');await click('Library');await page.getByText('Loading content…',{exact:true}).waitFor({state:'hidden'});await shot(`my-content-${width}`)
 await click('Approved Exercises');await wait();await page.getByRole('button',{name:'Load More',exact:true}).waitFor();await shot(`approved-list-${width}`);await page.getByRole('button',{name:'Load More',exact:true}).scrollIntoViewIfNeeded();await shot(`load-more-control-${width}`);await click('Load More');await wait();await shot(`load-more-${width}`)
 const filters=page.getByRole('region',{name:'Approved Exercises',exact:true}).locator('details').first();await filters.locator('summary').click()
 await page.getByLabel('Content category',{exact:true}).selectOption('Mathematics');await page.getByLabel('Grade',{exact:true}).selectOption('7');await wait();await shot(`mathematics-${width}`)
 await page.getByLabel('Exercise mechanic',{exact:true}).selectOption('single-choice');await wait();await page.getByRole('button',{name:'Preview Shared single-choice',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert.match(await dialog.innerText(),/Read-only/);await dialog.getByRole('button',{name:'Check answer',exact:true}).click();await dialog.getByRole('button',{name:'Hint',exact:true}).click();await shot(`approved-preview-${width}`);await page.keyboard.press('Escape')
 await click('Reset filters');await page.getByLabel('Content country',{exact:true}).selectOption('RO');await page.getByLabel('Content region',{exact:true}).selectOption('13');await wait();await shot(`location-${width}`);await page.getByLabel('Find content city',{exact:true}).fill('Cluj');await page.getByLabel('Content city',{exact:true}).selectOption('683506');await wait();for(const name of ['Universal','Country','Region','City'])await page.getByRole('button',{name:`Preview Eligibility ${name}`,exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/Preview Eligibility Other/}).count(),0);await shot(`city-${width}`)
 await click('Reset filters');await page.getByRole('searchbox').fill('unfindable-exercise-xyz');await wait();await page.getByText('No approved exercises match. Adjust the filters.',{exact:true}).waitFor();await shot(`empty-${width}`)
 fail=true;await click('Reset filters');await page.getByRole('alert').waitFor();await shot(`error-${width}`);fail=false;await click('Refresh search');await wait()
 await page.getByLabel('Content type',{exact:true}).selectOption('Team Challenges');await wait();await page.getByRole('button',{name:'Preview Shared scrambled-word',exact:true}).waitFor();await shot(`team-${width}`)
 await page.getByRole('button',{name:'Preview Shared scrambled-word',exact:true}).click();await dialog.waitFor();await shot(`team-preview-${width}`);await page.keyboard.press('Escape')
 results.push({width,overflow:false,realBackend:true,exactApprovedRevisionDespiteNewDraft:true})
}
assert.deepEqual(errors,[]);for(const request of requests){const u=new URL(request.path,'http://local');if(u.searchParams.has('after')){u.searchParams.set('after','[opaque]');request.path=u.pathname+u.search}};await fs.writeFile(`${output}/results.json`,JSON.stringify({backend:'92970d6 (merged #120)',database:'disposable PostgreSQL 17',results,errors,requests},null,2));console.log('Approved Content real backend workflow passed at 1440/390/320px; 36 screenshots.')
}finally{await browser.close()}
