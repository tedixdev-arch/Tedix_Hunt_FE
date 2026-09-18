import { ApiError } from '../services/api/client.ts';
import type { HuntStatus } from '../services/api/hunts.ts';

export const accessStatusLabels: Partial<Record<HuntStatus, string>> = {
  published: 'Ready to join',
  active: 'Hunt in progress',
  paused: 'Hunt temporarily paused',
  cancelled: 'Hunt cancelled',
  finished: 'Hunt finished',
};

export function participantLink(origin: string, code: string) {
  return `${origin}/#/join/${encodeURIComponent(code)}`;
}

export function accessCreationError(error: unknown) {
  if (error instanceof ApiError && error.status === 403) return "You don't have access to create participant access for this Hunt.";
  if (error instanceof ApiError && error.status === 404) return 'This Hunt could not be found.';
  if (error instanceof ApiError && error.status === 409) return 'Participant access cannot be created for the Hunt in its current state.';
  return "We couldn't create participant access. Please try again.";
}

export async function copyParticipantLink(link: string, clipboard: Pick<Clipboard, 'writeText'> | undefined) {
  if (!clipboard) return "Couldn't copy the link. Select and copy it manually.";
  try {
    await clipboard.writeText(link);
    return 'Link copied';
  } catch {
    return "Couldn't copy the link. Select and copy it manually.";
  }
}

export async function shareParticipantLink(
  link: string,
  huntName: string,
  sharing: Pick<Navigator, 'share'>['share'] | undefined,
  clipboard: Pick<Clipboard, 'writeText'> | undefined,
) {
  if (!sharing) return copyParticipantLink(link, clipboard);
  try {
    await sharing({ title: `Join ${huntName}`, text: `Join my TedixHunt: ${huntName}`, url: link });
    return '';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'Share cancelled';
    return 'Share cancelled';
  }
}
