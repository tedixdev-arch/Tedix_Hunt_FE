# Tedix Hunt FE

A React + TypeScript Progressive Web App, built with Vite and organized around a feature-based
architecture. Includes role-specific authentication flows and a landing page.

## Scripts

- `npm run dev` - start the Vite development server.
- `npm run build` - type-check and build for production (outputs to `dist/`, includes the PWA
  service worker and manifest).
- `npm run preview` - serve the production build locally.

## Architecture

```text
index.html          Vite entry point
vite.config.ts       Vite config, including the PWA plugin (manifest + service worker)
src/
  main.tsx           App bootstrap
  app/               Application composition: root component, navigation, providers
  components/
    layout/          Page shell/layout components
    ui/               Reusable, presentation-only UI components
  features/           Domain or screen-level modules (auth, landing, ...)
  shared/
    theme/            CSS custom properties (colors, spacing) and global styles
public/                Static assets served as-is (favicon, PWA icons)
```

## PWA

The app is installable and works offline via a generated service worker
([vite-plugin-pwa](https://vite-pwa-org.netlify.app/)). Manifest fields (name, icons, theme
color, etc.) are configured in `vite.config.ts`.

## Shared Mapbox foundation

`src/components/TedixMap.tsx` provides geographic rendering and normal Mapbox pan/zoom.
Set `VITE_MAPBOX_ACCESS_TOKEN` in your local environment (see `.env.example`) and restart
Vite. Use a public token; Vite includes it in the browser bundle. Without a token,
the component displays a configuration message.

```tsx
<TedixMap initialLongitude={23.59} initialLatitude={46.77} initialZoom={12} />
```

The container fills its parent with a 300px minimum height. Give the parent a height
for a taller map, or use `className` for layout. Container size changes resize the map.
`mapStyle` accepts a Mapbox style URL and can change without replacing the map.
Camera props are initial values; rerenders preserve the user's camera.

This foundation can later serve Creator HuntMapEditor, Creator/Admin/Organizer
HuntMapPreview, Participant HuntGameMap, and Organizer/Supervisor/Admin LiveHuntMap.
Those wrappers are not implemented here. Mapbox owns geographic presentation;
TedixHunt owns game rules and runtime state, with PostgreSQL/backend authoritative.
The future Participant runtime will keep one mounted game map per active Hunt
session, even while navigation hides or covers it. This component adds no runtime
navigation or game behavior and leaves the existing Leaflet editor in place.

`npm test` runs the existing Node tests followed by mocked Mapbox component tests
in Vitest/jsdom. These unit tests do not require a real token or network access.

### Location search (F5 / Mapbox M1b)

Enable search on the shared map with
`<TedixMap initialLongitude={23.59} initialLatitude={46.77} locationSearch />`.
The optional `locationSearch` prop defaults to false. Selection calls `flyTo`
on that component's existing map with the returned longitude/latitude and zoom 14;
initial camera props and style lifecycle retain their existing behavior.

`MapboxLocationSearch` is also reusable separately: pass the configured public
`accessToken` and an `onSelect({ center: [longitude, latitude] })` callback.
The callback only receives temporary coordinates. Search never creates checkpoints,
FinishPoints, templates or backend requests. The Leaflet Creator is unaffected.

Set `VITE_MAPBOX_ACCESS_TOKEN` to a public Mapbox token and restart Vite. Search uses
Mapbox Search Box `/suggest` and `/retrieve`, sharing a session token until selection,
with requests debounced by 300 ms after two characters. It supports cities, streets,
addresses and landmarks/POIs where Mapbox has coverage. Results are temporary and
must not be persisted; account access, billing and applicable Search Box terms apply.
Keep the Search by Mapbox link and Mapbox GL's default attribution visible. Restrict
public tokens to intended deployment URLs; never configure a secret token here.

Use arrow keys/Enter or tap a result; Escape dismisses results. Loading, empty and
failure messages are announced. Provider requests and Mapbox GL are mocked in tests;
real rendering, geographic coverage and search require browser verification with a
configured public token.
