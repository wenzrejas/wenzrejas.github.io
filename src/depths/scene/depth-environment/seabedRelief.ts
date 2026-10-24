import { FULL_TURN } from '@/utils/math'
import { seededRandom } from '@/utils/random'
import { deepestDepth } from '../timeline/timeline'
import {
  ENVIRONMENT_SEED,
  SEABED_DROP,
  SEABED_RELIEF,
  SEABED_RELIEF_SCALE,
  SEABED_RIDGE_STRETCH,
  SEABED_RIPPLE_SCALE,
  SEABED_RIPPLE_SHARE,
} from './constants'

const phaseRandom = seededRandom(ENVIRONMENT_SEED)
const RIDGE_PHASE_ACROSS = phaseRandom() * FULL_TURN
const RIDGE_PHASE_ALONG = phaseRandom() * FULL_TURN

export const seabedY = () => deepestDepth() - SEABED_DROP

export function seabedReliefAt(x: number, z: number) {
  const across = x * SEABED_RELIEF_SCALE
  const along = z * SEABED_RELIEF_SCALE
  const ridge =
    Math.sin(across + RIDGE_PHASE_ACROSS) *
    Math.cos(along * SEABED_RIDGE_STRETCH + RIDGE_PHASE_ALONG)
  return (
    (ridge + SEABED_RIPPLE_SHARE * Math.sin((across + along) * SEABED_RIPPLE_SCALE)) * SEABED_RELIEF
  )
}

export const seabedHeightAt = (x: number, z: number) => seabedY() + seabedReliefAt(x, z)
