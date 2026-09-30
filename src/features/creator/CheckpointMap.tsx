import { Fragment } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CITY_ZOOM, CLUJ_NAPOCA_VIEW, prototypeTileProvider } from '../../maps/tileProvider'
import type { RouteCheckpoint } from './routeCheckpoints'

type Props = {
  checkpoints: RouteCheckpoint[]
  active: number
  verified: ReadonlySet<number>
  onSelect: (index: number) => void
  onPosition: (latitude: number, longitude: number) => void
}

function MapClick({ onPosition }: Pick<Props, 'onPosition'>) {
  useMapEvents({ click: (event: { latlng: { lat: number; lng: number } }) => onPosition(event.latlng.lat, event.latlng.lng) })
  return null
}

export function CheckpointMap({ checkpoints, active, verified, onSelect, onPosition }: Props) {
  return <div className="overflow-hidden rounded-2xl border border-slate-300" aria-label="Creator geographic checkpoint map">
    <MapContainer center={CLUJ_NAPOCA_VIEW} zoom={CITY_ZOOM} className="h-80 w-full" scrollWheelZoom>
      <TileLayer url={prototypeTileProvider.url} attribution={prototypeTileProvider.attribution} maxZoom={prototypeTileProvider.maxZoom} />
      <MapClick onPosition={onPosition} />
      {checkpoints.map((checkpoint, index) => checkpoint.latitude !== null && checkpoint.longitude !== null && <Fragment key={index}>
        <Circle center={[checkpoint.latitude, checkpoint.longitude]} radius={checkpoint.radiusMeters} pathOptions={{ color: verified.has(index) ? '#059669' : '#d97706', fillOpacity: .08, weight: 1 }} />
        <CircleMarker
          center={[checkpoint.latitude, checkpoint.longitude]}
          radius={active === index ? 10 : 8}
          bubblingMouseEvents={false}
          pathOptions={{ color: '#fff', fillColor: verified.has(index) ? '#10b981' : active === index ? '#0f172a' : '#f59e0b', fillOpacity: 1, weight: active === index ? 4 : 3 }}
          eventHandlers={{ click: () => onSelect(index) }}
        ><Tooltip permanent direction="top" offset={[0, -8]}>Checkpoint {index + 1}</Tooltip></CircleMarker>
      </Fragment>)}
    </MapContainer>
    <p className="bg-white px-3 py-2 text-xs font-bold text-slate-600">Select a checkpoint, then click the map to place or move it.</p>
  </div>
}
