import { create } from 'zustand'
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
  useLoadingStore.setState(({ pendingTasks }) => ({
    pendingTasks: pendingTasks.filter((pending) => pending !== task),
  }))
}

export const setSail = () => useLoadingStore.setState({ hasSetSail: true })

export const beginDescent = () => useLoadingStore.setState({ descentStartedAt: performance.now() })

export const dismissLoader = () => useLoadingStore.setState({ isLoaderGone: true })

export const isLoaderShowing = () => !useLoadingStore.getState().isLoaderGone
