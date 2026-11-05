import { JOYSTICK_DEAD_ZONE, JOYSTICK_RADIUS } from '../constants'

export function joystickOffset(deltaX: number, deltaY: number) {
  const distance = Math.hypot(deltaX, deltaY)
  const scale = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1
  const knobX = deltaX * scale
  const knobY = deltaY * scale
  const share = Math.min(1, distance / JOYSTICK_RADIUS)
  const speed = Math.max(0, (share - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE))
  return {
    knobX,
    knobY,
    x: distance > 0 ? (deltaX / distance) * speed : 0,
    y: distance > 0 ? (-deltaY / distance) * speed : 0,
  }
}
