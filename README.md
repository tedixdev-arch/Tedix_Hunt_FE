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
