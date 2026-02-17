import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('🔴 Error Boundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to logging service (e.g., Sentry, LogRocket)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state and try to recover
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // Full page reload as last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white border border-white/20">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-3">
              Oops! Qualcosa è andato storto
            </h1>

            {/* Description */}
            <p className="text-white/80 text-center mb-6">
              Si è verificato un errore inaspettato durante l'esecuzione del gioco.
              Non preoccuparti, i tuoi dati sono al sicuro!
            </p>

            {/* Error Details (Collapsible in production) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-black/30 rounded-lg p-4 text-xs">
                <summary className="cursor-pointer font-semibold mb-2 text-red-300">
                  🔍 Dettagli Errore (Dev Mode)
                </summary>
                <div className="text-red-200 font-mono overflow-auto max-h-40">
                  <p className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                Torna al Menu
              </button>

              <button
                onClick={this.handleReload}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-white/30"
              >
                <RefreshCw className="w-5 h-5" />
                Ricarica App
              </button>
            </div>

            {/* Help Text */}
            <p className="text-center text-white/60 text-sm mt-6">
              Se il problema persiste, prova a svuotare la cache del browser
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
