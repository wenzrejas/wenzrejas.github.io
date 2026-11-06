import { create } from 'zustand'
import { trackEvent } from '@/analytics/analytics'
import { IS_DEBUG } from '@/app/experience/constants'

export const LOADING_TASKS = ['scene', 'assets', 'panels'] as const

export type LoadingTask = (typeof LOADING_TASKS)[number]

interface LoadingState {
  pendingTasks: LoadingTask[]
  hasSetSail: boolean
  descentStartedAt: number | null
  isLoaderGone: boolean
}

export const useLoadingStore = create<LoadingState>(() => ({
  pendingTasks: [...LOADING_TASKS],
  hasSetSail: IS_DEBUG,
  descentStartedAt: null,
  isLoaderGone: IS_DEBUG,
}))

export function finishLoadingTask(task: LoadingTask) {
  const { pendingTasks } = useLoadingStore.getState()
  if (!pendingTasks.includes(task)) return
  const stillPending = pendingTasks.filter((pending) => pending !== task)
  useLoadingStore.setState({ pendingTasks: stillPending })
  if (stillPending.length === 0)
    trackEvent('loading_completed', { load_seconds: Math.round(performance.now() / 1000) })
}

export const setSail = () => useLoadingStore.setState({ hasSetSail: true })

export const beginDescent = () => useLoadingStore.setState({ descentStartedAt: performance.now() })

export const dismissLoader = () => useLoadingStore.setState({ isLoaderGone: true })

export const isLoaderShowing = () => !useLoadingStore.getState().isLoaderGone
