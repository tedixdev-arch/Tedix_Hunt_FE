function fieldLabel(value: string): string {
  const label = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function PersistedValue({ value }: { value: unknown }) {
  if (value == null) return <span className="text-slate-500">Not submitted</span>
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>
  if (typeof value !== 'object') return <span className="whitespace-pre-wrap break-words">{String(value)}</span>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-500">None submitted</span>
    return <ol className="space-y-2">{value.map((item, index) => <li className="rounded-lg border border-slate-200 bg-white p-3" key={index}><span className="mb-2 block text-xs font-bold uppercase text-slate-400">Item {index + 1}</span><PersistedValue value={item} /></li>)}</ol>
  }
  const entries = Object.entries(value)
  if (entries.length === 0) return <span className="text-slate-500">No persisted values</span>
  return <dl className="space-y-3">{entries.map(([key, item]) => <div key={key}><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{fieldLabel(key)}</dt><dd className="mt-1"><PersistedValue value={item} /></dd></div>)}</dl>
}

