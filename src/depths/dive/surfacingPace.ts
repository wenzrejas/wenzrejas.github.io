import * as THREE from 'three'
import { SURFACING_ASCENT_DELAY_SECONDS, SURFACING_SECONDS } from './constants'

export const RISING_SECONDS = SURFACING_ASCENT_DELAY_SECONDS + SURFACING_SECONDS

export const ascentShare = (surfacingSeconds: number) =>
  THREE.MathUtils.clamp(
    (surfacingSeconds - SURFACING_ASCENT_DELAY_SECONDS) / SURFACING_SECONDS,
    0,
    1
  )
