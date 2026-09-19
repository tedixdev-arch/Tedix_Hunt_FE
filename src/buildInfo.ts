/** The commit used to build this frontend, injected by Vite in CI. */
export const buildSha = import.meta.env?.VITE_BUILD_SHA || 'development'
