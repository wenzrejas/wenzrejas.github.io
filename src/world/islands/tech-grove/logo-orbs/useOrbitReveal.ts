import { useFrame } from '@react-three/fiber'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { revealOrbits, type Orbit } from './orbits'

export function useOrbitReveal(orbits: Orbit[]) {
  useFrame((_, delta) => revealOrbits(orbits, Math.min(delta, MAX_FRAME_SECONDS)))
}
