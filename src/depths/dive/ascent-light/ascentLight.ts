import type * as THREE from 'three'
import { isRising, type DiveRun } from '../dive'

export function paintAscentLight(
  material: THREE.ShaderMaterial,
  run: DiveRun,
  time: number,
  aspect: number
) {
  const { uniforms } = material
  const isStillBelow = isRising(run)
  uniforms.uRise.value = isStillBelow ? run.cover : 0
  uniforms.uFade.value = isStillBelow ? 0 : run.cover
  uniforms.uTime.value = time
  uniforms.uAspect.value = aspect
}
