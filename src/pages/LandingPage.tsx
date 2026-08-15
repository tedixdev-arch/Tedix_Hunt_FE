import { useNavigate } from 'react-router-dom'

const HERO_IMAGE =
  'https://images.pexels.com/photos/1309688/pexels-photo-1309688.jpeg?auto=compress&cs=tinysrgb&w=1920'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#08090a]">
      {/* Cinematic full-bleed background */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="City street at night"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/80 to-[#08090a]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,transparent_30%,#08090a_85%)] opacity-70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-10 pt-20 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-3xl">
          {/* Eyebrow with live pulse */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-400">
              TEDIXHUNT // LIVE CITY MISSION
            </p>
          </div>

          {/* Title */}
          <h1 className="mt-5 font-black uppercase leading-[0.85] tracking-tight text-white text-5xl sm:text-6xl lg:text-7xl">
            Signal:
            <br />
            Cluj Napoca
          </h1>

          {/* Mission context */}
          <div className="mt-6 grid max-w-lg grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Mission</span><strong className="mt-1 block text-sm text-white">Restore the Signal</strong></div>
            <div><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Location</span><strong className="mt-1 block text-sm text-white">Cluj Napoca</strong></div>
          </div>

          {/* Description */}
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
            Restore six linked relay points, trace the signal to its source, and restart the final transmitter together.
          </p>

          {/* Primary action */}
          <button
            onClick={() => navigate('/play/template-1', { state: { startNewMission: true } })}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-[3px] bg-brand-500 px-8 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-brand-400 active:scale-[0.98] sm:w-auto sm:px-12"
          >
            Enter Mission
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

        </div>

        {/* Organizer link - discreet */}
        <div className="mx-auto mt-10 w-full max-w-3xl border-t border-white/5 pt-5">
          <button
            onClick={() => navigate('/create')}
            className="text-xs font-medium uppercase tracking-wider text-white/30 transition-colors hover:text-white/60"
          >
            View organizer experience -&gt;
          </button>
        </div>
      </div>
    </div>
  )
}
