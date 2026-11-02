import { useSyncExternalStore } from 'react'

const isFullscreen = () => Boolean(document.fullscreenElement)

const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

export const useIsFullscreen = () => useSyncExternalStore(subscribeFullscreen, isFullscreen)

export function toggleFullscreen() {
  const change = isFullscreen()
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen()
  change.catch(() => undefined)
}
