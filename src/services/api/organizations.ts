import { apiClient, type ApiClient } from './client.ts';

export interface Organization {
  id: string;
  name: string;
}

export class OrganizationsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listAccessible(): Promise<Organization[]> {
    return this.client.get<Organization[]>('/api/organizations');
  }
}

export const organizationsApi = new OrganizationsApi();
