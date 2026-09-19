import { type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VIEW_MARGIN, type IslandKey } from './constants'
import { ISLAND_SPECS } from './islandSpecs'
import { createIslandTransform, islandExtent, islandTransform } from './islandTransform'
import { groundReach, liftOffset, sampleGroundFrame } from './viewReach'
import { useDebugStore } from '../../../store/debugStore'

const _ground = new THREE.Vector2()
const _lift = new THREE.Vector2()
const _transform = createIslandTransform()

export function useNearViewport(groupRef: RefObject<THREE.Group | null>, islandKey: IslandKey) {
  useFrame(({ camera }) => {
    const group = groupRef.current
    if (!group) return

    const tuning = useDebugStore.getState().islands[islandKey]
    const { x, z, scale } = islandTransform(islandKey, tuning, _transform)
    const top = ISLAND_SPECS[islandKey].height * scale + tuning.offsetY

    sampleGroundFrame(camera, _ground)
    liftOffset(top, _lift)

    const run = _lift.lengthSq()
    const t =
      run > 0
        ? THREE.MathUtils.clamp(((_ground.x - x) * _lift.x + (_ground.y - z) * _lift.y) / run, 0, 1)
        : 0

    const dx = x + _lift.x * t - _ground.x
    const dz = z + _lift.y * t - _ground.y
    const reach = groundReach(dx, dz) + islandExtent(islandKey, tuning) + VIEW_MARGIN

    group.visible = dx * dx + dz * dz < reach * reach
  })
}
