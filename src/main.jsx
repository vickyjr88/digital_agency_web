import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { initErrorHandlers } from './lib/errorHandler';
import './index.css';

// Initialize global error handlers
initErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary name="RootErrorBoundary">
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
