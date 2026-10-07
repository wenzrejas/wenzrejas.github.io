import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import {
  SKY_FLASH_BACKGROUND,
  SKY_FLASH_FOG,
  SKY_FLASH_LIGHT,
  SKY_FLASH_SEA,
  SKY_FLASH_TINT,
} from './constants'
import type { SkyLights } from './skyDarkening'

const TINT = new THREE.Color(SKY_FLASH_TINT)

export function flashSky(flash: number, { background, hemi, sun }: SkyLights) {
  const cycle = useCycleStore.getState()
  cycle.fogColor.lerp(TINT, flash * SKY_FLASH_FOG)
  cycle.oceanDeep.lerp(TINT, flash * SKY_FLASH_SEA)
  cycle.oceanMid.lerp(TINT, flash * SKY_FLASH_SEA)

  if (background instanceof THREE.Color) background.lerp(TINT, flash * SKY_FLASH_BACKGROUND)

  if (hemi) {
    hemi.color.lerp(TINT, flash)
    hemi.intensity += flash * SKY_FLASH_LIGHT
  }
  if (sun) {
    sun.color.lerp(TINT, flash)
    sun.intensity += flash * SKY_FLASH_LIGHT
  }
}
