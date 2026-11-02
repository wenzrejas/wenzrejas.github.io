import { useCoastStore } from '../store/coastStore'
import { useShipStore } from '../store/shipStore'
import { isRaining } from '../store/weatherStore'
import { signedLoopDistance } from '../utils/polygon'
import { nightGlow } from '../world/islands/shared/nightGlow'
import {
  CRICKET_FADE,
  CRICKET_FULL_GAP,
  CRICKET_ISLANDS,
  CRICKET_LEVEL_STEP,
  CRICKET_RAMP,
  CRICKET_SILENT_GAP,
} from './constants'
import { createProximityLoop, holdLoopAt, nearnessOf, quietLoop } from './proximityLoop'

function nearestCricketCoast(x: number, z: number) {
  let nearest = Infinity
  for (const { islandKey, outlines } of useCoastStore.getState().coastlines) {
    if (!CRICKET_ISLANDS.includes(islandKey)) continue
    for (const outline of outlines) nearest = Math.min(nearest, signedLoopDistance(outline, x, z))
  }
  return nearest
}

export function createCricketSounds() {
  const crickets = createProximityLoop('crickets', {
    rampSeconds: CRICKET_RAMP,
    fadeSeconds: CRICKET_FADE,
    levelStep: CRICKET_LEVEL_STEP,
  })

  return {
    update() {
      const night = isRaining() ? 0 : nightGlow()
      if (night <= 0) {
        holdLoopAt(crickets, 0)
        return
      }
      const ship = useShipStore.getState()
      const distance = nearestCricketCoast(ship.x, ship.z)
      holdLoopAt(crickets, nearnessOf(distance, CRICKET_FULL_GAP, CRICKET_SILENT_GAP) * night)
    },
    dispose() {
      quietLoop(crickets)
    },
  }
}
