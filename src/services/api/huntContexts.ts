import { apiClient, type ApiClient } from './client.ts';
import type { HuntStatus } from './hunts.ts';

export interface HuntContext {
  huntId: string;
  huntName: string;
  huntStatus: HuntStatus;
  participant: boolean;
  supervisor: boolean;
}

export class HuntContextsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  list(): Promise<HuntContext[]> {
    return this.client.get<HuntContext[]>('/api/me/hunt-contexts');
  }
}

export const huntContextsApi = new HuntContextsApi();
