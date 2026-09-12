export function readApiBaseUrl(value: string | undefined, production = false): string {
  const base = (value?.trim() || '/api').replace(/\/+$/, '');
  if (!base.startsWith('//') && /^\/[a-zA-Z0-9/_-]+$/.test(base)) return base;
  try {
    const url = new URL(base);
    if (url.username || url.password || url.search || url.hash || !['http:', 'https:'].includes(url.protocol)) throw new Error();
    if (production && url.protocol !== 'https:') throw new Error();
    return url.href.replace(/\/+$/, '');
  } catch {
    throw new Error('VITE_API_BASE_URL must be an API path or HTTP(S) URL; production requires HTTPS.');
  }
}
