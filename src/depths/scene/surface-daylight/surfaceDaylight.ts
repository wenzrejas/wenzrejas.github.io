import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { mix } from '@/utils/math'
import { SUN_HEIGHT_AT_DAY, SUN_HEIGHT_AT_NIGHT } from './constants'

export const surfaceDaylight = () =>
  THREE.MathUtils.smoothstep(
    useCycleStore.getState().clockSunHeight,
    SUN_HEIGHT_AT_NIGHT,
    SUN_HEIGHT_AT_DAY
  )

export const dimForNight = (nightLevel: number, daylight: number) => mix(nightLevel, 1, daylight)
