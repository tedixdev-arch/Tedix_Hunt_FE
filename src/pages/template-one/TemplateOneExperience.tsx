import { ReactNode, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { checkpointExercises, CheckpointExercise, missionData } from '../../data/templateOne'
import { CheckpointAttempt, Difficulty, MissionState, ScoreEvent, TeamChallengeRecord, useTemplateOneMission } from '../../hooks/useTemplateOneMission'
import { useTedixFeedback } from '../../hooks/useTedixFeedback'
import { prototypeCompetition } from '../../data/competitionResults'

const difficultyLabels: Record<Difficulty, { label: string; multiplier: number; description: string }> = {
  easy: { label: 'Easy', multiplier: 1, description: 'Steady route' },
  medium: { label: 'Medium', multiplier: 1.5, description: 'Higher stakes' },
  hard: { label: 'Hard', multiplier: 2, description: 'Maximum score' },
}

type AnswerTargetProps = {
  label: string
  value: string
  state: CheckpointAttempt['status']
  onClick: () => void
  celebrating: boolean
}

function AnswerTarget({ label, value, state, onClick, celebrating }: AnswerTargetProps) {
  const feedbackClass = state === 'incorrect' ? ' is-wrong' : ['correct', 'solution'].includes(state) ? ' is-correct' : ''
  return <button type="button" className={`tedix-answer-target${feedbackClass}${celebrating ? ' answer-success-pulse' : ''}`} aria-label={label} onClick={onClick}><span>{value || '?'}</span>{state === 'correct' && <i className="answer-check" aria-hidden="true">{'\u2713'}</i>}</button>
}

function ChallengeVisual({ exercise, attempt, onOpen, onSelect }: { exercise: CheckpointExercise; attempt: CheckpointAttempt; onOpen: (key: string) => void; onSelect: (value: string) => void }) {
  const target = (label: string, key = 'x') => <AnswerTarget label={label} value={attempt.answers[key] ?? ''} state={attempt.status} celebrating={attempt.status === 'correct'} onClick={() => onOpen(key)} />

  if (exercise.kind === 'hidden-rule') {
    return <div className="rule-grid" aria-label="Input and output examples">
      {[['23', '6'], ['425', '40'], ['1234', '24']].map(([input, output]) => <div className="rule-row" key={input}><span>{input}</span><b>-&gt;</b><span>{output}</span></div>)}
      <div className="rule-row target-row"><span>3416</span><b>-&gt;</b>{target('Missing output for 3416')}</div>
    </div>
  }

  if (exercise.kind === 'find-sabotage') {
    if (attempt.mistakeStage === 'explain') return <div className="mistake-explanation"><div className="mistake-found"><strong>Great!</strong><span>You found the mistake.</span></div><fieldset><legend>Why is it incorrect?</legend>{exercise.mistakeExplanations?.map(option=><label className={attempt.answers.x===option.id?'selected':''} key={option.id}><input type="radio" name="mistake-explanation" value={option.id} checked={attempt.answers.x===option.id} onChange={()=>onSelect(option.id)}/><span>{option.text}</span></label>)}</fieldset></div>
    if (attempt.mistakeStage === 'resolved') return <div className="mistake-correction"><div><small>First wrong step</small><strong>{exercise.mistakeSegments?.find(segment=>segment.mistake)?.content}</strong></div><div><small>Correction</small><strong>{exercise.correctedExpression}</strong></div><p>{exercise.mistakeExplanations?.find(option=>option.correct)?.text}</p></div>
    return <div className="mistake-search" role="group" aria-label="Mathematical transmission. Select the incorrect part.">{exercise.mistakeSegments?.map(segment=><button type="button" aria-pressed={attempt.answers.x===segment.id} className={attempt.answers.x===segment.id?'selected':''} onClick={()=>onSelect(segment.id)} key={segment.id}>{segment.content}</button>)}</div>
  }

  if (exercise.kind === 'square') {
    const squares = [{ top: '8', left: '12', right: '', bottom: '6' }, { top: '6', left: '2', right: '3', bottom: '1' }, { top: '3', left: '2', right: '9', bottom: '6' }]
    return <div className="square-grid" aria-label="Three divided square examples">{squares.map((item, index) => <div className={`square-shape ${index === 0 ? 'visual-target' : ''}`} key={index}><svg viewBox="0 0 112 112" aria-hidden="true"><rect x="12" y="12" width="88" height="88" rx="5" /><path d="M12 12 L100 100 M100 12 L12 100" /></svg><span className="square-top">{item.top}</span><span className="square-left">{item.left}</span>{index === 0 ? <div className="square-right">{target('Missing number in right section')}</div> : <span className="square-right">{item.right}</span>}<span className="square-bottom">{item.bottom}</span></div>)}</div>
  }

  if (exercise.kind === 'build-key') {
    const selected = attempt.answers.x ?? ''
    return <div className="build-key" aria-label="Build 24 from number blocks"><div className="build-target"><span>Target</span><strong>24</strong></div><div className="build-slots">{[0,1,2].map(index=><span key={index}>{selected[index] ?? '_'}</span>)}</div><div className="build-blocks">{['2','3','4','5'].map(block=><button type="button" disabled={selected.includes(block)||selected.length===3} onClick={()=>onSelect(`${selected}${block}`)} key={block}>{block}</button>)}</div><button type="button" className="build-clear" disabled={!selected} onClick={()=>onSelect('')}>Clear key</button></div>
  }

  if (exercise.kind === 'radial') {
    return <div className="radial visual-target" aria-label="Three intersecting lines with opposite endpoints"><svg viewBox="0 0 260 220" aria-hidden="true"><path d="M130 110 L70 40 M130 110 L190 180 M130 110 L205 110 M130 110 L55 110 M130 110 L190 40 M130 110 L70 180" /><circle cx="130" cy="110" r="5" /><text x="25" y="116">6</text><text x="220" y="116">20</text><text x="198" y="34">17</text><text x="51" y="207">9</text><text x="198" y="207">11</text></svg><div className="radial-target">{target('Missing radial endpoint')}</div></div>
  }

  if (exercise.kind === 'identify-signal') {
    return <div className="frequency-options" aria-label="Recovered signal frequencies">{['24','29','35'].map(value=><button type="button" aria-pressed={attempt.answers.x===value} className={attempt.answers.x===value?'selected':''} onClick={()=>onSelect(value)} key={value}><span>{value}</span><small>MHz</small></button>)}</div>
  }

  return <div className="final-lock" aria-label="Prime sequence 2, 3, 5, 7, 11, missing number"><div className="final-locks">{['2','3','5','7','11'].map(value=><span key={value}>{value}</span>)}{target('Missing prime number')}</div><p>Open your channel. The key digit appears only after the solve.</p></div>
}

function Calculator({ answerKey, value, onChange, onClose }: { answerKey: string; value: string; onChange: (value: string) => void; onClose: () => void }) {
  return <section className="tedix-calculator" role="dialog" aria-modal="false" aria-label={answerKey === 'x' ? 'Calculator' : `Calculator - ${answerKey}`}>
    <header><strong>{answerKey === 'x' ? 'Calculator' : `Calculator - ${answerKey}`}</strong><button type="button" aria-label="Close calculator" onClick={onClose}>X</button></header>
    <output aria-live="polite" aria-label="Calculator value">{value || '0'}</output>
    <div className="calculator-keys">{['1','2','3','4','5','6','7','8','9'].map(digit => <button type="button" aria-label={`Enter ${digit}`} onClick={() => onChange(`${value}${digit}`)} key={digit}>{digit}</button>)}<button type="button" aria-label="Clear calculator" onClick={() => onChange('')}>C</button><button type="button" aria-label="Enter 0" onClick={() => onChange(`${value}0`)}>0</button><button type="button" aria-label="Delete last digit" onClick={() => onChange(value.slice(0, -1))}>DEL</button></div>
    <button type="button" className="calculator-done" onClick={onClose}>Done</button>
  </section>
}

function SolutionDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="solution-backdrop"><section role="alertdialog" aria-modal="true" aria-labelledby="solution-title"><span className="solution-icon" aria-hidden="true">-100</span><h2 id="solution-title">View solution?</h2><p>This ends your private attempt and deducts 100 points.</p><div><button type="button" onClick={onConfirm}>View solution</button><button type="button" onClick={onCancel} autoFocus>Cancel</button></div></section></div>
}

function TeamSolutionDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="solution-backdrop"><section role="alertdialog" aria-modal="true" aria-labelledby="team-solution-title"><span className="solution-icon" aria-hidden="true">-100</span><h2 id="team-solution-title">Reveal team solution?</h2><p>The complete answer will be revealed. The team can continue, but earns no team-challenge points.</p><div><button type="button" onClick={onConfirm}>Reveal solution</button><button type="button" onClick={onCancel} autoFocus>Keep solving</button></div></section></div>
}

function SafetyControl({ onOpen }: { onOpen: () => void }) {
  return <button aria-label="Get help" className="safety-control" onClick={onOpen} type="button"><span aria-hidden="true">!</span><strong>Help</strong></button>
}

function SafetyDialog({ phase, checkpoint, location, onClose }: { phase: MissionState['phase']; checkpoint: number; location: string; onClose: () => void }) {
  const [progress, setProgress] = useState(0)
  const [sent, setSent] = useState(false)
  const holdStart = useRef<number | null>(null)
  const holdTimer = useRef<number | null>(null)
  const progressTimer = useRef<number | null>(null)

  function stopHold() {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    if (progressTimer.current !== null) window.clearInterval(progressTimer.current)
    holdTimer.current = null
    progressTimer.current = null
    holdStart.current = null
    if (!sent) setProgress(0)
  }

  function startHold() {
    if (sent || holdStart.current !== null) return
    holdStart.current = Date.now()
    setProgress(1)
    progressTimer.current = window.setInterval(() => {
      if (holdStart.current !== null) setProgress(Math.min(99, Math.round(((Date.now() - holdStart.current) / 2000) * 100)))
    }, 50)
    holdTimer.current = window.setTimeout(() => {
      if (progressTimer.current !== null) window.clearInterval(progressTimer.current)
      holdStart.current = null
      holdTimer.current = null
      progressTimer.current = null
      setProgress(100)
      setSent(true)
    }, 2000)
  }

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    if (progressTimer.current !== null) window.clearInterval(progressTimer.current)
  }, [])

  return <div className="safety-backdrop" role="dialog" aria-modal="true" aria-labelledby="safety-title"><section className="safety-sheet">
    {!sent ? <>
      <div className="safety-sheet-heading"><span aria-hidden="true">!</span><div><p>Organizer support</p><h2 id="safety-title">Safety or operational problem?</h2></div></div>
      <p>Your location, team, and current Hunt step will be sent to the Organizer.</p>
      <dl><div><dt>Team</dt><dd>Aurora</dd></div><div><dt>Location</dt><dd>{location}</dd></div><div><dt>Hunt step</dt><dd>{phase} · checkpoint {checkpoint}</dd></div></dl>
      <button className="safety-hold" onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); startHold() } }} onKeyUp={event => { if (event.key === ' ' || event.key === 'Enter') stopHold() }} onPointerCancel={stopHold} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); startHold() }} onPointerLeave={stopHold} onPointerUp={stopHold} type="button"><i style={{ width: `${progress}%` }} /><span>{progress ? `Hold to send · ${progress}%` : 'Press and hold to send'}</span></button>
      <button className="safety-cancel" onClick={onClose} type="button">Cancel</button>
    </> : <>
      <div className="safety-sent-mark" aria-hidden="true">✓</div>
      <h2 id="safety-title">Request sent</h2>
      <p>The Organizer received your location and current Hunt step.</p>
      <div className="safety-contact"><span>Organizer contact</span><strong>+40 700 123 456</strong></div>
      <button className="safety-cancel-request" onClick={() => { setSent(false); setProgress(0) }} type="button">Cancel request</button>
      <button className="safety-close" onClick={onClose} type="button">Return to the Hunt</button>
    </>}
  </section></div>
}

function TeamCaseFile({records,currentCheckpoint,onClose}:{records:TeamChallengeRecord[];currentCheckpoint:number;onClose:()=>void}){return <div className="case-file-backdrop"><section className="case-file-sheet" role="dialog" aria-modal="true" aria-labelledby="case-file-title"><header><div><p>NIGHT SHIFT</p><h2 id="case-file-title">Mission map</h2></div><button type="button" aria-label="Close mission map" onClick={onClose} autoFocus>X</button></header><p className="case-file-intro">Each checkpoint has one mission. Completed steps keep the team answer and the route it unlocked.</p><div className="case-file-list mission-map-list">{checkpointExercises.map((exercise,index)=>{const record=records.find(item=>item.checkpoint===exercise.checkpoint);const isCurrent=!record&&index===currentCheckpoint;const checkpointLabel=`Checkpoint ${String(exercise.checkpoint).padStart(2,'0')}`;return <article className={record?'is-complete':isCurrent?'is-current':'is-locked'} key={exercise.checkpoint}><span>{checkpointLabel} / {record||isCurrent?exercise.location:'Locked'}{exercise.checkpoint===1&&(record||isCurrent)?' / Starting point':''}</span>{record?<><h3><small>Mission completed</small>{exercise.storyObjective}</h3><p>{exercise.storySuccess}</p><div className="mission-map-answer"><small>Team answer</small><strong>{record.answer}</strong></div><p><b>Route unlocked:</b> {exercise.nextLocation}</p><small>{record.resolvedWithSolution?'Solution revealed':'Completed by team'}</small></>:isCurrent?<><h3><small>Mission</small>{exercise.storyObjective}</h3><p>{exercise.storyProblem}</p><strong className="mission-map-status">Complete this step</strong></>:<><h3>{checkpointLabel} is locked</h3><p>Complete the previous checkpoint to reveal its mission.</p></>}</article>})}</div><p className="case-file-privacy">Only shared team results appear here. Private challenges remain hidden.</p><button type="button" className="case-file-close" onClick={onClose}>Back to hunt</button></section></div>}

