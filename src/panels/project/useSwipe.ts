import { useRef, type MouseEvent, type PointerEvent } from 'react'
import { PREVIEW_SWIPE_PIXELS } from './constants'

interface SwipeGesture {
  pointerId: number
  startX: number
  startY: number
}

export function useSwipe(onSwipe: (shift: 1 | -1) => void) {
  const gestureRef = useRef<SwipeGesture | null>(null)
  const wasSwipedRef = useRef(false)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' || gestureRef.current) return
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
    wasSwipedRef.current = false
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    gestureRef.current = null
    const distanceX = event.clientX - gesture.startX
    const distanceY = event.clientY - gesture.startY
    if (Math.abs(distanceX) < PREVIEW_SWIPE_PIXELS || Math.abs(distanceX) < Math.abs(distanceY))
      return
    wasSwipedRef.current = true
    onSwipe(distanceX < 0 ? 1 : -1)
  }

  const onPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerId === gestureRef.current?.pointerId) gestureRef.current = null
  }

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!wasSwipedRef.current) return
    wasSwipedRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return { onPointerDown, onPointerUp, onPointerCancel, onClickCapture }
}
