import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const output=process.env.TEDIX_EVIDENCE_DIR || 'docs/evidence/c1-4/answer-review'; await fs.mkdir(output,{recursive:true})
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}); const page=await browser.newPage();page.setDefaultTimeout(8000)
const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
const panel=()=>page.getByRole('region',{name:'Personal Challenge authoring',exact:true}); const btn=name=>panel().getByRole('button',{name,exact:true}); const canvas=()=>panel().getByLabel('Mobile challenge canvas',{exact:true}).filter({visible:true})
// Read-only React fixture probe; all mutations below use actual Creator controls.
async function state(){return page.evaluate(()=>{let node=document.querySelector('.personal-authoring');let fiber=node[Object.keys(node).find(k=>k.startsWith('__reactFiber'))];while(fiber.return)fiber=fiber.return;const visit=f=>{if(!f)return null;if(f.type?.name==='PersonalMechanicEditor')return f.memoizedProps.exercise;return visit(f.child)??visit(f.sibling)};const exercise=visit(fiber.stateNode.current);if(!exercise)throw Error('Missing authored exercise');return JSON.parse(JSON.stringify(exercise))})}
async function open(label){
 if (!await btn(`Edit ${label}`).isVisible()) {
  if (['Minimum','Maximum','Tick spacing'].includes(label)) { if (await btn('Edit Number line').getAttribute('aria-expanded')!=='true') await btn('Edit Number line').click() }
  else if (label==='Reveal delay (milliseconds)') { if (await btn('Edit Recall card').getAttribute('aria-expanded')!=='true') await btn('Edit Recall card').click() }
  else if (await btn('Edit correct answer').getAttribute('aria-expanded')!=='true') await btn('Edit correct answer').click()
 }
 await btn(`Edit ${label}`).click();return panel().getByRole('group',{name:`Edit ${label}`,exact:true})}
