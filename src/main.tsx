import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import './index.css'
import './shared/theme/theme.css';
import './shared/theme/global.css';
import { AuthProvider } from './app/providers/AuthProvider';

// An open SPA keeps executing its loaded JavaScript after a newly deployed
// service worker takes control. Reload that client once so client-side route
// changes cannot keep running an obsolete bundle against newer API contracts.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider><RouterProvider router={router} /></AuthProvider>
  </StrictMode>,
);
