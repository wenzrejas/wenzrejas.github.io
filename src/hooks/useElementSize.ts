import { useState, type RefObject } from 'react'
import { useResizeEffect } from './useResizeEffect'

export interface ElementSize {
  width: number
  height: number
}

export function useElementSize(ref: RefObject<Element | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useResizeEffect(ref, (width, height) => {
    setSize((previous) =>
      previous.width === width && previous.height === height ? previous : { width, height }
    )
  })

  return size
}
