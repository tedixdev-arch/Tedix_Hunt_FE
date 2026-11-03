import { PrototypeLocationSelector } from '../prototype/PrototypeLocationSelector'
import type { LocalitySnapshot } from '../../services/api/geography'

export function HuntSetup({ local, onContinue, error }: {
  local: boolean; savedId?: string | null; snapshot?: LocalitySnapshot | null
  value: string | null | undefined; onChange: (id: string | null | undefined) => void
  onSelect: (place: LocalitySnapshot | null) => void
  beforeChange: (id: string | null | undefined) => boolean
  onSearchPendingChange?: (pending: boolean) => void
  onContinue: () => void; error: string; cityUnavailable?: boolean; onRetryCity?: () => void
}) {
  return <section id="local-geography" aria-labelledby="hunt-setup-heading" className="mt-7 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 id="hunt-setup-heading" className="text-2xl font-bold">Hunt Setup</h2>
    <p className="mt-2 text-sm text-slate-600">{local ? 'Where will your adventure take place?' : 'Create an adventure that can be played anywhere.'}</p>
    {local && <PrototypeLocationSelector />}
    {error && <p role="alert" className="mt-3 text-sm font-bold text-red-800">{error}</p>}
    <button type="button" onClick={onContinue} className="mt-5 min-h-12 rounded-xl bg-emerald-500 px-6 font-bold">Continue to Template builder</button>
  </section>
}
