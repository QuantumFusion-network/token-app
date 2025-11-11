import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="max-w-2xl space-y-4 p-4 text-center">
            <h1 className="text-destructive text-2xl font-bold">
              Application Error
            </h1>
            <p className="text-muted-foreground">
              Something went wrong. Please refresh the page or try again later.
            </p>
            {this.state.error && (
              <div className="bg-destructive/5 border-destructive/20 space-y-2 rounded-lg border p-4 text-left">
                <h3 className="text-destructive font-semibold">
                  Error Details:
                </h3>
                <p className="text-destructive font-mono text-sm break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="text-xs">
                    <summary className="text-muted-foreground hover:text-foreground cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-muted-foreground mt-2 break-all whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
