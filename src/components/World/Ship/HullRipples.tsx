import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'
import { FOAM_PLANE_SIZE, hullFoamBound } from './constants'

const GROUPS = 5
const PARTICLES_PER_GROUP = 40
const TOTAL = GROUPS * PARTICLES_PER_GROUP

interface Particle {
  alive: boolean
  written: boolean
  spawnTime: number
  x: number
  z: number
  velocityX: number
  velocityZ: number
  size: number
}

function getHullDist(ax: number, ny: number): number {
  const ay = Math.abs(ny)
  const bowWidthScale = Math.max(1 - Math.max(0, ny) * 0.5, 0.02)
  const bowDist = Math.cbrt((ax / bowWidthScale) ** 3 + (ay * 1.2) ** 3)
  const sternBeam = Math.max(1 - Math.pow(Math.max(0, -ny), 3) * 0.3, 0.05)
  const sternDist = Math.max(ax / sternBeam, ay)
  const bowBlend = Math.max(0, Math.min(1, ny * 2))
  return bowDist * bowBlend + sternDist * (1 - bowBlend)
}

function findBoundaryNx(ny: number): number {
  let lo = 0,
    hi = 2
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2
    if (getHullDist(mid, ny) < 1) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export default function HullRipples({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const groupIndex = useRef(0)
  const prevBobSign = useRef(1)

  const particles = useRef<Particle[]>(
    Array.from({ length: TOTAL }, () => ({
      alive: false,
      written: true,
      spawnTime: 0,
      x: 0,
      z: 0,
      velocityX: 0,
      velocityZ: 0,
      size: 1,
    }))
  )

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const material = useMemo(
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
    const mesh = meshRef.current
    if (mesh) {
      dummy.scale.setScalar(0)
      dummy.updateMatrix()
      for (let i = 0; i < TOTAL; i++) mesh.setMatrixAt(i, dummy.matrix)
      mesh.instanceMatrix.needsUpdate = true
    }
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [])

  useFrame(({ clock }) => {
    const ship = shipRef.current
    if (!ship) return
    const mesh = meshRef.current
    if (!mesh) return

    const { ship: s } = useDebugStore.getState()
    const cycle = useCycleStore.getState()
    const time = clock.getElapsedTime()

    const bobSign = Math.sin(time * s.bobSpeed) >= 0 ? 1 : -1
    if (prevBobSign.current > 0 && bobSign < 0) spawnGroup(time, ship, s)
    prevBobSign.current = bobSign

    let dirty = false
    for (let i = 0; i < TOTAL; i++) {
      const p = particles.current[i]

      if (!p.alive) {
        if (!p.written) {
          p.written = true
          dummy.scale.setScalar(0)
          dummy.position.y = -9999
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
          dirty = true
        }
        continue
      }

      const age = time - p.spawnTime
      if (age >= s.partLife) {
        p.alive = false
        p.written = false
        continue
      }

      const progress = age / s.partLife
      dummy.position.set(
        p.x + p.velocityX * age * s.partSpeed,
        0.6,
        p.z + p.velocityZ * age * s.partSpeed
      )
      dummy.scale.setScalar(p.size * Math.max(0, 1 - progress * 1.25))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      dirty = true
    }

    if (dirty) mesh.instanceMatrix.needsUpdate = true
    material.color.copy(cycle.foamColor)
  })

  function spawnGroup(
    time: number,
    ship: THREE.Group,
    s: ReturnType<typeof useDebugStore.getState>['ship']
  ) {
    const heading = ship.rotation.y
    const cos = Math.cos(heading)
    const sin = Math.sin(heading)
    const slotBase = (groupIndex.current % GROUPS) * PARTICLES_PER_GROUP
    const fb = hullFoamBound(s.modelSize, s.foamWidth) - Math.sin(time * s.bobSpeed) * 0.008
    const hullAspect = s.modelSize / (2 * fb * FOAM_PLANE_SIZE)
    const hullHalf = fb * FOAM_PLANE_SIZE

    for (let i = 0; i < PARTICLES_PER_GROUP; i++) {
      const t = i / PARTICLES_PER_GROUP
      const ny_norm = t < 0.5 ? t * 4 - 1 : 1 - (t - 0.5) * 4
      const nx_norm = (t < 0.5 ? -1 : 1) * findBoundaryNx(ny_norm)

      const jitter = hullHalf * 0.23
      const localX = nx_norm * hullHalf + (Math.random() - 0.5) * jitter
      const localZ = -ny_norm * hullHalf * hullAspect + (Math.random() - 0.5) * jitter

      const worldX = ship.position.x + cos * localX + sin * localZ
      const worldZ = ship.position.z - sin * localX + cos * localZ
      const dx = worldX - ship.position.x
      const dz = worldZ - ship.position.z
      const len = Math.sqrt(dx * dx + dz * dz) || 1

      const p = particles.current[slotBase + i]
      p.alive = true
      p.written = false
      p.spawnTime = time
      p.x = worldX
      p.z = worldZ
      p.velocityX = dx / len + (Math.random() - 0.5) * 0.25
      p.velocityZ = dz / len + (Math.random() - 0.5) * 0.25
      p.size = hullHalf * (0.09 + Math.random() * 0.15)
    }

    groupIndex.current++
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL]}
      frustumCulled={false}
      renderOrder={4}
    />
  )
}
