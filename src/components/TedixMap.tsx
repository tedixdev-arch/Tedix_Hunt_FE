import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Feature, Polygon, LineString, MultiLineString } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { FinishPoint } from '../features/creator/finishPoint'
import type { LandmarkReference } from '../features/creator/signalLandmarks'
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

export type PositionPin = Pick<TedixMapCheckpoint, 'checkpointNumber' | 'name' | 'latitude' | 'longitude' | 'selected'> & {
  status: 'reference' | 'edited' | 'confirmed'
}

export type TedixMapProps = {
  /** Increment only for an explicit camera fit from an external toolbar. */
  fitPositionsRequest?: number
  hideFitPositionsControl?: boolean
  /** Creator display coordinates only; reference pins never enter persistence. */
  positionPins?: PositionPin[]
  initialFitPoints?: Pick<PositionPin, 'latitude' | 'longitude'>[]
  selectedLocationLabel?: string
  onSearchPosition?: (latitude: number, longitude: number) => void
  initialLongitude: number
  initialLatitude: number
  initialZoom?: number
  mapStyle?: string
  /** Search explores the camera unless onSearchPosition handles selected checkpoint placement. */
  locationSearch?: boolean
  finishPoint?: FinishPoint
  /** Move the existing camera to a read-only destination without recreating the map. */
  cameraTarget?: Pick<FinishPoint, 'latitude' | 'longitude'>
  /** Informational landmark pin only: no radius or placement callback. */
  landmarkReference?: Pick<FinishPoint, 'latitude' | 'longitude' | 'name'>
  /** Dashed straight-line overview; never a directions estimate. */
  landmarkReferences?: LandmarkReference[]
  /** Fit provisional references once on opening, without changing authored geography. */
  fitLandmarkReferences?: boolean
  proposedSequence?: MultiLineString
  onLandmarkSelect?: (checkpointNumber: number) => void
  routeOverview?: LineString
  walkingRoute?: LineString
  checkpoints?: TedixMapCheckpoint[]
  finishPointSelected?: boolean
  onFinishPointSelect?: () => void
  onFinishPointMove?: (latitude: number, longitude: number) => void
  onCheckpointMove?: (checkpointNumber: number, latitude: number, longitude: number) => void
  onMapClick?: (latitude: number, longitude: number) => void
  onCheckpointSelect?: (checkpointNumber: number) => void
  className?: string
}

