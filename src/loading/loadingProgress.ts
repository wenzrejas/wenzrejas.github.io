import { LOADING_TASKS, type LoadingTask } from '@/store/loadingStore'
import { stagePace } from './loadingMessages'

export function loadedShare(downloadPercent: number, pendingTasks: readonly LoadingTask[]) {
  if (pendingTasks.length === 0) return 1
  const downloads = pendingTasks.includes('scene') ? downloadPercent / 100 : 1
  const finishedTasks = LOADING_TASKS.length - pendingTasks.length
  return (downloads + finishedTasks) / (LOADING_TASKS.length + 1)
}

export function advanceProgress(shown: number, goal: number, seconds: number) {
  if (goal <= shown) return shown
  return Math.min(goal, shown + stagePace(shown) * seconds)
}
