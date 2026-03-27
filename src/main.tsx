import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker - works for both APK and PWA/GitHub Pages
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Get base path (works for both '/' and '/repo-name/')
    const swUrl = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}

// Prevent double-tap zoom on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) event.preventDefault();
  lastTouchEnd = now;
}, false);

// Disable context menu on long press
document.addEventListener('contextmenu', (e) => e.preventDefault());

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
