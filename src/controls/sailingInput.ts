import { MathUtils } from 'three'
import { FORWARD_RISE, GROUND_FORWARD, SCREEN_RIGHT } from '@/app/experience/cameraFraming'
import type { Keys } from '@/hooks/useKeyboardInput'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { isIntroductionPending } from '@/store/guideStore'
import { useInputStore } from '@/store/inputStore'
import { isPanelOpen } from '@/store/panelStore'
import { isWorldInView } from '@/store/viewStore'
import { wrapAngle } from '@/utils/math'
import { STEER_FULL_ANGLE, STEER_MIN_THROTTLE } from './constants'

const IDLE_INPUT = { throttle: 0, turn: 0, steering: 0 }

export const isSailingHeld = () =>
  isIntroductionPending() || isCinematicPlaying() || isPanelOpen() || !isWorldInView()

export function sailingInput(keys: Keys, heading: number) {
  if (isSailingHeld()) return IDLE_INPUT

  if (keys.forward || keys.backward || keys.left || keys.right) {
    return {
      throttle: keys.forward ? 1 : keys.backward ? -1 : 0,
      turn: Number(keys.left) - Number(keys.right),
      steering: keys.left ? 1 : keys.right ? -1 : 0,
    }
  }

  const { x, y } = useInputStore.getState().joystick
  const length = Math.hypot(x, y)
  if (length === 0) return IDLE_INPUT

  const groundX = SCREEN_RIGHT.x * x + GROUND_FORWARD.x * (y / FORWARD_RISE)
  const groundZ = SCREEN_RIGHT.z * x + GROUND_FORWARD.y * (y / FORWARD_RISE)
  const gap = wrapAngle(Math.atan2(-groundX, -groundZ) - heading)
  const turn = MathUtils.clamp(gap / STEER_FULL_ANGLE, -1, 1)
  return {
    throttle: length * Math.max(STEER_MIN_THROTTLE, Math.cos(gap)),
    turn,
    steering: turn,
  }
}
