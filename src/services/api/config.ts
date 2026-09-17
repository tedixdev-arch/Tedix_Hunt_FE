const configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim();

// An empty base URL keeps local development on the current origin (for example, with a Vite proxy).
export const API_BASE_URL = configuredBaseUrl?.replace(/\/+$/, '') ?? '';

export function buildApiUrl(path: string, baseUrl = API_BASE_URL): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/+$/, '')}${normalizedPath}`;
}
