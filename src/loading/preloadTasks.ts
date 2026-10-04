import { preloadPanels } from '@/panels/panelPreload'
import { finishLoadingTask, type LoadingTask } from '@/store/loadingStore'
import { PRELOAD_WAIT_LIMIT_SECONDS } from './constants'
import { preloadAssets } from './preloadAssets'

const waitSeconds = (seconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, seconds * 1000))

function finishWithinLimit(task: LoadingTask, preload: Promise<unknown>) {
  Promise.race([preload, waitSeconds(PRELOAD_WAIT_LIMIT_SECONDS)]).then(() =>
    finishLoadingTask(task)
  )
}

export function startPreloads() {
  finishWithinLimit('assets', preloadAssets())
  finishWithinLimit('panels', preloadPanels())
}
