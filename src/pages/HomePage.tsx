import { Link } from 'react-router-dom'

function TrailMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 32 32" fill="none">
      <path d="M5 24.5 13.2 7l5.1 10.2L22 10l5 14.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5" cy="24.5" r="2.5" fill="currentColor" />
      <circle cx="27" cy="24.5" r="2.5" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#07110f] text-white">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <svg className="absolute inset-x-0 top-16 h-[58%] w-full opacity-25" viewBox="0 0 400 500" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M-20 395C61 392 67 307 141 304c78-3 68-104 138-111 62-6 53-92 141-116" stroke="#4ade80" strokeWidth="2" strokeDasharray="5 10" />
          <circle cx="141" cy="304" r="7" fill="#07110f" stroke="#4ade80" strokeWidth="3" />
          <circle cx="279" cy="193" r="7" fill="#07110f" stroke="#4ade80" strokeWidth="3" />
        </svg>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,#07110f_78%)]" />
      </div>

      <div className="home-shell relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-7 pt-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex min-h-11 items-center gap-2 text-emerald-300" aria-label="TedixHunt home">
            <TrailMark />
            <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-white">TedixHunt</span>
          </Link>
          <Link to="/join" className="flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-bold text-white transition hover:border-emerald-300 hover:text-emerald-200">
            Join a hunt
          </Link>
        </header>

        <section className="home-hero flex flex-1 flex-col justify-center pb-8 pt-16 sm:max-w-2xl lg:pt-24">
          <div className="home-kicker mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_4px_rgba(74,222,128,0.55)]" />
            Real places. Shared missions.
          </div>
          <h1 className="home-title max-w-3xl text-[clamp(3.25rem,13vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.055em]">
            Yours city is waiting.
          </h1>
          <p className="home-copy mt-6 max-w-xl text-lg leading-7 text-slate-300 sm:text-xl sm:leading-8">
            Explore real places, solve challenges, and complete a mission with your team.
          </p>

          <div className="home-discovery mt-9 flex flex-col gap-3 sm:max-w-sm">
            <Link
              to="/discover"
              className="group flex min-h-16 items-center justify-between rounded-xl bg-emerald-400 px-6 text-base font-bold text-slate-950 shadow-[0_18px_50px_rgba(52,211,153,0.22)] transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
            >
              <span>See how it works</span>
              <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
            </Link>
            <p className="px-1 text-center text-xs text-slate-400">Try a short mini-hunt. No account needed.</p>
          </div>
        </section>

        <footer className="home-footer border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Professional access</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-emerald-200/80">
            <Link className="rounded py-1 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" to="/organizer/sign-in">Organizer workspace</Link>
            <span className="text-emerald-800" aria-hidden="true">·</span>
            <Link className="rounded py-1 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" to="/creator/sign-in">Creator Studio</Link>
            <span className="text-emerald-800" aria-hidden="true">·</span>
            <Link className="rounded py-1 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" to="/admin/sign-in">Admin sign in</Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