function ScoringSheet({ score, events, difficulty, onClose }: { score: number; events: ScoreEvent[]; difficulty: Difficulty | null; onClose: () => void }) {
  const missionComplete = events.some(event => event.id === 'completion-bonus')
  const [view, setView] = useState<'earn' | 'protect' | 'run'>(missionComplete ? 'run' : 'earn')
  const deductions = events.filter(event => event.points < 0).reduce((sum, event) => sum + event.points, 0)
  const checkpointPoints = events.filter(event => event.id.includes('accuracy')).reduce((sum, event) => sum + event.points, 0)
  const teamPoints = events.filter(event => event.id.endsWith('-team')).reduce((sum, event) => sum + event.points, 0)
  const finishPoints = events.find(event => event.id === 'finishpoint-puzzle')?.points ?? 0
  const completionPoints = events.find(event => event.id === 'completion-bonus')?.points ?? 0
  const multiplier = difficulty ? difficultyLabels[difficulty].multiplier : 1
  return <div className="score-backdrop"><section className="score-sheet" role="dialog" aria-modal="true" aria-labelledby="score-sheet-title">
    <header><div><p>Hunt Score</p><h2 id="score-sheet-title">How scoring works</h2></div><button type="button" aria-label="Close scoring" onClick={onClose} autoFocus>X</button></header>
    <div className="score-current"><span>Current score</span><strong>{score}</strong><small>Started at 500</small></div>
    <p className="score-explainer">Start at 500. Earn points, protect them, then apply your difficulty multiplier at the finish.</p>
    <div className="score-tabs" role="tablist" aria-label="Scoring sections"><button type="button" role="tab" aria-selected={view==='earn'} onClick={()=>setView('earn')}>Earn</button><button type="button" role="tab" aria-selected={view==='protect'} onClick={()=>setView('protect')}>Protect</button>{missionComplete&&<button type="button" role="tab" aria-selected={view==='run'} onClick={()=>setView('run')}>This run</button>}</div>
    {view==='earn' ? <div className="score-allocation" aria-label="Scoring allocation">
      <article><span>Each checkpoint</span><strong>+100</strong><small>First-time solve at checkpoints 1-6</small></article>
      <article><span>Each team challenge</span><strong>+50</strong><small>Solve together at checkpoints 1-6</small></article>
      <article><span>FinishPoint shared key</span><strong>+250</strong><small>Open every lock and restore the final frequency</small></article>
      <article><span>All checkpoints completion</span><strong>+100</strong><small>Complete all seven stages</small></article>
      <article><span>Time bonus</span><strong>up to +50</strong><small>Top five teams; inactive in this prototype</small></article>
    </div> : view==='protect' ? <div className="score-rules"><h3>Deductions</h3>
    <div className="score-penalties"><span>Retry <b>-25</b></span><span>Hint <b>-50</b></span><span>Solution or Skip <b>-100</b></span></div>
    <h3>Difficulty multiplier</h3>
    <div className="score-multipliers">{(Object.keys(difficultyLabels) as Difficulty[]).map(level=><span className={difficulty===level?'selected':''} key={level}>{difficultyLabels[level].label} <b>x{difficultyLabels[level].multiplier}</b>{difficulty===level&&<small>Selected</small>}</span>)}</div>
    <p className="score-explainer">Maximum base score is 1800. The multiplier is applied only at mission completion.</p>
    {events.length > 0 && <div className="score-live-summary"><h3>Current run</h3><dl><div><dt>Checkpoint points</dt><dd>+{checkpointPoints}</dd></div><div><dt>Team points</dt><dd>+{teamPoints}</dd></div><div><dt>Deductions</dt><dd>{deductions}</dd></div></dl></div>}</div> : <div className="score-run" aria-label="Final score breakdown"><dl><div><dt>Starting score</dt><dd>500</dd></div><div><dt>Checkpoint points</dt><dd>+{checkpointPoints}</dd></div><div><dt>Team challenges</dt><dd>+{teamPoints}</dd></div><div><dt>FinishPoint</dt><dd>+{finishPoints}</dd></div><div><dt>Completion</dt><dd>+{completionPoints}</dd></div><div><dt>Deductions</dt><dd>{deductions}</dd></div><div><dt>Base score</dt><dd>{score}</dd></div><div><dt>{difficultyLabels[difficulty??'easy'].label} multiplier</dt><dd>x{multiplier}</dd></div><div className="score-run-total"><dt>Final score</dt><dd>{Math.round(score*multiplier)}</dd></div></dl></div>}
    <button type="button" className="score-close" onClick={onClose}>Back to hunt</button>
  </section></div>
}

function HunterOnboarding({ score, difficulty, onDifficulty, onStart, onScoring }: { score: number; difficulty: Difficulty | null; onDifficulty: (difficulty: Difficulty) => void; onStart: () => void; onScoring: () => void }) {
  return <main className="hunter-onboarding">
    <div className="hunter-grid" aria-hidden="true" />
    <p className="hunter-signal">{missionData.signal}</p>
    <div className="hunter-mark" aria-hidden="true"><span>H</span></div>
    <p className="hunter-kicker">Identity confirmed</p>
    <h1>Great! You are now a Hunter.</h1>
    <div className="hunter-score"><span>Starting Hunt Score</span><strong>{score}</strong><small>points</small></div>
    <p className="hunter-mantra">Protect it. Improve it. Claim your place.</p>
    <fieldset className="difficulty-picker"><legend>Choose your difficulty</legend><div>{(Object.keys(difficultyLabels) as Difficulty[]).map(level=><button type="button" aria-pressed={difficulty===level} className={difficulty===level?'selected':''} onClick={()=>onDifficulty(level)} key={level}><strong>{difficultyLabels[level].label}</strong><span>x{difficultyLabels[level].multiplier}</span></button>)}</div></fieldset>
    <button type="button" className="hunter-primary" disabled={!difficulty} onClick={onStart}>Begin the hunt</button>
    <button type="button" className="hunter-scoring" onClick={onScoring}>How scoring works</button>
  </main>
}

const huntObjectives = [
  ['Reach the checkpoint', 'Follow each newly unlocked route.'],
  ['Solve your challenge', 'Earn a private contribution.'],
  ['Combine discoveries', 'Every Hunter is needed.'],
  ['Unlock the route', 'Solve the team challenge together.'],
] as const

function MissionObjectiveBriefing({ onContinue }: { onContinue: () => void }) {
  return <main className="mission-objective-briefing">
    <div className="objective-heading">
      <p>Mission: Restore the Signal</p>
      <h1>Unlock the route!</h1>
      <span>Complete each checkpoint with your team to reveal the next location.</span>
    </div>
    <ol className="objective-list">
      {huntObjectives.map(([title, explanation], index) => <li key={title}>
        <b aria-hidden="true">{index + 1}</b>
        <div><strong>{title}</strong><span>{explanation}</span></div>
      </li>)}
    </ol>
    <p className="objective-loop" aria-label="Mission loop">Navigate <i aria-hidden="true">→</i> Solve <i aria-hidden="true">→</i> Combine <i aria-hidden="true">→</i> Unlock</p>
    <button type="button" onClick={onContinue}>Find the starting point</button>
  </main>
}

