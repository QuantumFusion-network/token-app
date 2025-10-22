import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  componentName?: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Component Error Boundary (${this.props.componentName}) caught an error:`,
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
        <div className="border-destructive/20 bg-destructive/5 rounded border p-3 text-sm">
          <span className="text-destructive font-medium">
            {this.props.componentName
              ? `${this.props.componentName} Error`
              : 'Component Error'}
          </span>
          <p className="text-muted-foreground mt-1">
            Unable to render this component.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
