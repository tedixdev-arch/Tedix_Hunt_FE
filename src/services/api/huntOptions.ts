import { apiClient, type ApiClient } from './client.ts';

export interface HuntOption {
  key: string;
  label: string;
}

export interface HuntOptions {
  formats: HuntOption[];
  teamSizes: number[];
  accessModes: HuntOption[];
  difficulties: HuntOption[];
  checkpointOrders: HuntOption[];
}

export class HuntOptionsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listHuntOptions(): Promise<HuntOptions> {
    return this.client.get<HuntOptions>('/api/hunt-options');
  }
}

export const huntOptionsApi = new HuntOptionsApi();
