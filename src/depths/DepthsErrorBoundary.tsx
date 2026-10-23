import { Component, type ReactNode } from 'react'

interface DepthsErrorBoundaryProps {
  onError: () => void
  children: ReactNode
}

interface DepthsErrorBoundaryState {
  hasFailed: boolean
}

export default class DepthsErrorBoundary extends Component<
  DepthsErrorBoundaryProps,
  DepthsErrorBoundaryState
> {
  state: DepthsErrorBoundaryState = { hasFailed: false }

  static getDerivedStateFromError(): DepthsErrorBoundaryState {
    return { hasFailed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
    this.props.onError()
  }

  render() {
    return this.state.hasFailed ? null : this.props.children
  }
}
