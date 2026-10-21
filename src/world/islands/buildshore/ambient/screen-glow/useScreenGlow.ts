import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import { dayNightGlow } from '@/world/islands/shared/nightGlow'
import { setColorGlow } from '@/world/islands/buildshore/shared/color-glow/colorGlowModel'
import { SCREEN_GLOW_DAY_SHARE, SCREEN_GLOW_STRENGTH, UIUX_SCREEN_GLOW_SHARE } from './constants'
import { glowScreens } from './screenGlowModel'

export function useScreenGlow(island: IslandModel) {
  const glows = useMemo(() => glowScreens(island), [island])

  useFrame(() => {
    const level = dayNightGlow(SCREEN_GLOW_DAY_SHARE) * SCREEN_GLOW_STRENGTH
    setColorGlow(glows.screens, level)
    setColorGlow(glows.uiuxScreens, level * UIUX_SCREEN_GLOW_SHARE)
  })
}
