import { onceFor } from '@/utils/cache'
import { meshesNamed, sinkBehindCoplanar } from '@/utils/meshes'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import {
  addColorGlow,
  createColorGlow,
  dressColorGlow,
  type ColorGlow,
} from '@/world/islands/buildshore/shared/color-glow/colorGlowModel'
import { FLOATING_CARD_NODES } from '@/world/islands/buildshore/projects/gelify/constants'
import { SCREEN_DEPTH_STEPS, SCREEN_GLOW_MATERIAL, UIUX_SCREEN_NODES } from './constants'

export interface ScreenGlows {
  screens: ColorGlow
  uiuxScreens: ColorGlow
}

const glowingIslands = new WeakMap<IslandModel, ScreenGlows>()

export const glowScreens = (island: IslandModel) =>
  onceFor(glowingIslands, island, () => {
    const glows = { screens: createColorGlow(), uiuxScreens: createColorGlow() }
    for (const { mat } of island.tints) {
      if (mat.name !== SCREEN_GLOW_MATERIAL) continue
      sinkBehindCoplanar(mat, SCREEN_DEPTH_STEPS)
      addColorGlow(mat, glows.screens)
    }
    const panels = meshesNamed(island.model, FLOATING_CARD_NODES)
    if (panels.length > 0) dressColorGlow(panels, glows.screens)
    const uiuxScreens = meshesNamed(island.model, UIUX_SCREEN_NODES)
    if (uiuxScreens.length > 0) dressColorGlow(uiuxScreens, glows.uiuxScreens)
    return glows
  })
