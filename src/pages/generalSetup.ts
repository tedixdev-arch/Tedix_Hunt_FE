import type { Hunt, UpdateDraftInput } from '../services/api/hunts.ts';
import type { HuntTemplateMetadata } from '../services/api/huntTemplates.ts';
import type { HuntOption, HuntOptions } from '../services/api/huntOptions.ts';

export interface GeneralSetupSettings {
  name: string; date: string; time: string; timezone: string; country: string; county: string;
  location: string; language: string; format: string; duration: string; contact: string;
  participants: string; teamSize: string; access: string; difficulty: string;
  checkpointOrder: string; mission: string; theme: string;
}

export interface GeneralSetupProgress {
  activeSection: number;
  completedSections: Set<number>;
}

export function generalSetupProgressFromNavigationState(state: unknown): GeneralSetupProgress {
  const resumeAfterDetails = Boolean(state && typeof state === 'object'
    && (state as { resumeGeneralSection?: unknown }).resumeGeneralSection === 1);
  return {
    activeSection: resumeAfterDetails ? 1 : 0,
    completedSections: new Set(resumeAfterDetails ? [0] : []),
  };
}

export const newHuntDefaults: GeneralSetupSettings = {
  name: 'Signal: Cluj Napoca', date: '2026-09-12', time: '10:00', timezone: 'Europe/Bucharest',
  country: 'Romania', county: 'Cluj', location: 'Cluj Napoca', language: 'English',
  format: 'Team Hunters', duration: '90', contact: 'Ana Pop', participants: '24', teamSize: '4',
  access: 'Invitation-only', difficulty: 'Easy', checkpointOrder: 'Recommended route',
  mission: 'Signal: Cluj Napoca', theme: 'Smart Theme (Signal)',
};

function labelFor(options: HuntOption[] | undefined, key: string | null, fallback: string): string {
  return key ? options?.find(option => option.key === key)?.label ?? fallback : fallback;
}

export function settingsFromHunt(hunt: Hunt, local: GeneralSetupSettings = newHuntDefaults, options?: HuntOptions): GeneralSetupSettings {
  return {
    ...local,
    name: hunt.name ?? '', country: hunt.country ?? '', county: hunt.region ?? '', location: hunt.city ?? '',
    date: hunt.startDate ?? '', time: hunt.startTime?.slice(0, 5) ?? '', timezone: hunt.timezone ?? 'Europe/Bucharest',
    duration: hunt.durationMinutes?.toString() ?? '', participants: hunt.capacity?.toString() ?? '',
    contact: hunt.contactName ?? '',
    format: labelFor(options?.formats, hunt.format, local.format),
    teamSize: hunt.teamSize?.toString() ?? local.teamSize,
    access: labelFor(options?.accessModes, hunt.accessMode, local.access),
    difficulty: labelFor(options?.difficulties, hunt.difficulty, local.difficulty),
    checkpointOrder: labelFor(options?.checkpointOrders, hunt.checkpointOrder, local.checkpointOrder),
    ...(hunt.templateSnapshot && { mission: hunt.templateSnapshot.displayName, theme: hunt.templateSnapshot.theme }),
  };
}

function positiveInteger(value: string, label: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${label} must be at least 1.`);
  return number;
}

export function huntDetailsInput(settings: GeneralSetupSettings): UpdateDraftInput {
  return {
    name: settings.name.trim(), country: settings.country, region: settings.county, city: settings.location,
    startDate: settings.date, startTime: settings.time, timezone: settings.timezone,
    durationMinutes: positiveInteger(settings.duration, 'Duration'), contactName: settings.contact,
  };
}

export function capacityInput(settings: GeneralSetupSettings): UpdateDraftInput {
  return { capacity: positiveInteger(settings.participants, 'Participants') };
}

function keyFor(options: HuntOption[], label: string, field: string): string {
  const option = options.find(candidate => candidate.label === label);
  if (!option) throw new Error(`${field} is not available in the current pilot.`);
  return option.key;
}

export function general2Input(settings: GeneralSetupSettings, options: HuntOptions): UpdateDraftInput {
  const teamSize = positiveInteger(settings.teamSize, 'Team size');
  if (!options.teamSizes.includes(teamSize)) throw new Error('Team size is not available in the current pilot.');
  return {
    capacity: positiveInteger(settings.participants, 'Participants'),
    format: keyFor(options.formats, settings.format, 'Hunt format') as Hunt['format'],
    teamSize,
    accessMode: keyFor(options.accessModes, settings.access, 'Hunt access') as Hunt['accessMode'],
  };
}

export function general3Input(settings: GeneralSetupSettings, options: HuntOptions): UpdateDraftInput {
  return {
    difficulty: keyFor(options.difficulties, settings.difficulty, 'Difficulty') as Hunt['difficulty'],
    checkpointOrder: keyFor(options.checkpointOrders, settings.checkpointOrder, 'Checkpoint order') as Hunt['checkpointOrder'],
  };
}

export function optionSupported(options: HuntOption[], label: string): boolean {
  return options.some(option => option.label === label);
}

/** Applies catalog display metadata without coupling a Hunt's organizer-defined name to its template. */
export function settingsWithTemplate(settings: GeneralSetupSettings, template: HuntTemplateMetadata): GeneralSetupSettings {
  return { ...settings, mission: template.displayName, theme: template.theme };
}

export function templateInput(templateKey: string): UpdateDraftInput {
  return { templateKey };
}
