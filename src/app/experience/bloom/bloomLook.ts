import { surfaceGlowOf } from '@/depths/scene/depth-environment/surfaceGlow'
import { useDepthsStore } from '@/store/depthsStore'
import type { RenderedScene } from '@/store/viewStore'
import { mix } from '@/utils/math'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import {
  BLOOM_DEPTHS_STRENGTH,
  BLOOM_DEPTHS_THRESHOLD,
  BLOOM_DUSK_THRESHOLD,
  BLOOM_FADE_IN_SECONDS,
  BLOOM_NIGHT_STRENGTH,
  BLOOM_NIGHT_THRESHOLD,
} from './constants'

type BloomedScene = NonNullable<RenderedScene>

function depthsStrength() {
  const { timeline } = useDepthsStore.getState()
  return timeline ? BLOOM_DEPTHS_STRENGTH * (1 - surfaceGlowOf(timeline)) : 0
}

export function bloomStrength(scene: BloomedScene, shownSeconds: number) {
  const fullStrength = scene === 'depths' ? depthsStrength() : BLOOM_NIGHT_STRENGTH * nightGlow()
  return fullStrength * Math.min(shownSeconds / BLOOM_FADE_IN_SECONDS, 1)
}

export const bloomThreshold = (scene: BloomedScene) =>
  scene === 'depths'
    ? BLOOM_DEPTHS_THRESHOLD
    : mix(BLOOM_DUSK_THRESHOLD, BLOOM_NIGHT_THRESHOLD, nightGlow())
