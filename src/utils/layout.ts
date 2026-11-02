import { useSyncExternalStore } from 'react'

const compact = window.matchMedia('(max-width: 767px), (max-height: 500px)')
const sheetLayout = window.matchMedia('(max-width: 1023px), (max-height: 500px)')
const sheetPortrait = window.matchMedia('(max-width: 1023px) and (orientation: portrait)')
const depthsFitted = window.matchMedia('(max-width: 1365px), (max-height: 639px)')

const isCompactLayout = () => compact.matches
const isSheetPortrait = () => sheetPortrait.matches
const isDepthsFitted = () => depthsFitted.matches

export const isSheetLayout = () => sheetLayout.matches

const subscribeTo = (query: MediaQueryList) => (onChange: () => void) => {
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const subscribeCompactLayout = subscribeTo(compact)
const subscribeSheetLayout = subscribeTo(sheetLayout)
const subscribeSheetPortrait = subscribeTo(sheetPortrait)
const subscribeDepthsFitted = subscribeTo(depthsFitted)

export const useCompactLayout = () => useSyncExternalStore(subscribeCompactLayout, isCompactLayout)

export const useSheetLayout = () => useSyncExternalStore(subscribeSheetLayout, isSheetLayout)

export const useSheetPortrait = () => useSyncExternalStore(subscribeSheetPortrait, isSheetPortrait)

export const useDepthsFitted = () => useSyncExternalStore(subscribeDepthsFitted, isDepthsFitted)
