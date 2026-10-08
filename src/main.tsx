import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './lib/firebase';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for PWA installability and offline support
registerSW({ immediate: true });

// Validate connection to Firestore on initial boot
testConnection();

createRoot(document.getElementById('root')!).render(<App />);
