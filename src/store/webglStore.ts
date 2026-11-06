import { create } from 'zustand'

const IS_FAILURE_PREVIEW = import.meta.env.DEV && window.location.hash.includes('no-webgl')

const canCreateWebglContext = () => document.createElement('canvas').getContext('webgl2') !== null

export type FailureReason = 'graphics' | 'crash'

interface WebglState {
  hasFailed: boolean
  reason: FailureReason
}

export const useWebglStore = create<WebglState>(() => ({
  hasFailed: IS_FAILURE_PREVIEW || !canCreateWebglContext(),
  reason: 'graphics',
}))

export const reportWebglFailure = (reason: FailureReason = 'graphics') =>
  useWebglStore.setState({ hasFailed: true, reason })
