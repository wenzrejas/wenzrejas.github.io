import { JOYSTICK_DEAD_ZONE, JOYSTICK_RADIUS } from '../constants'

export function joystickOffset(dx: number, dy: number) {
  const distance = Math.hypot(dx, dy)
  const scale = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1
  const knobX = dx * scale
  const knobY = dy * scale
  const share = Math.min(1, distance / JOYSTICK_RADIUS)
  const speed = Math.max(0, (share - JOYSTICK_DEAD_ZONE) / (1 - JOYSTICK_DEAD_ZONE))
  return {
    knobX,
    knobY,
    x: distance > 0 ? (dx / distance) * speed : 0,
    y: distance > 0 ? (-dy / distance) * speed : 0,
  }
}
