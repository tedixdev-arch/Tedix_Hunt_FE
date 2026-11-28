import { parseRange, teamSizeLimits, type Range } from '../creator/templateDetailRules'

/**
 * The participation rules a Creator set on the Template: format, participant range and (Team Hunters) team size
 * range. The backend enforces the same rules on save and publish; this mirrors them for inline guidance.
 */
export interface TemplateParticipation { format: 'solo' | 'team' | null; participants: Range | null; teamSize: Range | null }

export function templateParticipation(snapshot: unknown): TemplateParticipation {
  const configuration = snapshot && typeof snapshot === 'object' && (snapshot as { configuration?: unknown }).configuration
  const c = configuration && typeof configuration === 'object' ? configuration as Record<string, unknown> : {}
  const format = c.format === 'Single Hunters' ? 'solo' : c.format === 'Team Hunters' ? 'team' : null
  const participants = typeof c.participants === 'string' ? parseRange(c.participants) : null
  const team = format !== 'solo' && (typeof c.teamSize === 'string' || typeof c.teamSize === 'number') ? parseRange(String(c.teamSize)) : null
  return {
    format,
    participants: participants && participants.min >= 1 && participants.min <= participants.max ? participants : null,
    teamSize: team && team.min >= teamSizeLimits.min && team.max <= teamSizeLimits.max && team.min <= team.max ? team : null,
  }
}

export const clamp = (value: number, range: Range | null) => range ? Math.min(range.max, Math.max(range.min, value)) : value
export const rangeLabel = (range: Range) => range.min === range.max ? String(range.min) : `${range.min}–${range.max}`

/** Inline messages for the Organizer's participants and team size; empty strings when valid. */
export function participationErrors(rules: TemplateParticipation, capacity: number, teamSize: number) {
  const capacityError = !Number.isInteger(capacity) || capacity < 1 ? 'Enter the number of participants.'
    : rules.participants && (capacity < rules.participants.min || capacity > rules.participants.max)
      ? `This Hunt is designed for ${rangeLabel(rules.participants)} participants.` : ''
  const teamError = rules.format === 'solo' ? ''
    : !Number.isInteger(teamSize) || teamSize < 1 ? 'Enter the team size.'
    : rules.teamSize && (teamSize < rules.teamSize.min || teamSize > rules.teamSize.max) ? `Teams must have ${rangeLabel(rules.teamSize)} members for this Hunt.`
    : !rules.teamSize && teamSize !== 4 ? 'This Hunt plays in teams of 4.'
    : Number.isInteger(capacity) && teamSize > capacity ? 'A team cannot be larger than the number of participants.' : ''
  return { capacityError, teamError }
}
