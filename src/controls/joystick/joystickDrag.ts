import { interactions } from '@/interaction/interactionManager'
import { useDebugStore } from '@/store/debugStore'
import { useInputStore } from '@/store/inputStore'
import { followCanvasDrag } from '@/utils/canvasDrag'
import { isSailingHeld } from '../sailingInput'
import { joystickOffset } from './joystickModel'

const isDebugCamera = () => {
  const { topView, orbitCamera } = useDebugStore.getState().camera
  return topView || orbitCamera
}

export function bindJoystick(canvas: HTMLCanvasElement, ring: HTMLElement, knob: HTMLElement) {
  const joystick = useInputStore.getState().joystick
  let originX = 0
  let originY = 0

  const hide = () => {
    if (!joystick.isActive) return
    joystick.x = 0
    joystick.y = 0
    joystick.isActive = false
    ring.classList.remove('joystick--active')
    canvas.style.cursor = ''
  }

  const drag = followCanvasDrag(canvas, {
    canStart: (event) =>
      (event.pointerType !== 'mouse' || event.button === 0) &&
      !isSailingHeld() &&
      !isDebugCamera() &&
      !interactions.isMarkerAt(event),
    onStart: (event) => {
      if (event.pointerType === 'mouse') {
        event.preventDefault()
        canvas.style.cursor = 'var(--cursor-grab)'
      }
      originX = event.clientX
      originY = event.clientY
      joystick.isActive = true
      ring.style.left = `${originX}px`
      ring.style.top = `${originY}px`
      knob.style.transform = 'translate(0px, 0px)'
      ring.classList.add('joystick--active')
    },
    onMove: (event) => {
      if (isSailingHeld()) {
        drag.cancel()
        return
      }
      const offset = joystickOffset(event.clientX - originX, event.clientY - originY)
      joystick.x = offset.x
      joystick.y = offset.y
      knob.style.transform = `translate(${offset.knobX}px, ${offset.knobY}px)`
    },
    onRelease: hide,
    onCancel: hide,
  })

  return drag.unbind
}