export function TedixMap({
  fitPositionsRequest, hideFitPositionsControl = false, positionPins, initialFitPoints, selectedLocationLabel, onSearchPosition,
  initialLongitude,
  initialLatitude,
  initialZoom = 12,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  className = '',
  locationSearch = false,
  checkpoints,
  finishPoint,
  walkingRoute,
  routeOverview,
  cameraTarget,
  landmarkReference,
  landmarkReferences,
  fitLandmarkReferences = false,
  proposedSequence,
  onLandmarkSelect,
  finishPointSelected,
  onFinishPointSelect,
  onFinishPointMove,
  onCheckpointMove,
  onMapClick,
  onCheckpointSelect,
}: TedixMapProps) {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim()
  const [mapError, setMapError] = useState('')
  const [mapLoading, setMapLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const initialOptions = useRef({
    center: [initialLongitude, initialLatitude] as [number, number],
    zoom: initialZoom,
    style: mapStyle,
  })
  const currentStyle = useRef(mapStyle)
  const didFitLandmarks = useRef(false)
  const suppressClickUntil = useRef(0)
  const clickHandler = useRef(onMapClick)
  clickHandler.current = onMapClick

  useEffect(() => {
    if (!accessToken || !containerRef.current) return

    setMapError(''); setMapLoading(true)
    let map: mapboxgl.Map
    try { map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken,
      ...initialOptions.current,
    }) } catch { setMapError('Map unavailable. Check browser WebGL support and Mapbox configuration.'); setMapLoading(false); return }
    const failed = () => { setMapError('Map could not load. Check the Mapbox token and network access. Saved stop details remain available.'); setMapLoading(false) }
    const loaded = () => { setMapLoading(false); setMapError('') }
    map.on?.('error', failed)
    map.on?.('load', loaded)
    mapRef.current = map
    didFitLandmarks.current = false
    currentStyle.current = initialOptions.current.style
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(containerRef.current)

    return () => {
      map.off?.('error', failed)
      map.off?.('load', loaded)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [accessToken])

  function fitPositions(points: Pick<PositionPin, 'latitude' | 'longitude'>[] | undefined = positionPins) {
    if (!points?.length || !mapRef.current) return
    const bounds = new mapboxgl.LngLatBounds()
    points.forEach(point => bounds.extend([point.longitude, point.latitude]))
    mapRef.current.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 0 })
  }

  useEffect(() => {
    if (fitPositionsRequest) fitPositions()
    // Request changes alone fit the camera; edits and selection never trigger this effect.
  }, [fitPositionsRequest])

  useEffect(() => {
    if (!mapRef.current || didFitLandmarks.current || !initialFitPoints?.length) return
    fitPositions(initialFitPoints)
    didFitLandmarks.current = true
  }, [initialFitPoints, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !positionPins) return
    const markers = positionPins.map(point => {
      const button = document.createElement('button')
      button.type = 'button'
      const label = point.checkpointNumber === 0 ? 'F' : String(point.checkpointNumber)
      button.setAttribute('aria-label', `Select checkpoint ${label}: ${point.name}. ${point.status === 'reference' ? 'Reference position · unconfirmed' : point.status === 'confirmed' ? 'Creator-confirmed position' : 'Locally edited · unconfirmed'}`)
      button.setAttribute('aria-pressed', String(!!point.selected))
      button.dataset.positionPin = label
      button.className = 'h-11 w-11 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700'
      // The SVG tip ends at the bottom-center anchor, exactly on the coordinate.
      button.innerHTML = `<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><path d="M22 43 C18 35 8 27 8 17 A14 14 0 1 1 36 17 C36 27 26 35 22 43Z" fill="${point.status === 'confirmed' ? '#047857' : '#475569'}" stroke="${point.selected ? '#34d399' : '#ffffff'}" stroke-width="${point.selected ? 3 : 2}"/><text x="22" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="700"></text></svg>`
      button.querySelector('text')!.textContent = label
      button.onclick = event => {
        event.stopPropagation()
        if (Date.now() <= suppressClickUntil.current) return
        suppressClickUntil.current = Date.now() + 250
        onCheckpointSelect?.(point.checkpointNumber)
      }
      const marker = new mapboxgl.Marker({ element: button, anchor: 'bottom', draggable: !!point.selected && !!onCheckpointMove }).setLngLat([point.longitude, point.latitude]).addTo(map)
      marker.on('dragend', () => {
        suppressClickUntil.current = Date.now() + 250
        const { lat, lng } = marker.getLngLat()
        onCheckpointMove?.(point.checkpointNumber, lat, lng)
      })
      return marker
    })
    return () => markers.forEach(marker => marker.remove())
  }, [positionPins, onCheckpointSelect, onCheckpointMove, accessToken])

  useEffect(() => {
    if (mapRef.current && currentStyle.current !== mapStyle) {
      mapRef.current.setStyle(mapStyle)
      currentStyle.current = mapStyle
    }
  }, [mapStyle, accessToken])

  useEffect(() => {
    if (cameraTarget) mapRef.current?.flyTo({ center: [cameraTarget.longitude, cameraTarget.latitude], zoom: 16 })
  }, [cameraTarget, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !landmarkReference) return
    const element = document.createElement('div')
    element.textContent = 'R'
    element.setAttribute('role', 'img')
    element.setAttribute('aria-label', `Landmark reference, not an arrival location: ${landmarkReference.name}`)
    element.title = `Landmark reference only: ${landmarkReference.name}`
    element.className = 'flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-blue-700 font-bold text-white shadow-lg'
    element.onclick = event => event.stopPropagation()
    const marker = new mapboxgl.Marker({ element }).setLngLat([landmarkReference.longitude, landmarkReference.latitude]).addTo(map)
    return () => { marker.remove() }
  }, [landmarkReference, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !landmarkReferences) return
    const markers = landmarkReferences.map(point => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = point.checkpointNumber === 0 ? 'F' : String(point.checkpointNumber)
      button.setAttribute('aria-label', `Select provisional landmark ${button.textContent}: ${point.name}. Not an arrival location.`)
      button.setAttribute('aria-pressed', String(!!point.selected))
      button.title = `Sourced landmark reference only: ${point.name}`
      button.className = `flex h-11 w-11 items-center justify-center border-4 border-white bg-amber-600 font-bold text-white shadow-lg ${point.checkpointNumber === 0 ? 'rounded-lg' : 'rounded-full'} ${point.selected ? 'ring-4 ring-amber-300' : ''}`
      button.onclick = event => {
        event.stopPropagation()
        suppressClickUntil.current = Date.now() + 250
        onLandmarkSelect?.(point.checkpointNumber)
      }
      // No drag callback or radius: reference data cannot become gameplay geography.
      return new mapboxgl.Marker({ element: button, draggable: false, offset: [24, -24] }).setLngLat([point.longitude, point.latitude]).addTo(map)
    })
    // Separate nearby reference badges in screen pixels, retaining their sourced coordinates.
    const arrange = () => {
      const placed: { x: number; y: number }[] = []
      landmarkReferences.forEach((point, index) => {
        const pixel = map.project([point.longitude, point.latitude])
        let offsetY = -24
        while (placed.some(other => Math.abs(other.x - (pixel.x + 24)) < 48 && Math.abs(other.y - (pixel.y + offsetY)) < 48)) offsetY += 52
        markers[index].setOffset([24, offsetY])
        placed.push({ x: pixel.x + 24, y: pixel.y + offsetY })
      })
    }
    arrange()
    map.on('moveend', arrange)
    return () => { map.off('moveend', arrange); markers.forEach(marker => marker.remove()) }
  }, [landmarkReferences, onLandmarkSelect, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !proposedSequence) return
    const id = 'tedix-proposed-landmarks'
    const draw = () => {
      if (map.getSource(id)) return
      map.addSource(id, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: proposedSequence } })
      map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': '#d97706', 'line-width': 3, 'line-dasharray': [2, 2] } })
    }
    if (map.isStyleLoaded()) draw()
    map.on('style.load', draw)
    return () => {
      map.off('style.load', draw)
      if (mapRef.current !== map) return
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    }
  }, [proposedSequence, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !onMapClick) return
    const click = (event: mapboxgl.MapMouseEvent) => { if (Date.now() > suppressClickUntil.current) clickHandler.current?.(event.lngLat.lat, event.lngLat.lng) }
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
      button.className = `flex h-11 w-11 items-center justify-center rounded-full border-4 border-white font-bold text-white shadow-lg ${point.selected ? 'bg-emerald-700 ring-4 ring-emerald-400' : 'bg-emerald-600'}`
      button.onclick = event => { event.stopPropagation(); onCheckpointSelect?.(point.checkpointNumber) }
      const marker = new mapboxgl.Marker({ element: button, ...(onCheckpointMove ? { draggable: true } : {}) }).setLngLat([point.longitude, point.latitude]).addTo(map)
      if (onCheckpointMove) marker.on('dragend', () => {
        suppressClickUntil.current = Date.now() + 250
        const { lat, lng } = marker.getLngLat()
        onCheckpointMove(point.checkpointNumber, lat, lng)
      })
      return marker
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
  }, [checkpoints, onCheckpointSelect, onCheckpointMove, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !finishPoint) return
    const sourceId = 'tedix-finishpoint-radius'
    const element = document.createElement(onFinishPointSelect ? 'button' : 'div')
    if (element instanceof HTMLButtonElement) element.type = 'button'
    element.textContent = onFinishPointSelect ? 'F' : '⚑'
    if (onFinishPointSelect) element.setAttribute('aria-pressed', String(!!finishPointSelected))
    element.setAttribute('aria-label', `FinishPoint: ${finishPoint.name}`)
    element.className = `flex h-12 w-12 items-center justify-center rounded-lg border-4 border-white bg-violet-700 text-2xl text-white shadow-lg ${finishPointSelected ? 'ring-4 ring-emerald-400' : ''}`
    element.onclick = event => { event.stopPropagation(); onFinishPointSelect?.() }
    const marker = new mapboxgl.Marker({ element, ...(onFinishPointMove ? { draggable: true } : {}) }).setLngLat([finishPoint.longitude, finishPoint.latitude]).addTo(map)
    if (onFinishPointMove) marker.on('dragend', () => {
      suppressClickUntil.current = Date.now() + 250
      const { lat, lng } = marker.getLngLat()
      onFinishPointMove(lat, lng)
    })
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
  }, [finishPoint, finishPointSelected, onFinishPointSelect, onFinishPointMove, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !walkingRoute) return
    const id = 'tedix-walking-route'
    const draw = () => {
      if (map.getSource(id)) return
      map.addSource(id, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: walkingRoute } })
      map.addLayer({ id, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2563eb', 'line-width': 5, 'line-opacity': .85 } })
    }
    if (map.isStyleLoaded()) draw()
    map.on('style.load', draw)
    const bounds = new mapboxgl.LngLatBounds()
    walkingRoute.coordinates.forEach(point => bounds.extend([point[0], point[1]]))
    map.fitBounds(bounds, { padding: 55, maxZoom: 16 })
    return () => {
      map.off('style.load', draw)
      if (mapRef.current !== map) return
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    }
  }, [walkingRoute, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !routeOverview) return
    const id = 'tedix-route-overview'
    const draw = () => {
      if (map.getSource(id)) return
      map.addSource(id, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: routeOverview } })
      map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': '#64748b', 'line-width': 3, 'line-dasharray': [2, 2] } })
    }
    if (map.isStyleLoaded()) draw()
    map.on('style.load', draw)
    const bounds = new mapboxgl.LngLatBounds()
    routeOverview.coordinates.forEach(point => bounds.extend([point[0], point[1]]))
    map.fitBounds(bounds, { padding: 55, maxZoom: 16 })
    return () => {
      map.off('style.load', draw)
      if (mapRef.current !== map) return
      if (map.getLayer(id)) map.removeLayer(id)
      if (map.getSource(id)) map.removeSource(id)
    }
  }, [routeOverview, accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !fitLandmarkReferences || didFitLandmarks.current) return
    const points = landmarkReferences?.filter(point => Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180 && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90)
    if (!points?.length) return
    const bounds = new mapboxgl.LngLatBounds()
    points.forEach(point => bounds.extend([point.longitude, point.latitude]))
    // Runs after the authored overview's initial fit. Selection and editing do not refit references.
    // Keep the northernmost reference clear of the location-search overlay.
    map.fitBounds(bounds, { padding: locationSearch ? { top: 180, bottom: 64, left: 64, right: 64 } : 64, maxZoom: 16, duration: 0 })
    didFitLandmarks.current = true
  }, [landmarkReferences, fitLandmarkReferences, locationSearch, accessToken])

  return (
    <div className={`relative h-full min-h-[300px] w-full ${positionPins ? 'flex flex-col' : ''} ${className}`}>
      {landmarkReference && <p className="absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-white p-2 text-xs font-bold text-blue-900">R · Landmark reference only: {landmarkReference.name}. Not an arrival location.</p>}
      {accessToken && mapLoading && !mapError && <p role="status" className={`absolute left-2 ${positionPins ? 'bottom-14' : 'top-2'} z-10 rounded-lg bg-white p-2 text-sm`}>Loading map…</p>}
      {mapError && <p role="alert" className={`absolute left-2 right-2 ${positionPins ? 'bottom-14' : 'top-2'} z-10 rounded-lg bg-white p-3 text-sm text-red-700`}>{mapError}</p>}
      {accessToken && locationSearch && <MapboxLocationSearch compact={!!positionPins} inline={false} accessToken={accessToken} locationLabel={positionPins ? undefined : selectedLocationLabel} onSelect={({ center }) => {
        if (onSearchPosition) onSearchPosition(center[1], center[0])
        else mapRef.current?.flyTo({ center, zoom: 14 })
      }} />}
      {positionPins && !hideFitPositionsControl && <button type="button" disabled={!positionPins.length} className="absolute bottom-10 right-3 z-10 min-h-11 rounded-lg bg-white px-3 text-sm font-bold shadow disabled:opacity-50" onClick={() => fitPositions()}>Fit route</button>}
      {accessToken ? (
        <div ref={containerRef} className={positionPins ? "min-h-[300px] w-full flex-1" : "h-full min-h-[300px] w-full"} aria-label="Map" />
      ) : (
        <p role="status">Map unavailable. Configure VITE_MAPBOX_ACCESS_TOKEN with a public Mapbox access token and restart the application.</p>
      )}
    </div>
  )
}
