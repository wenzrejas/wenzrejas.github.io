import { reportWebglFailure } from '@/store/webglStore'
import { toMilliseconds } from '@/utils/time'
import { CONTEXT_RESTORE_GRACE_SECONDS } from './constants'

export function watchContextLoss(canvas: HTMLCanvasElement) {
  let isLost = false
  let graceTimer = 0

  const restartGrace = () => {
    window.clearTimeout(graceTimer)
    if (isLost && !document.hidden) {
      graceTimer = window.setTimeout(
        reportWebglFailure,
        toMilliseconds(CONTEXT_RESTORE_GRACE_SECONDS)
      )
    }
  }
  const markLost = (next: boolean) => {
    isLost = next
    restartGrace()
  }

  const listening = new AbortController()
  const { signal } = listening
  canvas.addEventListener('webglcontextlost', () => markLost(true), { signal })
  canvas.addEventListener('webglcontextrestored', () => markLost(false), { signal })
  document.addEventListener('visibilitychange', restartGrace, { signal })

  return () => {
    listening.abort()
    window.clearTimeout(graceTimer)
  }
}
