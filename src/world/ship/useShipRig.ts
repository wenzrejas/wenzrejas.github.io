import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useWindStore } from '@/store/windStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { downwindYaw, steerHelm, stepCloth, swayLantern, turnFlags, type ShipRig } from './shipRig'

export function useShipRig(
  rig: ShipRig,
  headingRef: RefObject<number>,
  steeringRef: RefObject<number>,
  tailwindRef: RefObject<number>
) {
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const time = clock.getElapsedTime()
    const wind = useWindStore.getState().dir

    steerHelm(rig, steeringRef.current, dt)
    turnFlags(rig.flags, downwindYaw(wind.x, wind.y, headingRef.current), dt)
    stepCloth(rig, tailwindRef.current, time, dt)
    if (rig.lantern) swayLantern(rig.lantern, time)
  })
}
