import type { CheckpointGameplay } from './checkpointGameplay'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { ParticipantPreviewShell } from './ParticipantPreviewShell'

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const bearings: Record<string, number> = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5 }

/** Saved story navigation only. Never requests sensors, calculates routes or advances progress. */
export function NavigationPreview({ value, checkpointName, destinationName, prototype }: {
  value: CheckpointGameplay; checkpointName: string; destinationName?: string; prototype?: { name: string; instructions: string }
}) {
  const mode = value.navigationMode
  const supported = ['compass', 'landmark', 'decoded-route', 'signal-strength'].includes(mode ?? '')
  const direction = text(value.direction), distance = text(value.distance), clue = text(value.navigationClue)
  const destination = text(value.nextLocation) || destinationName
  const angle = bearings[direction.toUpperCase()]
  return <div className="mt-5" aria-live="polite">
    <ParticipantPreviewShell compact label="Mobile navigation preview">
      <section className="space-y-4">
        <header><p className="text-xs font-bold uppercase text-emerald-800">{checkpointName} · Participant preview</p><h3 className="mt-2 text-2xl font-bold">{prototype ? prototype.name || 'New navigation' : 'Next checkpoint'}</h3><p className="mt-1 text-sm text-slate-600">{prototype ? 'Prototype · not saved' : gameplayPresentation('navigationMode', mode).name}</p></header>
        {prototype ? <p className="whitespace-pre-wrap">{prototype.instructions || 'Placeholder: participant instructions'}</p> : supported ? <>
          <p className="text-lg font-bold">{destination || 'Placeholder: destination'}</p>
          {mode === 'compass' && <>
            <svg className="mx-auto h-36 w-36 max-w-full" viewBox="0 0 160 160" role="img" aria-label={angle === undefined ? 'Compass placeholder: direction not configured' : `Configured story direction: ${direction}`}>
              <circle cx="80" cy="80" r="60" fill="white" stroke="#b9d7c7" strokeWidth="2" />
              <g fill="#43765f" fontSize="12" textAnchor="middle"><text x="80" y="15">N</text><text x="150" y="84">E</text><text x="80" y="154">S</text><text x="10" y="84">W</text></g>
              {angle !== undefined ? <g transform={`rotate(${angle} 80 80)`}><path d="M80 35 95 100 80 90 65 100Z" fill="#176644" /></g> : <text x="80" y="90" fill="#64748b" fontSize="28" textAnchor="middle">—</text>}
            </svg>
            <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-600">Direction</dt><dd className="font-bold">{direction || 'Not configured'}</dd></div><div><dt className="text-slate-600">Distance</dt><dd className="font-bold">{distance || 'Not configured'}</dd></div></dl>
          </>}
          {mode === 'landmark' && <div className="challenge-edit-card text-sm"><p className="font-bold">Recognize the landmark</p><p className="mt-2 text-slate-600">Placeholder: landmark image unavailable</p></div>}
          {mode === 'decoded-route' && <div className="challenge-edit-card text-sm"><p className="font-bold">Decoded route</p><p className="mt-2">{direction || 'Placeholder: decoded direction'}</p></div>}
          {mode === 'signal-strength' && <div className="challenge-edit-card text-sm"><p className="font-bold">Signal strength</p><div className="mt-3 flex items-end justify-center gap-2" aria-hidden="true">{[16, 24, 32, 40, 48].map(height => <span key={height} className="w-5 rounded border border-slate-300 bg-slate-100" style={{ height }} />)}</div><p className="mt-2 text-slate-600">Placeholder: signal unavailable in preview</p></div>}
          <p className="whitespace-pre-wrap text-sm">{clue || 'Placeholder: destination or landmark clue'}</p>
          <p className="text-xs text-slate-600">{direction || distance || clue ? 'Configured story content · no live readings or verified walking directions.' : 'Preview placeholders · no live navigation data.'}</p>
          <button type="button" disabled className="min-h-12 rounded-xl border px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">Open in Maps</button>
          <p className="text-xs text-slate-600">Map action unavailable in preview.</p>
        </> : <p className="text-sm">{mode === 'none' ? 'No onward navigation.' : mode ? 'Preview unavailable for this saved navigation type.' : 'Choose a Navigation type to see its preview.'}</p>}
      </section>
    </ParticipantPreviewShell>
  </div>
}
