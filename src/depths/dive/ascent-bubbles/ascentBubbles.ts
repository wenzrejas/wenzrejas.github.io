import * as THREE from 'three'
import { isRising, type DiveRun } from '../dive'
import { BUBBLE_FADE_IN_SECONDS } from './constants'

export const bubblePresence = (run: DiveRun) =>
  isRising(run)
    ? THREE.MathUtils.smoothstep(run.ascentSeconds, 0, BUBBLE_FADE_IN_SECONDS)
    : run.cover

export function paintBubbles(material: THREE.ShaderMaterial, run: DiveRun, pixelRatio: number) {
  const { uniforms } = material
  uniforms.uTravel.value = run.bubbleTravel
  uniforms.uTime.value = run.ascentSeconds
  uniforms.uPresence.value = bubblePresence(run)
  uniforms.uPixelRatio.value = pixelRatio
}
