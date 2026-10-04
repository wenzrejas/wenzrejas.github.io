import type * as THREE from 'three'

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve))

export async function warmShaders(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  await nextFrame()
  await renderer.compileAsync(scene, camera)
  for (const program of renderer.info.programs ?? []) program.getUniforms()
}
