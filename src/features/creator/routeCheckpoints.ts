export type RouteCheckpoint = {
  name: string
  latitude: number | null
  longitude: number | null
  radiusMeters: number
}

export function createRouteCheckpoints(names: string[], radiusMeters = 30): RouteCheckpoint[] {
  // Geographic authority starts empty; canonical Signal content does not supply coordinates.
  return names.map(name => ({ name, latitude: null, longitude: null, radiusMeters }))
}

export function hasValidGeography(checkpoint: RouteCheckpoint): boolean {
  return checkpoint.latitude !== null
    && Number.isFinite(checkpoint.latitude)
    && checkpoint.latitude >= -90
    && checkpoint.latitude <= 90
    && checkpoint.longitude !== null
    && Number.isFinite(checkpoint.longitude)
    && checkpoint.longitude >= -180
    && checkpoint.longitude <= 180
    && Number.isFinite(checkpoint.radiusMeters)
    && checkpoint.radiusMeters > 0
}

export function isRouteComplete(
  checkpoints: RouteCheckpoint[],
  verified: ReadonlySet<number>,
  completedSafetyChecks: number,
  requiredSafetyChecks: number,
): boolean {
  return checkpoints.length > 0
    && checkpoints.every((checkpoint, index) => hasValidGeography(checkpoint) && verified.has(index))
    && completedSafetyChecks === requiredSafetyChecks
}
