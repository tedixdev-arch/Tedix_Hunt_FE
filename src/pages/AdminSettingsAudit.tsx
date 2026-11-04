import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AdminShell } from './AdminConsole'
import { ApiError } from '../services/api'
import { adminOperationsApi, type AuditCategory, type AuditEvent, type PlatformSetting, type SettingValue } from '../services/api/operations'

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const control = 'mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-60'
const when = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
const groups: Array<{ id: PlatformSetting['group']; title: string; description: string }> = [
  { id: 'gps', title: 'Location check-in', description: 'How strictly a phone reading must prove a participant reached a checkpoint.' },
  { id: 'checkpoints', title: 'Checkpoints', description: 'Defaults applied when Creators save Templates. Saved Templates and running Hunts never change.' },
  { id: 'scoring', title: 'Scoring rules', description: 'Platform-wide scoring behaviour. Each Template keeps its own authored points.' },
  { id: 'gameplay', title: 'Gameplay safeguards', description: 'Fallbacks and limits that apply to every Hunt.' },
  { id: 'safety', title: 'Safety requirements', description: 'Information every participant sees on the Help screen.' },
  { id: 'sessions', title: 'Sessions', description: 'Sign-in lifetimes.' },
]

const display = (s: PlatformSetting, value: SettingValue) => s.kind === 'boolean' ? (value ? 'On' : 'Off') : `${String(value) || '(empty)'}${s.unit && s.kind === 'integer' ? ` ${s.unit}` : ''}`

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>()
  const [draft, setDraft] = useState<Record<string, SettingValue>>({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const load = useCallback(() => {
    setError('')
    adminOperationsApi.settings().then(r => { setSettings(r.settings); setDraft({}) }).catch(() => setError("We couldn't load Platform Settings. Please retry."))
  }, [])
  useEffect(load, [load])
  const changes = useMemo(() => Object.fromEntries(Object.entries(draft).filter(([key, value]) => settings?.find(s => s.key === key)?.value !== value)), [draft, settings])
  const dirty = Object.keys(changes).length > 0
  const value = (s: PlatformSetting) => (s.key in draft ? draft[s.key] : s.value)
  const set = (key: string, next: SettingValue) => { setNotice(''); setDraft(d => ({ ...d, [key]: next })) }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!dirty) return
    const invalid = settings!.find(s => s.key in changes && s.kind === 'integer' && (!Number.isInteger(changes[s.key]) || (changes[s.key] as number) < s.min! || (changes[s.key] as number) > s.max!))
    if (invalid) { setNotice(`${invalid.label} must be between ${invalid.min} and ${invalid.max}.`); return }
    setSaving(true); setNotice('')
    try {
      const result = await adminOperationsApi.updateSettings(changes)
      setSettings(result.settings); setDraft({})
      setNotice(result.changed.length ? `Saved ${result.changed.length} change${result.changed.length === 1 ? '' : 's'}. Recorded in the Audit Log.` : 'Nothing changed.')
    } catch (caught) {
      const key = caught instanceof ApiError ? (caught.details as { key?: string } | undefined)?.key : undefined
      setNotice(key ? `${settings!.find(s => s.key === key)?.label ?? key} has an invalid value.` : "We couldn't save the settings. Please retry.")
    } finally { setSaving(false) }
  }

  function field(s: PlatformSetting) {
    const id = `setting-${s.key.replace('.', '-')}`
    const current = value(s)
    const input = s.kind === 'boolean'
      ? <label className="mt-2 flex min-h-11 items-center gap-3 text-sm"><input id={id} type="checkbox" className="h-5 w-5 accent-emerald-500" checked={current === true} onChange={e => set(s.key, e.target.checked)} />{current ? 'On' : 'Off'}</label>
      : s.kind === 'choice'
        ? <select id={id} className={control} value={String(current)} onChange={e => set(s.key, e.target.value)}>{s.choices!.map(c => <option key={c} value={c}>{c}</option>)}</select>
        : s.kind === 'integer'
          ? <div className="flex items-center gap-2"><input id={id} type="number" inputMode="numeric" min={s.min} max={s.max} className={control} value={Number.isFinite(current) ? String(current) : ''} onChange={e => set(s.key, e.target.value === '' ? NaN : Number(e.target.value))} />{s.unit && <span className="mt-2 text-sm text-slate-500">{s.unit}</span>}</div>
          : (s.maxLength ?? 0) > 60
            ? <textarea id={id} className={`${control} min-h-24 py-2`} maxLength={s.maxLength} value={String(current)} onChange={e => set(s.key, e.target.value)} />
            : <input id={id} className={control} maxLength={s.maxLength} value={String(current)} onChange={e => set(s.key, e.target.value)} />
    return <div key={s.key} className="min-w-0 border-t border-slate-100 py-4 first:border-t-0">
      <label htmlFor={id} className="text-sm font-bold">{s.label}</label>
      {input}
      <p className="mt-2 text-xs text-slate-500">{s.help}{s.kind === 'integer' ? ` Allowed ${s.min}–${s.max}${s.unit ? ` ${s.unit}` : ''}.` : ''} Default: {display(s, s.defaultValue)}{/[.!?]$/.test(display(s, s.defaultValue)) ? '' : '.'}{s.public ? ' Visible to participants.' : ''}</p>
      {s.customized && s.updatedAt && <p className="mt-1 text-xs text-slate-500">Last changed {when(s.updatedAt)}.{current !== s.defaultValue && <button type="button" className="ml-2 font-bold text-emerald-700 underline" onClick={() => set(s.key, s.defaultValue)}>Use default</button>}</p>}
    </div>
  }

  return <AdminShell active="settings">
    <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Platform Settings</h2><p className="mt-1 max-w-3xl text-slate-600">Global rules for every Hunt. Hunt-specific options are set by Organizers; Template content is reviewed separately. Each change is recorded in the <Link className="font-bold underline" to="/admin/audit">Audit Log</Link>.</p></div></div>
    {error && <div className="mt-6 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={load}>Retry</button></div>}
    {!settings && !error && <p className="mt-6" role="status">Loading…</p>}
    {settings && <form noValidate className="mt-6 grid gap-5 pb-24 xl:grid-cols-2" onSubmit={event => void save(event)}>
      {groups.map(g => <section key={g.id} className={card} aria-labelledby={`group-${g.id}`}><h3 id={`group-${g.id}`} className="text-lg font-bold">{g.title}</h3><p className="mt-1 text-sm text-slate-600">{g.description}</p>
        <div className="mt-3">{settings.filter(s => s.group === g.id).map(field)}</div></section>)}
      <section className={card} aria-labelledby="group-notifications"><h3 id="group-notifications" className="text-lg font-bold">Notifications</h3>
        <p className="mt-1 text-sm text-slate-600">Help and emergency requests appear immediately on the Organizer's Hunt monitor and in <Link className="font-bold underline" to="/admin/alerts">Safety Alerts</Link>. Both refresh automatically.</p>
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Email and SMS delivery are not configured. Activation links and application decisions must be shared manually until an email provider is approved.</p></section>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-3 xl:col-span-2"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-end gap-3">
        {notice && <p role="status" className="mr-auto text-sm font-semibold text-slate-700">{notice}</p>}
        <button type="button" className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50" disabled={!dirty || saving} onClick={() => { setDraft({}); setNotice('') }}>Discard</button>
        <button type="submit" className="min-h-11 rounded-lg bg-emerald-500 px-5 text-sm font-bold disabled:bg-slate-200 disabled:text-slate-500" disabled={!dirty || saving}>{saving ? 'Saving…' : dirty ? `Save ${Object.keys(changes).length} change${Object.keys(changes).length === 1 ? '' : 's'}` : 'Saved'}</button>
      </div></div>
    </form>}
  </AdminShell>
}

