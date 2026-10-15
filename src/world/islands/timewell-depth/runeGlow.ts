import { useFrame } from '@react-three/fiber'
import type { IslandModel } from '../shared/islandModel'
import { lightGlows, nightGlow } from '../shared/nightGlow'
import {
  WHIRLPOOL_GLOW_PULSE_SPEED,
  WHIRLPOOL_RUNE_NIGHT_BOOST,
  WHIRLPOOL_RUNE_PULSE,
  WHIRLPOOL_RUNE_SPILL_STRENGTH,
} from './constants'

const runePulse = (seconds: number) =>
  1 + WHIRLPOOL_RUNE_PULSE * Math.sin(seconds * WHIRLPOOL_GLOW_PULSE_SPEED)

export const runeSpillLevel = (seconds: number) =>
  nightGlow() * runePulse(seconds) * WHIRLPOOL_RUNE_SPILL_STRENGTH

export function useRuneGlow(island: IslandModel) {
  useFrame(({ clock }) => {
    const pulse = runePulse(clock.getElapsedTime())
    lightGlows(island.glows, 1 + WHIRLPOOL_RUNE_NIGHT_BOOST * nightGlow() * pulse)
  })
}