function FeedbackPanel({ attempt, exercise, onRetry, onCloseHint, onContinue }: { attempt: CheckpointAttempt; exercise: CheckpointExercise; onRetry: () => void; onCloseHint: () => void; onContinue: () => void }) {
  if (attempt.status === 'incorrect') return <footer className="tedix-footer incorrect" role="status"><div className="signed-change negative">-25 Hunt Score</div><h2>Not quite. Try again.</h2><button type="button" className="retry-button" onClick={onRetry} autoFocus>Try again</button></footer>
  if (attempt.status === 'hint') return <footer className="tedix-footer support"><div className="assistance-panel"><h2>Hint</h2><p>{exercise.hint}</p><small>-50 Hunt Score applied once for this checkpoint.</small><button type="button" onClick={onCloseHint}>Close hint</button></div></footer>
  if (attempt.status === 'solution') return <footer className="tedix-footer support"><div className="assistance-panel"><h2>Solution</h2><p>{exercise.solutionIntro}</p><ol>{exercise.solutionSteps.map(step => <li key={step}>{step}</li>)}</ol>{exercise.kind!=='find-sabotage'&&<p><strong>Correct answer: {exercise.answerKeys.map(key => `${key} = ${exercise.correctAnswers[key]}`).join(', ')}</strong></p>}<small>-100 Hunt Score applied once. No checkpoint points.</small><button type="button" className="continue-button" onClick={onContinue}>Continue</button></div></footer>
  if (attempt.status === 'correct') return <footer className="tedix-footer correct correct-result" role="status"><div className="correct-copy"><h2>Correct!</h2><p>{exercise.successText}</p></div>{attempt.accuracyBonus > 0 && <span className="checkpoint-points">+{attempt.accuracyBonus} points</span>}<button type="button" className="continue-button" onClick={onContinue}>Continue</button></footer>
  return null
}

const COMPETITION_END_KEY = 'tedixhunt-prototype-competition-end-v2'
function getCompetitionEnd(){const saved=Number(sessionStorage.getItem(COMPETITION_END_KEY));if(saved>Date.now())return saved;const next=Date.now()+prototypeCompetition.durationMs;sessionStorage.setItem(COMPETITION_END_KEY,String(next));return next}
function formatCountdown(milliseconds:number){const seconds=Math.max(0,Math.floor(milliseconds/1000));const hours=Math.floor(seconds/3600);const minutes=Math.floor((seconds%3600)/60);const remainder=seconds%60;return [hours,minutes,remainder].map(value=>String(value).padStart(2,'0')).join(':')}

