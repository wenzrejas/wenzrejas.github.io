import { useEffectEvent, useLayoutEffect, type RefObject } from 'react'

export function useResizeEffect(
  ref: RefObject<Element | null>,
  onResize: (width: number, height: number) => void
) {
  const handleResize = useEffectEvent(onResize)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      handleResize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
}
