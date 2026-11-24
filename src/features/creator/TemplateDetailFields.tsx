import { useEffect, useState } from 'react'
import {
  OPEN_AGE_MAX, ageLimits, agePresets, durationLimits, formatRange, parseRange, participantLimits, participantPresets,
  presetKey, teamSizeLimits, teamsApply, type Range, type RangePreset,
} from './templateDetailRules'

const field = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-normal disabled:bg-slate-100 disabled:opacity-60'
const Error = ({ id, text }: { id: string; text?: string }) => text ? <p id={id} role="alert" className="mt-1 text-sm font-normal text-red-800">{text}</p> : null

function MinMax({ label, value, onChange, limits, openMax, disabled, errorId }: { label: string; value: string; onChange: (v: string) => void; limits: Range; openMax?: number; disabled?: boolean; errorId?: string }) {
  const range = parseRange(value, openMax)
  // Partial typing lives in draft; a value set from outside (loading a saved Template) replaces it.
  const [draft, setDraft] = useState<{ min: string; max: string } | null>(null)
  useEffect(() => {
    if (draft && range && (String(range.min) !== draft.min || String(range.max) !== draft.max)) setDraft(null)
  }, [value])
  const shown = draft ?? { min: range ? String(range.min) : '', max: range ? String(range.max) : '' }
  const set = (part: 'min' | 'max', text: string) => {
    const next = { ...shown, [part]: text }; setDraft(next)
    const min = Number(next.min), max = Number(next.max)
    onChange(next.min && next.max && Number.isFinite(min) && Number.isFinite(max) ? formatRange({ min, max }, openMax) : next.min || next.max ? `${next.min}–${next.max}` : '')
  }
  return <div className="mt-2 grid grid-cols-2 gap-3">
    {(['min', 'max'] as const).map(part => <label key={part} className="text-xs font-bold text-slate-600">{part === 'min' ? `Minimum ${label}` : `Maximum ${label}`}
      <input aria-label={`${part === 'min' ? 'Minimum' : 'Maximum'} ${label}`} aria-describedby={errorId} disabled={disabled} className={field} type="number" inputMode="numeric" min={limits.min} max={limits.max} step={1} value={shown[part]} onChange={e => set(part, e.target.value)} /></label>)}
  </div>
}

/** Standard choices with a "Custom range" fallback that opens minimum/maximum inputs. */
function RangeChoice({ id, label, presets, value, onChange, limits, openMax, error }: { id: string; label: string; presets: RangePreset[]; value: string; onChange: (v: string) => void; limits: Range; openMax?: number; error?: string }) {
  const key = value.trim() ? presetKey(parseRange(value, openMax), presets) : ''
  const [custom, setCustom] = useState(key === 'custom')
  const shown = custom ? 'custom' : key
  return <div className="text-sm font-bold">
    <label htmlFor={id}>{label}</label>
    <select id={id} aria-describedby={`${id}-error`} className={field} value={shown} onChange={e => {
      const choice = e.target.value
      setCustom(choice === 'custom')
      if (choice === 'custom') return
      onChange(choice === '' ? '' : formatRange(presets[Number(choice)], openMax))
    }}>
      <option value="">{`Choose ${label.toLowerCase()}`}</option>
      {presets.map((preset, index) => <option key={preset.label} value={String(index)}>{preset.label}</option>)}
      <option value="custom">Custom range</option>
    </select>
    {shown === 'custom' && <MinMax key={`${id}-custom`} label={label.replace(/ range$/i, '').toLowerCase()} value={value} onChange={onChange} limits={limits} openMax={openMax} errorId={`${id}-error`} />}
    <Error id={`${id}-error`} text={error} />
  </div>
}

export function AgeRangeField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return <RangeChoice id="template-age-range" label="Age range" presets={agePresets} value={value} onChange={onChange} limits={ageLimits} openMax={OPEN_AGE_MAX} error={error} />
}
export function DurationField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return <label className="text-sm font-bold">Duration (minutes)<input aria-describedby="template-duration-error" className={field} type="number" inputMode="numeric" min={durationLimits.min} max={durationLimits.max} step={5} value={value} onChange={e => onChange(e.target.value)} />
    <span className="mt-1 block text-xs font-normal text-slate-500">{durationLimits.min}–{durationLimits.max} minutes</span><Error id="template-duration-error" text={error} /></label>
}
export function ParticipantRangeField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return <RangeChoice id="template-participant-range" label="Participant range" presets={participantPresets} value={value} onChange={onChange} limits={participantLimits} error={error} />
}
export function TeamSizeField({ value, onChange, format, error }: { value: string; onChange: (v: string) => void; format: string; error?: string }) {
  const applies = teamsApply(format)
  return <div className="text-sm font-bold"><span>Team size range</span>
    {applies ? <MinMax key="team" label="team size" value={value} onChange={onChange} limits={teamSizeLimits} errorId="template-team-size-error" />
      : <p className="mt-2 rounded-xl bg-slate-50 p-3 font-normal text-slate-600">Not applicable: Single Hunters play individually.</p>}
    {applies && <span className="mt-1 block text-xs font-normal text-slate-500">{teamSizeLimits.min}–{teamSizeLimits.max} members per team, never more than the participant maximum.</span>}
    <Error id="template-team-size-error" text={error} />
  </div>
}