const categoryLabels: Record<AuditCategory, string> = { users: 'Users & roles', applications: 'Applications', templates: 'Templates', hunts: 'Hunts', safety: 'Safety', settings: 'Settings', requests: 'Custom requests', account: 'Account' }
function detailText(event: AuditEvent) {
  if (event.action === 'settings.updated' && Array.isArray(event.details.changes)) {
    return (event.details.changes as Array<{ key: string; from: unknown; to: unknown }>).map(c => `${c.key}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`).join(' · ')
  }
  const entries = Object.entries(event.details).filter(([, v]) => v !== null && v !== '')
  return entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ')
}
const targetLink = (event: AuditEvent) => event.targetId && event.targetType === 'hunt' ? `/organizer/hunts/${event.targetId}`
  : event.targetId && event.targetType === 'template' ? `/admin/reviews/${event.targetId}` : null

export function AdminAuditLogPage() {
  const [filters, setFilters] = useState({ category: '', actor: '', q: '' })
  const [applied, setApplied] = useState(filters)
  const [events, setEvents] = useState<AuditEvent[]>()
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const load = useCallback(async (after?: string) => {
    setLoading(true); setError('')
    try {
      const page = await adminOperationsApi.audit({ ...applied, cursor: after })
      setEvents(current => after ? [...(current ?? []), ...page.events] : page.events); setCursor(page.nextCursor)
    } catch { setError("We couldn't load the Audit Log. Please retry.") } finally { setLoading(false) }
  }, [applied])
  useEffect(() => { void load() }, [load])
  return <AdminShell active="audit"><section className={`${card} mt-6`}>
    <h2 className="text-2xl font-bold">Audit Log</h2><p className="mt-1 text-slate-600">Privileged actions across the platform, newest first: user and role changes, application and Template decisions, Hunt lifecycle, safety actions and setting changes. Entries cannot be edited or deleted.</p>
    <form className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_1fr_auto]" onSubmit={e => { e.preventDefault(); setApplied(filters) }}>
      <label className="text-sm font-bold">Category<select className={control} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}><option value="">All</option>{Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="text-sm font-bold">Actor<input className={control} placeholder="Email or name" value={filters.actor} onChange={e => setFilters(f => ({ ...f, actor: e.target.value }))} /></label>
      <label className="text-sm font-bold">Search<input className={control} placeholder="Action, summary or ID" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} /></label>
      <button className="min-h-11 self-end rounded-lg bg-slate-950 px-4 text-sm font-bold text-white" type="submit">Filter</button>
    </form>
    {error && <div className="mt-5 rounded-xl bg-rose-50 p-4"><p role="alert" className="font-semibold text-rose-800">{error}</p><button className="mt-3 min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" type="button" onClick={() => void load()}>Retry</button></div>}
    {!events && !error && <p className="mt-5" role="status">Loading…</p>}
    {events && (events.length === 0 ? <p className="mt-5 text-slate-600">No audit events match these filters.</p> :
      <ol className="mt-5 divide-y divide-slate-100">{events.map(e => { const link = targetLink(e); return <li key={e.id} className="grid gap-1 py-3 sm:grid-cols-[170px_1fr]">
        <div className="text-xs text-slate-500"><time dateTime={e.occurredAt}>{when(e.occurredAt)}</time><span className="mt-1 block w-fit rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">{categoryLabels[e.category]}</span></div>
        <div className="min-w-0"><p className="font-bold">{e.summary}{link && <> · <Link className="font-semibold text-emerald-700 underline" to={link}>Open</Link></>}</p>
          <p className="text-sm text-slate-600">{e.actor.label ?? 'System'}{e.actor.roles.length ? ` (${e.actor.roles.join(', ')})` : ''} · <code className="text-xs">{e.action}</code>{e.targetId ? <> · <code className="text-xs">{e.targetId}</code></> : null}</p>
          {detailText(e) && <p className="mt-1 break-words text-xs text-slate-500">{detailText(e)}</p>}</div>
      </li> })}</ol>)}
    {cursor && <button className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50" disabled={loading} type="button" onClick={() => void load(cursor)}>{loading ? 'Loading…' : 'Load older events'}</button>}
  </section></AdminShell>
}
