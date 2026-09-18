import type { Hunt, HuntStatus } from '../services/api/hunts.ts';
import type { HuntOption, HuntOptions } from '../services/api/huntOptions.ts';

export type GeneralSection = 1 | 2 | 3 | 4;

export interface HuntReviewIssue {
  section: 'general' | 'template' | 'options';
  generalSection: GeneralSection;
  field: string;
  message: string;
}

export interface HuntReviewResult {
  ready: boolean;
  issues: HuntReviewIssue[];
}

const required: Array<[keyof Hunt, GeneralSection, HuntReviewIssue['section'], string]> = [
  ['name', 1, 'general', 'Add a Hunt name'],
  ['country', 1, 'general', 'Add a country'],
  ['city', 1, 'general', 'Add a city'],
  ['startDate', 1, 'general', 'Add a Hunt date'],
  ['startTime', 1, 'general', 'Add a start time'],
  ['timezone', 1, 'general', 'Add a timezone'],
  ['durationMinutes', 1, 'general', 'Add a valid duration'],
  ['contactName', 1, 'general', 'Add a local contact'],
  ['capacity', 2, 'general', 'Add a valid capacity'],
  ['format', 2, 'options', 'Save Participants & access'],
  ['teamSize', 2, 'options', 'Save Participants & access'],
  ['accessMode', 2, 'options', 'Save Participants & access'],
  ['difficulty', 3, 'options', 'Save Experience defaults'],
  ['checkpointOrder', 3, 'options', 'Save Experience defaults'],
  ['templateKey', 4, 'template', 'Select a Hunt template'],
  ['templateVersion', 4, 'template', 'Select a Hunt template'],
  ['templateSnapshot', 4, 'template', 'Select a Hunt template'],
];

function missing(hunt: Hunt, field: keyof Hunt): boolean {
  const value = hunt[field];
  if (field === 'durationMinutes' || field === 'capacity' || field === 'teamSize' || field === 'templateVersion') {
    return typeof value !== 'number' || value < 1;
  }
  return value === null || value === undefined || (typeof value === 'string' && !value.trim());
}

export function reviewHunt(hunt: Hunt): HuntReviewResult {
  const issues = required
    .filter(([field]) => missing(hunt, field))
    .map(([field, generalSection, section, message]) => ({ section, generalSection, field, message }));
  return { ready: issues.length === 0, issues };
}

export function formatLocation(hunt: Hunt): string {
  return [hunt.city, hunt.region, hunt.country].filter(value => value?.trim()).join(', ') || 'Not saved';
}

export function formatDate(date: string | null): string {
  if (!date) return 'Not saved';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.valueOf()) ? date : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsed);
}

export function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : 'Not saved';
}

function readableKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function optionLabel(options: HuntOption[] | undefined, key: string | null): string {
  if (!key) return 'Not saved';
  return options?.find(option => option.key === key)?.label ?? readableKey(key);
}

export function reviewOptionLabels(hunt: Hunt, options: HuntOptions | null) {
  return {
    format: optionLabel(options?.formats, hunt.format),
    teamSize: hunt.teamSize ? `Teams of ${hunt.teamSize}` : 'Not saved',
    accessMode: optionLabel(options?.accessModes, hunt.accessMode),
    difficulty: optionLabel(options?.difficulties, hunt.difficulty),
    checkpointOrder: optionLabel(options?.checkpointOrders, hunt.checkpointOrder),
  };
}

export const statusLabels: Record<HuntStatus, string> = {
  draft: 'Draft', published: 'Published', active: 'In progress', paused: 'Paused', cancelled: 'Cancelled', finished: 'Completed',
};

export function reviewRefreshError(error: unknown): string {
  const status = typeof error === 'object' && error && 'status' in error ? (error as { status?: unknown }).status : undefined;
  if (status === 403) return "You don't have access to review this Hunt.";
  if (status === 404) return 'This Hunt could not be found.';
  return "We couldn't load the latest saved Hunt.";
}
