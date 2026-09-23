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
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full md:hidden" viewBox="0 0 400 800" fill="none" preserveAspectRatio="none">
          <defs>
            <filter id="mobile-point-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <path d="M50 686 C72 676 88 664 104 646" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 9" opacity="0.18" />
          <path d="M292 386 C310 362 324 336 334 304" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 9" opacity="0.16" />
          <circle cx="38" cy="692" r="13" fill="#34d399" opacity="0.08" filter="url(#mobile-point-glow)" />
          <circle cx="38" cy="692" r="5" fill="#4ade80" opacity="0.68" />
          <circle cx="284" cy="396" r="6" fill="#07110f" stroke="#4ade80" strokeWidth="1.5" opacity="0.55" />
          <circle cx="350" cy="112" r="18" fill="#34d399" opacity="0.13" filter="url(#mobile-point-glow)" />
          <circle cx="350" cy="112" r="7" fill="#07110f" stroke="#6ee7b7" strokeWidth="2" opacity="0.8" />
          <circle cx="350" cy="112" r="2.5" fill="#6ee7b7" opacity="0.85" />
        </svg>

        <svg aria-hidden="true" className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <defs>
            <filter id="desktop-destination-glow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <path d="M-30 700 C250 650 410 690 610 610 S980 500 1160 300 S1300 185 1370 126" stroke="#4ade80" strokeWidth="1.75" strokeDasharray="5 14" opacity="0.18" />
          <circle cx="150" cy="670" r="6" fill="#07110f" stroke="#4ade80" strokeWidth="1.5" opacity="0.46" />
          <circle cx="610" cy="610" r="6" fill="#07110f" stroke="#4ade80" strokeWidth="1.5" opacity="0.42" />
          <circle cx="1160" cy="300" r="7" fill="#07110f" stroke="#4ade80" strokeWidth="1.75" opacity="0.52" />
          <circle cx="1370" cy="126" r="34" fill="#34d399" opacity="0.2" filter="url(#desktop-destination-glow)" />
          <circle cx="1370" cy="126" r="11" fill="#07110f" stroke="#6ee7b7" strokeWidth="2.5" opacity="0.95" />
          <circle cx="1370" cy="126" r="3" fill="#6ee7b7" />
        </svg>
      </div>

      <div className="home-shell relative mx-auto grid min-h-dvh w-full max-w-md grid-rows-[minmax(4.5rem,0.65fr)_minmax(0,3fr)_minmax(4.75rem,0.85fr)] justify-items-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 sm:pb-10 sm:pt-8">
        <header className="flex justify-center self-start">
          <Link to="/" className="flex min-h-11 items-center gap-2 text-emerald-300" aria-label="TedixHunt home">
            <TrailMark />
            <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-white">TedixHunt</span>
          </Link>
        </header>

        <section className="home-hero flex w-full flex-col items-center self-start pt-[clamp(1rem,5vh,2.5rem)] text-center">
          <div>
            <h1 className="home-title whitespace-nowrap text-[2.375rem] font-extrabold leading-none tracking-[-0.045em] sm:text-5xl">
              GAME ON.
            </h1>
            <p className="home-copy mt-3 text-[17px] font-normal leading-7 text-slate-300 sm:text-lg">
              Explore. Solve. Keep moving.
            </p>
          </div>

          <div className="home-discovery mt-[clamp(2.25rem,6vh,3.5rem)] flex w-full max-w-sm flex-col gap-3">
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

        <footer className="home-footer flex w-full max-w-sm items-end justify-center self-stretch">
          <Link className="flex min-h-11 items-center rounded px-2 text-[13px] font-semibold text-emerald-200/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" to="/login-workspace">Organizer · Creator · Admin →</Link>
        </footer>
      </div>
    </main>
  )
}
