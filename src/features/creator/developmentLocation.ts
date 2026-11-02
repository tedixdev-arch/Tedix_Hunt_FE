/** Vite builds use production mode in both deployments. Require explicit dev targeting. */
export function developmentLocationEnabled() {
  return import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT === 'development'
    && import.meta.env.VITE_DEVELOPMENT_LOCATION_PRESET === 'cluj'
    && import.meta.env.VITE_API_BASE_URL === 'https://tedixhunt-be-dev.anainfo.ai'
}
export const developmentLocation = {
  countryCode: 'RO', country: 'Romania', city: 'Cluj-Napoca', administrativeContext: 'Cluj',
}
