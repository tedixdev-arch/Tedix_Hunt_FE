import { useEffect, useState } from 'react'
import { huntsApi, type Hunt, type HuntTemplateMetadata } from '../services/api'
import { HuntMapInspection } from './HuntMapPreview'

/** Browsing an approved identity is independent of selecting/saving it for a Hunt.
 * The existing approved catalog exposes metadata only, not geographic content. */
export function ApprovedTemplateGeographyInspection({ templates }: { templates: HuntTemplateMetadata[] }) {
  const [inspectionKey, setInspectionKey] = useState('')
  const template = templates.find(item => item.key === inspectionKey)
  return <section aria-label="Approved Template geography inspection" className="min-w-0 rounded-xl bg-slate-50 p-4">
    <label className="block text-sm font-bold">Template to inspect
      <select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" value={template?.key ?? ''} onChange={event => setInspectionKey(event.target.value)}>
        <option value="">Choose a Template to inspect</option>
        {templates.map(item => <option key={item.key} value={item.key}>{item.displayName} · Version {item.version}</option>)}
      </select>
    </label>
    <p className="mt-2 text-xs text-slate-600">Inspection does not select or save a Template for your Hunt.</p>
    {template && <div key={`${template.key}:${template.version}`}>
      <p className="mt-3 break-words text-sm font-bold">Approved Template: {template.displayName} · {template.key} · Version {template.version}</p>
      <HuntMapInspection unavailableReason="Approved Template geography is unavailable: the approved catalog provides names and versions only. Geographic inspection requires the approved version’s saved locations. You can continue selecting a Template; no locations were substituted." />
    </div>}
  </section>
}

/** Only the Hunt response supplies geography. Never request an approved/latest Template. */
export function HuntSnapshotGeographyInspection({ hunt }: { hunt: Hunt }) {
  const snapshot = hunt.templateSnapshot
  let unavailableReason: string | undefined
  if (!snapshot) unavailableReason = 'This Hunt has no persisted Template snapshot. No locations were substituted.'
  else if (!hunt.templateKey || !Number.isInteger(hunt.templateVersion) || (hunt.templateVersion ?? 0) < 1
    || snapshot.key !== hunt.templateKey || snapshot.version !== hunt.templateVersion) {
    unavailableReason = 'The persisted Template snapshot identity does not match this Hunt’s saved key and version. Geography cannot be inspected; no catalog version was substituted.'
  } else if (!snapshot.configuration || typeof snapshot.configuration !== 'object' || Array.isArray(snapshot.configuration)) {
    unavailableReason = 'This Hunt’s persisted Template snapshot does not expose geographic configuration. Legacy or unavailable snapshot geography cannot be replaced with a catalog Template. Existing Hunt actions remain available.'
  }
  return <section aria-label="Persisted Hunt snapshot geography" className="mt-5 min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="font-bold">Saved Hunt geography</h3>
    <p className="mt-2 break-words text-sm text-slate-600">Persisted Template snapshot · {hunt.templateKey ?? 'No Template saved'} · Version {hunt.templateVersion ?? 'not saved'}</p>
    <HuntMapInspection key={`${hunt.id}:${hunt.templateKey}:${hunt.templateVersion}`} configuration={unavailableReason ? undefined : snapshot?.configuration ?? undefined} unavailableReason={unavailableReason} sourceLabel="Persisted Hunt snapshot" />
  </section>
}

/** Existing details screen loads its own authoritative Hunt; simulated monitor data is never used. */
export function OrganizerHuntGeographyInspection({ huntId }: { huntId: string }) {
  const [result, setResult] = useState<{ id: string; hunt?: Hunt; error?: string }>()
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setResult(undefined)
    huntsApi.getHunt(huntId).then(hunt => {
      if (active) setResult(hunt.id === huntId
        ? { id: huntId, hunt }
        : { id: huntId, error: 'The returned Hunt does not match this page. Geography is unavailable.' })
    }).catch(() => { if (active) setResult({ id: huntId, error: 'We couldn’t load the saved Hunt geography.' }) })
    return () => { active = false }
  }, [huntId, attempt])
  if (!result || result.id !== huntId) return <p className="mt-5 text-sm text-slate-600" role="status">Loading saved Hunt geography…</p>
  if (result.hunt) return <HuntSnapshotGeographyInspection key={huntId} hunt={result.hunt} />
  return <div className="mt-5 rounded-xl bg-amber-50 p-4">
    <p className="text-sm text-amber-900" role="alert">{result.error} Existing Hunt actions remain available.</p>
    <button type="button" className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" onClick={() => setAttempt(value => value + 1)}>Retry geography</button>
  </div>
}
