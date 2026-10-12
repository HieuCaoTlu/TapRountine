import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Capture PWA install prompt
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as unknown as { deferredPrompt: unknown }).deferredPrompt = e;
  });
}

createRoot(document.getElementById('root')!).render(<App />);
