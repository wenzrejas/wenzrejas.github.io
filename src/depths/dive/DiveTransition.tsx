import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isRewindChosen, resetDepthsLoad, useDepthsStore } from '@/store/depthsStore'
import { placeShip, useShipStore } from '@/store/shipStore'
import {
  abortDive,
  arriveAtSurface,
  arriveInDepths,
  renderedScene,
  useViewStore,
} from '@/store/viewStore'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { createWallClock, tickWallClock } from '@/utils/time'
import { DIVE_STEP_FRAME_PRIORITY, VEIL_RENDER_FRAME_PRIORITY } from './constants'
import {
  createDiveRun,
  endDive,
  isSteeringCamera,
  releaseCamera,
  startDive,
  startSurfacing,
  steerCamera,
  stepDive,
} from './dive'
import { drawDiveVeil, isVeilShown, paintDiveVeil, warmDiveVeil } from './diveVeil'
import { createDiveVeil, disposeDiveVeil } from './diveVeilModel'

export default function DiveTransition() {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const veil = useMemo(() => createDiveVeil(), [])
  const run = useMemo(() => createDiveRun(), [])
  const clock = useMemo(() => createWallClock(), [])

  useEffect(() => () => disposeDiveVeil(veil), [veil])

  useEffect(
    () =>
      useViewStore.subscribe(({ scenePhase }, previous) => {
        if (scenePhase === previous.scenePhase) return
        if (scenePhase === 'diving') {
          resetDepthsLoad()
          startDive(run, useWhirlpoolStore.getState(), useShipStore.getState())
        } else if (scenePhase === 'depths') {
          warmDiveVeil(veil, gl, camera)
        } else if (scenePhase === 'surfacing') {
          startSurfacing(run, isRewindChosen())
        } else if (previous.scenePhase === 'depths') {
          endDive(run)
        }
      }),
    [run, gl, camera, veil]
  )

  useFrame(() => {
    tickWallClock(clock)
    if (run.stage === 'idle') return
    const event = stepDive(run, clock.delta, useDepthsStore.getState())
    if (event === 'arrived') {
      arriveInDepths()
      releaseCamera()
    } else if (event === 'aborted') {
      abortDive()
    } else if (event === 'surfaced') {
      arriveAtSurface()
      placeShip(run.shipPose.x, run.shipPose.z, run.shipPose.heading)
    } else if (event === 'settled') {
      releaseCamera()
    }
    if (isSteeringCamera(run)) steerCamera(run)
  }, DIVE_STEP_FRAME_PRIORITY)

  useFrame(({ gl, camera, size }) => {
    if (!isVeilShown(run) || renderedScene() === null) return
    paintDiveVeil(veil, run, camera, clock.elapsed, size.width / size.height, gl.getPixelRatio())
    drawDiveVeil(veil, gl, camera)
  }, VEIL_RENDER_FRAME_PRIORITY)

  return null
}
