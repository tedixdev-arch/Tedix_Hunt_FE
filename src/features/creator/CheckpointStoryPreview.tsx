/** Backend story stays read-only here; diagnostic directions are puzzle content. */
export function CheckpointStoryPreview({ value, friendly = false }: { value: Record<string, unknown>; friendly?: boolean }) {
  const name = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
  const readable = (value: unknown): string => Array.isArray(value) ? value.map(readable).join('\n') : value && typeof value === 'object' ? Object.entries(value).map(([key, v]) => `${name(key)}: ${readable(v)}`).join('\n') : String(value ?? '')
  const fields = ['location', 'storyStage', 'story', 'storyProblem', 'storyObjective', 'storyPlan', 'storyRisk', 'storySuccess', 'teamRevelation', 'nextDestination', 'fictionalNavigation']
  const visible = fields.filter(key => value[key] !== undefined)
  if (!visible.length) return null
  return <details className="mt-4 min-w-0 rounded-xl border border-slate-200 p-4" aria-label="Checkpoint story preview">
    <summary className="min-h-11 cursor-pointer py-3 font-bold">Checkpoint story preview</summary>
    <p className="text-xs text-slate-600">{friendly ? 'Story context for this checkpoint.' : 'Backend story content. Diagnostic grid directions belong to the puzzle and are not walking navigation.'}</p>
    <dl className="mt-3 space-y-3">{visible.map(key => <div key={key}><dt className="text-sm font-bold">{friendly ? name(key) : key.replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{friendly ? readable(value[key]) : typeof value[key] === 'string' ? value[key] as string : JSON.stringify(value[key], null, 2)}</dd></div>)}</dl>
  </details>
}
