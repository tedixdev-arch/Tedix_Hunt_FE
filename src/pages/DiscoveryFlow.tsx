import { Link } from 'react-router-dom'

function DiscoveryShell({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <main className="min-h-dvh bg-[#07110f] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-7 pt-5">
        <header className="flex min-h-11 items-center justify-between">
          <Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Mini-hunt · {step}/3</span>
        </header>
        <div className="mt-3 flex gap-2" aria-label={`Mini-hunt step ${step} of 3`}>
          {[1, 2, 3].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item <= step ? 'bg-emerald-400' : 'bg-white/10'}`} />)}
        </div>
        {children}
      </div>
    </main>
  )
}

export function DiscoveryIntroPage() {
  return (
    <DiscoveryShell step={1}>
      <section className="flex flex-1 flex-col justify-center py-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">A signal has disappeared</p>
        <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] tracking-[-0.045em]">Can your team bring it back?</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          TedixHunt turns real places into shared missions. You solve your own challenge, combine what the team discovers, and move forward together.
        </p>
        <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <p className="text-sm font-bold text-emerald-200">Your 2-minute mission</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>1. Solve one personal clue</li>
            <li>2. Receive your teammate’s discovery</li>
            <li>3. Restore the signal together</li>
          </ul>
        </div>
        <Link className="mt-8 flex min-h-16 items-center justify-center rounded-xl bg-emerald-400 px-6 font-bold text-slate-950" to="/discover/mini-hunt">
          Start the mini-hunt
        </Link>
        <Link className="mt-3 min-h-11 py-3 text-center text-sm font-semibold text-slate-400" to="/">Not now</Link>
      </section>
    </DiscoveryShell>
  )
}

export function PassportPreviewPage() {
  return (
    <DiscoveryShell step={3}>
      <section className="flex flex-1 flex-col justify-center py-9 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-300 bg-emerald-300/10 text-4xl shadow-[0_0_60px_rgba(52,211,153,0.25)]">⚡</div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Signal restored</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">You completed the mini-hunt!</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">You solved your clue and used your teammate’s discovery to finish the mission.</p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">My Hunts Passport</span><span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">Preview</span></div>
          <div className="mt-5 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-300 text-2xl">⚡</div><div><p className="font-bold">Signal Restorer</p><p className="mt-1 text-sm text-slate-400">Sample achievement · Mini-hunt</p></div></div>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">This is a reward preview. Create an account only when you join a full hunt to keep real achievements.</p>
        <Link className="mt-7 flex min-h-16 items-center justify-center rounded-xl bg-emerald-400 px-6 font-bold text-slate-950" to="/join">Explore a full hunt</Link>
        <Link className="mt-3 min-h-11 py-3 text-sm font-semibold text-slate-400" to="/">Back to home</Link>
      </section>
    </DiscoveryShell>
  )
}
