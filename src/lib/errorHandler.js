/**
 * Global Error Handler
 * Sets up listeners for unhandled errors and promise rejections
 * Reports all errors to PostHog for monitoring
 */

import { captureException } from './posthog';

let isInitialized = false;

/**
 * Initialize global error handlers
 */
export const initErrorHandlers = () => {
  if (isInitialized) {
    return;
  }

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);

    captureException(error, {
      error_type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Don't prevent default error handling
    return false;
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    captureException(error, {
      error_type: 'unhandled_promise_rejection',
      promise: event.promise,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }
  });

  // Handle console errors (optional - captures console.error calls)
  if (import.meta.env.PROD) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);

      // Capture the error if it's an Error object
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg) {
        captureException(errorArg, {
          error_type: 'console_error',
          args: args.map(arg =>
            arg instanceof Error ? arg.message : String(arg)
          ).join(' '),
        });
      }
    };
  }

  isInitialized = true;
  console.log('✅ Global error handlers initialized');
};

/**
 * Manually capture an error with context
 */
export const reportError = (error, context = {}) => {
  captureException(error, {
    ...context,
    error_type: 'manual_report',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Create an error wrapper for async functions
 */
export const withErrorHandler = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, {
        ...context,
        error_type: 'wrapped_async_error',
        function_name: fn.name || 'anonymous',
      });
      throw error; // Re-throw to allow normal error handling
    }
  };
};

/**
 * Error boundary helper for class components
 */
export const createErrorBoundaryLogger = (componentName) => {
  return (error, errorInfo) => {
    captureException(error, {
      error_type: 'react_error_boundary',
      component_name: componentName,
      component_stack: errorInfo?.componentStack || '',
    });
  };
};

export default {
  initErrorHandlers,
  reportError,
  withErrorHandler,
  createErrorBoundaryLogger,
};
