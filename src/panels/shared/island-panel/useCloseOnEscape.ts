import { useEffect } from 'react'
import { closePanel } from '@/store/panelStore'
import { isDepthsInView, isWorldInView } from '@/store/viewStore'

export function useCloseOnEscape() {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isWorldInView() || isDepthsInView())) closePanel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])
}
