import { readApiBaseUrl } from './config';

export interface ApiUser { id: string; email: string; displayName: string | null }
export interface LoginInput { email: string; password: string }
export interface RegisterInput extends LoginInput { displayName?: string }
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message); this.name = 'ApiError'; this.status = status; this.code = code;
  }
}
type AuthLock = <T>(work: () => Promise<T>) => Promise<T>;
type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; auth?: boolean; signal?: AbortSignal };
interface ClientOptions { baseUrl?: string; production?: boolean; fetch?: typeof fetch; timeoutMs?: number; withAuthLock?: AuthLock }

const sessionChanged = () => new ApiError(0, 'session_changed', 'The session changed. Please try again.');
const isUser = (value: unknown): value is ApiUser => {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return typeof user.id === 'string' && typeof user.email === 'string' && (user.displayName === null || typeof user.displayName === 'string');
};
const serverError = (status: number, body: unknown) => {
  const code = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(body.error) ? body.error : 'http_error';
  // Do not render arbitrary server/proxy bodies, which may contain internal details.
  const messages: Record<number, string> = { 400: 'Check the information entered.', 401: 'Please sign in again.', 403: 'This request is not permitted.', 404: 'The requested resource was not found.', 409: 'An account cannot be created with that email.', 429: 'Too many attempts. Please try again later.' };
  return new ApiError(status, code, code === 'invalid_credentials' ? 'Email or password is incorrect.' : messages[status] ?? 'The service is temporarily unavailable.');
};

export class ApiClient {
  private readonly base: string;
  private readonly send: typeof fetch;
  private readonly timeout: number;
  private readonly authLock: AuthLock;
  private accessToken: string | null = null;
  private identity: ApiUser | null = null;
  private epoch = 0;
  private pendingRefresh: Promise<ApiUser> | null = null;
  private authQueue: Promise<unknown> = Promise.resolve();
  private readonly listeners = new Set<() => void>();

  constructor(options: ClientOptions = {}) {
    this.base = readApiBaseUrl(options.baseUrl, options.production);
    this.send = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeout = options.timeoutMs ?? 15_000;
    const lockName = `tedixhunt-auth:${this.base}`;
    this.authLock = options.withAuthLock ?? (async (work) => {
      if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(lockName, work);
      // Same-tab queue still applies. Older browsers must use a single tab for auth.
      return work();
    });
  }

