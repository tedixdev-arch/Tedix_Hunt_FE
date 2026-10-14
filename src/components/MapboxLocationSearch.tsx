import { useEffect, useId, useRef, useState } from 'react'

export type MapboxLocation = { center: [number, number]; bbox?: [number, number, number, number] }
type Suggestion = { mapbox_id: string; name: string; full_address?: string; place_formatted?: string }
type Props = {
  proximity?: [number, number]
  compact?: boolean
  inline?: boolean
  locationLabel?: string
  accessToken: string
  /** Receives temporary coordinates only; callers decide how to move their map. */
  onSelect: (location: MapboxLocation) => void
}

export function MapboxLocationSearch({ accessToken, onSelect, locationLabel, inline = false, compact = false, proximity }: Props) {
  const id = useId()
  const session = useRef(crypto.randomUUID())
  const request = useRef<AbortController | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [retrieving, setRetrieving] = useState(false)
  const selectionPending = useRef(false)

  useEffect(() => {
    if (!open || query.trim().length < 2) return
    const controller = new AbortController()
    request.current = controller
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), access_token: accessToken, session_token: session.current, limit: '5' })
        if (proximity) params.set('proximity', proximity.join(','))
        const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params}`, { signal: controller.signal })
        if (controller.signal.aborted) return
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403 ? 'Mapbox search authorization failed. Check the configured token and allowed URLs.' : response.status === 429 ? 'Mapbox search limit reached. Try again later.' : 'Location search unavailable. Please try again.')
        }
        const data = await response.json() as { suggestions: Suggestion[] }
        if (controller.signal.aborted) return
        if (!Array.isArray(data.suggestions)) throw new Error('Location search returned an invalid response. Try again.')
        setSuggestions(data.suggestions)
        setStatus(data.suggestions.length ? '' : 'No locations found.')
      } catch (error) {
        if (!controller.signal.aborted) { setSuggestions([]); setStatus(error instanceof Error && error.message.startsWith('Mapbox') ? error.message : 'Location search unavailable. Please try again.') }
      }
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open, accessToken, proximity?.[0], proximity?.[1]])

  useEffect(() => () => request.current?.abort(), [])

  async function select(suggestion: Suggestion) {
    if (selectionPending.current) return
    selectionPending.current = true
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setRetrieving(true)
    setStatus('Loading location…')
    try {
      const params = new URLSearchParams({ access_token: accessToken, session_token: session.current })
      const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Mapbox search authorization failed. Check the configured token and allowed URLs.' : 'Location search unavailable. Please try again.')
      const data = await response.json() as { features?: { geometry?: { coordinates?: number[] }; bbox?: number[] }[] }
      const feature = data.features?.[0]
      const coordinates = feature?.geometry?.coordinates
      if (!coordinates || coordinates.length < 2 || !coordinates.slice(0, 2).every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90) throw new Error('Missing coordinates')
      if (controller.signal.aborted) return
      const bounds = feature?.bbox
      const bbox = bounds?.length === 4 && bounds.every(Number.isFinite)
        && bounds[0] >= -180 && bounds[2] <= 180 && bounds[1] >= -90 && bounds[3] <= 90
        && bounds[0] <= bounds[2] && bounds[1] <= bounds[3]
        ? bounds as MapboxLocation['bbox'] : undefined
      onSelect({ center: [coordinates[0], coordinates[1]], bbox })
      session.current = crypto.randomUUID()
      setActive(-1)
      setQuery(suggestion.name)
      setOpen(false)
      setSuggestions([])
      setStatus('Location selected.')
    } catch (error) {
      if (!controller.signal.aborted) setStatus(error instanceof Error && error.message.startsWith('Mapbox') ? error.message : 'Location search unavailable. Please try again.')
    } finally {
      if (request.current === controller) { selectionPending.current = false; setRetrieving(false) }
    }
  }

  function dismiss() {
    request.current?.abort()
    setOpen(false)
    setActive(-1)
    selectionPending.current = false
    setRetrieving(false)
    setStatus('')
  }

  return (
    <div className={inline ? "relative z-30 w-full shrink-0 bg-white p-2 text-gray-900 shadow" : `absolute left-3 top-3 z-30 ${compact ? 'w-[calc(100%_-_1.5rem)]' : 'w-[calc(100%_-_6rem)]'} max-w-sm rounded bg-white p-2 text-gray-900 shadow`}>
      <label htmlFor={id} className={compact ? "sr-only" : undefined}>Search locations</label>
      {locationLabel && <p className="my-1 break-words text-xs" aria-live="polite">{locationLabel}</p>}
      {/* Keep focus during retrieval: leaving the search dismisses and aborts the request. */}
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open && suggestions.length > 0}
        aria-controls={`${id}-results`} aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
        placeholder={compact ? "Search landmark or address…" : "City, street, address or landmark"} value={query} readOnly={retrieving} aria-busy={retrieving}
        className="min-h-11 w-full rounded border p-2"
        onChange={(event) => {
          request.current?.abort()
          setQuery(event.target.value)
          setSuggestions([])
          setActive(-1)
          setOpen(true)
          setStatus(event.target.value.trim().length >= 2 ? 'Searching…' : '')
        }}
        onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) dismiss() }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') dismiss()
          if (open && suggestions.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            setActive(index => index < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
          }
          if (!retrieving && event.key === 'Enter' && open && active >= 0) { event.preventDefault(); void select(suggestions[active]) }
        }} />
      {status && <p className="text-xs" role="status" aria-live="polite">{status}</p>}
      {open && suggestions.length > 0 && <ul id={`${id}-results`} role="listbox" aria-label="Locations" className="max-h-64 overflow-y-auto overscroll-contain">
        {suggestions.map((suggestion, index) => <li key={suggestion.mapbox_id} id={`${id}-${index}`} role="option" aria-selected={active === index}>
          <button type="button" disabled={retrieving} className={`min-h-11 w-full p-2 text-left ${active === index ? 'bg-gray-100' : ''}`}
            onPointerDown={event => event.preventDefault()}
            onClick={() => void select(suggestion)} onBlur={(event) => { if (!event.currentTarget.closest('ul')?.parentElement?.contains(event.relatedTarget)) dismiss() }}>
            <strong>{suggestion.name}</strong><span className="block text-sm">{suggestion.full_address || suggestion.place_formatted}</span>
          </button>
        </li>)}
      </ul>}
      <a className="text-xs" href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Search by Mapbox</a>
    </div>
  )
}
