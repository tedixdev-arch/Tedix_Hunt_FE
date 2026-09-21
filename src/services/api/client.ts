import { API_BASE_URL, buildApiUrl } from './config.ts';
import { LocalSessionStore, type SessionStore, type SessionTokens } from './session.ts';

export type ApiErrorKind = 'bad_request' | 'unauthorized' | 'conflict' | 'http' | 'network';

export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ApiErrorKind;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number | null,
    kind: ApiErrorKind,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.details = details;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
}

function errorKind(status: number): ApiErrorKind {
  if (status === 400) return 'bad_request';
  if (status === 401) return 'unauthorized';
  if (status === 409) return 'conflict';
  return 'http';
}

async function responseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : undefined;
}

function publicErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const candidate = (body as { message?: unknown; detail?: unknown; error?: unknown }).message
      ?? (body as { detail?: unknown }).detail
      ?? (body as { error?: unknown }).error;
    if (typeof candidate === 'string') return candidate;
  }
  return status === 401 ? 'Authentication is required.' : 'The request could not be completed.';
}

function tokensFrom(body: unknown): SessionTokens | null {
  if (!body || typeof body !== 'object') return null;
  const value = body as { accessToken?: unknown; refreshToken?: unknown };
  if (typeof value.accessToken !== 'string') return null;
  return {
    accessToken: value.accessToken,
    ...(typeof value.refreshToken === 'string' && { refreshToken: value.refreshToken }),
  };
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly session: SessionStore;
  private readonly fetcher: typeof fetch;

  constructor(
    baseUrl = API_BASE_URL,
    session: SessionStore = new LocalSessionStore(),
    fetcher: typeof fetch = (input, init) => fetch(input, init),
  ) {
    this.baseUrl = baseUrl;
    this.session = session;
    this.fetcher = fetcher;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.send<T>(path, options, false);
  }

  get<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T = void>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  private async send<T>(path: string, options: ApiRequestOptions, hasRetried: boolean): Promise<T> {
    const { body, authenticated = true, retryOnUnauthorized = true, headers, ...init } = options;
    const requestHeaders = new Headers(headers);
    if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');
    const accessToken = authenticated ? this.session.getAccessToken() : null;
    if (accessToken) requestHeaders.set('Authorization', `Bearer ${accessToken}`);

    let response: Response;
    try {
      response = await this.fetcher(buildApiUrl(path, this.baseUrl), {
        ...init,
        headers: requestHeaders,
        ...(body !== undefined && { body: JSON.stringify(body) }),
      });
    } catch {
      throw new ApiError('The backend is unavailable. Please try again.', null, 'network');
    }

    if (response.status === 401 && authenticated && retryOnUnauthorized && !hasRetried && path !== '/api/auth/refresh') {
      const refreshed = await this.refreshSession();
      if (refreshed) return this.send<T>(path, options, true);
      this.session.clearSession();
      throw new ApiError('Your session has expired. Please sign in again.', 401, 'unauthorized');
    }

    const parsed = await responseBody(response);
    if (!response.ok) {
      throw new ApiError(publicErrorMessage(parsed, response.status), response.status, errorKind(response.status), parsed);
    }
    return parsed as T;
  }

  private async refreshSession(): Promise<boolean> {
    const refreshToken = this.session.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await this.send<unknown>('/api/auth/refresh', {
        method: 'POST', body: { refreshToken }, authenticated: false, retryOnUnauthorized: false,
      }, true);
      const tokens = tokensFrom(response);
      if (!tokens) return false;
      // Some backends rotate refresh tokens; retain the old one only when no replacement is returned.
      this.session.saveSession({ ...tokens, refreshToken: tokens.refreshToken ?? refreshToken });
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
