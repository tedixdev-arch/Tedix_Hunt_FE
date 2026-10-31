import { LocalGeographySelector } from './LocalGeographySelector'
import type { LocalitySnapshot } from '../../services/api/geography'

export function HuntSetup({ local, savedId, snapshot, value, onChange, onSelect, beforeChange, onContinue, error, cityUnavailable = false, onRetryCity }: {
  local: boolean; savedId?: string | null; snapshot?: LocalitySnapshot | null
  value: string | null | undefined; onChange: (id: string | null | undefined) => void
  onSelect: (place: LocalitySnapshot | null) => void
  beforeChange: (id: string | null | undefined) => boolean
  onContinue: () => void; error: string; cityUnavailable?: boolean; onRetryCity?: () => void
}) {
  return <section id="local-geography" aria-labelledby="hunt-setup-heading" className="mt-7 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 id="hunt-setup-heading" className="text-2xl font-bold">Hunt Setup</h2>
    <p className="mt-2 text-sm text-slate-600">{local ? 'Where will your adventure take place?' : 'Create an adventure that can be played anywhere.'}</p>
    {local && <LocalGeographySelector compact savedId={savedId} snapshot={snapshot} value={value} onChange={onChange} onSelect={onSelect} beforeChange={beforeChange} />}
    <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="min-w-0 text-sm font-bold">Curriculum (optional)<select aria-label="Curriculum (optional)" disabled aria-describedby="learning-availability" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 font-normal" value=""><option value="">Not specified</option><option value="mathematics">Mathematics</option><option value="mixed">Mixed</option></select></label>
      <label className="min-w-0 text-sm font-bold">Grade (optional)<select aria-label="Grade (optional)" disabled aria-describedby="learning-availability" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 font-normal" value=""><option value="">Not specified</option>{[9, 10, 11, 12].map(grade => <option key={grade} value={String(grade)}>Grade {grade}</option>)}<option value="mixed">Mixed grades</option></select></label>
    </div>
    <p id="learning-availability" className="mt-2 text-sm text-slate-500">Curriculum and Grade are not available yet.</p>
    {cityUnavailable && <div className="mt-3 text-sm"><p role="alert">The city location could not be loaded. Your selected city is kept.</p><button type="button" onClick={onRetryCity} className="min-h-11 font-bold underline">Retry city location</button></div>}
    {error && <p role="alert" className="mt-3 text-sm font-bold text-red-800">{error}</p>}
    <button type="button" onClick={onContinue} className="mt-5 min-h-12 rounded-xl bg-emerald-500 px-6 font-bold">Continue to Hunt builder</button>
  </section>
}
