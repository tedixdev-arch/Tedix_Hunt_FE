/**
 * Template Details: standard choices and validation for age, duration, participants and team size.
 *
 * Values are stored in the Template configuration in their existing text form ("12–16", "16–40",
 * "4" or "3–5"), so saved Templates and the Signal starter stay compatible. These limits are
 * authoring defaults for Creators; Organizers still set the actual event capacity per Hunt.
 */
export interface Range { min: number; max: number }
export interface RangePreset extends Range { label: string }

/** Upper bound used for "and older" age groups ("18+"). */
export const OPEN_AGE_MAX = 99
export const ageLimits: Range = { min: 4, max: OPEN_AGE_MAX }
export const agePresets: RangePreset[] = [
  { min: 6, max: 9, label: '6–9 years' },
  { min: 10, max: 12, label: '10–12 years' },
  { min: 12, max: 16, label: '12–16 years' },
  { min: 16, max: 18, label: '16–18 years' },
  { min: 18, max: OPEN_AGE_MAX, label: '18+ (adults)' },
]
/** A Hunt is played in one session: at least 15 minutes, at most 8 hours. */
export const durationLimits: Range = { min: 15, max: 480 }
export const durationPresets = [30, 45, 60, 90, 120, 180]
export const participantLimits: Range = { min: 1, max: 1000 }
export const participantPresets: RangePreset[] = [
  { min: 2, max: 10, label: '2–10 participants' },
  { min: 10, max: 30, label: '10–30 participants' },
  { min: 16, max: 40, label: '16–40 participants' },
  { min: 30, max: 60, label: '30–60 participants' },
  { min: 60, max: 120, label: '60–120 participants' },
]
/** Teams of 2–10; the current pilot plays in teams of 4. */
export const teamSizeLimits: Range = { min: 2, max: 10 }
export const formats = ['Team Hunters', 'Single Hunters'] as const
export const teamsApply = (format: string) => format === 'Team Hunters'

const DASH = /\s*[–—-]\s*/
/** Reads "12–16", "12-16", "18+" or "4" (a single value means min = max). Returns null for anything else. */
export function parseRange(text: string, openMax = OPEN_AGE_MAX): Range | null {
  const value = text.trim()
  let match = /^(\d{1,4})\s*\+$/.exec(value)
  if (match) return { min: Number(match[1]), max: openMax }
  match = /^(\d{1,4})$/.exec(value)
  if (match) return { min: Number(match[1]), max: Number(match[1]) }
  const parts = value.split(DASH)
  if (parts.length === 2 && parts.every(part => /^\d{1,4}$/.test(part))) return { min: Number(parts[0]), max: Number(parts[1]) }
  return null
}
/** Stored text form: "12–16", "18+" for an open age group, or "4" when min equals max. */
export function formatRange({ min, max }: Range, openMax?: number) {
  if (openMax !== undefined && max === openMax) return `${min}+`
  return min === max ? String(min) : `${min}–${max}`
}
export const presetKey = (range: Range | null, presets: RangePreset[]) => {
  const index = range ? presets.findIndex(item => item.min === range.min && item.max === range.max) : -1
  return index < 0 ? 'custom' : String(index)
}

function checkRange(label: string, text: string, limits: Range, unit: string, openMax?: number): string {
  const range = parseRange(text, openMax)
  if (!text.trim()) return `Choose the ${label}.`
  if (!range) return `Enter the ${label} as a minimum and a maximum.`
  if (range.min < limits.min || range.max > limits.max) return `The ${label} must be between ${limits.min} and ${limits.max} ${unit}.`
  if (range.min > range.max) return `The minimum ${label.replace(/ range$/, '')} cannot be greater than the maximum.`
  return ''
}

export interface DetailValues { age: string; duration: string; participants: string; teamSize: string; format: string }
export type DetailErrors = Partial<Record<'age' | 'duration' | 'participants' | 'teamSize', string>>

/**
 * Empty object when the details are valid. A draft may leave fields blank (`complete: false`);
 * submission for approval requires every applicable field (`complete: true`).
 */
export function validateTemplateDetails(details: DetailValues, complete = true): DetailErrors {
  const errors: DetailErrors = {}
  if (!complete) {
    const full = validateTemplateDetails(details, true)
    for (const key of ['age', 'duration', 'participants', 'teamSize'] as const) if (!details[key].trim()) delete full[key]
    return full
  }
  const age = checkRange('age range', details.age, ageLimits, 'years', OPEN_AGE_MAX)
  if (age) errors.age = age
  const minutes = Number(details.duration)
  if (!details.duration.trim()) errors.duration = 'Enter the duration in minutes.'
  else if (!Number.isInteger(minutes) || minutes < durationLimits.min || minutes > durationLimits.max) errors.duration = `The duration must be a whole number of minutes between ${durationLimits.min} and ${durationLimits.max}.`
  const participants = checkRange('participant range', details.participants, participantLimits, 'participants')
  if (participants) errors.participants = participants
  if (teamsApply(details.format)) {
    const team = checkRange('team size range', details.teamSize, teamSizeLimits, 'members')
    const people = parseRange(details.participants), teams = parseRange(details.teamSize)
    if (team) errors.teamSize = team
    else if (!participants && people && teams && teams.max > people.max) errors.teamSize = 'The maximum team size cannot exceed the maximum number of participants.'
    else if (!participants && people && teams && details.format === 'Team Hunters' && teams.min > people.min) errors.teamSize = 'The minimum team size cannot exceed the minimum number of participants; at least one full team must be possible.'
  }
  return errors
}
export const detailErrorText = (errors: DetailErrors) => Object.values(errors).filter(Boolean).join(' ')
