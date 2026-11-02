import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { useDepthsStore } from '@/store/depthsStore'
import { isTravelHeld, useGuideStore } from '@/store/guideStore'
import { isPanelOpen } from '@/store/panelStore'
import { useInputStore } from '@/store/inputStore'
import { isMotionReduced } from '@/store/settingsStore'
import { isDepthsInView } from '@/store/viewStore'
import { useDepthsFitted } from '@/utils/layout'
import type { WallClock } from '@/utils/time'
import { DEPTHS_CAMERA_FRAME_PRIORITY } from '../constants'
import { rewindShare, type Surfacing } from '../surfacing/surfacing'
import {
  rewindTimeline,
  scrollTimeline,
  stepTimeline,
  wheelLevels,
  type Timeline,
} from '../timeline/timeline'
import {
  aimParallax,
  createDepthsFraming,
  easeParallax,
  fitLens,
  frameDepths,
} from './depthsCameraFraming'
import { bindDepthsTouch, createTouchTravel, stepTouchTravel } from './depthsTouchModel'

interface DepthsCameraRigProps {
  camera: THREE.PerspectiveCamera
  focus: THREE.Vector3
  clock: WallClock
  timeline: Timeline
  surfacing: Surfacing
}

const canTravel = () =>
  isDepthsInView() &&
  useDepthsStore.getState().isRevealed &&
  !isTravelHeld(useGuideStore.getState()) &&
  !isPanelOpen()

export default function DepthsCameraRig({
  camera,
  focus,
  clock,
  timeline,
  surfacing,
}: DepthsCameraRigProps) {
  const pressedKeys = useKeyboardInput()
  const size = useThree((state) => state.size)
  const canvas = useThree((state) => state.gl.domElement)
  const isFitted = useDepthsFitted()
  const framing = useMemo(() => createDepthsFraming(), [])
  const touchTravel = useMemo(() => createTouchTravel(), [])

  useEffect(
    () => bindDepthsTouch(canvas, touchTravel, timeline, canTravel),
    [canvas, touchTravel, timeline]
  )

  useLayoutEffect(
    () => fitLens(camera, framing, size.width, size.height, isFitted),
    [camera, framing, size, isFitted]
  )

  useEffect(() => {
    const scrollLevel = (event: WheelEvent) => {
      touchTravel.stop()
      if (canTravel()) scrollTimeline(timeline, wheelLevels(event))
    }
    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') aimParallax(framing, event.clientX, event.clientY)
    }
    window.addEventListener('wheel', scrollLevel, { passive: true })
    window.addEventListener('pointermove', followPointer)
    return () => {
      window.removeEventListener('wheel', scrollLevel)
      window.removeEventListener('pointermove', followPointer)
    }
  }, [timeline, framing, touchTravel])

  useFrame(() => {
    const keys = pressedKeys.current
    const isTravelFree = canTravel()
    const heldDirection = isTravelFree ? Number(keys.backward) - Number(keys.forward) : 0
    if (!isTravelFree || heldDirection !== 0 || surfacing.isRewinding) touchTravel.stop()
    else stepTouchTravel(touchTravel, timeline, clock.delta)
    stepTimeline(timeline, heldDirection, clock.delta)
    if (surfacing.isRewinding) rewindTimeline(timeline, surfacing.fromLevel, rewindShare(surfacing))
    easeParallax(
      framing,
      clock.delta,
      isMotionReduced() || useInputStore.getState().mode === 'touch'
    )
    frameDepths(camera, focus, timeline.viewedLevel, framing, surfacing)
  }, DEPTHS_CAMERA_FRAME_PRIORITY)

  return null
}
