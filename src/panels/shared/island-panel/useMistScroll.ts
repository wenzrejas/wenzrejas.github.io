import { useMemo, type RefObject } from 'react'
import { useScrollOverflowVariables } from '@/hooks/useScrollOverflowVariables'
import { mistMaskStyle } from './mistModel'

export function useMistScroll(ref: RefObject<HTMLElement | null>) {
  useScrollOverflowVariables(ref)
  return useMemo(() => mistMaskStyle(), [])
}
