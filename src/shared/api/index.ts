import { ApiClient } from './client';

// Construction makes no network calls. Step 7.5 wires this into the visible login UI.
export const api = new ApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL, production: import.meta.env.PROD });
export { ApiClient, ApiError } from './client';
export type { ApiUser, LoginInput, RegisterInput } from './client';
