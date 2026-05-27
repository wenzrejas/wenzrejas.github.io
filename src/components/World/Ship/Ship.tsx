import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'
import { useKeyboardInput } from '../../../hooks/useKeyboardInput'
import {
  MODEL_BOW_OFFSET,
  MODEL_TARGET_SIZE,
  INITIAL_HEADING,
  FOAM_PLANE_SIZE,
  RIPPLE_MAX,
  PARTICLES_PER_RIPPLE,
  TOTAL_PARTICLES,
} from './constants'
import { BOUNDARY_RADIUS } from '../Boundary/constants'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'

interface Particle {
  alive: boolean
  spawnTime: number
  x: number
  z: number
  velocityX: number
  velocityZ: number
  size: number
}

const Ship = forwardRef<THREE.Group>((_props, ref) => {
  const ship = useDebugStore((s) => s.ship)
  const {
    baseY,
    bobAmp,
    bobSpeed,
    moveSpeed,
    turnSpeed,
    tiltMax,
    tiltSpeed,
    partLife,
    partSpeed,
    foamBound,
    foamY,
  } = ship

  const { scene: shipScene } = useGLTF('/models/ship/ship-medium.glb')
  const clonedScene = useMemo(() => {
    const clone = shipScene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.z)
    const scale = MODEL_TARGET_SIZE / maxDim
    clone.scale.setScalar(scale)
    clone.rotation.y = MODEL_BOW_OFFSET
    return clone
  }, [shipScene])

  const shipGroupRef = useRef<THREE.Group>(null)
  const foamMeshRef = useRef<THREE.Mesh>(null)
  const rippleInstancesRef = useRef<THREE.InstancedMesh>(null)
  const pressedKeys = useKeyboardInput()
  const headingAngle = useRef(INITIAL_HEADING)
  const tiltAngle = useRef(0)
  const prevBobSign = useRef(1)
  const rippleGroupIndex = useRef(0)
  const dummyObject = useMemo(() => new THREE.Object3D(), [])

  const particles = useRef<Particle[]>(
    Array.from({ length: TOTAL_PARTICLES }, () => ({
      alive: false,
      spawnTime: 0,
      x: 0,
      z: 0,
      velocityX: 0,
      velocityZ: 0,
      size: 1,
    }))
  )

  const foamMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uFoamBound: { value: 0.13 },
          uHullAspect: { value: 1.0 },
          uColor: { value: new THREE.Color(1, 1, 1) },
        },
        vertexShader: FOAM_VERT,
        fragmentShader: FOAM_FRAG,
      }),
    []
  )

  const rippleGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const rippleMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }),
    []
  )

  useEffect(() => {
    const rippleInstances = rippleInstancesRef.current
    if (rippleInstances) {
      dummyObject.scale.setScalar(0)
      dummyObject.updateMatrix()
      for (let i = 0; i < TOTAL_PARTICLES; i++) rippleInstances.setMatrixAt(i, dummyObject.matrix)
      rippleInstances.instanceMatrix.needsUpdate = true
    }
    return () => {
      foamMaterial.dispose()
      rippleGeometry.dispose()
      rippleMaterial.dispose()
    }
  }, [])

  const spawnHullRipple = (time: number, group: THREE.Group) => {
    const cos = Math.cos(headingAngle.current)
    const sin = Math.sin(headingAngle.current)
    const slotBase = (rippleGroupIndex.current % RIPPLE_MAX) * PARTICLES_PER_RIPPLE

    const fb = foamBound - Math.sin(time * bobSpeed) * 0.008
    const hullAspect = MODEL_TARGET_SIZE / (2 * fb * FOAM_PLANE_SIZE)

    // Mirror the foam shader hull shape
    const getHullDist = (ax: number, ny: number): number => {
      const ay = Math.abs(ny)
      const bowProgress = Math.max(0, ny)
      const bowWidthScale = Math.max(1 - bowProgress * 0.5, 0.02)
      const bx = ax / bowWidthScale
      const by = ay * 1.2
      const bowDist = Math.cbrt(bx * bx * bx + by * by * by)
      const sternSide = Math.max(0, -ny)
      const sternBeam = Math.max(1 - Math.pow(sternSide, 3) * 0.3, 0.05)
      const sternDist = Math.max(ax / sternBeam, ay)
      const bowBlend = Math.max(0, Math.min(1, ny * 2))
      return bowDist * bowBlend + sternDist * (1 - bowBlend)
    }

    const findBoundaryNx = (ny: number): number => {
      let lo = 0,
        hi = 2
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2
        if (getHullDist(mid, ny) < 1) lo = mid
        else hi = mid
      }
      return (lo + hi) / 2
    }

    for (let i = 0; i < PARTICLES_PER_RIPPLE; i++) {
      const t = i / PARTICLES_PER_RIPPLE

      // Port side (0→0.5): stern→bow, nx < 0
      // Starboard side (0.5→1): bow→stern, nx > 0
      const ny_norm = t < 0.5 ? t * 4 - 1 : 1 - (t - 0.5) * 4
      const nx_norm = (t < 0.5 ? -1 : 1) * findBoundaryNx(ny_norm)

      // Ship-local offsets: localX = starboard+, localZ = bow- (world -Z when heading=0)
      const localX = nx_norm * fb * FOAM_PLANE_SIZE + (Math.random() - 0.5) * 1.5
      const localZ = -ny_norm * fb * hullAspect * FOAM_PLANE_SIZE + (Math.random() - 0.5) * 1.5

      const worldX = group.position.x + cos * localX + sin * localZ
      const worldZ = group.position.z - sin * localX + cos * localZ

      const dx = worldX - group.position.x
      const dz = worldZ - group.position.z
      const len = Math.sqrt(dx * dx + dz * dz) || 1

      const particle = particles.current[slotBase + i]
      particle.alive = true
      particle.spawnTime = time
      particle.x = worldX
      particle.z = worldZ
      particle.velocityX = dx / len + (Math.random() - 0.5) * 0.25
      particle.velocityZ = dz / len + (Math.random() - 0.5) * 0.25
      particle.size = 0.6 + Math.random() * 1.0
    }

    rippleGroupIndex.current++
  }

  useFrame(({ clock }, delta) => {
    const group = shipGroupRef.current
    if (!group) return

    const dt = isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0.016
    const time = clock.getElapsedTime()
    const wind = useWindStore.getState()
    const weather = useWeatherStore.getState()
    const cycle = useCycleStore.getState()

    if (pressedKeys.current.left) headingAngle.current += turnSpeed * dt
    if (pressedKeys.current.right) headingAngle.current -= turnSpeed * dt

    if (pressedKeys.current.forward || pressedKeys.current.backward) {
      const direction = pressedKeys.current.forward ? 1 : -1
      const fwdX = -Math.sin(headingAngle.current)
      const fwdZ = -Math.cos(headingAngle.current)
      const windAlignment = fwdX * wind.dir.x + fwdZ * wind.dir.y
      const windMultiplier = 1 + Math.max(0, windAlignment) * 0.5 * Math.min(weather.windMult, 2.5)
      group.position.x += fwdX * moveSpeed * windMultiplier * direction * dt
      group.position.z += fwdZ * moveSpeed * windMultiplier * direction * dt
    }

    const distFromCenter = Math.sqrt(group.position.x ** 2 + group.position.z ** 2)
    if (distFromCenter > BOUNDARY_RADIUS) {
      const scale = BOUNDARY_RADIUS / distFromCenter
      group.position.x *= scale
      group.position.z *= scale
    }

    const tiltTarget = pressedKeys.current.left ? tiltMax : pressedKeys.current.right ? -tiltMax : 0
    tiltAngle.current += (tiltTarget - tiltAngle.current) * Math.min(1, tiltSpeed * dt)

    group.rotation.y = headingAngle.current
    group.rotation.z = tiltAngle.current
    group.position.y = baseY + Math.sin(time * bobSpeed) * bobAmp * weather.waveAmpMult

    const foamMesh = foamMeshRef.current
    if (foamMesh) {
      foamMesh.position.x = group.position.x
      foamMesh.position.y = foamY
      foamMesh.position.z = group.position.z
      foamMesh.rotation.set(-Math.PI / 2, headingAngle.current, 0, 'YXZ')
      foamMaterial.uniforms.uTime.value = time
      foamMaterial.uniforms.uFoamBound.value = foamBound - Math.sin(time * bobSpeed) * 0.008
      foamMaterial.uniforms.uHullAspect.value =
        MODEL_TARGET_SIZE / (2 * foamBound * FOAM_PLANE_SIZE)
      foamMaterial.uniforms.uColor.value.copy(cycle.foamColor)
    }

    const bobSign = Math.sin(time * bobSpeed) >= 0 ? 1 : -1
    if (prevBobSign.current > 0 && bobSign < 0) spawnHullRipple(time, group)
    prevBobSign.current = bobSign

    const rippleInstances = rippleInstancesRef.current
    if (!rippleInstances) return

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const particle = particles.current[i]

      if (!particle.alive) {
        dummyObject.scale.setScalar(0)
        dummyObject.position.y = -9999
        dummyObject.updateMatrix()
        rippleInstances.setMatrixAt(i, dummyObject.matrix)
        continue
      }

      const age = time - particle.spawnTime
      if (age >= partLife) {
        particle.alive = false
        dummyObject.scale.setScalar(0)
        dummyObject.position.y = -9999
        dummyObject.updateMatrix()
        rippleInstances.setMatrixAt(i, dummyObject.matrix)
        continue
      }

      const progress = age / partLife
      dummyObject.position.set(
        particle.x + particle.velocityX * age * partSpeed,
        0.6,
        particle.z + particle.velocityZ * age * partSpeed
      )
      dummyObject.scale.setScalar(particle.size * Math.max(0, 1 - progress * 1.25))
      dummyObject.updateMatrix()
      rippleInstances.setMatrixAt(i, dummyObject.matrix)
    }

    rippleInstances.instanceMatrix.needsUpdate = true
    rippleMaterial.color.copy(cycle.foamColor)
  })

  return (
    <>
      <group
        ref={(el) => {
          shipGroupRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        position={[0, baseY, 0]}
      >
        <primitive object={clonedScene} />
      </group>

      <mesh
        ref={foamMeshRef}
        position={[0, foamY, 0]}
        material={foamMaterial}
        renderOrder={3}
        frustumCulled={false}
      >
        <planeGeometry args={[FOAM_PLANE_SIZE, FOAM_PLANE_SIZE]} />
      </mesh>

      <instancedMesh
        ref={rippleInstancesRef}
        args={[rippleGeometry, rippleMaterial, TOTAL_PARTICLES]}
        frustumCulled={false}
        renderOrder={4}
      />
    </>
  )
})

Ship.displayName = 'Ship'
export default Ship
