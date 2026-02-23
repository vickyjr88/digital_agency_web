import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { trackEvent } from '../../lib/posthog';
import './ErrorBoundary.css';

/**
 * Error Boundary Component
 * Catches React errors and reports them to PostHog
 * Provides fallback UI when errors occur
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Track error in PostHog
    try {
      trackEvent('app_error', {
        error_message: error?.message || 'Unknown error',
        error_name: error?.name || 'Error',
        error_stack: error?.stack || '',
        component_stack: errorInfo?.componentStack || '',
        error_boundary: this.props.name || 'AppErrorBoundary',
        url: window.location.href,
        user_agent: navigator.userAgent,
      });
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>

            <h1>Oops! Something went wrong</h1>

            <p className="error-message">
              {this.props.showDetails && this.state.error
                ? this.state.error.message
                : "We're sorry, but something unexpected happened. Please try again."}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="btn-secondary"
              >
                <RefreshCw size={18} />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="btn-secondary"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn-primary"
              >
                <Home size={18} />
                Go to Homepage
              </button>
            </div>

            {this.state.errorCount > 2 && (
              <div className="error-warning">
                <AlertTriangle size={16} />
                <p>
                  This error has occurred multiple times. Please contact support if the problem persists.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
