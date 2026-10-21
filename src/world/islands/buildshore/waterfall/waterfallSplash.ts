import { placeOnIsland, turnToIsland, type SiteFrame } from '@/world/islands/shared/shoreSites'
import type { WaterfallBase } from './cascades'

export type SplashSite = WaterfallBase

export function placeSplashSites(
  bases: WaterfallBase[],
  frame: SiteFrame,
  offsetY: number
): SplashSite[] {
  return bases.map((base) => {
    const [x, z] = placeOnIsland(frame, base.x, base.z)
    const [alongX, alongZ] = turnToIsland(frame, base.alongX, base.alongZ)
    const [awayX, awayZ] = turnToIsland(frame, base.awayX, base.awayZ)
    return {
      x,
      y: base.y * frame.scale + offsetY,
      z,
      alongX,
      alongZ,
      halfWidth: base.halfWidth * frame.scale,
      awayX,
      awayZ,
      intoSea: base.intoSea,
    }
  })
}
