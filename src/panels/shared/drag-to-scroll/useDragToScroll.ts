import {
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import { DRAG_THRESHOLD_PIXELS } from './constants'

interface DragGesture {
  pointerId: number
  startX: number
  startScrollLeft: number
  hasMoved: boolean
}

export function useDragToScroll(trackRef: RefObject<HTMLElement | null>, onRelease?: () => void) {
  const gestureRef = useRef<DragGesture | null>(null)
  const wasDraggedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const track = trackRef.current
    if (!track || event.pointerType !== 'mouse' || event.button !== 0) return
    wasDraggedRef.current = false
    if (track.scrollWidth <= track.clientWidth) return
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      hasMoved: false,
    }
  }

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    gestureRef.current = null
    if (!gesture.hasMoved) return
    wasDraggedRef.current = event.type === 'pointerup'
    setIsDragging(false)
    onRelease?.()
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    const track = trackRef.current
    if (!gesture || !track || event.pointerId !== gesture.pointerId) return
    if (event.buttons === 0) {
      endDrag(event)
      return
    }
    const distance = event.clientX - gesture.startX
    if (!gesture.hasMoved) {
      if (Math.abs(distance) < DRAG_THRESHOLD_PIXELS) return
      gesture.hasMoved = true
      track.setPointerCapture(event.pointerId)
      setIsDragging(true)
    }
    track.scrollLeft = gesture.startScrollLeft - distance
  }

  const onDragStart = (event: DragEvent<HTMLElement>) => event.preventDefault()

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
      onDragStart,
      onClickCapture,
    },
  }
}
