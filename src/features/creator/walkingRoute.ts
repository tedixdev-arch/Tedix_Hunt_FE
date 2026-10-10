import type { LineString } from 'geojson'

export interface RouteDestination { label: string; latitude: number; longitude: number }
export interface WalkingRoute { geometry: LineString; distance: number; duration: number }

function coordinates(value: unknown): value is { latitude: number; longitude: number } {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return typeof point.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180
}

/** Read geography only. Array order must already agree with authoritative numbering. */
export function walkingDestinations(configuration: Record<string, unknown>): RouteDestination[] {
  const count = configuration.normalCheckpointCount
  if (!Number.isInteger(count) || (count as number) < 1 || (count as number) > 20) throw new Error('Set the normal checkpoint count to an integer from 1 to 20 in Feature 1.')
  const points = configuration.checkpointPositions
  if (!Array.isArray(points) || points.length !== count) throw new Error(`Position exactly ${count} normal checkpoints in Feature 2.`)
  const destinations = points.map((point, index) => {
    if (!point || point.checkpointNumber !== index + 1) throw new Error('Checkpoint numbering must be complete, unique, and ordered 1..N. Correct the saved geography before validating; numbering was not changed.')
    if (!coordinates(point)) throw new Error(`Checkpoint ${index + 1} needs valid latitude (−90..90) and longitude (−180..180) in Feature 2.`)
    return { label: `CP${index + 1}`, latitude: point.latitude, longitude: point.longitude }
  })
  if (!coordinates(configuration.finishPoint)) throw new Error('Place a FinishPoint with valid latitude (−90..90) and longitude (−180..180) in Feature 6.')
  return [...destinations, { label: 'FinishPoint', latitude: configuration.finishPoint.latitude, longitude: configuration.finishPoint.longitude }]
}

export async function calculateWalkingRoute(destinations: RouteDestination[], accessToken: string, signal?: AbortSignal): Promise<WalkingRoute> {
  if (!accessToken.trim()) throw new Error('Configure VITE_MAPBOX_ACCESS_TOKEN with a public Mapbox token to validate the walking route.')
  if (destinations.length < 2 || destinations.length > 21 || destinations.at(-1)?.label !== 'FinishPoint') throw new Error('The walking route must end at FinishPoint after 1–20 normal checkpoints.')
  const path = destinations.map(point => `${point.longitude},${point.latitude}`).join(';')
  const query = new URLSearchParams({ access_token: accessToken, geometries: 'geojson', overview: 'full', steps: 'false', alternatives: 'false' })
  let response: Response
  try { response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${path}?${query}`, { signal }) }
  catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Mapbox walking directions could not be reached. Check your connection and try again.')
  }
  if (!response.ok) throw new Error(`Mapbox walking directions failed (HTTP ${response.status}). Check the token and routing access, then retry.`)
  let data
  try { data = await response.json() } catch { throw new Error('Mapbox returned an unreadable walking route. Try again.') }
  const route = data?.routes?.[0]
  const line = route?.geometry
  if (data?.code !== 'Ok' || !route || !Number.isFinite(route.distance) || route.distance < 0
    || !Number.isFinite(route.duration) || route.duration < 0 || !Array.isArray(route.legs) || route.legs.length !== destinations.length - 1
    || !Array.isArray(data.waypoints) || data.waypoints.length !== destinations.length || line?.type !== 'LineString' || !Array.isArray(line.coordinates) || line.coordinates.length < 2
    || !line.coordinates.every((point: unknown) => Array.isArray(point) && point.length >= 2 && coordinates({ longitude: point[0], latitude: point[1] }))) {
    throw new Error('Mapbox did not return a usable walking route through every destination. Review checkpoint and FinishPoint locations, then retry.')
  }
  return { geometry: line, distance: route.distance, duration: route.duration }
}

export function walkingDistance(meters: number): string { return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km` }
export function walkingDuration(seconds: number): string {
  const minutes = Math.ceil(seconds / 60)
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
}
