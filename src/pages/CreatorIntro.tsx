import { useNavigate } from 'react-router-dom'

export function CreatorIntro() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col items-center bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-600" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Create your own adventure</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          A guided event-building simulation is coming next. You'll be able to design your own
          checkpoint challenges, set up storylines, and publish events for players to discover.
        </p>

        <div className="mt-6 space-y-3">
          <ComingItem text="Design checkpoint challenges" />
          <ComingItem text="Build storylines and clues" />
          <ComingItem text="Publish events for players" />
        </div>

        <div className="mt-auto pb-4 pt-8">
          <button
            onClick={() => navigate('/')}
            className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            Back to demo
          </button>
        </div>
      </div>
    </div>
  )
}

function ComingItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </span>
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  )
}
