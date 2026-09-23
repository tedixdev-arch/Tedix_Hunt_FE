import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, huntAccessApi, type HuntAccessResolution } from '../services/api';
import { accessStatusLabels } from './participantAccess';

export function PublicHuntAccessPage() {
  const { code = '' } = useParams();
  const [hunt, setHunt] = useState<HuntAccessResolution | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setHunt(null);
    setError('');
    huntAccessApi.resolve(code).then(result => { if (active) setHunt(result); }).catch(caught => {
      if (!active) return;
      setError(caught instanceof ApiError && caught.status === 404
        ? 'This Hunt code is invalid or no longer available.'
        : "We couldn't check this Hunt code. Please try again.");
    });
    return () => { active = false; };
  }, [code]);

  return <main className="grid min-h-dvh place-items-center bg-[#07110f] px-5 py-8 text-white"><section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl sm:p-8"><Link className="text-sm font-extrabold uppercase tracking-[0.2em]" to="/">TedixHunt</Link>
    {!hunt && !error && <p className="mt-10 text-slate-300" role="status">Checking Hunt code…</p>}
    {error && <><p className="mt-10 rounded-xl bg-amber-300/10 p-4 font-bold text-amber-200" role="alert">{error}</p><button className="mt-5 min-h-11 text-sm font-bold text-slate-300" onClick={() => history.back()} type="button">← Go back</button></>}
    {hunt && <><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Hunt invitation</p><h1 className="mt-3 text-3xl font-extrabold">{hunt.name}</h1><dl className="mt-6 space-y-4 rounded-xl bg-black/20 p-4"><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Code</dt><dd className="mt-1 text-xl font-bold tracking-[0.16em]">{hunt.code.toUpperCase()}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</dt><dd className="mt-1 font-bold text-emerald-300">{accessStatusLabels[hunt.status] ?? 'Hunt unavailable'}</dd></div></dl><p className="mt-6 text-sm leading-6 text-slate-300">Participant joining will be connected in the next phase.</p><button className="mt-5 min-h-11 text-sm font-bold text-slate-300" onClick={() => history.back()} type="button">← Go back</button></>}
  </section></main>;
}
