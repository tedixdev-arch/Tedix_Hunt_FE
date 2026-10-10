import { apiClient, type ApiClient } from './client.ts';

export interface HuntTemplateMetadata {
  key: string;
  version: number;
  displayName: string;
  theme: string;
}

/** BE #63: saved fields are optional for legacy/partial approved geography. */
export interface HuntTemplateGeographicPoint {
  name?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

export interface HuntTemplateGeography {
  key: string;
  version: number;
  configuration: {
    normalCheckpointCount?: number;
    checkpointPositions?: (HuntTemplateGeographicPoint & { checkpointNumber?: number })[];
    finishPoint?: HuntTemplateGeographicPoint;
  };
}

export class HuntTemplatesApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  listHuntTemplates(): Promise<HuntTemplateMetadata[]> {
    return this.client.get<HuntTemplateMetadata[]>('/api/hunt-templates');
  }

  getApprovedGeography(key: string, signal?: AbortSignal): Promise<HuntTemplateGeography> {
    return this.client.get<HuntTemplateGeography>(`/api/hunt-templates/${encodeURIComponent(key)}/geography`, { signal });
  }
}

export const huntTemplatesApi = new HuntTemplatesApi();
