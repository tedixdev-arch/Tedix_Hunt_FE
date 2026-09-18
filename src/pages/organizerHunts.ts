import type { HuntLifecycleAction, HuntListItem, HuntStatus } from '../services/api/hunts.ts';

export const statusLabels: Record<HuntStatus, string> = {
  draft: 'Draft',
  published: 'Ready to start',
  active: 'In progress',
  paused: 'Paused',
  cancelled: 'Cancelled',
  finished: 'Completed',
};

export function lifecycleActions(hunt: HuntListItem): HuntLifecycleAction[] {
  if (!hunt.huntRoles.includes('organizer')) return [];
  const actions: Record<HuntStatus, HuntLifecycleAction[]> = {
    draft: ['publish', 'cancel'],
    published: ['start', 'cancel'],
    active: ['pause', 'finish', 'cancel'],
    paused: ['resume', 'finish', 'cancel'],
    finished: [],
    cancelled: [],
  };
  return actions[hunt.status];
}

export function huntSummary(hunts: HuntListItem[]) {
  return {
    active: hunts.filter((hunt) => hunt.status === 'active').length,
    needsAttention: hunts.filter((hunt) => hunt.status === 'paused').length,
  };
}

export function mergeLifecycleResult(current: HuntListItem, updated: Omit<HuntListItem, 'huntRoles'>): HuntListItem {
  return { ...updated, huntRoles: current.huntRoles };
}
