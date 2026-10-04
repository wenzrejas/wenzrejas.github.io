import { create } from 'zustand'

const LOADING_TASKS = ['scene', 'assets', 'panels'] as const

export type LoadingTask = (typeof LOADING_TASKS)[number]

interface LoadingState {
  pendingTasks: LoadingTask[]
}

export const useLoadingStore = create<LoadingState>(() => ({
  pendingTasks: [...LOADING_TASKS],
}))

export const hasPendingTasks = ({ pendingTasks }: LoadingState) => pendingTasks.length > 0

export function finishLoadingTask(task: LoadingTask) {
  useLoadingStore.setState(({ pendingTasks }) => ({
    pendingTasks: pendingTasks.filter((pending) => pending !== task),
  }))
}

export const isLoading = () => hasPendingTasks(useLoadingStore.getState())
