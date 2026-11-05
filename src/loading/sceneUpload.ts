import * as THREE from 'three'
import { hasFinePointer } from '@/store/inputStore'
import { ISLAND_ROOT_NAME } from '@/world/islands/shared/constants'

const _scissor = new THREE.Vector4()

export function uploadQueueOf(scene: THREE.Scene) {
  const queue: THREE.Object3D[] = []
  if (!hasFinePointer()) return queue
  queue.push(scene)
  scene.traverse((object) => {
    if (object.name === ISLAND_ROOT_NAME) queue.push(object)
  })
  return queue
}

export function uploadOnce(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  root: THREE.Object3D
) {
  const wasVisible = root.visible
  const culled: THREE.Object3D[] = []
  root.traverse((object) => {
    if (!object.frustumCulled) return
    object.frustumCulled = false
    culled.push(object)
  })
  root.visible = true
  renderer.getScissor(_scissor)
  renderer.setScissor(0, 0, 1, 1)
  renderer.setScissorTest(true)
  renderer.render(scene, camera)
  renderer.setScissorTest(false)
  renderer.setScissor(_scissor)
  root.visible = wasVisible
  for (const object of culled) object.frustumCulled = true
}
