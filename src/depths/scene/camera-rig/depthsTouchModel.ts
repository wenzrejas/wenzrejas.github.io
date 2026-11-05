import { MathUtils } from 'three'
import { followCanvasDrag } from '@/utils/canvasDrag'
import { MAX_FRAME_SECONDS, toSeconds } from '@/utils/time'
import { SCROLL_LEVELS_PER_PIXEL } from '../timeline/constants'
import { scrollTimeline, type Timeline } from '../timeline/timeline'
import {
  TOUCH_GLIDE_DECAY,
  TOUCH_MAX_SPEED,
  TOUCH_MIN_SAMPLE_SECONDS,
  TOUCH_RELEASE_WINDOW_MILLISECONDS,
  TOUCH_STOP_SPEED,
} from './constants'

export const createTouchTravel = () => ({
  isDragging: false,
  y: 0,
  stamp: 0,
  velocity: 0,
  stop: () => {},
})

type TouchTravel = ReturnType<typeof createTouchTravel>

export function stepTouchTravel(travel: TouchTravel, timeline: Timeline, delta: number) {
  if (travel.isDragging || travel.velocity === 0) return
  const dt = Math.min(delta, MAX_FRAME_SECONDS)
  const nextVelocity = MathUtils.damp(travel.velocity, 0, TOUCH_GLIDE_DECAY, dt)
  scrollTimeline(timeline, (travel.velocity - nextVelocity) / TOUCH_GLIDE_DECAY)
  travel.velocity = Math.abs(nextVelocity) < TOUCH_STOP_SPEED ? 0 : nextVelocity
}

export function bindDepthsTouch(
  canvas: HTMLCanvasElement,
  travel: TouchTravel,
  timeline: Timeline,
  canTravel: () => boolean
) {
  const drag = followCanvasDrag(canvas, {
    canStart: ({ pointerType }) => pointerType !== 'mouse' && canTravel(),
    onStart: ({ clientY, timeStamp }) => {
      travel.isDragging = true
      travel.y = clientY
      travel.stamp = timeStamp
      travel.velocity = 0
    },
    onMove: ({ clientY, timeStamp }) => {
      if (!canTravel()) {
        drag.cancel()
        return
      }
      const levels = (travel.y - clientY) * SCROLL_LEVELS_PER_PIXEL
      const dt = Math.max(toSeconds(timeStamp - travel.stamp), TOUCH_MIN_SAMPLE_SECONDS)
      scrollTimeline(timeline, levels)
      travel.velocity = MathUtils.clamp(levels / dt, -TOUCH_MAX_SPEED, TOUCH_MAX_SPEED)
      travel.y = clientY
      travel.stamp = timeStamp
    },
    onRelease: ({ timeStamp }) => {
      travel.isDragging = false
      if (!canTravel() || timeStamp - travel.stamp > TOUCH_RELEASE_WINDOW_MILLISECONDS)
        travel.velocity = 0
    },
    onCancel: () => {
      travel.isDragging = false
      travel.velocity = 0
    },
  })
  const stopOutside = (event: PointerEvent) => {
    if (event.target !== canvas) drag.cancel()
  }

  travel.stop = drag.cancel
  window.addEventListener('pointerdown', stopOutside)
  return () => {
    drag.unbind()
    window.removeEventListener('pointerdown', stopOutside)
  }
}
