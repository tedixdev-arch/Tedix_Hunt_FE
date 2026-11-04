import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const actors = JSON.parse(await fs.readFile(process.env.C2C_ACTORS || 'work/review-actors.json','utf8'))
const output = process.env.C2C_EVIDENCE || 'docs/evidence/c2c-02'
await fs.mkdir(output,{recursive:true})
const endpoint = 'http://127.0.0.1:3002', origin = 'http://127.0.0.1:5173/tests/browser/contentReview.html'
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']})
const results = [], errors = [], screenshots = [], requests = [], runId = Date.now()
async function pageFor(actor,admin=false){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(15000)
 page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept())
 await page.addInitScript(token=>localStorage.setItem('tedix-hunt.session',JSON.stringify({accessToken:token})),actor.token)
 await page.route('**/api/**',async route=>{const req=route.request(),u=new URL(req.url()),path=u.pathname+u.search;if(!u.pathname.startsWith('/api/'))return route.continue();requests.push({method:req.method(),path});const response=await route.fetch({url:endpoint+path});await route.fulfill({response})})
 await page.goto(origin+(admin?'?admin':''));if(!admin)await page.getByRole('button',{name:'Content',exact:true}).click()
 return page
}
const api = async (page,path,method='GET',body,actor=actors[0],status=200) => {
 const r=await page.request.fetch(endpoint+path,{method,headers:{Authorization:`Bearer ${actor.token}`},...(body!==undefined?{data:body}:{})});assert.equal(r.status(),status,`${method} ${path}: ${await r.text()}`);return r.json()
}
const click=(page,name)=>page.getByRole('button',{name,exact:true}).click()
const shot=async(page,name)=>{await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${name}`);await page.screenshot({path:`${output}/${name}.png`,fullPage:true});screenshots.push(name)}
const editTitle=async(page,title)=>{await click(page,'Edit Title');await page.getByLabel('Title',{exact:true}).fill(title);await page.keyboard.press('Escape')}
const library=async(page)=>{await click(page,'Library');await page.getByText('Loading content…',{exact:true}).waitFor({state:'hidden'})}
const open=async(page,title,status='Edit')=>{await library(page);while(!await page.getByRole('button',{name:`${status} ${title}`,exact:true}).count()){await click(page,'Load more content');await page.getByText('Loading content…',{exact:true}).waitFor({state:'hidden'})}await click(page,`${status} ${title}`)}
const current=async(page,title)=>(await api(page,'/api/creator/content?view=all&limit=100')).items.find(r=>r.exercise.title===title)
let creator,admin
try {
 creator=await pageFor(actors[0]);admin=await pageFor(actors[2],true)
 for(const width of [1440,390,320]){
  await creator.setViewportSize({width,height:960});await admin.setViewportSize({width,height:960})
  if(width!==1440){await creator.reload();await click(creator,'Content')}
  const title=`Science pairs ${width} ${runId}`
  await editTitle(creator,title);await creator.getByLabel('Exercise category',{exact:true}).selectOption('Science');await shot(creator,`creator-draft-${width}`)
  await click(creator,'Add Exercise');await creator.getByText('Saved to Library.',{exact:true}).waitFor();await shot(creator,`submit-for-approval-${width}`)
  const draft=await current(creator,title);assert.equal(draft.status,'draft')
  await editTitle(creator,title+' unsaved');assert.equal(await creator.getByRole('button',{name:'Submit for Approval',exact:true}).isDisabled(),true)
  await editTitle(creator,title);await click(creator,'Save Changes');await creator.getByText('Saved to Library.',{exact:true}).waitFor()
  const saved=await current(creator,title)
  await click(creator,'Submit for Approval');await creator.getByText('Submitted for Review',{exact:true}).waitFor();assert.equal(await creator.getByRole('button',{name:'Edit Title',exact:true}).count(),0);await shot(creator,`submitted-${width}`)
  let submitted=await current(creator,title);assert.equal(submitted.revisionId,saved.revisionId);assert.deepEqual(submitted.exercise,saved.exercise)
  await click(admin,'Refresh');await admin.getByRole('button',{name:`Review ${title}`,exact:true}).waitFor();await shot(admin,`admin-queue-${width}`)
  await click(admin,`Review ${title}`);await admin.getByRole('button',{name:'Approve',exact:true}).waitFor();assert.equal(await admin.getByRole('button',{name:'Edit Title',exact:true}).count(),0)
  assert.equal(await admin.getByLabel('Saved exercise preview',{exact:true}).locator('details').evaluate(e=>e.open),false)
  await shot(admin,`admin-review-${width}`);await admin.getByRole('button',{name:'Approve',exact:true}).scrollIntoViewIfNeeded();await shot(admin,`admin-review-actions-${width}`)
  // Exercise actual student attempt and inspect hints/solution without changing content.
  await click(admin,'Check answer');await click(admin,'Hint');await click(admin,'Solution');await admin.getByLabel('Exercise solution',{exact:true}).waitFor();await click(admin,'Solution')
  await click(admin,'Approve');await admin.getByText('Exercise approved.',{exact:true}).waitFor()
  const approved=await current(creator,title);assert.equal(approved.status,'approved');assert.equal(approved.revisionId,saved.revisionId);assert.deepEqual(approved.exercise,saved.exercise)
  await open(creator,title,'View');await creator.getByText('Approved',{exact:true}).waitFor();await shot(creator,`approved-${width}`)
  await click(creator,'Create New Revision');await creator.getByRole('button',{name:'Save Changes',exact:true}).waitFor();const revised=await current(creator,title);assert.notEqual(revised.revisionId,approved.revisionId);assert.deepEqual(revised.exercise,approved.exercise)
  const retained=await api(creator,`/api/creator/content/${approved.contentId}/revisions/${approved.revisionId}`);assert.deepEqual(retained,approved)
  await editTitle(creator,title+' revision');await click(creator,'Save Changes');await creator.getByText('Saved to Library.',{exact:true}).waitFor();await click(creator,'Submit for Approval');await creator.getByText('Submitted for Review',{exact:true}).waitFor()
  await click(admin,'Refresh');await click(admin,`Review ${title} revision`);await click(admin,'Request Changes');await admin.getByLabel('Review comment',{exact:true}).fill('Explain the second hint and include the reasoning.');await shot(admin,`request-changes-${width}`)
  await click(admin,'Send Request');await admin.getByText('Changes requested.',{exact:true}).waitFor()
  await library(creator)
  const feedbackRow=creator.getByRole('region',{name:'My Content',exact:true}).locator('li').filter({hasText:title+' revision'})
  await feedbackRow.waitFor();await feedbackRow.scrollIntoViewIfNeeded();await shot(creator,`changes-requested-${width}`)
  await feedbackRow.getByRole('button',{name:`Revise ${title} revision`,exact:true}).click();await creator.getByRole('button',{name:'Save Changes',exact:true}).waitFor();await shot(creator,`revised-draft-${width}`)
  await click(admin,'Refresh');await admin.getByText('No submissions awaiting review.',{exact:true}).waitFor();await shot(admin,`empty-queue-${width}`)
  results.push({width,saveSubmitExact:true,unsavedBlocked:true,readOnly:true,approveExact:true,feedbackRevise:true,historyImmutable:true})
 }
 // Team uses the same editor/preview and canonical persisted exercise.
 await creator.reload();await click(creator,'Content');await creator.getByLabel('Content type',{exact:true}).selectOption('Team Challenges');await editTitle(creator,`Team signal ${runId}`);await creator.getByLabel('Exercise category',{exact:true}).selectOption('Science');await click(creator,'Add Exercise');await creator.getByText('Saved to Library.',{exact:true}).waitFor();await click(creator,'Submit for Approval');await creator.getByText('Submitted for Review',{exact:true}).waitFor();const team=await current(creator,`Team signal ${runId}`)
 await click(admin,'Refresh');await click(admin,`Review Team signal ${runId}`);await admin.getByLabel('scrambled-word interactive exercise',{exact:true}).waitFor();await click(admin,'Solution');await admin.getByLabel('Exercise solution',{exact:true}).waitFor();await shot(admin,'admin-team-review-320')
 // Real backend self-review and competing decisions, never mocked.
 const target=`/api/admin/content/review/${team.contentId}/revisions/${team.revisionId}`
 await api(creator,target+'/approve','POST',{},actors[0],403)
 const concurrent=await Promise.all([actors[2],actors[3]].map(actor=>admin.request.post(endpoint+target+'/approve',{headers:{Authorization:`Bearer ${actor.token}`},data:{}})))
 assert.deepEqual(concurrent.map(r=>r.status()).sort(),[200,409]);await click(admin,'Approve');await admin.getByRole('alert').waitFor();assert.match(await admin.getByRole('alert').innerText(),/already changed|no longer available/);assert.equal(await admin.getByRole('button',{name:'Approve',exact:true}).count(),0)
 const history=await api(creator,`/api/creator/content/${team.contentId}/revisions/${team.revisionId}`);assert.equal(history.reviewEvents.filter(e=>e.decision==='approved').length,1)
 const heads=await api(creator,'/api/creator/content?view=all&limit=100');assert.ok(heads.items.some(i=>i.status==='draft'));assert.ok(heads.items.some(i=>i.status==='approved'))
 results.push({teamPreview:true,selfReview403:true,concurrent200and409:true,oneDecision:true})
 assert.deepEqual(errors,[])
 await fs.writeFile(`${output}/results.json`,JSON.stringify({backend:'a56ae6452f93fa14ba5a7e9c881c063899cb3763',database:'disposable PostgreSQL 17',results,screenshots,errors,requests},null,2)+'\n')
 console.log(`Content review PostgreSQL browser workflow passed: ${results.length} groups; ${screenshots.length} screenshots.`)
} finally {await browser.close()}
