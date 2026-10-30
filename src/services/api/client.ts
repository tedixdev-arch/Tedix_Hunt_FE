import { API_BASE_URL, buildApiUrl } from './config.ts';
import { LocalSessionStore, clearSession, rotateSession, sameCredentials, sameSession, sessionSnapshot, sessionState, type SessionSnapshot, type SessionStore, type SessionTokens } from './session.ts';

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

function tokensFrom(body: unknown): Required<SessionTokens> | null {
  if (!body || typeof body !== 'object') return null;
  const value = body as { accessToken?: unknown; refreshToken?: unknown };
  if (typeof value.accessToken !== 'string' || !value.accessToken.trim()
    || typeof value.refreshToken !== 'string' || !value.refreshToken.trim()) return null;
  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
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
    return this.send<T>(path, options, false, sessionSnapshot(this.session));
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

  put<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  delete<T = void>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  private async send<T>(path: string, options: ApiRequestOptions, hasRetried: boolean, origin: SessionSnapshot): Promise<T> {
    const { body, authenticated = true, retryOnUnauthorized = true, headers, ...init } = options;
    const requestHeaders = new Headers(headers);
    if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');
    if (authenticated && !sameSession(this.session, origin)) throw this.sessionChanged();
    const sent = sessionSnapshot(this.session);
    const accessToken = authenticated ? sent.accessToken : null;
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
      if (!sameSession(this.session, origin)) throw this.sessionChanged();
      // A late 401 can refer to the token already replaced by a shared flight.
      if (sameCredentials(this.session, sent)) await this.refreshSession(sent);
      if (!sameSession(this.session, origin)) throw this.sessionChanged();
      return this.send<T>(path, options, true, origin);
    }

    if (authenticated && !sameSession(this.session, origin)) throw this.sessionChanged();

    let parsed: unknown;
    try {
      parsed = await responseBody(response);
    } catch {
      const status = response.ok && path === '/api/auth/refresh' ? 401 : response.status;
      throw new ApiError('The backend returned an invalid response.', status, errorKind(status));
    }
    if (authenticated && !sameSession(this.session, origin)) throw this.sessionChanged();
    if (!response.ok) {
      throw new ApiError(publicErrorMessage(parsed, response.status), response.status, errorKind(response.status), parsed);
    }
    return parsed as T;
  }

  private sessionChanged(): ApiError {
    return new ApiError('The session has changed. Please try again.', 401, 'unauthorized');
  }

  /** All automatic, bootstrap and explicit refreshes share the store's flight. */
  refreshSession(snapshot = sessionSnapshot(this.session)): Promise<Required<SessionTokens>> {
    const state = sessionState(this.session);
    if (!sameCredentials(this.session, snapshot)) return Promise.reject(this.sessionChanged());
    if (state.flight && state.flight.snapshot.identity === snapshot.identity
      && state.flight.snapshot.refreshToken === snapshot.refreshToken) return state.flight.promise;

    const promise = (async () => {
      try {
        if (!snapshot.refreshToken) {
          throw new ApiError('Your session has expired. Please sign in again.', 401, 'unauthorized');
        }
        const body = await this.send<unknown>('/api/auth/refresh', {
          method: 'POST', body: { refreshToken: snapshot.refreshToken }, authenticated: false, retryOnUnauthorized: false,
        }, true, snapshot);
        const tokens = tokensFrom(body);
        if (!tokens) throw new ApiError('Invalid refresh response. Please sign in again.', 401, 'unauthorized');
        if (!sameCredentials(this.session, snapshot)) {
          // A logout may have revoked the consumed credential before rotation completed.
          // Revoke the discarded replacement too, without touching the active login.
          void this.send('/api/auth/logout', {
            method: 'POST', body: { refreshToken: tokens.refreshToken }, authenticated: false, retryOnUnauthorized: false,
          }, true, snapshot).catch(() => undefined);
          throw this.sessionChanged();
        }
        rotateSession(this.session, tokens);
        return tokens;
      } catch (error) {
        // Transport/server failures are retryable; only definitive expiry invalidates this login.
        if (sameCredentials(this.session, snapshot) && error instanceof ApiError
          && (error.status === 400 || error.status === 401 || error.status === 403)) clearSession(this.session);
        throw error;
      }
    })();
    const flight = { snapshot, promise };
    state.flight = flight;
    // Both handlers consume cleanup without creating an unhandled rejecting promise.
    void promise.then(() => { if (state.flight === flight) state.flight = undefined; },
      () => { if (state.flight === flight) state.flight = undefined; });
    return promise;
  }
}

export const apiClient = new ApiClient();
