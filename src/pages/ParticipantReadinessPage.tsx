import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const difficulties = [
  { id: 'easy', label: 'Easy', multiplier: '×1' },
  { id: 'medium', label: 'Medium', multiplier: '×1.5' },
  { id: 'hard', label: 'Hard', multiplier: '×2' },
]

export function ParticipantReadinessPage() {
  const navigate = useNavigate()
  const [consent, setConsent] = useState(false)
  const [difficulty, setDifficulty] = useState('easy')

  return (
    <main className="min-h-dvh bg-[#07110f] px-5 py-5 text-white">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col">
        <header className="flex min-h-11 items-center justify-between">
          <Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Ready to begin</span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Signal: Cluj Napoca</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Team Aurora is ready</h1>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
            <div><span className="text-xs font-bold uppercase tracking-wide text-emerald-300">Your role</span><p className="mt-1 font-bold">Signal Decoder</p></div>
            <div><span className="text-xs font-bold uppercase tracking-wide text-emerald-300">Starting score</span><p className="mt-1 text-2xl font-bold">500</p></div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-bold">Before you start</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
              <li>• Stay with your team.</li>
              <li>• Stop before looking at your phone.</li>
              <li>• Contact the Organizer if you need help.</li>
            </ul>
            <div className="mt-3 border-t border-red-300/15 pt-3 text-sm leading-6 text-slate-300">
              <strong className="text-red-300">Panic Button:</strong> use it for a safety or operational problem. It sends your location and hunt status to the Organizer.
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Choose your difficulty</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {difficulties.map((option) => (
                <button aria-pressed={difficulty === option.id} className={`min-h-14 rounded-xl border px-2 font-bold ${difficulty === option.id ? 'border-emerald-300 bg-emerald-300/15 text-emerald-200' : 'border-white/15 bg-white/[0.03] text-slate-300'}`} key={option.id} onClick={() => setDifficulty(option.id)} type="button">
                  {option.label}<span className="ml-1 text-xs">{option.multiplier}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <input checked={consent} className="mt-1 h-5 w-5 shrink-0 accent-emerald-400" onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
            <span><strong className="block">I choose to take part</strong><span className="mt-1 block text-xs leading-5 text-slate-400">I have the required permission and understand I can stop and ask for help.</span></span>
          </label>

          <button className="mt-4 min-h-16 rounded-xl bg-emerald-400 px-6 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-35" disabled={!consent} onClick={() => navigate('/play/template-1', { state: { startNewMission: true, difficulty } })}>Begin the Hunt</button>
          <Link className="mt-2 min-h-11 py-3 text-center text-sm font-semibold text-slate-300" to="/play/template-1">How scoring works</Link>
        </section>
      </div>
    </main>
  )
}
