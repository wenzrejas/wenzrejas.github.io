import { useFrame } from '@react-three/fiber'
import { useWindStore } from '@/store/windStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { downwindYaw, steerHelm, stepCloth, swayLantern, turnFlags, type ShipRig } from './shipRig'
import type { ShipSailing } from './shipSailing'

export function useShipRig(rig: ShipRig, sailing: ShipSailing) {
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const time = clock.getElapsedTime()
    const wind = useWindStore.getState().direction

    steerHelm(rig, sailing.steering, dt)
    turnFlags(rig.flags, downwindYaw(wind.x, wind.y, sailing.heading), dt)
    stepCloth(rig, sailing.sailFill, time, dt)
    if (rig.lantern) swayLantern(rig.lantern, time)
  })
}
