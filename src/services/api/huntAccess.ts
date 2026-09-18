import { apiClient, type ApiClient } from './client.ts';
import type { HuntStatus } from './hunts.ts';

export interface HuntAccessResolution {
  huntId: string;
  code: string;
  name: string;
  status: HuntStatus;
}

export class HuntAccessApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  resolve(code: string): Promise<HuntAccessResolution> {
    return this.client.get<HuntAccessResolution>(`/api/hunt-access/${encodeURIComponent(code)}`, {
      authenticated: false,
    });
  }
}

export const huntAccessApi = new HuntAccessApi();
