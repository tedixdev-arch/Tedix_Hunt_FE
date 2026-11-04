import { authorPrototype } from '../src/features/creator/exercises/persistenceAdapter'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { PersonalChallengeAuthoring } from '../src/features/creator/exercises/PersonalChallengeAuthoring'
import { personalTypes, prototypes, validateExercise, type Exercise } from '../src/features/creator/exercises/catalog'
import type { AuthoringDraft } from '../src/features/creator/exercises/experimentDrafts'
let host: HTMLDivElement, root: Root, draft: AuthoringDraft, replaceAnswer: (answer: any) => void
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);host=document.createElement('div');document.body.append(host);root=createRoot(host) })
afterEach(() => { act(()=>root.unmount());host.remove();vi.unstubAllGlobals() })
function Harness({ standalone }: { standalone: boolean }) { const [value,set]=useState<AuthoringDraft>(standalone ? {source:'custom',assignment:'predefined',custom:authorPrototype(prototypes[0])} : {source:'saved',assignment:'predefined'});draft=value;replaceAnswer=answer=>set(current=>({...current,custom:{...current.custom!,authored:{...current.custom!.authored!,expected:answer}} as Exercise}));return <PersonalChallengeAuthoring standalone={standalone} value={{}} draft={value} onDraftChange={set} onChange={()=>{}} /> }
const button=(label:string)=>[...host.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.getAttribute('aria-label')===label||b.textContent===label)!
async function click(label:string){await act(async()=>button(label).click())}
async function write(field: HTMLTextAreaElement,value:string){await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(field,value);field.dispatchEvent(new Event('input',{bubbles:true}))})}
for(const standalone of [false,true]) for(const [type] of personalTypes) test(`${standalone?'Content':'Template'} ${type}: one common editing surface, contextual support, Escape and mode retention`,async()=>{
 await act(async()=>root.render(<Harness standalone={standalone}/>));if(!standalone) await click('Create Your Own')
 const select=host.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
 await act(async()=>{select.value=type;select.dispatchEvent(new Event('change',{bubbles:true}))})
 expect(host.querySelector('textarea[aria-label="Title"]')).toBeNull()
 await click('Edit Title');const field=host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Title"]')!;expect(document.activeElement).toBe(field);await write(field,`Authored ${type}`)
 await act(async()=>field.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));expect(document.activeElement).toBe(button('Edit Title'));expect(draft.custom!.title).toBe(`Authored ${type}`)
 const details=host.querySelector('details')!;await act(async()=>{details.open=true});await click('Add hint');const index=draft.custom!.authored!.hints.length;await click(`Edit Hint ${index}`)
 const hint=host.querySelector<HTMLTextAreaElement>(`[role="group"][aria-label="Edit Hint ${index}"] textarea`)!;await write(hint,'Keep this clue');await act(async()=>hint.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})))
 const saved=structuredClone(draft.custom) as Exercise;expect(validateExercise(saved)).toEqual([])
 await click('Try challenge');for(const pencil of host.querySelectorAll('[aria-label="Mobile challenge canvas"] [aria-label^="Edit "]')) expect(pencil.closest('[hidden]')).not.toBeNull();await click('Edit');expect(draft.custom).toEqual(saved)
 await click('Complex / LaTeX');await click('Edit with Preview');expect(draft.custom).toEqual(saved)
})
test('list structure and correct answers are contextual, and removal preserves validation',async()=>{
 await act(async()=>root.render(<Harness standalone={false}/>));await click('Create Your Own');const select=host.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
 await act(async()=>{select.value='multiple-choice';select.dispatchEvent(new Event('change',{bubbles:true}))})
 expect(button('Remove option 1')).toBeUndefined();expect(host.querySelector('[aria-label="Option cards"] input[type="checkbox"]')).toBeNull()
 await click('Edit Option 1');expect(button('Remove option 1')).toBeDefined();expect(host.querySelector('[aria-label="Option cards"] input[type="checkbox"]')).not.toBeNull()
 const count=(draft.custom!.authored!.activity as any).options.length;await click('Add option');await click(`Edit Option ${count+1}`);await click(`Remove option ${count+1}`);expect(validateExercise(draft.custom!)).toEqual([])
})
test('Escape closes a pattern editor after its action disables the focused button',async()=>{
 await act(async()=>root.render(<Harness standalone={false}/>));await click('Create Your Own');const select=host.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
 await act(async()=>{select.value='number-pattern';select.dispatchEvent(new Event('change',{bubbles:true}))})
 await click('Edit Pattern item 1');const action=button('Make this the blank');action.focus();await click('Make this the blank');expect(action.disabled).toBe(true)
 await act(async()=>document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})))
 expect(button('Edit Pattern item 1').getAttribute('aria-expanded')).toBe('false');expect(document.activeElement).toBe(button('Edit Pattern item 1'));expect(validateExercise(draft.custom!)).toEqual([])
})

