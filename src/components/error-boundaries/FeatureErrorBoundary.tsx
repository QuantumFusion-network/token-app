import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  featureName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Feature Error Boundary (${this.props.featureName}) caught an error:`,
      error,
      errorInfo
    )
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="border-destructive/20 bg-destructive/5 space-y-2 rounded-lg border p-4 text-left">
          <h3 className="text-destructive font-semibold">
            {this.props.featureName
              ? `${this.props.featureName} Error`
              : 'Feature Error'}
          </h3>
          <p className="text-muted-foreground text-sm">
            This feature encountered an error and cannot be displayed.
          </p>
          {this.state.error && (
            <div className="space-y-2">
              <p className="text-destructive font-mono text-sm break-all">
                {this.state.error.name}: {this.state.error.message}
              </p>
              {this.state.error.stack && (
                <details className="text-xs">
                  <summary className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Stack Trace
                  </summary>
                  <pre className="text-muted-foreground mt-1 max-h-32 overflow-y-auto break-all whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
