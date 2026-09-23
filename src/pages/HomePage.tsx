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
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-400/[0.08] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-400/[0.07] blur-3xl" />
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <defs>
            <filter id="destination-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <path d="M-18 738C54 710 59 620 118 574C176 529 231 493 264 409C297 325 319 225 421 153" stroke="#4ade80" strokeWidth="2" strokeDasharray="5 11" opacity="0.2" />
          <circle cx="30" cy="708" r="4" fill="#4ade80" opacity="0.3" />
          <circle cx="118" cy="574" r="6" fill="#07110f" stroke="#4ade80" strokeWidth="2" opacity="0.45" />
          <circle cx="264" cy="409" r="6" fill="#07110f" stroke="#4ade80" strokeWidth="2" opacity="0.55" />
          <circle cx="370" cy="190" r="18" fill="#34d399" opacity="0.16" filter="url(#destination-glow)" />
          <circle cx="370" cy="190" r="8" fill="#07110f" stroke="#6ee7b7" strokeWidth="2.5" opacity="0.8" />
        </svg>
      </div>

      <div className="home-shell relative mx-auto grid min-h-dvh w-full max-w-md grid-rows-[auto_1fr_auto] justify-items-center px-5 py-7 sm:px-8 sm:py-10">
        <header className="flex justify-center">
          <Link to="/" className="flex min-h-11 items-center gap-2 text-emerald-300" aria-label="TedixHunt home">
            <TrailMark />
            <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-white">TedixHunt</span>
          </Link>
        </header>

        <section className="home-hero flex w-full flex-col items-center self-center py-8 text-center">
          <h1 className="home-title whitespace-nowrap text-[clamp(2.625rem,12vw,3rem)] font-extrabold leading-none tracking-[-0.045em]">
            GAME ON.
          </h1>
          <p className="home-copy mt-3 text-[17px] font-normal leading-7 text-slate-300 sm:text-lg">
            Explore. Solve. Keep moving.
          </p>

          <div className="home-discovery mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link
              to="/join"
              className="group relative flex min-h-16 items-center justify-center rounded-xl bg-emerald-400 px-14 text-base font-bold text-slate-950 shadow-[0_18px_50px_rgba(52,211,153,0.22)] transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
            >
              <span>Join a Hunt</span>
              <span className="absolute right-6 transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
            </Link>
            <Link
              to="/discover"
              className="flex min-h-14 items-center justify-center rounded-xl border border-emerald-300/40 bg-white/[0.04] px-6 text-[15px] font-semibold text-emerald-100 transition hover:border-emerald-300 hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-emerald-300/20"
            >
              Try a short Hunt
            </Link>
            <p className="px-1 text-center text-xs text-slate-400">No account needed.</p>
          </div>
        </section>

        <footer className="home-footer flex w-full max-w-sm justify-center">
          <Link className="flex min-h-11 items-center rounded px-2 text-[13px] font-semibold text-emerald-200/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" to="/professional-access">Professional access →</Link>
        </footer>
      </div>
    </main>
  )
}
