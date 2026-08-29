import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA Service Worker Registration
if ('serviceWorker' in navigator && !window.location.host.startsWith('localhost:3000')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[TropicalOS PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[TropicalOS PWA] Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
