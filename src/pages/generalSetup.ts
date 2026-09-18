import type { Hunt, UpdateDraftInput } from '../services/api/hunts.ts';

export interface GeneralSetupSettings {
  name: string; date: string; time: string; timezone: string; country: string; county: string;
  location: string; language: string; format: string; duration: string; contact: string;
  participants: string; teamSize: string; access: string; difficulty: string;
  checkpointOrder: string; mission: string; theme: string;
}

export const newHuntDefaults: GeneralSetupSettings = {
  name: 'Signal: Cluj Napoca', date: '2026-09-12', time: '10:00', timezone: 'Europe/Bucharest',
  country: 'Romania', county: 'Cluj', location: 'Cluj Napoca', language: 'English',
  format: 'Team Hunters', duration: '90', contact: 'Ana Pop', participants: '24', teamSize: '4',
  access: 'Invitation-only', difficulty: 'Easy', checkpointOrder: 'Recommended route',
  mission: 'Signal: Cluj Napoca', theme: 'Smart Theme (Signal)',
};

export function settingsFromHunt(hunt: Hunt, local: GeneralSetupSettings = newHuntDefaults): GeneralSetupSettings {
  return {
    ...local,
    name: hunt.name ?? '', country: hunt.country ?? '', county: hunt.region ?? '', location: hunt.city ?? '',
    date: hunt.startDate ?? '', time: hunt.startTime?.slice(0, 5) ?? '', timezone: hunt.timezone ?? 'Europe/Bucharest',
    duration: hunt.durationMinutes?.toString() ?? '', participants: hunt.capacity?.toString() ?? '',
    contact: hunt.contactName ?? '',
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
