import { useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from 'react'
import { CAROUSEL_DRAG_THRESHOLD_PIXELS } from './constants'

interface DragGesture {
  pointerId: number
  startX: number
  startScrollLeft: number
  hasMoved: boolean
}

export function useDragToScroll(trackRef: RefObject<HTMLElement | null>, onRelease: () => void) {
  const gestureRef = useRef<DragGesture | null>(null)
  const wasDraggedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const track = trackRef.current
    if (!track || event.pointerType !== 'mouse' || event.button !== 0) return
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      hasMoved: false,
    }
    wasDraggedRef.current = false
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    const track = trackRef.current
    if (!gesture || !track || event.pointerId !== gesture.pointerId) return
    const distance = event.clientX - gesture.startX
    if (!gesture.hasMoved) {
      if (Math.abs(distance) < CAROUSEL_DRAG_THRESHOLD_PIXELS) return
      gesture.hasMoved = true
      track.setPointerCapture(event.pointerId)
      setIsDragging(true)
    }
    track.scrollLeft = gesture.startScrollLeft - distance
  }

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    gestureRef.current = null
    if (!gesture.hasMoved) return
    wasDraggedRef.current = true
    setIsDragging(false)
    onRelease()
  }

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!wasDraggedRef.current) return
    wasDraggedRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return {
    isDragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
    },
  }
}
