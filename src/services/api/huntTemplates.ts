import { apiClient, type ApiClient } from './client.ts';

export interface HuntTemplateMetadata {
  key: string;
  version: number;
  displayName: string;
  theme: string;
}

export class HuntTemplatesApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listHuntTemplates(): Promise<HuntTemplateMetadata[]> {
    return this.client.get<HuntTemplateMetadata[]>('/api/hunt-templates');
  }
}

export const huntTemplatesApi = new HuntTemplatesApi();
