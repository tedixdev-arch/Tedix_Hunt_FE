import { useEffect, useId, useRef, useState } from 'react'

export type MapboxLocation = { center: [number, number] }
type Suggestion = { mapbox_id: string; name: string; full_address?: string; place_formatted?: string }
type Props = {
  accessToken: string
  /** Receives temporary coordinates only; callers decide how to move their map. */
  onSelect: (location: MapboxLocation) => void
}

export function MapboxLocationSearch({ accessToken, onSelect }: Props) {
  const id = useId()
  const session = useRef(crypto.randomUUID())
  const request = useRef<AbortController | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [retrieving, setRetrieving] = useState(false)

  useEffect(() => {
    if (!open || query.trim().length < 2) return
    const controller = new AbortController()
    request.current = controller
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), access_token: accessToken, session_token: session.current, limit: '5' })
        const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json() as { suggestions: Suggestion[] }
        if (controller.signal.aborted) return
        setSuggestions(data.suggestions)
        setStatus(data.suggestions.length ? '' : 'No locations found.')
      } catch {
        if (!controller.signal.aborted) setStatus('Location search unavailable. Please try again.')
      }
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open, accessToken])

  useEffect(() => () => request.current?.abort(), [])

  async function select(suggestion: Suggestion) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setRetrieving(true)
    setStatus('Loading location…')
    try {
      const params = new URLSearchParams({ access_token: accessToken, session_token: session.current })
      const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error('Retrieve failed')
      const data = await response.json() as { features: { geometry: { coordinates: number[] } }[] }
      const coordinates = data.features[0]?.geometry.coordinates
      if (!coordinates || coordinates.length < 2 || !coordinates.slice(0, 2).every(Number.isFinite)) throw new Error('Missing coordinates')
      if (controller.signal.aborted) return
      onSelect({ center: [coordinates[0], coordinates[1]] })
      session.current = crypto.randomUUID()
      setActive(-1)
      setQuery(suggestion.name)
      setOpen(false)
      setSuggestions([])
      setStatus('Location selected.')
    } catch {
      if (!controller.signal.aborted) setStatus('Location search unavailable. Please try again.')
    } finally {
      if (!controller.signal.aborted) setRetrieving(false)
    }
  }

  function dismiss() {
    request.current?.abort()
    setOpen(false)
    setActive(-1)
    setRetrieving(false)
    setStatus('')
  }

  return (
    <div className="absolute left-3 top-3 z-10 w-[calc(100%-6rem)] max-w-sm rounded bg-white p-2 text-gray-900 shadow">
      <label htmlFor={id}>Search locations</label>
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open && suggestions.length > 0}
        aria-controls={`${id}-results`} aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
        placeholder="City, street, address or landmark" value={query} disabled={retrieving}
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
            setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
          }
          if (event.key === 'Enter' && open && active >= 0) { event.preventDefault(); void select(suggestions[active]) }
        }} />
      <p role="status" aria-live="polite">{status}</p>
      {open && suggestions.length > 0 && <ul id={`${id}-results`} role="listbox" aria-label="Locations">
        {suggestions.map((suggestion, index) => <li key={suggestion.mapbox_id} id={`${id}-${index}`} role="option" aria-selected={active === index}>
          <button type="button" disabled={retrieving} className={`min-h-11 w-full p-2 text-left ${active === index ? 'bg-gray-100' : ''}`}
            onClick={() => void select(suggestion)} onBlur={(event) => { if (!event.currentTarget.closest('ul')?.parentElement?.contains(event.relatedTarget)) dismiss() }}>
            <strong>{suggestion.name}</strong><span className="block text-sm">{suggestion.full_address || suggestion.place_formatted}</span>
          </button>
        </li>)}
      </ul>}
      <a className="text-xs" href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Search by Mapbox</a>
    </div>
  )
}
