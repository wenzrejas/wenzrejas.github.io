import * as THREE from 'three'
import type { DiveRun } from '../dive'

const _projected = new THREE.Vector3()

export function paintSwirl(
  material: THREE.ShaderMaterial,
  run: DiveRun,
  camera: THREE.Camera,
  time: number,
  aspect: number
) {
  const { uniforms } = material
  uniforms.uCover.value = run.cover
  uniforms.uOpacity.value = run.opacity
  uniforms.uTime.value = time
  uniforms.uAspect.value = aspect
  _projected.copy(run.focus).project(camera)
  uniforms.uCentre.value.set(_projected.x * 0.5 + 0.5, _projected.y * 0.5 + 0.5)
}
