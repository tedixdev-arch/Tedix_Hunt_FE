import type { CreatorTemplateContent } from '../../services/api/creatorTemplates'
import { HuntMapInspection } from '../../components/HuntMapPreview'
import { CheckpointStoryPreview } from '../creator/CheckpointStoryPreview'
import { gameplayPresentation } from '../creator/CheckpointGameplayEditor'
import { hydrateGameplay, supportedGameplay, type CheckpointGameplay, type GameplayField } from '../creator/checkpointGameplay'
import { PersistedValue } from './PersistedValue'

const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'boolean' ? value ? 'Yes' : 'No' : undefined
const fields = (record: Record<string, unknown>, labels: Record<string, string>) => Object.entries(labels).flatMap(([key, label]) => {
  const value = record[key]
  const values = Array.isArray(value) ? value.map(text).filter((item): item is string => item !== undefined) : text(value) === undefined ? [] : [text(value)!]
  return values.length ? [{ label, values }] : []
})

function ReadableFields({ value, labels, columns = false }: { value: Record<string, unknown>; labels: Record<string, string>; columns?: boolean }) {
  return <dl className={columns ? 'mt-3 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3' : 'mt-3 space-y-3 text-sm'}>{fields(value, labels).map(({ label, values }) => <div className={columns && ['Summary', 'Briefing', 'Participant instructions'].includes(label) ? 'col-span-full' : undefined} key={label}><dt className="font-bold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{values.length === 1 ? values[0] : <ul className="list-disc space-y-1 pl-5">{values.map((item, index) => <li key={index}>{item}</li>)}</ul>}</dd></div>)}</dl>
}

function Position({ value }: { value: unknown }) {
  const point = object(value)
  const valid = typeof point.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180
  return <div className="mt-2 text-sm"><p className="font-bold">Position</p>{valid ? <p>Coordinates: {String(point.latitude)}, {String(point.longitude)}</p> : <p>Position not submitted or invalid.</p>}
    {text(point.name) && <p>{text(point.name)}</p>}{typeof point.radiusMeters === 'number' && Number.isFinite(point.radiusMeters) && <p>Discovery radius: {point.radiusMeters} m</p>}
  </div>
}

function Activity({ field, value, checkpoint }: { field: GameplayField; value: unknown; checkpoint: CheckpointGameplay }) {
  const label = field === 'kind' ? 'Personal Challenge' : field === 'teamKind' ? 'Team Challenge' : 'Onward navigation'
  const name = value == null ? 'Activity type not submitted' : typeof value === 'string' && supportedGameplay[field].includes(value) ? gameplayPresentation(field, value).name : 'Unrecognized saved activity; see Technical details'
  const nested = field === 'kind' ? object(checkpoint.challenge) : field === 'teamKind' ? object(checkpoint.teamChallenge) : {}
  const labels: Record<string, string> = field === 'kind' ? { title: 'Title', prompt: 'Instructions', answer: 'Answer', answerKeys: 'Answer keys', hint: 'Hint', hints: 'Hints', solutionIntro: 'Solution', solutionSteps: 'Solution steps', solution: 'Solution', successText: 'Success message', personalContribution: 'Personal contribution' }
    : field === 'teamKind' ? { teamPrompt: 'Instructions', teamInstruction: 'Team instructions', teamDisplay: 'Puzzle content', teamAnswer: 'Answer', teamOptions: 'Choices', teamRule: 'Rule' }
      : { navigationClue: 'Navigation clue', nextLocation: 'Next destination', direction: 'Direction', distance: 'Distance' }
  const answers = field === 'kind' ? Object.entries(object(checkpoint.correctAnswers)).flatMap(([key, answer]) => text(answer) === undefined ? [] : [`${key}: ${text(answer)}`]) : []
  const hasContent = fields(checkpoint, labels).length > 0 || Object.keys(nested).length > 0 || answers.length > 0
  return <section className="min-w-0 rounded-xl bg-slate-50 p-3"><h5 className="font-bold">{label}</h5><p className="mt-1 text-sm">{name}</p>
    {hasContent && <details className="mt-2"><summary className="cursor-pointer text-sm font-bold">{field === 'navigationMode' ? 'Saved directions' : 'Instructions, answers and hints'}</summary><ReadableFields value={checkpoint} labels={labels} /><ReadableFields value={nested} labels={{ prompt: 'Instructions', answer: 'Answer', hints: 'Hints', hint: 'Hint', solution: 'Solution', solutionSteps: 'Solution steps' }} />
    {answers.length > 0 && <ReadableFields value={{ answers }} labels={{ answers: 'Correct answers' }} />}</details>}
  </section>
}

/** Read-only presentation of the supplied immutable artifact, with no defaults or API reads. */
export function TemplateContentInspection({ content, version, category, sourceLabel = 'Submitted-version' }: {
  content: CreatorTemplateContent; version: number; category?: 'universal' | 'local' | null; sourceLabel?: string
}) {
  const configuration = content.configuration
  const universal = category === 'universal'
  // Existing compatibility mapping translates explicit legacy activity indexes only.
  const gameplay = hydrateGameplay(content)
  const positions = !universal && Array.isArray(configuration.checkpointPositions) ? configuration.checkpointPositions : []
  const checkpointNumbers = [...new Set([...gameplay.normal.map(item => item.checkpoint), ...positions.map(item => object(item).checkpointNumber)])].filter((number): number is number => Number.isInteger(number) && (number as number) > 0).sort((a, b) => a - b)
  const terminals = content.checkpoints.filter(item => object(item).role === 'terminal')
  const legacyChoices = content.checkpoints.some(item => ['personal', 'team', 'navigation'].some(field => object(item)[field] !== undefined))
  const scoringLabels = { startingScore: 'Starting score', points: 'Points', failedVerifiedAttempt: 'Incorrect verified answer', hintUsed: 'Hint used', solutionRevealed: 'Solution revealed', skippedChallenge: 'Challenge skipped', solvedTeamChallenge: 'Team challenge solved', teamSolutionRevealed: 'Team solution revealed', finishPointPuzzle: 'FinishPoint puzzle' }
  const technicalContent = universal ? { ...content, configuration: Object.fromEntries(Object.entries(configuration).filter(([key]) => !['checkpointPositions', 'finishPoint'].includes(key))) } : content
  return <>
    <section className={panel} aria-label="Submitted gameplay and settings"><h3 className="text-xl font-bold">Template summary</h3><p className="mt-2 text-sm">Version under review: {version}</p>
      <ReadableFields columns value={configuration} labels={{ summary: 'Summary', durationMinutes: 'Duration (minutes)', normalCheckpointCount: 'Number of checkpoints', ageRange: 'Age range', language: 'Language', participants: 'Participants', teamSize: 'Team size', format: 'Format', environment: 'Environment', equipment: 'Equipment', difficulty: 'Difficulty', category: 'Activity category', briefing: 'Briefing', participantInstructions: 'Participant instructions' }} />
      <section className="mt-4"><h4 className="font-bold">Mission and story</h4>{typeof content.mission === 'string' ? <p className="mt-2 whitespace-pre-wrap break-words text-sm">{content.mission || 'No mission text submitted.'}</p> : <ReadableFields value={object(content.mission)} labels={{ name: 'Mission', title: 'Title', briefing: 'Briefing', story: 'Story', summary: 'Summary', objective: 'Objective', signal: 'Signal', finishLocation: 'Story ending location' }} />}</section>
    </section>
    <section className={panel} aria-label="Submitted checkpoints"><h3 className="text-xl font-bold">Checkpoints</h3>
      {legacyChoices && <p className="mt-2 text-sm">Legacy activity selections use the existing compatibility labels. Saved content is unchanged.</p>}
      {!checkpointNumbers.length && <p className="mt-3">No numbered checkpoint details submitted.</p>}
      <ol className="mt-3 space-y-4">{checkpointNumbers.map(number => {
        const matches = gameplay.normal.filter(item => item.checkpoint === number)
        const points = positions.filter(item => object(item).checkpointNumber === number)
        const point = points.length === 1 ? points[0] : undefined
        return <li key={number} className="min-w-0 rounded-xl border border-slate-200 p-3"><h4 className="text-lg font-bold">Checkpoint {number}</h4>
          {matches.length !== 1 && <p role="alert">Checkpoint activities are missing or ambiguous. Inspect Technical details.</p>}
          {matches.map((checkpoint, index) => <div key={index}><p className="mt-2 font-bold">{text(checkpoint.name) ?? text(object(point).name) ?? text(checkpoint.location) ?? 'Name not submitted'}</p>
            {!universal && <Position value={point} />}
            <div className="mt-3 grid gap-3 xl:grid-cols-3">{(['kind', 'teamKind', 'navigationMode'] as const).map(field => <Activity key={field} field={field} value={checkpoint[field]} checkpoint={checkpoint} />)}</div>
            <CheckpointStoryPreview value={Object.fromEntries(Object.entries(checkpoint).filter(([, value]) => typeof value === 'string'))} />
          </div>)}
          {!matches.length && <><p className="mt-2 font-bold">{text(object(point).name) ?? 'Name not submitted'}</p>{!universal && <Position value={point} />}</>}
        </li>
      })}</ol>
    </section>
    <section className={panel} aria-label="Submitted FinishPoint"><h3 className="text-xl font-bold">FinishPoint</h3><p className="mt-2 font-bold">{(!universal ? text(object(configuration.finishPoint).name) : undefined) ?? text(object(terminals[0]).name) ?? 'Name not submitted'}</p>
      {!universal && <Position value={configuration.finishPoint} />}
      <h4 className="mt-4 font-bold">Terminal gameplay</h4>
      {!terminals.length && <p className="mt-2 text-sm">No terminal gameplay submitted.</p>}
      {terminals.length > 1 && <p role="alert">Multiple terminal gameplay entries were submitted. No single FinishPoint activity is inferred.</p>}
      {terminals.map((entry, index) => { const checkpoint = object(entry) as CheckpointGameplay; return <div key={index} className="mt-3 grid gap-3 sm:grid-cols-2">{(['kind', 'teamKind'] as const).map(field => <Activity key={field} field={field} value={checkpoint[field]} checkpoint={checkpoint} />)}<CheckpointStoryPreview value={Object.fromEntries(Object.entries(checkpoint).filter(([, value]) => typeof value === 'string'))} /></div> })}
    </section>
    {!universal && <details className={panel}><summary className="cursor-pointer font-bold">Saved geography</summary><HuntMapInspection configuration={configuration} sourceLabel={sourceLabel} /></details>}
    <section className={panel} aria-label="Submitted scoring"><h3 className="text-xl font-bold">Scoring</h3>
      {content.scoring.model === 'platform' && <p className="mt-2 text-sm">Platform scoring</p>}
      {!fields(content.scoring, scoringLabels).length && content.scoring.model !== 'platform' && !Array.isArray(content.scoring.events) && <p className="mt-2 text-sm">No scoring summary available; inspect any additional saved rules in Technical details.</p>}
      <ReadableFields value={content.scoring} labels={scoringLabels} />
      {Array.isArray(content.scoring.events) && <ul className="mt-3 space-y-2 text-sm">{content.scoring.events.map((item, index) => <li key={index}><ReadableFields value={{ ...object(item), event: typeof object(item).event === 'string' ? String(object(item).event).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ') : undefined }} labels={{ event: 'Scoring event', points: 'Points' }} /></li>)}</ul>}
    </section>
    <details className={panel} aria-label="Technical details"><summary className="cursor-pointer font-bold">Technical details</summary><p className="mt-2 text-sm">Exact saved values for version {version}, including additional fields and unsupported legacy data.</p><PersistedValue value={technicalContent} /></details>
  </>
}
