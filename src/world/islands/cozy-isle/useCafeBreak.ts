import { useFrame } from '@react-three/fiber'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import type { HoverTimeline } from '../shared/hoverTimeline'
import { stepCafeBreak } from './cafeBreak'
import { lightCafeGlows, type CafeGlows } from './cafeLights'

export function useCafeBreak(cafeBreak: HoverTimeline, glows: CafeGlows) {
  useFrame((_, delta) => {
    stepCafeBreak(cafeBreak, Math.min(delta, MAX_FRAME_SECONDS))
    lightCafeGlows(glows, cafeBreak)
  })
}
