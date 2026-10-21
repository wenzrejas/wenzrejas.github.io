import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { clockHours, findStationClock, poseStationClock } from './stationClock'

export function useStationClock(model: THREE.Object3D) {
  const clock = useMemo(() => findStationClock(model), [model])

  useFrame(() => {
    if (clock) poseStationClock(clock, clockHours(useCycleStore.getState().timeOfDay))
  })
}
