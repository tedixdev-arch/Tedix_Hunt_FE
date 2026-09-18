import { apiClient, type ApiClient } from './client.ts';

export interface Organization {
  id: string;
  name: string;
}

export class OrganizationsApi {
  constructor(private readonly client: ApiClient = apiClient) {}

  listAccessible(): Promise<Organization[]> {
    return this.client.get<Organization[]>('/api/organizations');
  }
}

export const organizationsApi = new OrganizationsApi();
