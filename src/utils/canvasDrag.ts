interface CanvasDragHandlers {
  canStart: (event: PointerEvent) => boolean
  onStart: (event: PointerEvent) => void
  onMove: (event: PointerEvent) => void
  onRelease: (event: PointerEvent) => void
  onCancel: () => void
}

export function followCanvasDrag(canvas: HTMLCanvasElement, handlers: CanvasDragHandlers) {
  const listening = new AbortController()
  const { signal } = listening
  let pointerId: number | null = null

  const letGo = () => {
    if (pointerId !== null && canvas.hasPointerCapture(pointerId)) {
      canvas.releasePointerCapture(pointerId)
    }
    pointerId = null
  }
  const cancel = () => {
    letGo()
    handlers.onCancel()
  }
  const cancelOwnPointer = (event: PointerEvent) => {
    if (event.pointerId === pointerId) cancel()
  }

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (pointerId !== null || !handlers.canStart(event)) return
      pointerId = event.pointerId
      canvas.setPointerCapture(pointerId)
      handlers.onStart(event)
    },
    { signal }
  )
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerId === pointerId) handlers.onMove(event)
    },
    { signal }
  )
  canvas.addEventListener(
    'pointerup',
    (event) => {
      if (event.pointerId !== pointerId) return
      letGo()
      handlers.onRelease(event)
    },
    { signal }
  )
  canvas.addEventListener('pointercancel', cancelOwnPointer, { signal })
  canvas.addEventListener('lostpointercapture', cancelOwnPointer, { signal })
  window.addEventListener('blur', cancel, { signal })
  window.addEventListener('resize', cancel, { signal })
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) cancel()
    },
    { signal }
  )

  return {
    cancel,
    unbind: () => {
      cancel()
      listening.abort()
    },
  }
}
