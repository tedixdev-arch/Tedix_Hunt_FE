import { apiClient, type ApiClient } from './client.ts';

export type HuntStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'finished';

export type HuntRole = 'organizer' | 'supervisor';

export interface Hunt {
  id: string;
  organizationId: string;
  createdByUserId: string;
  name: string;
  status: HuntStatus;
  createdAt: string;
  updatedAt: string;
  country: string | null;
  region: string | null;
  city: string | null;
  startDate: string | null;
  startTime: string | null;
  timezone: string | null;
  durationMinutes: number | null;
  capacity: number | null;
  contactName: string | null;
}

export interface HuntListItem extends Hunt {
  huntRoles: HuntRole[];
}

export interface CreateDraftInput { organizationId: string; name: string }
export type UpdateDraftInput = Partial<Pick<Hunt,
  'name' | 'country' | 'region' | 'city' | 'startDate' | 'startTime' | 'timezone' |
  'durationMinutes' | 'capacity' | 'contactName'
>>;

export type HuntLifecycleAction = 'publish' | 'start' | 'pause' | 'resume' | 'cancel' | 'finish';

export class HuntsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listHunts(): Promise<HuntListItem[]> {
    return this.client.get<HuntListItem[]>('/api/hunts');
  }

  createDraft(input: CreateDraftInput): Promise<Hunt> {
    return this.client.post<Hunt>('/api/hunts', input);
  }

  getHunt(id: string): Promise<Hunt> {
    return this.client.get<Hunt>(`/api/hunts/${encodeURIComponent(id)}`);
  }

  updateDraft(id: string, input: UpdateDraftInput): Promise<Hunt> {
    return this.client.patch<Hunt>(`/api/hunts/${encodeURIComponent(id)}`, input);
  }

  private transition(id: string, action: HuntLifecycleAction): Promise<Hunt> {
    return this.client.post<Hunt>(`/api/hunts/${encodeURIComponent(id)}/${action}`);
  }

  publish(id: string) { return this.transition(id, 'publish'); }
  start(id: string) { return this.transition(id, 'start'); }
  pause(id: string) { return this.transition(id, 'pause'); }
  resume(id: string) { return this.transition(id, 'resume'); }
  cancel(id: string) { return this.transition(id, 'cancel'); }
  finish(id: string) { return this.transition(id, 'finish'); }
}

export const huntsApi = new HuntsApi();
