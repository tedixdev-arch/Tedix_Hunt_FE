import { Link } from 'react-router-dom'

type PrototypeRoutePageProps = {
  eyebrow: string
  title: string
  description: string
  next?: { label: string; path: string }
}

export function PrototypeRoutePage({ eyebrow, title, description, next }: PrototypeRoutePageProps) {
  return (
    <main className="min-h-dvh bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-lg flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-300">{description}</p>
        {next && (
          <Link
            className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-emerald-500 px-6 text-center font-bold text-slate-950"
            to={next.path}
          >
            {next.label}
          </Link>
        )}
        <Link className="mt-4 min-h-11 py-3 text-center text-sm font-semibold text-slate-400" to="/">
          Back to TedixHunt home
        </Link>
      </div>
    </main>
  )
}
