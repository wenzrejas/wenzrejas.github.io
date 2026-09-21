import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'
import { useShipStore } from '../../../store/shipStore'
import { retain } from '../../../utils/array'
import { rand } from '../../../utils/math'
import { isOnScreen } from '../../../utils/screen'
import { buildFishGeometry, createFishMaterial } from './fishModel'
import { spawnChance } from './habitat'
import {
  CRUISE_DEPTH_MAX,
  DESPAWN_VIEW_MARGIN,
  FADE_START_DEPTH,
  FIRST_SPAWN_DELAY,
  FISH_SHADE,
  HIDDEN_DEPTH,
  MAX_FISH,
  NIGHT_CUTOFF,
  SCATTER_RADIUS,
  SPAWN_DISTANCE_MAX,
  SPAWN_DISTANCE_MIN,
  SPAWN_VIEW_MARGIN,
} from './constants'
import {
  createSchool,
  leave,
  regroup,
  scatter,
  steerSchool,
  updateFish,
  type School,
} from './school'

const _dummy = new THREE.Object3D()

export default function Fish() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildFishGeometry(), [])
  const material = useMemo(() => createFishMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  const schools = useRef<School[]>([])
  const spawnTimer = useRef(FIRST_SPAWN_DELAY)

  useFrame(({ clock, camera }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const { x: shipX, z: shipZ } = useShipStore.getState()
    const fadeAttr = geometry.getAttribute('aFade') as THREE.InstancedBufferAttribute
    const phaseAttr = geometry.getAttribute('aPhase') as THREE.InstancedBufferAttribute

    material.uniforms.uColor.value
      .copy(useCycleStore.getState().oceanDeep)
      .multiplyScalar(FISH_SHADE)

    const { fishDelayMin, fishDelayMax } = useDebugStore.getState().wildlife
    spawnTimer.current = Math.min(spawnTimer.current, fishDelayMax) - dt
    if (spawnTimer.current <= 0) {
      spawnTimer.current = rand(fishDelayMin, fishDelayMax)
      const active = schools.current.reduce((sum, school) => sum + school.fish.length, 0)
      const angle = Math.random() * Math.PI * 2
      const distance = rand(SPAWN_DISTANCE_MIN, SPAWN_DISTANCE_MAX)
      const x = shipX + Math.sin(angle) * distance
      const z = shipZ + Math.cos(angle) * distance
      _dummy.position.set(x, -CRUISE_DEPTH_MAX, z)
      if (
        active < MAX_FISH &&
        useCycleStore.getState().nightFactor < NIGHT_CUTOFF &&
        isOnScreen(_dummy.position, camera, SPAWN_VIEW_MARGIN) &&
        Math.random() < spawnChance(x, z)
      ) {
        schools.current.push(createSchool(x, z, MAX_FISH - active))
      }
    }

    let index = 0
    retain(schools.current, (school) => {
      school.age += dt
      if (!school.leaving && school.age > school.lifetime) leave(school)
      if (school.fleeTimer > 0) {
        school.fleeTimer -= dt
        if (school.fleeTimer <= 0) regroup(school, shipX, shipZ)
      } else {
        steerSchool(school, time, dt)
        const shipNear = school.fish.some(
          (member) =>
            member.depth < HIDDEN_DEPTH &&
            Math.hypot(member.x - shipX, member.z - shipZ) < SCATTER_RADIUS
        )
        if (shipNear) scatter(school, shipX, shipZ)
      }

      const firstIndex = index
      let onScreen = false
      let submerged = true

      for (const fish of school.fish) {
        updateFish(school, fish, time, dt)
        submerged &&= fish.depth >= HIDDEN_DEPTH

        _dummy.position.set(fish.x, -fish.depth, fish.z)
        _dummy.rotation.set(0, fish.heading, 0)
        _dummy.scale.setScalar(fish.size)
        _dummy.updateMatrix()
        mesh.setMatrixAt(index, _dummy.matrix)
        fadeAttr.setX(
          index,
          1 - THREE.MathUtils.smoothstep(fish.depth, FADE_START_DEPTH, HIDDEN_DEPTH)
        )
        phaseAttr.setX(index, fish.phase)
        onScreen ||= isOnScreen(_dummy.position, camera, DESPAWN_VIEW_MARGIN)
        index++
      }

      if (!onScreen || (school.leaving && submerged)) {
        index = firstIndex
        return false
      }
      return true
    })

    mesh.count = index
    mesh.visible = index > 0
    mesh.instanceMatrix.needsUpdate = true
    fadeAttr.needsUpdate = true
    phaseAttr.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_FISH]}
      frustumCulled={false}
      visible={false}
      renderOrder={2.5}
    />
  )
}
