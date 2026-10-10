import { useEffect, useState } from 'react'
import { ApiError, huntsApi, huntTemplatesApi, type Hunt, type HuntTemplateMetadata, type HuntTemplateGeography } from '../services/api'
import { HuntMapInspection } from './HuntMapPreview'

/** Browsing an approved identity is independent of selecting/saving it for a Hunt. */
export function ApprovedTemplateGeographyInspection({ templates, onRefreshTemplates }: { templates: HuntTemplateMetadata[]; onRefreshTemplates?: () => void }) {
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
    {templates.length === 0 && <p>No approved Competition Templates are currently available.</p>}
    {template && <div key={`${template.key}:${template.version}`}>
      <p className="mt-3 break-words text-sm font-bold">Approved Template: {template.displayName} · {template.key} · Version {template.version}</p>
      <ApprovedGeography key={`${template.key}:${template.version}`} template={template} onRefreshTemplates={onRefreshTemplates} />
    </div>}
  </section>
}

type ApprovedResult = { configuration: HuntTemplateGeography['configuration'] } | { error: string; refresh?: boolean }

/** Each catalog identity owns its request and map lifetime; a newer response is never substituted. */
function ApprovedGeography({ template, onRefreshTemplates }: { template: HuntTemplateMetadata; onRefreshTemplates?: () => void }) {
  const [result, setResult] = useState<ApprovedResult>()
  const [attempt, setAttempt] = useState(0)
  const [enabled, setEnabled] = useState(false)
  const { key, version } = template
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setResult(undefined)
    huntTemplatesApi.getApprovedGeography(key, controller.signal).then(response => {
      if (controller.signal.aborted) return
      if (response?.key !== key || response.version !== version) {
        setResult({ error: 'The approved version changed or its identity no longer matches the catalog. Refresh approved Templates and choose the version to inspect again. No returned geography was displayed.', refresh: true })
      } else if (!response.configuration || typeof response.configuration !== 'object' || Array.isArray(response.configuration)) {
        setResult({ error: 'Approved Template geography is unavailable or malformed. No locations were substituted.' })
      } else setResult({ configuration: response.configuration })
    }).catch(cause => {
      if (controller.signal.aborted) return
      const status = cause instanceof ApiError ? cause.status : undefined
      setResult({ error: status === 401 ? 'Your session has expired. Sign in again, then retry geography.'
        : status === 404 ? 'This Template is missing or its approval was withdrawn. Refresh approved Templates before inspecting again.'
        : status === 409 ? 'Saved approved Template geography is unavailable or malformed. No locations were substituted.'
        : 'We couldn’t load approved Template geography. Please retry.', refresh: status === 404 })
    })
    return () => { controller.abort() }
  }, [key, version, enabled, attempt])
  return <HuntMapInspection configuration={result && 'configuration' in result ? result.configuration : undefined} sourceLabel="Approved-version" onOpenChange={open => {
    if (!open) setResult(undefined)
    setEnabled(open)
  }}>
    {!result ? <p role="status" className="mt-4">Loading approved Template geography…</p>
      : 'error' in result ? <div className="mt-4 space-y-3">
        <p role="alert">{result.error}</p>
        {result.refresh && onRefreshTemplates && <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-4" onClick={onRefreshTemplates}>Refresh approved Templates</button>}
        <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-4" onClick={() => setAttempt(value => value + 1)}>Retry geography</button>
      </div> : undefined}
  </HuntMapInspection>
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
