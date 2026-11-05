import { preloadPanels } from '@/panels/panelPreload'
import { finishLoadingTask, type LoadingTask } from '@/store/loadingStore'
import { waitSeconds } from '@/utils/time'
import { PRELOAD_WAIT_LIMIT_SECONDS } from './constants'
import { preloadAssets } from './preloadAssets'

function finishWithinLimit(task: LoadingTask, preload: Promise<unknown>) {
  const finish = () => finishLoadingTask(task)
  void Promise.race([preload, waitSeconds(PRELOAD_WAIT_LIMIT_SECONDS)]).then(finish, finish)
}

export function startPreloads() {
  finishWithinLimit('assets', preloadAssets())
  finishWithinLimit('panels', preloadPanels())
}
