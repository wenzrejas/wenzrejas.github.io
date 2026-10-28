import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { useDepthsStore } from '@/store/depthsStore'
import { isTravelHeld, useGuideStore } from '@/store/guideStore'
import { isPanelOpen } from '@/store/panelStore'
import { isMotionReduced } from '@/store/settingsStore'
import { isDepthsInView } from '@/store/viewStore'
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
  const framing = useMemo(() => createDepthsFraming(), [])

  useLayoutEffect(() => fitLens(camera, size.width, size.height), [camera, size])

  useEffect(() => {
    const scrollLevel = (event: WheelEvent) => {
      if (canTravel()) scrollTimeline(timeline, wheelLevels(event))
    }
    const followPointer = (event: PointerEvent) =>
      aimParallax(framing, event.clientX, event.clientY)
    window.addEventListener('wheel', scrollLevel, { passive: true })
    window.addEventListener('pointermove', followPointer)
    return () => {
      window.removeEventListener('wheel', scrollLevel)
      window.removeEventListener('pointermove', followPointer)
    }
  }, [timeline, framing])

  useFrame(() => {
    const keys = pressedKeys.current
    const heldDirection = canTravel() ? Number(keys.backward) - Number(keys.forward) : 0
    stepTimeline(timeline, heldDirection, clock.delta)
    if (surfacing.isRewinding) rewindTimeline(timeline, surfacing.fromLevel, rewindShare(surfacing))
    easeParallax(framing, clock.delta, isMotionReduced())
    frameDepths(camera, focus, timeline.viewedLevel, framing, surfacing)
  }, DEPTHS_CAMERA_FRAME_PRIORITY)

  return null
}