async function pencil(label,value,numeric=false){const group=await open(label);const field=group.getByRole(numeric?'spinbutton':'textbox');assert.equal(await field.evaluate(n=>n===document.activeElement),true,label);await field.fill(String(value));await page.keyboard.press('Escape');assert.equal(await btn(`Edit ${label}`).evaluate(n=>n===document.activeElement),true,label)}
async function choose(label,id){const g=await open(label);await g.getByRole('combobox').selectOption(id);await page.keyboard.press('Escape')}
async function shot(name){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name}: page overflow`);assert.equal(await canvas().evaluate(n=>n.scrollWidth>n.clientWidth),false,`${name}: canvas overflow`);await canvas().screenshot({path:`${output}/${name}.png`})}
async function closeAll(){let expanded;while(await (expanded=canvas().locator('button[aria-label^="Edit "][aria-expanded="true"]')).count())await expanded.first().click()}
async function structural(e){const d=e.authored.activity;
 const specs={ 'tap-pair':['Add pair','Card',d.left?.length,'Remove pair'], 'single-choice':['Add option','Option',d.options?.length,'Remove option'], 'fill-blank':['Add blank','Question',d.blanks?.length,'Remove question'], 'multiple-choice':['Add option','Option',d.options?.length,'Remove option'], 'match-columns':['Add pair','Left card',d.left?.length,'Remove pair'], 'drag-drop':['Add item','Item',d.items?.length,'Remove item'], 'sequence':['Add sequence item','Sequence item',d.elements?.length,'Remove sequence item'], 'find-mistake':['Add step','Step',d.steps?.length,'Remove step'], 'build-problem':['Add piece','Piece',d.pieces?.length,'Remove piece'], 'rule-discovery':['Add example','Example',d.examples?.length,'Remove example'] };
 if(specs[e.type]){const [add,label,count,remove]=specs[e.type];await btn(add).click();const g=await open(`${label} ${count+1}`);await g.getByRole('button',{name:`${remove} ${count+1}`,exact:true}).click()}
 else if(e.type.endsWith('pattern')){await btn('Add pattern item').click();const g=await open(`Pattern item ${d.terms.length+1}`);await g.getByRole('button',{name:'Remove item',exact:true}).click();const first=d.terms.findIndex(x=>x.id!==d.missingId);const g2=await open(`Pattern item ${first+1}`);await g2.getByRole('button',{name:'Make this the blank',exact:true}).click();await page.keyboard.press('Escape');const old=d.terms.findIndex(x=>x.id===d.missingId);const g3=await open(`Pattern item ${old+1}`);await g3.getByRole('button',{name:'Make this the blank',exact:true}).click();await page.keyboard.press('Escape')}
 else if(e.type==='number-line'){await pencil('Maximum',d.max+d.step,true);await pencil('Maximum',d.max,true)}
 else if(e.type==='memory-card'){await pencil('Reveal delay (milliseconds)',1000,true)}
 else {await btn('Edit correct answer').click();await panel().getByRole('group',{name:'Edit correct answer',exact:true}).getByRole('button',{name:'False',exact:true}).click();await panel().getByRole('group',{name:'Edit correct answer',exact:true}).getByRole('button',{name:'True',exact:true}).click()}
}
async function answer(e){const d=e.authored.activity,a=e.authored.expected;
 switch(e.type){
 case 'single-choice':{const i=d.options.findIndex(x=>x.id===a.optionId);const g=await open(`Option ${i+1}`);await g.getByRole('radio',{name:'Correct answer',exact:true}).check();await page.keyboard.press('Escape');break}
 case 'multiple-choice':{const g=await open('Option 1');const c=g.getByRole('checkbox',{name:'Correct answer',exact:true});const v=await c.isChecked();await c.setChecked(!v);await c.setChecked(v);await page.keyboard.press('Escape');break}
 case 'true-false':{if(await btn('Edit correct answer').getAttribute('aria-expanded')!=='true')await btn('Edit correct answer').click();const g=panel().getByRole('group',{name:'Edit correct answer',exact:true});await g.getByRole('button',{name:a.value?'False':'True',exact:true}).click();await g.getByRole('button',{name:a.value?'True':'False',exact:true}).click();break;}
 case 'memory-card':await pencil('Accepted recall answer',a.value);break;
 case 'number-line':await pencil('Correct value',a.target,true);break;
 case 'fill-blank':await pencil('Accepted answer 1',a.values[0].value);break;
 case 'match-columns':await choose(`Match for ${d.left[0].text}`,a.pairs[0].rightId);break;
 case 'drag-drop':await choose(`Place ${d.items[0].text}`,a.assignments[0].targetId);break;
 case 'sequence':case 'build-problem':{const g=await open('Answer item 1');await g.getByRole('button',{name:'Move answer position 1 down',exact:true}).click();await page.keyboard.press('Escape');const g2=await open('Answer item 2');await g2.getByRole('button',{name:'Move answer position 2 up',exact:true}).click();await page.keyboard.press('Escape');break}
 case 'find-mistake':await choose('Incorrect step',a.stepId);await choose('Correct explanation',a.explanationId);break;
 case 'number-pattern':await pencil('Missing number',a.value,true);break;
 case 'shape-pattern':await choose('Missing shape',a.shapeId);break;
 case 'rule-discovery':await choose('Correct rule',a.ruleId);await pencil('Predicted output',a.predictedOutput,true);break;
 // Tap & Pair relationships are authored by the two cards in each pair.
 case 'tap-pair':{if(await btn('Edit correct answer').getAttribute('aria-expanded')!=='true')await btn('Edit correct answer').click();const g=panel().getByRole('group',{name:'Edit correct answer',exact:true});await g.getByRole('combobox',{name:'Match for card 1',exact:true}).selectOption(a.pairs[1].rightId);await g.getByRole('combobox',{name:'Match for card 1',exact:true}).selectOption(a.pairs[0].rightId);break;}
 }
}
async function solve(e){const p=panel().locator(`[aria-label="${e.type} interactive exercise"]:visible`),d=e.authored.activity,a=e.authored.expected;const click=name=>p.getByRole('button',{name,exact:true}).click();const select=(name,id)=>p.getByRole('combobox',{name,exact:true}).selectOption(id);
 switch(e.type){
 case 'tap-pair':{const cards=p.getByLabel('Tap and pair cards').getByRole('button');for(const pair of a.pairs){await cards.nth(d.left.findIndex(x=>x.id===pair.leftId)).click();await cards.nth(d.left?.length+[...d.right].reverse().findIndex(x=>x.id===pair.rightId)).click()}break}
 case 'single-choice':await click(d.options.find(x=>x.id===a.optionId).text);break;
 case 'fill-blank':for(const v of a.values)await p.getByRole('textbox').nth(d.blanks.findIndex(x=>x.id===v.blankId)).fill(v.value);break;
 case 'true-false':await click(a.value?'True':'False');break;
 case 'memory-card':await p.getByRole('textbox',{name:'Recalled answer'}).fill(a.value);await click('Reveal recall card');break;
 case 'number-line':await p.getByRole('slider').fill(String(a.target));await p.getByRole('slider').press('Home');await p.getByRole('slider').fill(String(a.target));break;
 case 'multiple-choice':for(const id of a.optionIds)await p.getByRole('checkbox',{name:d.options.find(x=>x.id===id).text,exact:true}).check();break;
 case 'match-columns':for(const v of a.pairs)await select(d.left.find(x=>x.id===v.leftId).text,v.rightId);break;
 case 'drag-drop':await p.locator('[draggable=true]').first().dragTo(p.locator('[class*=border-dashed]').nth(d.targets.findIndex(x=>x.id===a.assignments[0].targetId)));for(const v of a.assignments)await select(`Target for ${d.items.find(x=>x.id===v.itemId).text}`,v.targetId);break;
 case 'sequence':case 'build-problem':{const items=d.elements??d.pieces;for(const id of a.order??a.construction){const i=items.findIndex(x=>x.id===id);await click(`${i+1}. ${items[i].text}`)}break}
 case 'find-mistake':await click(d.steps.find(x=>x.id===a.stepId).text);await click('Check answer');await click(d.explanations.find(x=>x.id===a.explanationId).text);break;
 case 'number-pattern':await p.getByRole('textbox',{name:'Missing term'}).fill(String(a.value));break;
 case 'shape-pattern':await click(d.shapes.find(x=>x.id===a.shapeId).text);break;
 case 'rule-discovery':await click(d.rules.find(x=>x.id===a.ruleId).text);await p.getByRole('textbox',{name:`Predicted output for ${d.predictionInput}`}).fill(String(a.predictedOutput));break;
 }
 await click('Check answer');assert.equal(await p.locator('[role="status"]').textContent(),e.correctFeedback);await click('Hint');assert.match(await p.textContent(),/Context clue/);await click('Solution');assert.match(await p.textContent(),/Context solution/)
}
try{for(const width of [1440,390,320])for(const entry of ['content','template']){
 await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:5173/tests/browser/contentUnified.html${entry==='template'?'?template=1':''}`);if(entry==='template')await btn('Create Your Own').click();const types=await panel().getByLabel('Personal Challenge',{exact:true}).locator('option').evaluateAll(ns=>ns.map(n=>n.value).filter(Boolean));assert.equal(types.length,15)
 for(const type of types){console.log(width,entry,type);await panel().getByLabel('Personal Challenge',{exact:true}).selectOption(type);assert.equal(await btn('Edit correct answer').getAttribute('aria-expanded'),'false');
 for(const label of ['Correct sequence','Correct construction','Accepted distance','Correct value','Missing number','Missing shape','Accepted recall answer','Correct explanation','Correct truth value','Predicted output','✓ Correct answer']) assert.equal(await canvas().getByText(label,{exact:true}).count(),0,`${type}: closed ${label}`);
 await shot(`${entry}-${type}-closed-${width}`);await btn('Edit correct answer').click();await shot(`${entry}-${type}-answer-${width}`);await panel().getByRole('group',{name:'Edit correct answer',exact:true}).locator(':scope > button').last().click();assert.equal(await panel().getByRole('textbox',{name:'Title',exact:true}).count(),0);const baseline=await state();
 await pencil('Title',`Context ${type}`);await structural(baseline);await answer(await state());await closeAll();
 const summary=panel().locator('summary').filter({hasText:/Hints/});await summary.click();await btn('Add hint').click();let e=await state();const hintIndex=e.authored.hints.length;
 await pencil(`Hint ${hintIndex}`,'Context clue');if(hintIndex>1)await pencil('Hint 1','Context clue');
 await pencil('Correct feedback','Context success');await pencil('Try again feedback','Context retry');await pencil('Solution','Context solution');await summary.click();
 e=await state();assert.equal(await btn('Try challenge').isEnabled(),true,JSON.stringify(e));await btn('Try challenge').click();assert.equal(await canvas().getByRole('button',{name:/^Edit /}).count(),0);await solve(e);if(width===390&&entry==='template')await shot(`${entry}-${type}-try-${width}`);await btn('Edit').click();assert.deepEqual(await state(),e);await btn('Complex / LaTeX').click();await btn('Edit with Preview').click();assert.deepEqual(await state(),e);
 // Switching mechanic variants retains the complete authored draft.
 await panel().getByLabel('Personal Challenge',{exact:true}).selectOption(types[(types.indexOf(type)+1)%types.length]);await panel().getByLabel('Personal Challenge',{exact:true}).selectOption(type);assert.deepEqual(await state(),e);results.push({width,entry,type,content:true,structure:type==='true-false'?'fixed two truth values':true,closedAndOpenedAnswers:true,answer:true,play:true,modes:true,support:true,variants:true,overflow:false});
 }
}assert.deepEqual(errors,[]);await fs.writeFile(`${output}/results.json`,JSON.stringify({scenarios:results.length,results,errors,backend:'Deterministic FE fixtures; actual ContentStudio, shared Template authoring, validation and ExerciseRenderer. No live backend writes.'},null,2));}finally{await browser.close()}
