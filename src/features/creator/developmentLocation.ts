/** Temporary development preset; production builds always use the catalog UI. */
export function developmentLocationEnabled() {
  return import.meta.env.MODE === 'development' && import.meta.env.VITE_DEVELOPMENT_LOCATION_PRESET === 'cluj'
}
export const developmentLocation = {
  countryCode: 'RO', country: 'Romania', city: 'Cluj-Napoca', administrativeContext: 'Cluj',
}
