import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RIPPLE_MAX_GROUPS, RIPPLE_SPRITES_PER_GROUP, TOTAL_RIPPLE_SPRITES } from './constants'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'

interface RippleSprite {
  alive: boolean
  spawnTime: number
  x: number
  z: number
  velocityX: number
  velocityZ: number
  size: number
}

interface SpawnPoint {
  x: number
  z: number
}

export default function WakeRipples({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const rippleInstancesRef = useRef<THREE.InstancedMesh>(null)
  const dummyObject = useMemo(() => new THREE.Object3D(), [])
  const rippleGroupIndex = useRef(0)
  const lastSpawnPoint = useRef<SpawnPoint | null>(null)

  const sprites = useRef<RippleSprite[]>(
    Array.from({ length: TOTAL_RIPPLE_SPRITES }, () => ({
      alive: false,
      spawnTime: 0,
      x: 0,
      z: 0,
      velocityX: 0,
      velocityZ: 0,
      size: 1,
    }))
  )

  const spriteGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const spriteMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    []
  )

  useEffect(() => {
    const rippleInstances = rippleInstancesRef.current
    if (rippleInstances) {
      dummyObject.scale.setScalar(0)
      dummyObject.updateMatrix()
      for (let i = 0; i < TOTAL_RIPPLE_SPRITES; i++)
        rippleInstances.setMatrixAt(i, dummyObject.matrix)
      rippleInstances.instanceMatrix.needsUpdate = true
    }
    return () => {
      spriteGeometry.dispose()
      spriteMaterial.dispose()
    }
  }, [])

  useFrame(({ clock }) => {
    const ship = shipRef.current
    if (!ship) return
    const time = clock.getElapsedTime()
    const rippleInstances = rippleInstancesRef.current
    if (!rippleInstances) return

    const wake = useDebugStore.getState().wake
    const cycle = useCycleStore.getState()
    const shipX = ship.position.x
    const shipZ = ship.position.z

    if (!lastSpawnPoint.current) {
      lastSpawnPoint.current = { x: shipX, z: shipZ }
    }

    const lastSpawn = lastSpawnPoint.current
    if (Math.hypot(shipX - lastSpawn.x, shipZ - lastSpawn.z) >= wake.spawnDist) {
      const heading = ship.rotation.y
      const cos = Math.cos(heading)
      const sin = Math.sin(heading)
      const slotBase = (rippleGroupIndex.current % RIPPLE_MAX_GROUPS) * RIPPLE_SPRITES_PER_GROUP

      for (let i = 0; i < RIPPLE_SPRITES_PER_GROUP; i++) {
        const theta = (i / (RIPPLE_SPRITES_PER_GROUP - 1)) * Math.PI
        const localX = Math.cos(theta) * wake.halfSpread
        const localZ = Math.sin(theta) * wake.rippleDepth

        const worldX = shipX + cos * localX + sin * localZ
        const worldZ = shipZ - sin * localX + cos * localZ

        const localLength = Math.sqrt(localX * localX + localZ * localZ) || 1
        const normalLocalX = localX / localLength
        const normalLocalZ = localZ / localLength
        const velocityX = cos * normalLocalX + sin * normalLocalZ
        const velocityZ = -sin * normalLocalX + cos * normalLocalZ

        const sprite = sprites.current[slotBase + i]
        sprite.alive = true
        sprite.spawnTime = time
        sprite.x = worldX
        sprite.z = worldZ
        sprite.velocityX = velocityX
        sprite.velocityZ = velocityZ
        sprite.size = 1.0 + Math.random() * 0.8
      }

      rippleGroupIndex.current++
      lastSpawn.x = shipX
      lastSpawn.z = shipZ
    }

    for (let i = 0; i < TOTAL_RIPPLE_SPRITES; i++) {
      const sprite = sprites.current[i]

      if (!sprite.alive) {
        dummyObject.scale.setScalar(0)
        dummyObject.position.y = -9999
        dummyObject.updateMatrix()
        rippleInstances.setMatrixAt(i, dummyObject.matrix)
        continue
      }

      const age = time - sprite.spawnTime
      if (age >= wake.rippleLifetime) {
        sprite.alive = false
        dummyObject.scale.setScalar(0)
        dummyObject.position.y = -9999
        dummyObject.updateMatrix()
        rippleInstances.setMatrixAt(i, dummyObject.matrix)
        continue
      }

      const progress = age / wake.rippleLifetime
      dummyObject.position.set(
        sprite.x + sprite.velocityX * age * wake.expandSpeed,
        0.4,
        sprite.z + sprite.velocityZ * age * wake.expandSpeed
      )
      dummyObject.scale.setScalar(sprite.size * Math.max(0, 1 - progress * 1.25))
      dummyObject.updateMatrix()
      rippleInstances.setMatrixAt(i, dummyObject.matrix)
    }

    rippleInstances.instanceMatrix.needsUpdate = true
    spriteMaterial.color.copy(cycle.foamColor)
  })

  return (
    <instancedMesh
      ref={rippleInstancesRef}
      args={[spriteGeometry, spriteMaterial, TOTAL_RIPPLE_SPRITES]}
      frustumCulled={false}
      renderOrder={4}
    />
  )
}