function FinishPoint({ state, onRestart, onScoring }: { state: MissionState; onRestart: () => void; onScoring: () => void }) {
  const difficulty = state.difficulty ?? 'easy'
  const multiplier = difficultyLabels[difficulty].multiplier
  const finalScore = Math.round(state.huntScore * multiplier)
  const [view,setView]=useState<'summary'|'ceremony'|'results'>('summary')
  const [revealStage,setRevealStage]=useState<'complete'|'countdown'|'board'>('complete')
  const [revealCount,setRevealCount]=useState(5)
  const [revealedRank,setRevealedRank]=useState(11)
  const [revealedSpecials,setRevealedSpecials]=useState(0)
  const [ceremonyStarted,setCeremonyStarted]=useState(false)
  const [reducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [competitionEnd]=useState(getCompetitionEnd)
  const [remaining,setRemaining]=useState(()=>Math.max(0,competitionEnd-Date.now()))
  useEffect(()=>{const timer=window.setInterval(()=>setRemaining(Math.max(0,competitionEnd-Date.now())),1000);return()=>window.clearInterval(timer)},[competitionEnd])
  const teammateScores=prototypeCompetition.teammateScoreOffsets.map(offset=>Math.max(0,finalScore-offset))
  const teamTotal=finalScore+teammateScores.reduce((sum,score)=>sum+score,0)
  const leaderboard=prototypeCompetition.leaderboard.map(team=>({...team,score:Math.max(0,teamTotal+team.scoreOffset)}))
  const ended=remaining===0
  useEffect(()=>{if(view!=='ceremony'||reducedMotion)return;const nextRank=revealedRank-1;const delay=revealStage==='complete'?2500:revealStage==='countdown'?1000:nextRank>=6?1000:nextRank>=4?3000:5000;const timer=window.setTimeout(()=>{if(revealStage==='complete')setRevealStage('countdown');else if(revealStage==='countdown'){if(revealCount>1)setRevealCount(value=>value-1);else setRevealStage('board')}else if(revealedRank>1)setRevealedRank(nextRank);else if(revealedSpecials<2)setRevealedSpecials(value=>value+1)},delay);return()=>window.clearTimeout(timer)},[reducedMotion,revealCount,revealStage,revealedRank,revealedSpecials,view])
  const startCeremony=()=>{setCeremonyStarted(true);setRevealStage('complete');setRevealCount(5);setRevealedRank(11);setRevealedSpecials(0);setView('ceremony')}
  useEffect(()=>{if(ended&&view==='summary'&&!ceremonyStarted)startCeremony()},[ceremonyStarted,ended,view])
  const advanceReducedReveal=()=>{if(revealStage==='complete')setRevealStage('countdown');else if(revealStage==='countdown')setRevealStage('board');else if(revealedRank>1)setRevealedRank(value=>value-1);else if(revealedSpecials<2)setRevealedSpecials(value=>value+1);else setView('results')}
  const positiveChanges=state.scoreEvents.filter(event=>event.points>0).reduce((sum,event)=>sum+event.points,0)
  const deductions=Math.abs(state.scoreEvents.filter(event=>event.points<0).reduce((sum,event)=>sum+event.points,0))
  if(view==='ceremony'){
  if(view==='ceremony')return <main className={`finish-point reveal-ceremony reveal-${revealStage}`}><p className="ceremony-preview">Deterministic prototype simulation</p>{revealStage!=='board'?<div className="ceremony-stage" role="status" aria-live="polite">{revealStage==='complete'?<><span className="ceremony-lock" aria-hidden="true">✓</span><h1>Competition complete.</h1><p>Scores are locked.</p></>:reducedMotion?<><h1>Final standings ready.</h1><p>Continue when you are ready.</p></>:<><p>Final standings in</p><strong className="ceremony-count">{revealCount}</strong></>}</div>:<div className="ceremony-board" role="status" aria-live="polite"><div className="ceremony-board-heading"><p className="finish-kicker">Final results</p><h1>{revealedRank===11?'The reveal begins':revealedSpecials<2?'Results ceremony':'All prizes awarded'}</h1></div><ol className="ceremony-rankings">{leaderboard.map((team,index)=>{const rank=index+1;const revealed=rank>=revealedRank;return <li className={`${revealed?'is-revealed':'is-concealed'} ${team.name==='NIGHT SHIFT'&&revealed?'is-team':''}`} key={team.name} aria-label={revealed?`${rank}. ${team.name}, ${team.score} points`:`Position ${rank}, not revealed`}><b>{rank}</b><span>{revealed?<><strong>{team.name}</strong>{team.prize&&rank<=5?<small>{team.prize}</small>:null}</>:<i aria-hidden="true"/>}</span><em>{revealed?team.score.toLocaleString():'—'}</em></li>})}</ol><div className="ceremony-specials" aria-label="Special awards">{prototypeCompetition.specialAwards.map((award,index)=>{const revealed=index<revealedSpecials;return <article className={revealed?'is-revealed':'is-concealed'} key={award.name} aria-label={revealed?`${award.name}: ${award.team}, ${award.result}`:`${award.name}, not revealed`}><span><small>Special award</small><strong>{award.name}</strong></span><b>{revealed?award.team:'Waiting…'}</b>{revealed&&<em>{award.result}</em>}</article>})}</div></div>}<div className="ceremony-actions"><button type="button" className="ceremony-skip" onClick={reducedMotion?advanceReducedReveal:()=>setView('results')}>{reducedMotion?(revealedSpecials===2?'View final leaderboard':'Reveal next'):(revealedSpecials===2?'View final leaderboard':'Skip reveal')}</button></div></main>}
  if(view==='results')return <main className="finish-point competition-results"><div className="results-heading"><div><p className="finish-kicker">SIGNAL: CLUJ NAPOCA</p><h1>Final competition results</h1></div><div className="competition-clock"><span>Scores locked</span><strong>Final</strong></div></div><section className="leaderboard-card" aria-labelledby="leaderboard-title"><h2 id="leaderboard-title">Top 10 leaderboard</h2><ol>{leaderboard.map((team,index)=><li className={team.name==='NIGHT SHIFT'?'is-team':''} key={team.name}><b>{index+1}</b><span><strong>{team.name}</strong>{team.prize&&<small>Awarded: {team.prize}{team.accuracy?` - ${team.accuracy}`:''}</small>}</span><em>{team.score.toLocaleString()}</em></li>)}</ol></section><section className="results-score-summary" aria-labelledby="results-score-title"><h2 id="results-score-title">Your score breakdown</h2><div><span>Hunt score <b>{state.huntScore.toLocaleString()}</b></span><span>Earned <b>+{positiveChanges}</b></span><span>Deductions <b>-{deductions}</b></span><span>{difficultyLabels[difficulty].label} <b>x{multiplier}</b></span><strong>Final: {finalScore.toLocaleString()}</strong></div></section><section className="award-list" aria-labelledby="award-title"><h2 id="award-title">Special awards</h2>{prototypeCompetition.specialAwards.map(award=><article key={award.name}><strong>{award.name}</strong><p>{award.team} - {award.result}. {award.condition}</p></article>)}</section><small className="prototype-results-note">One prize per team. Placements 6-10 remain eligible for special awards.</small><div className="finish-result-actions results-three-actions"><button type="button" onClick={startCeremony}>Replay ceremony</button><button type="button" onClick={()=>setView('summary')}>Mission result</button><button type="button" className="finish-restart" onClick={onRestart}>Restart</button></div></main>
  return <main className="finish-point"><div className="finish-signal">SIGNAL RESTORED</div><h1>Mission complete.</h1><p className="finish-kicker">NIGHT SHIFT restored SIGNAL: CLUJ NAPOCA.</p><div className="finish-totals"><div><span>{finalScore.toLocaleString()}</span><small>Your final score</small></div><div><span>{teamTotal.toLocaleString()}</span><small>Team total score</small></div></div><div className="finish-countdown" role="timer" aria-live="polite"><span>{ended?'Results ready':'Results unlock in'}</span><strong>{formatCountdown(remaining)}</strong></div><small className="ceremony-summary-note">Simulation: the results ceremony starts automatically at zero.</small><button type="button" className="finish-scoring" onClick={onScoring}>View your score breakdown</button></main>
}

function Invitation({onAccept}:{onAccept:()=>void}){return <main className="mission-screen invitation"><div className="screen-content invitation-content"><p className="mission-eyebrow">Live city mission</p><h1>SIGNAL: CLUJ NAPOCA</h1><p>The city signal was cut across six linked relays. Restore each relay, trace the source, then restart the main transmitter.</p><div className="mission-facts"><div><span>Mission</span><strong>Restore the Signal</strong></div><div><span>Team</span><strong>NIGHT SHIFT</strong></div></div></div><button onClick={onAccept}>Enter mission</button></main>}
function MapPreview({label}:{label:string}){const isStart=label==='MATTHIAS REX STATUE';const place=isStart?'Matthias Rex Monument, Piata Unirii, Cluj-Napoca':`${label}, Cluj-Napoca`;const src=`https://maps.google.com/maps?hl=en&q=${encodeURIComponent(place)}&z=17&ie=UTF8&iwloc=B&output=embed`;const href=isStart?'https://www.google.com/maps/search/?api=1&query=46.7697894%2C23.5901044':`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;return <div className="map-preview google-map" aria-label={`Google Map centered on ${label}`}>{isStart?<img src="/matthias-rex-map.png" alt="Satellite map of Matthias Rex Statue in Piata Unirii"/>:<iframe title={`Map of ${label}`} src={src} loading="eager" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>}<a className="map-open-overlay" href={href} target="_blank" rel="noreferrer" aria-label={`Open ${label} in Google Maps`}><span>Open in Google Maps</span></a></div>}
const compassBearings:Record<string,number>={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5}
type CompassPermission='unknown'|'granted'|'denied'|'unsupported'
type CompassMode='waiting'|'live'|'calibrate'|'direction-only'
function LiveCompass({direction,permission}:{direction:string;permission:CompassPermission}){const [heading,setHeading]=useState<number|null>(null);const [accuracy,setAccuracy]=useState<number|null>(null);const [mode,setMode]=useState<CompassMode>('waiting');useEffect(()=>{let received=false;const screenAngle=()=>screen.orientation?.angle??0;const smooth=(next:number)=>setHeading(previous=>{if(previous===null)return next;const delta=((next-previous+540)%360)-180;return(previous+delta*.24+360)%360});const update=(event:DeviceOrientationEvent,absoluteEvent=false)=>{const compassEvent=event as DeviceOrientationEvent&{webkitCompassHeading?:number;webkitCompassAccuracy?:number};const iosHeading=compassEvent.webkitCompassHeading;const hasIosHeading=typeof iosHeading==='number'&&Number.isFinite(iosHeading);const hasAbsoluteHeading=(absoluteEvent||event.absolute===true)&&typeof event.alpha==='number'&&Number.isFinite(event.alpha);if(!hasIosHeading&&!hasAbsoluteHeading)return;received=true;const next=hasIosHeading?iosHeading!:(360-event.alpha!+screenAngle()+360)%360;const nextAccuracy=hasIosHeading&&typeof compassEvent.webkitCompassAccuracy==='number'?Math.abs(compassEvent.webkitCompassAccuracy):null;setAccuracy(nextAccuracy);setMode(nextAccuracy!==null&&nextAccuracy>25?'calibrate':'live');smooth(next)};const relativeListener=(event:DeviceOrientationEvent)=>update(event,false);const absoluteListener=(event:Event)=>update(event as DeviceOrientationEvent,true);window.addEventListener('deviceorientation',relativeListener,true);window.addEventListener('deviceorientationabsolute',absoluteListener,true);const unavailable=window.setTimeout(()=>{if(!received)setMode('direction-only')},1800);return()=>{window.clearTimeout(unavailable);window.removeEventListener('deviceorientation',relativeListener,true);window.removeEventListener('deviceorientationabsolute',absoluteListener,true)}},[]);useEffect(()=>{if(permission==='denied'||permission==='unsupported')setMode('direction-only')},[permission]);const targetBearing=compassBearings[direction]??0;const dialRotation=heading===null?0:-heading;const status=mode==='live'?'Live compass':mode==='calibrate'?'Calibration needed':mode==='direction-only'?'Direction only':'Checking compass';const guidance=mode==='live'?'Turn until the target dot reaches the top.':mode==='calibrate'?'Move your phone in a figure eight, then try again.':mode==='direction-only'?`Keep ${direction} ahead or open Maps.`:'Checking this phone for a reliable compass sensor.';return <div className={`live-compass mode-${mode}`}><div className="compass-orbit" aria-label={`${status}. Target ${direction}`}><div className="compass-dial" style={{transform:`rotate(${dialRotation}deg)`}}><span className="north-mark">N</span><span className="east-mark">E</span><span className="south-mark">S</span><span className="west-mark">W</span><b className="target-marker" aria-label={`Target ${direction}`} title={`Target ${direction}`} style={{transform:`translate(-50%,-50%) rotate(${targetBearing}deg) translateY(-45px) rotate(${-targetBearing}deg)`}} /></div><i className="phone-direction"/></div><div className="compass-state" role="status" aria-live="polite"><strong>{status}</strong><span>{guidance}</span>{accuracy!==null&&<small>Accuracy about {Math.round(accuracy)} degrees</small>}</div></div>}
function NavigationScreen({exercise,first,compassPermission,onArrive}:{exercise:CheckpointExercise;first:boolean;compassPermission:CompassPermission;onArrive:()=>void}){const useMap=first||exercise.navigationMode==='map';const target=first?exercise.location:exercise.nextLocation;const place=`${target}, Cluj-Napoca`;const mapsHref=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;const [rangeReady,setRangeReady]=useState(false);useEffect(()=>{const ready=window.setTimeout(()=>setRangeReady(true),5000);return()=>window.clearTimeout(ready)},[]);const arrivalLabel=exercise.checkpoint===6&&!first?'Arrived at FinishPoint':first?'Confirm arrival':'Arrived at checkpoint';const routeVisual=exercise.navigationMode==='landmark'?<div className="landmark-fragment" aria-label="Recovered fragment showing a clock face"><div className="clock-fragment"><i/><b>12</b><span>3</span><small>9</small></div><p>Match this detail in the street.</p></div>:exercise.navigationMode==='decoded-route'?<div className="decoded-route" aria-label="Decoded route"><span>EAST</span><b>+ 45 degrees right</b><strong>SE</strong></div>:exercise.navigationMode==='signal-strength'?<div className="signal-strength" aria-label={rangeReady?'Signal strength strong':'Signal strength rising'}><span className="active"/><span className="active"/><span className="active"/><span className={rangeReady?'active':''}/><span className={rangeReady?'active':''}/><strong>{rangeReady?'STRONG':'RISING'}</strong></div>:useMap?<MapPreview label={target}/>:<LiveCompass direction={exercise.direction} permission={compassPermission}/>;return <main className={`mission-screen navigation-screen ${first?'starting-point-screen':''}`}>{!first&&<><p className="mission-eyebrow">{exercise.storyStage} / route unlocked</p><h1>{target}</h1><div className="compass-readout"><span>{exercise.direction}</span><strong>{exercise.distance}</strong></div><p>{exercise.navigationClue}</p></>}{first?<div className="map-arrival-card"><MapPreview label={target}/><div className="map-arrival-confirm"><p className={rangeReady?'is-ready':''} role="status" aria-live="polite">{rangeReady?'You are in range':'You are close to location!'}</p><button disabled={!rangeReady} onClick={onArrive}>Confirm arrival</button></div></div>:<>{routeVisual}{!useMap&&<a className="navigation-map-link" href={mapsHref} target="_blank" rel="noreferrer">Open in Maps</a>}<p className={`range-status ${rangeReady?'is-ready':''}`} role="status" aria-live="polite">{rangeReady?'You are in range':'You are close to location!'}</p><button disabled={!rangeReady} onClick={onArrive}>{arrivalLabel}</button></>}</main>}
function Arrival({exercise,onOpen}:{exercise:CheckpointExercise;onOpen:()=>void}){const finish=exercise.checkpoint===7;return <main className="mission-screen"><div className="screen-content story-arrival"><p className="checkpoint-context"><span>{finish?'FinishPoint':`Checkpoint ${exercise.checkpoint} of 7`}</span><i aria-hidden="true">·</i><strong>{exercise.location}</strong></p><h1>{exercise.storyObjective}</h1><p className="arrival-problem">{exercise.storyProblem}</p><ol className="checkpoint-path"><li><span>Now / private</span><p>{exercise.storyPlan}</p></li><li><span>Next / team</span><p>{exercise.teamInstruction}</p></li><li><span>Reward</span><p>{finish?'Restore SIGNAL: CLUJ NAPOCA.':`Unlock directions to ${exercise.nextLocation}.`}</p></li></ol><small className="arrival-privacy">Your exercise and answer stay private.</small></div><button onClick={onOpen}>{finish?'Open final lock':'Start private challenge'}</button></main>}
function PersonalSignal({exercise}:{exercise:CheckpointExercise}){return <div className="personal-signal" aria-label={`Your private view: ${exercise.personalMask}`}><span>Your view of the team signal</span><strong>{exercise.personalMask}</strong><small>Other discoveries stay hidden</small></div>}
function Contribution({exercise,onContinue}:{exercise:CheckpointExercise;onContinue:()=>void}){return <main className="mission-screen contribution-screen"><div className="contribution-panel"><p className="mission-eyebrow">Private challenge complete</p><h1>Correct.</h1><div className="contribution-hero"><span>You earned</span><strong>{exercise.personalContribution}</strong><small>Your team contribution</small></div><div className="contribution-guidance"><div className="contribution-guidance-row purpose"><span aria-hidden="true"/><div><strong>Added to the team challenge</strong><p>Your contribution is ready.</p></div></div><div className="contribution-guidance-row next"><span aria-hidden="true"/><div><strong>Next</strong><p>Join your team to solve the challenge and unlock the next direction.</p></div></div><div className="contribution-guidance-row privacy"><span aria-hidden="true"/><p>Your teammates see your contribution, not your private challenge.</p></div></div></div><button onClick={onContinue}>View team challenge</button></main>}
function TeamProgress({exercise,ready,onReady,onOpen}:{exercise:CheckpointExercise;ready:boolean;onReady:()=>void;onOpen:()=>void}){useEffect(()=>{if(ready)return;const timer=window.setTimeout(onReady,5000);return()=>window.clearTimeout(timer)},[onReady,ready]);return <main className="mission-screen team-screen"><div className="screen-content"><p className="mission-eyebrow">NIGHT SHIFT / shared progress</p><PersonalSignal exercise={exercise}/><div className="status-list compact-status" aria-label="Team contribution status"><span>Maya <b>Ready</b></span><span>Liam <b>Ready</b></span><span>You <b>Added</b></span><span className={ready?'is-ready':'is-solving'}>Zara <b>{ready?'Ready':'Solving privately'}</b></span></div><p className={`team-readiness-message ${ready?'is-ready':''}`} role="status" aria-live="polite">{ready?'All contributions are ready.':'One teammate is still solving.'}</p></div><button disabled={!ready} onClick={onOpen}>Open team challenge</button></main>}
function TeamChallenge({exercise,value,incorrect,onChange,onVerify,onSolution}:{exercise:CheckpointExercise;value:string;incorrect:boolean;onChange:(v:string)=>void;onVerify:()=>void;onSolution:()=>void}){const isChoice=exercise.teamOptions.length>0;const hasTeamPoints=exercise.checkpoint<=6;const isScrambledWord=exercise.teamKind==='scrambled-word';const isTeamRiddle=exercise.teamKind==='clue-synthesis';const isFilterNoise=exercise.teamKind==='filter-noise';const selectedSignals=new Set(value.split('|').filter(Boolean));const toggleSignal=(name:string)=>{const next=new Set(selectedSignals);if(next.has(name))next.delete(name);else next.add(name);onChange(exercise.publicContributions.map(item=>item.split(':')[0].toUpperCase()).filter(name=>next.has(name)).join('|'))};return <main className="tedix-challenge team-tedix-challenge" aria-labelledby="team-challenge-title"><header className="tedix-progress"><span>Team challenge · {exercise.checkpoint} of 7</span><div><i style={{width:`${(exercise.checkpoint/7)*100}%`}}/></div><b>{hasTeamPoints?'+50 points':'FinishPoint'}</b></header><div className="grade-row"><span className="grade-icon" aria-hidden="true">H</span><strong>TEDIXHUNT</strong><span>Team solve</span></div><section className="challenge-content team-challenge-content"><div className="challenge-title"><p className="privacy-label team-shared-label">Shared · solve together</p><h1 id="team-challenge-title">{exercise.teamPrompt}</h1></div>{exercise.teamRule&&<div className="team-code-key"><span>Decoder key</span><strong>{exercise.teamRule}</strong></div>}{isFilterNoise?<div className="filter-noise-signals" aria-label="Select the team signals you trust">{exercise.publicContributions.map(item=>{const [name,...parts]=item.split(':');const signal=parts.join(':').trim();const key=name.toUpperCase();return <button type="button" key={item} aria-pressed={selectedSignals.has(key)} onClick={()=>toggleSignal(key)}><span>{name}</span><strong>{signal}</strong></button>})}</div>:<div className={`team-evidence ${isScrambledWord?'scrambled-contributions':''}`} aria-label={isScrambledWord?'Scrambled letter contributions from the team':'Discoveries shared by the team'}>{exercise.publicContributions.map((item,index)=><span key={`${item}-${index}`}>{item}</span>)}</div>}{isTeamRiddle&&<div className="team-answer-pattern" aria-label="Answer pattern: C, blank, blank, H, blank, blank">{exercise.teamDisplay}</div>}<p className="team-instruction">{exercise.teamInstruction}</p>{!isFilterNoise&&(isChoice?<div className="team-options">{exercise.teamOptions.map(option=><button type="button" className={value===option?'selected':''} key={option} onClick={()=>onChange(option)}>{option}{exercise.teamKind==='assemble-machine'&&<small> MHz</small>}</button>)}</div>:<input className="finish-input" inputMode={exercise.teamKind==='shared-final-key'?'numeric':'text'} value={value} onChange={event=>onChange(event.target.value)} aria-label={isTeamRiddle?'Enter the riddle answer':isScrambledWord?'Enter the reconstructed team word':'Complete team answer'} placeholder={isTeamRiddle?'Enter the word':isScrambledWord?'Enter the command':exercise.teamRule?'Decoded word':exercise.teamKind==='shared-final-key'?'Final frequency':'Team answer'} autoCapitalize="characters" maxLength={40}/>)} {incorrect&&<p className="team-error" role="alert">{isFilterNoise?'That selection does not form one valid destination and direction. Recheck contradictions and repetition.':'Not yet. Review the shared information and try again.'}</p>}</section><footer className="tedix-footer team-tedix-footer"><button type="button" className="team-solution-button" onClick={onSolution}>Solution <span>-100</span></button><button type="button" className="verify-button" disabled={!value.trim()} onClick={onVerify}>{exercise.teamKind==='shared-final-key'?'Restore signal':isFilterNoise?'Confirm selected signals':'Verify team answer'} {hasTeamPoints&&<span>+50</span>}</button></footer></main>}
function TeamCelebration({exercise,solutionUsed,onReveal}:{exercise:CheckpointExercise;solutionUsed:boolean;onReveal:()=>void}){const displayAnswer=exercise.teamKind==='filter-noise'?exercise.teamDisplay:exercise.teamAnswer;const decodedLetters=exercise.teamRule?.startsWith('A = 1')?[...exercise.teamAnswer].filter(letter=>/[A-Z]/.test(letter)):[];return <main className={`mission-screen team-celebration ${solutionUsed?'solution-result':''}`}><div className="team-celebration-mark" aria-hidden="true"><span/><i/></div><div role="status" aria-live="polite"><p className="mission-eyebrow">{solutionUsed?'Solution revealed':`${exercise.storyStage} complete`}</p><div className="team-result-answer"><span>Team answer</span><strong>{displayAnswer}</strong>{decodedLetters.length>0&&<div className="decoded-answer" aria-label={`${exercise.teamAnswer}: ${decodedLetters.map(letter=>letter.charCodeAt(0)-64).join(', ')}`} aria-hidden="false">{decodedLetters.map((letter,index)=><span key={`${letter}-${index}`}><b>{letter}</b><small>{letter.charCodeAt(0)-64}</small></span>)}</div>}</div><strong className="team-celebration-points">{solutionUsed?'-100':'+50'}</strong><p>{exercise.storySuccess}</p></div><button type="button" onClick={onReveal}>Show next route</button></main>}

export function TemplateOneExperience(){
 const location=useLocation(); const navigate=useNavigate(); const launchState=location.state as {startNewMission?:boolean;difficulty?:Difficulty}|null; const startNewMission=launchState?.startNewMission===true
 const {state,dispatch}=useTemplateOneMission(startNewMission,launchState?.difficulty); const {playCorrect}=useTedixFeedback(); const [calculatorKey,setCalculatorKey]=useState<string|null>(null); const [solutionDialogOpen,setSolutionDialogOpen]=useState(false); const [teamSolutionDialogOpen,setTeamSolutionDialogOpen]=useState(false); const [scoringOpen,setScoringOpen]=useState(false); const [caseFileOpen,setCaseFileOpen]=useState(false); const [safetyOpen,setSafetyOpen]=useState(false); const [compassPermission,setCompassPermission]=useState<CompassPermission>('unknown')
 const exercise=checkpointExercises[state.checkpointIndex]; const attempt=state.attempts[state.checkpointIndex]
 const previousAttemptStatus=useRef(attempt.status); const previousPhase=useRef(state.phase)
 useEffect(()=>{setCalculatorKey(null);setSolutionDialogOpen(false);setTeamSolutionDialogOpen(false);window.scrollTo(0,0)},[state.phase,state.checkpointIndex])
 useEffect(()=>{if(exercise.kind==='find-sabotage'&&calculatorKey)setCalculatorKey(null)},[calculatorKey,exercise.kind])
 useEffect(()=>{if(startNewMission) navigate(location.pathname,{replace:true,state:null})},[location.pathname,navigate,startNewMission])
 useEffect(()=>{if(previousAttemptStatus.current!=='correct'&&attempt.status==='correct')playCorrect(attempt.wrongAttempts>0||attempt.hintUsed);previousAttemptStatus.current=attempt.status},[attempt.hintUsed,attempt.status,attempt.wrongAttempts,playCorrect])
 useEffect(()=>{if(previousPhase.current!=='team-celebration'&&state.phase==='team-celebration')playCorrect(false);previousPhase.current=state.phase},[playCorrect,state.phase])
 const revealRoute=async()=>{const orientation=DeviceOrientationEvent as typeof DeviceOrientationEvent&{requestPermission?:()=>Promise<'granted'|'denied'>};if(typeof orientation.requestPermission==='function'){try{setCompassPermission(await orientation.requestPermission())}catch{setCompassPermission('denied')}}else setCompassPermission('unsupported');dispatch({type:'REVEAL_ROUTE'})}
 const header=<MissionHeader score={state.huntScore} latestEvent={state.scoreEvents[state.scoreEvents.length-1]} caseFileCount={state.teamRecords.length} onCaseFile={()=>setCaseFileOpen(true)} onScoring={()=>setScoringOpen(true)} onHelp={()=>setSafetyOpen(true)}/>
 let content:ReactNode
 if(state.phase==='invitation') content=<Invitation onAccept={()=>dispatch({type:'ACCEPT_MISSION'})}/>
 else if(state.phase==='onboarding') content=<HunterOnboarding score={state.huntScore} difficulty={state.difficulty} onDifficulty={difficulty=>dispatch({type:'SELECT_DIFFICULTY',difficulty})} onStart={()=>dispatch({type:'START_HUNT'})} onScoring={()=>setScoringOpen(true)}/>
 else if(state.phase==='briefing') content=<MissionObjectiveBriefing onContinue={()=>dispatch({type:'BEGIN_ROUTE'})}/>
 else if(state.phase==='navigation') content=<NavigationScreen exercise={exercise} first={state.checkpointIndex===0&&state.completedCheckpoints===0} compassPermission={compassPermission} onArrive={()=>dispatch({type:'ARRIVE'})}/>
 else if(state.phase==='arrival') content=<Arrival exercise={exercise} onOpen={()=>dispatch({type:'OPEN_CHECKPOINT'})}/>
 else if(state.phase==='contribution') content=<Contribution exercise={exercise} onContinue={()=>dispatch({type:'OPEN_TEAM_PROGRESS'})}/>
 else if(state.phase==='team-waiting') content=<TeamProgress exercise={exercise} ready={false} onReady={()=>dispatch({type:'TEAM_CONTRIBUTIONS_READY'})} onOpen={()=>dispatch({type:'OPEN_TEAM_CHALLENGE'})}/>
 else if(state.phase==='team-ready') content=<TeamProgress exercise={exercise} ready onReady={()=>dispatch({type:'TEAM_CONTRIBUTIONS_READY'})} onOpen={()=>dispatch({type:'OPEN_TEAM_CHALLENGE'})}/>
 else if(state.phase==='team-unlocked') content=<TeamChallenge exercise={exercise} value={state.teamAnswer} incorrect={state.teamIncorrect} onChange={value=>dispatch({type:'SET_TEAM_ANSWER',value})} onVerify={()=>dispatch({type:'VERIFY_TEAM'})} onSolution={()=>setTeamSolutionDialogOpen(true)}/>
 else if(state.phase==='team-celebration') content=<TeamCelebration exercise={exercise} solutionUsed={state.teamSolutionUsed[state.checkpointIndex]} onReveal={revealRoute}/>
 else if(state.phase==='complete') content=<FinishPoint state={state} onRestart={()=>dispatch({type:'RESTART'})} onScoring={()=>setScoringOpen(true)}/>
 else { const canEdit=attempt.status==='active'; const canVerify=canEdit&&exercise.answerKeys.every(key=>attempt.answers[key]?.length); const difficulty=state.difficulty??'easy'; content=<main className="tedix-challenge" aria-labelledby="challenge-title"><header className="tedix-progress"><span>Private challenge · {exercise.checkpoint} of 7</span><div><i style={{width:`${(exercise.checkpoint/7)*100}%`}}/></div><b>{difficultyLabels[difficulty].label} x{difficultyLabels[difficulty].multiplier}</b></header><div className="grade-row"><span className="grade-icon" aria-hidden="true">H</span><strong>TEDIXHUNT</strong><span>{exercise.label}</span></div><section className="challenge-content"><div className="challenge-title"><p className="privacy-label">Private · only you can see this</p><h1 id="challenge-title">{exercise.title}</h1><p>{exercise.prompt}</p></div><ChallengeVisual exercise={exercise} attempt={attempt} onOpen={key=>canEdit&&setCalculatorKey(key)} onSelect={value=>canEdit&&dispatch({type:'SET_ANSWER',key:'x',value})}/></section>{calculatorKey&&canEdit&&<Calculator answerKey={calculatorKey} value={attempt.answers[calculatorKey]??''} onChange={value=>dispatch({type:'SET_ANSWER',key:calculatorKey,value})} onClose={()=>setCalculatorKey(null)}/>} {attempt.status==='active'&&<footer className="tedix-footer action-footer"><div className="support-actions"><button disabled={!attempt.assistanceUnlocked} onClick={()=>setSolutionDialogOpen(true)}>Solution</button><button disabled={!attempt.assistanceUnlocked} onClick={()=>dispatch({type:'SHOW_HINT'})}>Hint</button><button disabled={!attempt.assistanceUnlocked} onClick={()=>dispatch({type:'SKIP'})}>Skip</button></div><button className="verify-button" disabled={!canVerify} onClick={()=>{setCalculatorKey(null);dispatch({type:'VERIFY'})}}>Verify</button></footer>}<FeedbackPanel attempt={attempt} exercise={exercise} onRetry={()=>{dispatch({type:'RETRY'});setCalculatorKey(['hidden-rule','find-sabotage','square','radial','shared-final-key'].includes(exercise.kind)?exercise.answerKeys[0]:null)}} onCloseHint={()=>dispatch({type:'CLOSE_HINT'})} onContinue={()=>dispatch({type:'CLAIM_CONTRIBUTION'})}/></main> }
 return <div className="checkpoint-page">{!['invitation','onboarding'].includes(state.phase)&&header}<div className={`challenge-frame phase-${state.phase}`}>{content}</div>{solutionDialogOpen&&<SolutionDialog onCancel={()=>setSolutionDialogOpen(false)} onConfirm={()=>{setSolutionDialogOpen(false);dispatch({type:'REVEAL_SOLUTION'})}}/>}{teamSolutionDialogOpen&&<TeamSolutionDialog onCancel={()=>setTeamSolutionDialogOpen(false)} onConfirm={()=>{setTeamSolutionDialogOpen(false);dispatch({type:'REVEAL_TEAM_SOLUTION'})}}/>}{scoringOpen&&<ScoringSheet score={state.huntScore} events={state.scoreEvents} difficulty={state.difficulty} onClose={()=>setScoringOpen(false)}/>} {caseFileOpen&&<TeamCaseFile records={state.teamRecords} currentCheckpoint={state.checkpointIndex} onClose={()=>setCaseFileOpen(false)}/>} {safetyOpen&&<SafetyDialog phase={state.phase} checkpoint={exercise.checkpoint} location={exercise.location} onClose={()=>setSafetyOpen(false)}/>}</div>
}

function MissionHeader({score,latestEvent,caseFileCount,onCaseFile,onScoring,onHelp}:{score:number;latestEvent?:ScoreEvent;caseFileCount:number;onCaseFile:()=>void;onScoring:()=>void;onHelp:()=>void}){return <header className="checkpoint-header"><div className="competition-tools"><button className="header-score" onClick={onScoring} aria-label={`Hunt Score ${score}. How scoring works`}><span>Score</span><strong>{score}</strong>{latestEvent&&<small className={latestEvent.points<0?'negative':'positive'}>{latestEvent.points>0?'+':''}{latestEvent.points}</small>}</button><button type="button" className="case-file-button" onClick={onCaseFile} aria-label={`Open Hunt history. ${caseFileCount} completed story step${caseFileCount===1?'':'s'}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5.5 9 3l6 2.5L20.5 3v15.5L15 21l-6-2.5L3.5 21z"/><path d="M9 3v15.5M15 5.5V21"/><circle cx="12" cy="11.5" r="1.4"/></svg>{caseFileCount>0&&<span>{caseFileCount}</span>}</button></div><SafetyControl onOpen={onHelp}/></header>}
