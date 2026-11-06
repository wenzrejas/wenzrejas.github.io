import { Component, type ReactNode } from 'react'

interface FailureBoundaryProps {
  onError: (error: unknown) => void
  children: ReactNode
}

interface FailureBoundaryState {
  hasFailed: boolean
}

export default class FailureBoundary extends Component<FailureBoundaryProps, FailureBoundaryState> {
  override state: FailureBoundaryState = { hasFailed: false }

  static getDerivedStateFromError(): FailureBoundaryState {
    return { hasFailed: true }
  }

  override componentDidCatch(error: unknown) {
    console.error(error)
    this.props.onError(error)
  }

  override render() {
    return this.state.hasFailed ? null : this.props.children
  }
}
