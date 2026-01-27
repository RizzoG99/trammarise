import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import './index.css';
import './i18n'; // Initialize i18n
import { ThemeProvider } from './context/ThemeContext';
import { ApiKeyProvider } from './context/ApiKeyContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="trammarise-theme">
        <ApiKeyProvider>
          <App />
        </ApiKeyProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
