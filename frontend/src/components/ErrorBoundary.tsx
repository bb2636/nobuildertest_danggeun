import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary', error, errorInfo.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
          <p className="text-body-16 text-gray-100 font-medium mb-2">문제가 발생했어요</p>
          <p className="text-body-14 text-gray-60 text-center mb-6">
            잠시 후 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 rounded-lg bg-point-0 text-white text-body-14 font-medium"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
