import { Link } from 'react-router-dom'
import { HuntPreviewData } from '../data/huntPreviews'

export function HuntPreview({ hunt }: { hunt: HuntPreviewData }) {
  const titleParts = hunt.title.split(':')

  return (
    <main className="relative h-dvh overflow-y-auto bg-[#08090a] text-white">
      <div className="fixed inset-0">
        <img src={hunt.imageUrl} alt={hunt.imageAlt} className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090a]/30 via-[#08090a]/85 to-[#08090a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,transparent_20%,#08090a_85%)] opacity-70" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-9 pt-[38vh] sm:px-9 sm:pt-[30vh] lg:px-12">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" /></span>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-brand-400">{hunt.eyebrow}</p>
        </div>
        <h1 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-6xl lg:text-7xl">
          {titleParts.map((part, index) => <span className="block" key={`${part}-${index}`}>{part}{index < titleParts.length - 1 ? ':' : ''}</span>)}
        </h1>

        <dl className="mt-6 grid max-w-xl grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div><dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Mission</dt><dd className="mt-1 text-sm font-bold">{hunt.mission}</dd></div>
          <div><dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Location</dt><dd className="mt-1 text-sm font-bold">{hunt.location}</dd></div>
        </dl>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{hunt.description}</p>

        <section className="mt-10 border-t border-white/10 pt-8" aria-labelledby="hunt-loop-title">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">A taste of the hunt</p>
          <h2 className="mt-2 text-2xl font-black" id="hunt-loop-title">One checkpoint. Three connected actions.</h2>
          <p className="mt-2 text-sm text-white/45">Example from {hunt.sampleLoop.checkpoint}. Answers stay hidden.</p>
          <ol className="mt-6 grid gap-3 lg:grid-cols-3">
            <li className="rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.16em] text-brand-400">1 · Personal</span><span aria-hidden="true" className="text-xl">◇</span></div>
              <h3 className="mt-4 text-lg font-black">{hunt.sampleLoop.personalChallenge.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{hunt.sampleLoop.personalChallenge.prompt}</p>
            </li>
            <li className="rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">2 · Team</span><span aria-hidden="true" className="text-xl">◎</span></div>
              <h3 className="mt-4 text-lg font-black">Combine discoveries</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{hunt.sampleLoop.teamChallenge.prompt}</p>
              <p className="mt-3 rounded-lg bg-white/[0.06] px-3 py-2 font-mono text-xs tracking-wider text-white/65">{hunt.sampleLoop.teamChallenge.sharedInformation}</p>
            </li>
            <li className="rounded-xl border border-brand-400/25 bg-brand-400/[0.07] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.16em] text-brand-400">3 · Direction</span><span aria-hidden="true" className="text-xl">↗</span></div>
              <h3 className="mt-4 text-lg font-black">Route unlocked: {hunt.sampleLoop.direction.destination}</h3>
              <p className="mt-2 text-sm font-bold text-brand-300">{hunt.sampleLoop.direction.bearing} · {hunt.sampleLoop.direction.distance}</p>
              <p className="mt-2 text-sm leading-6 text-white/60">{hunt.sampleLoop.direction.clue}</p>
            </li>
          </ol>
        </section>

        <div className="mt-8 rounded-xl border border-white/10 bg-black/55 p-4 backdrop-blur-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm leading-6 text-white/60"><strong className="block text-white">Ready to join your team?</strong>Sign in, complete the safety setup, then begin the mission.</p>
          <Link to={hunt.joinPath} className="mt-4 flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-md bg-brand-500 px-8 text-sm font-black uppercase tracking-[0.13em] transition hover:bg-brand-400 sm:mt-0 sm:w-auto">Join this hunt <span aria-hidden="true">→</span></Link>
        </div>

        <footer className="mt-8 border-t border-white/5 pt-5">
          <Link to={hunt.organizerPath} className="min-h-11 py-3 text-xs font-medium uppercase tracking-wider text-white/35 hover:text-white/65">View Organizer experience →</Link>
        </footer>
      </div>
    </main>
  )
}
