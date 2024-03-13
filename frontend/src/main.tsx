import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// import Application wide context providers
import { SettingsProvider } from "./context/SettingsContext"
import { LookupDataProvider } from './context/LookupDataContext';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <SettingsProvider>
        <LookupDataProvider>
          <App />
        </LookupDataProvider>
      </SettingsProvider>
  </React.StrictMode>,
)
