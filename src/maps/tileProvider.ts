// Tile-provider boundary: Creator Studio depends on this contract, not an OSM URL.
// A compatible provider can replace these values without changing checkpoint data.
export const prototypeTileProvider = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
} as const

export const CLUJ_NAPOCA_VIEW: [number, number] = [46.7712, 23.6236]
export const CITY_ZOOM = 14
