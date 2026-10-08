import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Feature, Polygon } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { FinishPoint } from '../features/creator/finishPoint'
import { MapboxLocationSearch } from './MapboxLocationSearch'

export type TedixMapCheckpoint = {
  checkpointNumber: number
  name: string
  longitude: number
  latitude: number
  radiusMeters: number
  selected?: boolean
  verified?: boolean
}

/** A geodesic polygon: distances are metres on the earth, independent of zoom. */
export function checkpointRadius(point: Pick<TedixMapCheckpoint, 'latitude' | 'longitude' | 'radiusMeters' | 'selected'>): Feature<Polygon> {
  const latitude = point.latitude * Math.PI / 180
  const longitude = point.longitude * Math.PI / 180
  const distance = point.radiusMeters / 6371008.8
  const coordinates = Array.from({ length: 65 }, (_, index) => {
    const bearing = index / 64 * 2 * Math.PI
    const lat = Math.asin(Math.sin(latitude) * Math.cos(distance) + Math.cos(latitude) * Math.sin(distance) * Math.cos(bearing))
    const lng = longitude + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(latitude), Math.cos(distance) - Math.sin(latitude) * Math.sin(lat))
    return [lng * 180 / Math.PI, lat * 180 / Math.PI]
  })
  coordinates[64] = coordinates[0]
  return { type: 'Feature', properties: { selected: !!point.selected }, geometry: { type: 'Polygon', coordinates: [coordinates] } }
}

export type TedixMapProps = {
  initialLongitude: number
  initialLatitude: number
  initialZoom?: number
  mapStyle?: string
  /** Enable temporary location search; selection only moves the mounted map. */
  locationSearch?: boolean
  finishPoint?: FinishPoint
  checkpoints?: TedixMapCheckpoint[]
  onMapClick?: (latitude: number, longitude: number) => void
  onCheckpointSelect?: (checkpointNumber: number) => void
  className?: string
}

export function TedixMap({
  initialLongitude,
  initialLatitude,
  initialZoom = 12,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  className = '',
  locationSearch = false,
  checkpoints,
  finishPoint,
  onMapClick,
  onCheckpointSelect,
}: TedixMapProps) {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const initialOptions = useRef({
    center: [initialLongitude, initialLatitude] as [number, number],
    zoom: initialZoom,
    style: mapStyle,
  })
  const currentStyle = useRef(mapStyle)
  const clickHandler = useRef(onMapClick)
  clickHandler.current = onMapClick

  useEffect(() => {
    if (!accessToken || !containerRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken,
      ...initialOptions.current,
    })
    mapRef.current = map
    currentStyle.current = initialOptions.current.style
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [accessToken])

  useEffect(() => {
    if (mapRef.current && currentStyle.current !== mapStyle) {
      mapRef.current.setStyle(mapStyle)
      currentStyle.current = mapStyle
    }
  }, [mapStyle, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !onMapClick) return
    const click = (event: mapboxgl.MapMouseEvent) => clickHandler.current?.(event.lngLat.lat, event.lngLat.lng)
    map.on('click', click)
    return () => { map.off('click', click) }
  }, [!!onMapClick, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !checkpoints) return
    const sourceId = 'tedix-checkpoint-radii'
    const fillId = `${sourceId}-fill`
    const lineId = `${sourceId}-line`
    const markers = checkpoints.map(point => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = String(point.checkpointNumber)
      button.setAttribute('aria-label', `Select checkpoint ${point.checkpointNumber}: ${point.name}`)
      button.setAttribute('aria-pressed', String(!!point.selected))
      button.className = `flex h-11 w-11 items-center justify-center rounded-full border-4 border-white font-bold text-white shadow-lg ${point.selected ? 'bg-slate-900 ring-4 ring-emerald-400' : point.verified ? 'bg-emerald-600' : 'bg-amber-600'}`
      button.onclick = event => { event.stopPropagation(); onCheckpointSelect?.(point.checkpointNumber) }
      return new mapboxgl.Marker({ element: button }).setLngLat([point.longitude, point.latitude]).addTo(map)
    })
    const draw = () => {
      if (map.getSource(sourceId)) return
      map.addSource(sourceId, { type: 'geojson', data: { type: 'FeatureCollection', features: checkpoints.map(checkpointRadius) } })
      map.addLayer({ id: fillId, type: 'fill', source: sourceId, paint: { 'fill-color': '#059669', 'fill-opacity': .12 } })
      map.addLayer({ id: lineId, type: 'line', source: sourceId, paint: { 'line-color': '#059669', 'line-width': ['case', ['get', 'selected'], 3, 1] } })
    }
    if (map.isStyleLoaded()) draw()
    map.on('style.load', draw)
    return () => {
      map.off('style.load', draw)
      markers.forEach(marker => marker.remove())
      if (mapRef.current !== map) return
      if (map.getLayer(lineId)) map.removeLayer(lineId)
      if (map.getLayer(fillId)) map.removeLayer(fillId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [checkpoints, onCheckpointSelect, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !finishPoint) return
    const sourceId = 'tedix-finishpoint-radius'
    const element = document.createElement('div')
    element.textContent = '⚑'
    element.setAttribute('aria-label', `FinishPoint: ${finishPoint.name}`)
    element.className = 'flex h-12 w-12 items-center justify-center rounded-lg border-4 border-white bg-violet-700 text-2xl text-white shadow-lg'
    element.onclick = event => event.stopPropagation()
    const marker = new mapboxgl.Marker({ element }).setLngLat([finishPoint.longitude, finishPoint.latitude]).addTo(map)
    const draw = () => {
      if (map.getSource(sourceId)) return
      map.addSource(sourceId, { type: 'geojson', data: checkpointRadius(finishPoint) })
      map.addLayer({ id: `${sourceId}-fill`, type: 'fill', source: sourceId, paint: { 'fill-color': '#7c3aed', 'fill-opacity': .15 } })
      map.addLayer({ id: `${sourceId}-line`, type: 'line', source: sourceId, paint: { 'line-color': '#7c3aed', 'line-width': 2 } })
    }
    if (map.isStyleLoaded()) draw()
    map.on('style.load', draw)
    return () => {
      map.off('style.load', draw)
      marker.remove()
      if (mapRef.current !== map) return
      for (const id of [`${sourceId}-line`, `${sourceId}-fill`]) if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [finishPoint, accessToken])

  return (
    <div className={`relative h-full min-h-[300px] w-full ${className}`}>
      {accessToken && locationSearch && <MapboxLocationSearch accessToken={accessToken} onSelect={({ center }) => mapRef.current?.flyTo({ center, zoom: 14 })} />}
      {accessToken ? (
        <div ref={containerRef} className="h-full min-h-[300px] w-full" aria-label="Map" />
      ) : (
        <p role="status">Map unavailable. Configure VITE_MAPBOX_ACCESS_TOKEN with a public Mapbox access token and restart the application.</p>
      )}
    </div>
  )
}
