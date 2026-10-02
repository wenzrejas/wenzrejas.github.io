import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { IslandModel } from '../shared/islandModel'
import { lightGlows, nightGlow } from '../shared/nightGlow'
import {
  WHIRLPOOL_GLOW_PULSE_SPEED,
  WHIRLPOOL_RUNE_COLOR,
  WHIRLPOOL_RUNE_NIGHT_BOOST,
  WHIRLPOOL_RUNE_PULSE,
} from './constants'

function paintRunes({ glows, tints }: IslandModel) {
  const runes = new Set<THREE.MeshStandardMaterial>(glows.map(({ mat }) => mat))
  for (const rune of runes) {
    rune.color.set(WHIRLPOOL_RUNE_COLOR)
    rune.emissive.set(WHIRLPOOL_RUNE_COLOR)
  }
  for (const tint of tints) if (runes.has(tint.mat)) tint.base.copy(tint.mat.color)
}

export function useRuneGlow(island: IslandModel) {
  useMemo(() => paintRunes(island), [island])

  useFrame(({ clock }) => {
    const pulse =
      1 + WHIRLPOOL_RUNE_PULSE * Math.sin(clock.getElapsedTime() * WHIRLPOOL_GLOW_PULSE_SPEED)
    lightGlows(island.glows, 1 + WHIRLPOOL_RUNE_NIGHT_BOOST * nightGlow() * pulse)
  })
}