  getUser = (): ApiUser | null => this.identity;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(user: ApiUser | null, token: string | null) {
    this.identity = user; this.accessToken = token;
    this.listeners.forEach((listener) => listener());
  }
  private serialized<T>(work: () => Promise<T>): Promise<T> {
    const result = this.authQueue.then(() => this.authLock(work));
    this.authQueue = result.catch(() => undefined);
    return result;
  }
  private url(path: string): string {
    if (!path.startsWith('/') || path.startsWith('//') || /[\\#]/.test(path)) throw new ApiError(0, 'invalid_path', 'Invalid API path.');
    const root = new URL(`${this.base}/`, 'https://api-placeholder.invalid');
    const target = new URL(`${this.base}${path}`, 'https://api-placeholder.invalid');
    if (root.origin !== target.origin || !target.pathname.startsWith(root.pathname)) throw new ApiError(0, 'invalid_path', 'Invalid API path.');
    return this.base.startsWith('/') ? `${target.pathname}${target.search}` : target.href;
  }
  private async raw(path: string, options: RequestOptions = {}, token?: string | null): Promise<unknown> {
    const url = this.url(path);
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, this.timeout);
    const cancel = () => controller.abort();
    options.signal?.addEventListener('abort', cancel, { once: true });
    if (options.signal?.aborted) controller.abort();
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = `Bearer ${token}`;
      if ((options.method ?? 'GET') !== 'GET') headers['X-TedixHunt-CSRF'] = '1';
      const response = await this.send(url, {
        method: options.method ?? 'GET', headers, credentials: 'include', cache: 'no-store', redirect: 'error', signal: controller.signal,
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      });
      if (response.status === 204) return undefined;
      let body: unknown;
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        try { body = await response.json(); } catch (error) {
          if (controller.signal.aborted) throw error;
          throw new ApiError(response.status, 'invalid_response', 'The service returned an invalid response.');
        }
      }
      if (!response.ok) throw serverError(response.status, body);
      if (body === undefined) throw new ApiError(response.status, 'invalid_response', 'The service returned an invalid response.');
      return body;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) throw new ApiError(0, timedOut ? 'timeout' : 'cancelled', timedOut ? 'The request timed out.' : 'The request was cancelled.');
      throw new ApiError(0, 'network_error', 'Unable to reach the service. Check your connection.');
    } finally {
      clearTimeout(timeout); options.signal?.removeEventListener('abort', cancel);
    }
  }

  private acceptSession(body: unknown, epoch: number): ApiUser {
    if (epoch !== this.epoch) throw sessionChanged();
    const session = body as { user?: unknown; accessToken?: unknown; tokenType?: unknown; expiresIn?: unknown } | null;
    if (!session || !isUser(session.user) || typeof session.accessToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(session.accessToken) || session.tokenType !== 'Bearer' || typeof session.expiresIn !== 'number' || session.expiresIn <= 0) {
      throw new ApiError(0, 'invalid_response', 'The service returned an invalid session.');
    }
    this.publish(session.user, session.accessToken);
    return session.user;
  }
  private account(path: string, input: LoginInput | RegisterInput): Promise<ApiUser> {
    const epoch = ++this.epoch;
    this.publish(null, null);
    return this.serialized(async () => this.acceptSession(await this.raw(path, { method: 'POST', body: input }), epoch));
  }
  login(input: LoginInput) { return this.account('/auth/login', input); }
  register(input: RegisterInput) { return this.account('/auth/register', input); }

  restore(): Promise<ApiUser | null> {
    return this.refresh().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    });
  }
  private refresh(): Promise<ApiUser> {
    if (this.pendingRefresh) return this.pendingRefresh;
    const epoch = this.epoch;
    const attempt = this.serialized(async () => {
      if (epoch !== this.epoch) throw sessionChanged();
      try { return this.acceptSession(await this.raw('/auth/refresh', { method: 'POST', body: {} }), epoch); }
      catch (error) { if (epoch === this.epoch) this.publish(null, null); throw error; }
    });
    this.pendingRefresh = attempt.finally(() => { this.pendingRefresh = null; });
    return this.pendingRefresh;
  }
  async logout(): Promise<void> {
    ++this.epoch;
    const token = this.accessToken;
    this.publish(null, null);
    await this.serialized(async () => { await this.raw('/auth/logout', { method: 'POST', body: {} }, token); });
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (options.signal?.aborted) throw new ApiError(0, 'cancelled', 'The request was cancelled.');
    // Authentication endpoints must go through serialized methods, never this generic path.
    const pathname = new URL(this.url(path), 'https://api-placeholder.invalid').pathname;
    if (/(^|\/)auth\/(login|register|refresh|logout)\/?$/.test(pathname)) throw new ApiError(0, 'invalid_path', 'Use the authentication methods for this request.');
    const authenticated = options.auth !== false;
    const epoch = this.epoch;
    if (authenticated && !this.accessToken) await this.refresh();
    if (authenticated && epoch !== this.epoch) throw sessionChanged();
    const token = authenticated ? this.accessToken : null;
    try {
      const result = await this.raw(path, options, token);
      if (authenticated && epoch !== this.epoch) throw sessionChanged();
      return result as T;
    } catch (error) {
      if (!authenticated || !(error instanceof ApiError) || error.status !== 401 || epoch !== this.epoch) throw error;
      // Never replay writes automatically: their outcome may be uncertain.
      if ((options.method ?? 'GET') !== 'GET') throw error;
      if (token === this.accessToken || !this.accessToken) await this.refresh();
      if (epoch !== this.epoch) throw sessionChanged();
      const retryToken = this.accessToken;
      try {
        const result = await this.raw(path, options, retryToken);
        if (epoch !== this.epoch) throw sessionChanged();
        return result as T;
      } catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401 && epoch === this.epoch && retryToken === this.accessToken) this.publish(null, null);
        throw retryError;
      }
    }
  }
}
