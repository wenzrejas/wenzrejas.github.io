import { useSyncExternalStore } from 'react'

const compact = window.matchMedia('(max-width: 767px), (max-height: 500px)')
const sheetLayout = window.matchMedia('(max-width: 1023px), (max-height: 500px)')

const isCompactLayout = () => compact.matches

export const isSheetLayout = () => sheetLayout.matches

const subscribeTo = (query: MediaQueryList) => (onChange: () => void) => {
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const subscribeCompactLayout = subscribeTo(compact)
const subscribeSheetLayout = subscribeTo(sheetLayout)

export const useCompactLayout = () => useSyncExternalStore(subscribeCompactLayout, isCompactLayout)

export const useSheetLayout = () => useSyncExternalStore(subscribeSheetLayout, isSheetLayout)
