import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './lib/firebase';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for PWA installability and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true });
  } catch {
    // Non-blocking in environments without active service workers
  }
}

// Validate connection to Firestore on initial boot
testConnection();

createRoot(document.getElementById('root')!).render(<App />);
