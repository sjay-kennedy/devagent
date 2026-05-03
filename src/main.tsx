import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import {
  applyThemeToDocument,
  readStoredTheme,
} from './utils/themeStorage';
import App from './App';

applyThemeToDocument(readStoredTheme());

// Mount the DevAgent shell; global tokens + resets load before any component CSS modules.
const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
