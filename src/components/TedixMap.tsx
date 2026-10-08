import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapboxLocationSearch } from './MapboxLocationSearch'

export type TedixMapProps = {
  initialLongitude: number
  initialLatitude: number
  initialZoom?: number
  mapStyle?: string
  /** Enable temporary location search; selection only moves the mounted map. */
  locationSearch?: boolean
  className?: string
}

export function TedixMap({
  initialLongitude,
  initialLatitude,
  initialZoom = 12,
  mapStyle = 'mapbox://styles/mapbox/streets-v12',
  className = '',
  locationSearch = false,
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
