import type * as THREE from 'three'
import type { CloudBakeRig } from './cloudDeckModel'
import { CLOUD_BAKE_MARGIN, CLOUD_BAKE_SHARE, CLOUD_LAYERS } from './constants'

export function bakeCloudLayers(
  renderer: THREE.WebGLRenderer,
  { scene, camera, material, target }: CloudBakeRig,
  width: number,
  height: number
) {
  const coverage = (1 + 2 * CLOUD_BAKE_MARGIN) * CLOUD_BAKE_SHARE
  target.setSize(Math.ceil(width * coverage), Math.ceil(height * coverage), CLOUD_LAYERS.length)
  material.uniforms.uAspect.value = width / height
  const previousTarget = renderer.getRenderTarget()
  CLOUD_LAYERS.forEach(({ scale, originX, originY }, layer) => {
    material.uniforms.uScale.value = scale
    material.uniforms.uOrigin.value.set(originX, originY)
    renderer.setRenderTarget(target, layer)
    renderer.render(scene, camera)
  })
  renderer.setRenderTarget(previousTarget)
}
