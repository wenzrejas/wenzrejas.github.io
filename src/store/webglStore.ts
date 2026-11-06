import { create } from 'zustand'
import { trackEvent } from '@/analytics/analytics'

const IS_FAILURE_PREVIEW = import.meta.env.DEV && window.location.hash.includes('no-webgl')

const canCreateWebglContext = () => document.createElement('canvas').getContext('webgl2') !== null

export type FailureReason = 'graphics' | 'crash'

interface WebglState {
  hasFailed: boolean
  reason: FailureReason
}

const hasNoWebgl = !IS_FAILURE_PREVIEW && !canCreateWebglContext()

export const useWebglStore = create<WebglState>(() => ({
  hasFailed: IS_FAILURE_PREVIEW || hasNoWebgl,
  reason: 'graphics',
}))

if (hasNoWebgl) trackEvent('webgl_failed', { reason: 'graphics' })

export function reportWebglFailure(reason: FailureReason = 'graphics') {
  if (!useWebglStore.getState().hasFailed) trackEvent('webgl_failed', { reason })
  useWebglStore.setState({ hasFailed: true, reason })
}