for (const standalone of [false, true]) for (const [type] of personalTypes) test(`${standalone ? 'Content' : 'Template'} ${type}: answer changes cannot leak into the closed student preview`, async () => {
 await act(async () => root.render(<Harness standalone={standalone} />)); if (!standalone) await click('Create Your Own')
 const select = host.querySelector<HTMLSelectElement>('[aria-label="Personal Challenge"]')!
 await act(async () => { select.value = type; select.dispatchEvent(new Event('change', { bubbles: true })) })
 const canvas = host.querySelector('.challenge-canvas')!, before = canvas.textContent
 const d: any = draft.custom!.authored!.activity, a: any = structuredClone(draft.custom!.authored!.expected)
 switch (type) {
 case 'tap-pair': case 'match-columns': [a.pairs[0].rightId, a.pairs[1].rightId] = [a.pairs[1].rightId, a.pairs[0].rightId]; break
 case 'single-choice': a.optionId = d.options.find((x: any) => x.id !== a.optionId).id; break
 case 'multiple-choice': a.optionIds = [d.options.find((x: any) => !a.optionIds.includes(x.id)).id]; break
 case 'true-false': a.value = !a.value; break
 case 'memory-card': a.value = 'Private recall answer'; a.caseSensitive = !a.caseSensitive; break
 case 'number-line': a.target = a.target === d.min ? d.max : d.min; break
 case 'drag-drop': a.assignments[0].targetId = d.targets.find((x: any) => x.id !== a.assignments[0].targetId).id; break
 case 'fill-blank': a.values[0].value = 'Private blank answer'; a.caseSensitive = !a.caseSensitive; break
 case 'sequence': a.order.reverse(); break
 case 'find-mistake': a.stepId = d.steps.find((x: any) => x.id !== a.stepId).id; a.explanationId = d.explanations.find((x: any) => x.id !== a.explanationId).id; break
 case 'build-problem': a.construction.reverse(); break
 case 'number-pattern': a.value = 876543; break
 case 'shape-pattern': a.shapeId = d.shapes.find((x: any) => x.id !== a.shapeId).id; break
 case 'rule-discovery': a.ruleId = d.rules.find((x: any) => x.id !== a.ruleId).id; a.predictedOutput = 876543; break
 }
 await act(async () => replaceAnswer(a)); expect(canvas.textContent).toBe(before)
 expect(canvas.querySelector('[role="group"][aria-label="Edit correct answer"]')).toBeNull()
 expect(canvas.textContent).not.toMatch(/Correct sequence|Correct construction|Accepted distance|Accepted answer|Accepted recall answer|Missing shape|Missing number|Correct explanation|Correct truth value|Predicted output|✓ Correct answer/)
 await click('Edit correct answer'); expect(canvas.querySelector('[role="group"][aria-label="Edit correct answer"]')).not.toBeNull()
 const snapshot = structuredClone(draft.custom); await click('Complex / LaTeX'); await click('Edit with Preview'); expect(draft.custom).toEqual(snapshot)
 expect(host.querySelector('.challenge-canvas [role="group"][aria-label="Edit correct answer"]')).toBeNull()
})
