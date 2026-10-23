import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { setShipLanded } from '@/store/depthsStore'
import type { WallClock } from '@/utils/time'
import { SHIP_MODEL_URL } from '@/world/ship/constants'
import { plungeSeconds, type Arrival } from '../arrival/arrival'
import type { Surfacing } from '../surfacing/surfacing'
import { DEEPEST_LEVEL, type Timeline } from '../timeline/timeline'
import { buildDepthsShip, disposeDepthsShip } from './depthsShipModel'
import {
  createShipMotion,
  followClockRuin,
  isShipLanded,
  poseShip,
  stepShipMotion,
} from './shipMotion'

interface DepthsShipProps {
  arrival: Arrival
  timeline: Timeline
  surfacing: Surfacing
  focus: THREE.Vector3
  shipSpot: THREE.Vector3
  clock: WallClock
}

export default function DepthsShip({
  arrival,
  timeline,
  surfacing,
  focus,
  shipSpot,
  clock,
}: DepthsShipProps) {
  const { scene } = useGLTF(SHIP_MODEL_URL)
  const ship = useMemo(() => buildDepthsShip(scene), [scene])
  const motion = useMemo(() => createShipMotion(shipSpot, ship.keelDepth), [shipSpot, ship])

  useEffect(() => () => disposeDepthsShip(ship), [ship])

  useFrame(() => {
    const clockRuin = useDebugStore.getState().ruins[DEEPEST_LEVEL]
    stepShipMotion(motion, timeline, surfacing, clock.delta)
    followClockRuin(motion, clockRuin, clock.elapsed)
    poseShip(ship.root, motion, focus, plungeSeconds(arrival), clock.elapsed)
    setShipLanded(isShipLanded(motion))
  })

  return <primitive object={ship.root} />
}
