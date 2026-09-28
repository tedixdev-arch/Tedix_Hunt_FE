import { apiClient, type ApiClient } from './client.ts';
import type { HuntStatus } from './hunts.ts';

export interface HuntContext {
  huntId: string;
  huntName: string;
  huntStatus: HuntStatus;
  participant: boolean;
  supervisor: boolean;
}

export interface HuntContextsResponse {
  contexts: HuntContext[];
}

export class HuntContextsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  async list(): Promise<HuntContext[]> {
    const response = await this.client.get<HuntContextsResponse>('/api/me/hunt-contexts');
    if (!Array.isArray(response.contexts)) throw new Error('Invalid Hunt contexts response.');
    return response.contexts;
  }
}

export const huntContextsApi = new HuntContextsApi();
