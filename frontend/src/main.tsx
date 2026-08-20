import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Progressive Web App service worker
registerServiceWorker();
