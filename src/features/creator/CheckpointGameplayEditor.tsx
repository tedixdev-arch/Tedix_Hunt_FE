import { signalFeatureDefaults } from '../../data/organizerTemplates'
import { checkpointExercises } from '../../data/templateOne'
import { gameplayFields, supportedGameplay, type CheckpointGameplay, type GameplayField } from './checkpointGameplay'

const labels: Record<GameplayField, string> = { navigationMode: 'Navigation', kind: 'Personal Challenge', teamKind: 'Team Challenge' }
const navigationLabels: Record<string, string> = { compass: 'Compass + Distance', landmark: 'Landmark Recognition', 'decoded-route': 'Decoded Route', 'signal-strength': 'Signal Strength', none: 'No navigation' }
function optionLabel(field: GameplayField, value: string) {
  if (field === 'navigationMode') return navigationLabels[value] ?? value
  const index = checkpointExercises.findIndex(entry => entry[field] === value)
  return signalFeatureDefaults[field === 'kind' ? 'personal' : 'team'][index]?.name ?? value
}

export function gameplayPresentation(field: GameplayField, value?: string) {
  if (!value) return { name: 'No activity configured', note: 'This activity is optional.', example: 'No participant activity is configured.' }
  const name = optionLabel(field, value)
  const template = signalFeatureDefaults[field === 'kind' ? 'personal' : field === 'teamKind' ? 'team' : 'navigation'].find(item => item.name === name)
  return template ?? { name, note: 'This checkpoint has no onward navigation.', example: 'No navigation instructions are shown.' }
}

export function CheckpointGameplayEditor({ value, onChange, fields = gameplayFields }: {
  value: CheckpointGameplay; onChange: (value: CheckpointGameplay) => void; fields?: GameplayField[]
}) {
  return <section className="mt-6 space-y-4" aria-label="Checkpoint gameplay">
    {fields.map(field => <label key={field} className="block text-sm font-bold">{labels[field]}
      <select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold focus:border-emerald-500" value={value[field] ?? ''} onChange={event => {
        const next = { ...value }
        if (event.target.value) next[field] = event.target.value
        else delete next[field]
        onChange(next)
      }}>
        <option value="">Not configured (optional)</option>
        {value[field] !== undefined && !supportedGameplay[field].includes(value[field]!) && <option value={value[field]}>Unsupported saved value: {value[field]}</option>}
        {supportedGameplay[field].map(type => <option key={type} value={type}>{optionLabel(field, type)}</option>)}
      </select>
    </label>)}
  </section>
}

export function GameplayScoring({ scoring }: { scoring: Record<string, unknown> }) {
  // Creator Studio uses platform scoring; it has no per-checkpoint scoring override.
  const fields = ['failedVerifiedAttempt', 'hintUsed', 'solutionRevealed', 'skippedChallenge', 'solvedTeamChallenge', 'teamSolutionRevealed', 'finishPointPuzzle']
  return <section className="mt-6 rounded-xl bg-slate-50 p-4" aria-label="FinishPoint scoring"><h4 className="font-bold">Scoring</h4><p className="mt-2 text-sm text-slate-600">Activities use the existing platform scoring rules. Creator gameplay choices preserve saved scoring and eligibility.</p>
    <dl className="mt-3 space-y-2 text-sm">{fields.filter(field => scoring[field] !== undefined).map(field => <div key={field} className="flex justify-between gap-4"><dt>{field.replace(/([A-Z])/g, ' $1')}</dt><dd>{String(scoring[field])}</dd></div>)}</dl>
  </section>
}
