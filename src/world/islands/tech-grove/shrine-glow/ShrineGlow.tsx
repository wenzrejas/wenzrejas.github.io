import GemHalo from '@/world/islands/shared/gem-halo/GemHalo'
import GroundGlow from '@/world/islands/shared/ground-glow/GroundGlow'
import { GEM_HALO_SPREAD, GEM_HALO_STRENGTH, SHRINE_GROUND_GLOW } from './constants'
import { sanctuaryGlow } from '../sanctuaryGlow'
import type { Shrines } from '../shrines'

const GEM_HALO = { spread: GEM_HALO_SPREAD, strength: GEM_HALO_STRENGTH }

interface ShrineGlowProps {
  shrines: Shrines
  islandScale: number
}

export default function ShrineGlow({ shrines, islandScale }: ShrineGlowProps) {
  return (
    <>
      <GroundGlow
        sites={shrines.bases}
        tuning={SHRINE_GROUND_GLOW}
        islandScale={islandScale}
        level={sanctuaryGlow}
      />
      <GemHalo
        gems={shrines.gems}
        tuning={GEM_HALO}
        islandScale={islandScale}
        level={sanctuaryGlow}
      />
    </>
  )
}
