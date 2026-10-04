import { useLayoutEffect, type RefObject } from 'react'

export function useScrollOverflowVariables(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const hiddenBelow = element.scrollHeight - element.clientHeight - element.scrollTop
      element.style.setProperty('--hidden-above', `${Math.max(0, element.scrollTop)}px`)
      element.style.setProperty('--hidden-below', `${Math.max(0, hiddenBelow)}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    element.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', measure)
    }
  }, [ref])
}
