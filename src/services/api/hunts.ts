import { apiClient, type ApiClient } from './client.ts';

export type HuntStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'finished';

export type HuntRole = 'organizer' | 'supervisor';

export interface HuntListItem {
  id: string;
  organizationId: string;
  createdByUserId: string;
  name: string;
  status: HuntStatus;
  createdAt: string;
  updatedAt: string;
  huntRoles: HuntRole[];
}

export type HuntLifecycleAction = 'publish' | 'start' | 'pause' | 'resume' | 'cancel' | 'finish';

export class HuntsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listHunts(): Promise<HuntListItem[]> {
    return this.client.get<HuntListItem[]>('/api/hunts');
  }

  private transition(id: string, action: HuntLifecycleAction): Promise<Omit<HuntListItem, 'huntRoles'>> {
    return this.client.post<Omit<HuntListItem, 'huntRoles'>>(`/api/hunts/${encodeURIComponent(id)}/${action}`);
  }

  publish(id: string) { return this.transition(id, 'publish'); }
  start(id: string) { return this.transition(id, 'start'); }
  pause(id: string) { return this.transition(id, 'pause'); }
  resume(id: string) { return this.transition(id, 'resume'); }
  cancel(id: string) { return this.transition(id, 'cancel'); }
  finish(id: string) { return this.transition(id, 'finish'); }
}

export const huntsApi = new HuntsApi();
