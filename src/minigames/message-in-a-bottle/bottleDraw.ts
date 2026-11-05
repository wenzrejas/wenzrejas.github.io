import * as THREE from 'three'
import { useWeatherStore } from '@/store/weatherStore'
import { isOnScreen } from '@/utils/screen'
import { poseBottle } from './bottleDrift'
import { BOTTLE_SPOTS, type BottleKey } from './bottleSpots'
import { BOTTLE_VIEW_MARGIN } from './constants'

const _pose = new THREE.Object3D()

export function drawBottles(
  contents: THREE.InstancedMesh,
  glass: THREE.InstancedMesh,
  afloat: readonly BottleKey[],
  scale: number,
  time: number,
  camera: THREE.Camera
): number {
  const swell = useWeatherStore.getState().waveAmplitudeMultiplier
  let drawn = 0
  for (const bottle of afloat) {
    poseBottle(_pose, BOTTLE_SPOTS[bottle], scale, time, swell)
    if (!isOnScreen(_pose.position, camera, BOTTLE_VIEW_MARGIN)) continue
    contents.setMatrixAt(drawn, _pose.matrix)
    glass.setMatrixAt(drawn, _pose.matrix)
    drawn++
  }
  contents.count = drawn
  glass.count = drawn
  if (drawn > 0) {
    contents.instanceMatrix.needsUpdate = true
    glass.instanceMatrix.needsUpdate = true
  }
  return drawn
}
