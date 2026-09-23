import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkpointExercises } from '../data/templateOne'

type MiniHuntStage = 'personal' | 'team-info' | 'team-challenge' | 'direction'
const checkpoint = checkpointExercises[0]
const miniHuntTarget = '3216'
const miniHuntAnswer = '36'

export function CompetitionMiniHunt() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<MiniHuntStage>('personal')
  const [personalAnswer, setPersonalAnswer] = useState('')
  const [teamAnswer, setTeamAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const personalCorrect = personalAnswer.trim() === miniHuntAnswer
  const teamCorrect = teamAnswer.trim().toUpperCase() === checkpoint.teamAnswer

  function submitPersonal(event: FormEvent) {
    event.preventDefault()
    setFeedback(personalCorrect ? `Correct — ${checkpoint.successText}` : 'Not quite. Find one rule that works for every example.')
  }

  function submitTeam(event: FormEvent) {
    event.preventDefault()
    setFeedback(teamCorrect ? checkpoint.storySuccess : 'Not yet. Rearrange every letter and use each one once.')
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#07110f] text-white">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col px-5 py-4">
        <header className="flex min-h-9 items-center justify-between">
          <Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Mini-hunt · 2/3</span>
        </header>
        <div className="mt-2 flex gap-2" aria-label="Mini-hunt step 2 of 3"><span className="h-1 flex-1 rounded-full bg-emerald-400" /><span className="h-1 flex-1 rounded-full bg-emerald-400" /><span className="h-1 flex-1 rounded-full bg-white/10" /></div>
        <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400"><span>Restore the signal</span><span>No account needed</span></div>

        {stage === 'personal' && (
          <section className="flex min-h-0 flex-1 flex-col justify-center py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Personal challenge</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{checkpoint.title}</h1>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-xs leading-5 text-slate-300">The same rule connects every input to its output. Find the output for {miniHuntTarget}.</p>
              <div className="mt-3 grid gap-1.5 font-sans text-base font-bold" aria-label="Input and output examples">
                {[['23', '6'], ['425', '40'], ['1234', '24']].map(([input, output]) => <div className="grid min-h-9 grid-cols-[1fr_auto_1fr] items-center rounded-md bg-white/[0.055] px-3 text-center" key={input}><span>{input}</span><span className="text-emerald-300">→</span><span>{output}</span></div>)}
                <div className="grid min-h-9 grid-cols-[1fr_auto_1fr] items-center rounded-md border border-emerald-300/35 bg-emerald-300/[0.07] px-3 text-center"><span>{miniHuntTarget}</span><span className="text-emerald-300">→</span><span>?</span></div>
              </div>
            </div>
            <form className="mt-3" onSubmit={submitPersonal}>
              <label className="text-sm font-bold" htmlFor="standalone-personal-answer">Your answer</label>
              <button id="standalone-personal-answer" type="button" onClick={() => setCalculatorOpen(true)} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-left text-lg font-bold text-white focus:border-emerald-300">{personalAnswer || <span className="font-normal text-slate-400">Tap to calculate</span>}</button>
              <button className="mt-2 min-h-12 w-full rounded-xl bg-emerald-400 px-5 font-bold text-slate-950" type="submit">Check answer</button>
            </form>
            {feedback && <p role="status" className={`mt-2 rounded-lg px-3 py-2 text-xs font-bold ${personalCorrect ? 'bg-emerald-300/15 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{feedback}</p>}
            {personalCorrect && feedback && <div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><p className="flex items-center rounded-lg border border-emerald-300/30 bg-emerald-300/[0.07] px-3 font-sans text-sm font-bold text-emerald-200">{checkpoint.personalMask}</p><button className="min-h-12 rounded-lg border border-emerald-300/40 px-4 text-sm font-bold text-emerald-200" onClick={() => { setFeedback(''); setStage('team-info') }}>Next →</button></div>}
          </section>
        )}

        {stage === 'team-info' && (
          <section className="flex flex-1 flex-col justify-center py-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Team information</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Every Hunter found different letters</h1>
            <div className="mt-7 space-y-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">{checkpoint.publicContributions.map((item) => <p className={`rounded-lg px-4 py-3 font-sans text-sm font-bold ${item.startsWith('You:') ? 'bg-emerald-300/15 text-emerald-200' : 'bg-white/[0.055]'}`} key={item}>{item}</p>)}</div>
            <p className="mt-5 text-sm leading-6 text-slate-400">Your result matters, but it cannot unlock the route alone. The team needs every contribution.</p>
            <button className="mt-7 min-h-16 rounded-xl bg-emerald-400 px-6 font-bold text-slate-950" onClick={() => setStage('team-challenge')}>Open the team challenge</button>
          </section>
        )}

        {stage === 'team-challenge' && (
          <section className="flex flex-1 flex-col justify-center py-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Team challenge</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Combine the discoveries</h1>
            <p className="mt-5 text-slate-300">{checkpoint.teamPrompt}</p>
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-4 text-center font-sans font-bold tracking-[0.12em]">{checkpoint.teamDisplay}</p>
            <form className="mt-6" onSubmit={submitTeam}>
              <label className="text-sm font-bold" htmlFor="standalone-team-answer">Team answer</label>
              <input id="standalone-team-answer" value={teamAnswer} onChange={(event) => { setTeamAnswer(event.target.value.toUpperCase()); setFeedback('') }} className="mt-2 min-h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-center font-bold uppercase tracking-[0.16em] outline-none placeholder:text-emerald-200/70 focus:border-emerald-300" placeholder="U _ _ O _ _ E _" aria-describedby="team-answer-hint" />
              <p className="mt-2 text-center text-xs text-slate-400" id="team-answer-hint">The first, fourth, and seventh letters are already revealed.</p>
              <button className="mt-4 min-h-14 w-full rounded-xl bg-emerald-400 px-5 font-bold text-slate-950" type="submit">Submit team answer</button>
            </form>
            {feedback && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-bold ${teamCorrect ? 'bg-emerald-300/15 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{feedback}</p>}
            {teamCorrect && feedback && <button className="mt-4 min-h-14 rounded-xl border border-emerald-300/40 px-5 font-bold text-emerald-200" onClick={() => setStage('direction')}>Get the direction →</button>}
          </section>
        )}

        {stage === 'direction' && (
          <section className="flex flex-1 flex-col justify-center py-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Route unlocked</p>
            <div className="mx-auto mt-6 grid h-28 w-28 place-items-center rounded-full border border-emerald-300/40 bg-emerald-300/[0.08] text-4xl font-extrabold text-emerald-200">{checkpoint.direction}</div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">{checkpoint.nextLocation}</h1>
            <p className="mt-3 text-lg font-bold text-emerald-200">{checkpoint.distance}</p>
            <p className="mx-auto mt-4 max-w-sm leading-7 text-slate-300">{checkpoint.navigationClue}</p>
            <button className="mt-8 min-h-16 rounded-xl bg-emerald-400 px-6 font-bold text-slate-950" onClick={() => navigate('/discover/passport')}>Complete the mini-hunt</button>
          </section>
        )}
      </div>

      {calculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="mini-calculator-title">
          <section className="w-full max-w-sm rounded-2xl bg-slate-100 p-4 text-slate-950 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold" id="mini-calculator-title">Calculator</h2><button className="min-h-11 px-3 font-bold text-slate-500" onClick={() => setCalculatorOpen(false)} aria-label="Close calculator">×</button></div>
            <output className="mt-2 flex min-h-14 items-center justify-end rounded-xl bg-slate-900 px-4 text-2xl font-bold text-white" aria-live="polite">{personalAnswer || '0'}</output>
            <div className="mt-3 grid grid-cols-3 gap-2">{['1','2','3','4','5','6','7','8','9'].map((digit) => <button className="min-h-12 rounded-lg bg-white font-bold shadow-sm" key={digit} onClick={() => { setPersonalAnswer(`${personalAnswer}${digit}`); setFeedback('') }}>{digit}</button>)}<button className="min-h-12 rounded-lg bg-red-100 font-bold text-red-700" onClick={() => setPersonalAnswer('')}>Clear</button><button className="min-h-12 rounded-lg bg-white font-bold shadow-sm" onClick={() => setPersonalAnswer(`${personalAnswer}0`)}>0</button><button className="min-h-12 rounded-lg bg-white font-bold shadow-sm" onClick={() => setPersonalAnswer(personalAnswer.slice(0, -1))}>⌫</button></div>
            <button className="mt-3 min-h-12 w-full rounded-xl bg-emerald-500 font-bold text-slate-950" onClick={() => setCalculatorOpen(false)}>Use answer</button>
          </section>
        </div>
      )}
    </main>
  )
}
