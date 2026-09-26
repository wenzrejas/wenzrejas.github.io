import { useFrame } from '@react-three/fiber'
import { MAX_DT } from '../../../../utils/time'
import { GEM_SPIN_RATE, GEM_TUMBLE_RATE } from './constants'
import type { ShrineGem } from './shrines'

function spinGems(gems: ShrineGem[], dt: number) {
  for (const gem of gems) {
    if (gem.spins) gem.node.rotation.y += GEM_SPIN_RATE * dt
    if (gem.tumbles) gem.node.rotation.z += GEM_TUMBLE_RATE * dt
  }
}

export function useGemSpin(gems: ShrineGem[]) {
  useFrame((_, delta) => spinGems(gems, Math.min(delta, MAX_DT)))
}
