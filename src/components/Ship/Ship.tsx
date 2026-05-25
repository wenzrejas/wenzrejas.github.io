import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FOAM_VERT, FOAM_FRAG } from './shaders/foam'
import {
  DIR_OFFSET,
  SHIP_HALF_WIDTH,
  SHIP_HALF_DEPTH,
  FOAM_PLANE_SIZE,
  RIPPLE_MAX,
  PARTICLES_PER_RIPPLE,
  TOTAL_PARTICLES,
} from './constants'
import { useDebug } from '../Debug/DebugControls'

interface Particle {
  alive: boolean
  spawnTime: number
  x: number
  z: number
  velocityX: number
  velocityZ: number
  size: number
}

const Ship = forwardRef<THREE.Mesh>((_props, ref) => {
  const { ship } = useDebug()
  const { baseY, bobAmp, bobSpeed, moveSpeed, turnSpeed, tiltMax, tiltSpeed, partLife, partSpeed } =
    ship

  const shipMeshRef = useRef<THREE.Mesh>(null)
  const foamMeshRef = useRef<THREE.Mesh>(null)
  const rippleInstancesRef = useRef<THREE.InstancedMesh>(null)
  const pressedKeys = useRef({ forward: false, backward: false, left: false, right: false })
  const headingAngle = useRef(0)
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
        uniforms: { uTime: { value: 0 }, uFoamBound: { value: 0.29 } },
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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') pressedKeys.current.forward = true
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')
        pressedKeys.current.backward = true
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') pressedKeys.current.left = true
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') pressedKeys.current.right = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') pressedKeys.current.forward = false
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')
        pressedKeys.current.backward = false
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') pressedKeys.current.left = false
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight')
        pressedKeys.current.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      foamMaterial.dispose()
      rippleGeometry.dispose()
      rippleMaterial.dispose()
    }
  }, [dummyObject, foamMaterial, rippleGeometry, rippleMaterial])

  const spawnHullRipple = (time: number, mesh: THREE.Mesh) => {
    const cos = Math.cos(headingAngle.current)
    const sin = Math.sin(headingAngle.current)
    const slotBase = (rippleGroupIndex.current % RIPPLE_MAX) * PARTICLES_PER_RIPPLE
    const shipWidth = SHIP_HALF_WIDTH * 2
    const shipHeight = SHIP_HALF_DEPTH * 2
    const perimeter = 2 * (shipWidth + shipHeight)

    for (let i = 0; i < PARTICLES_PER_RIPPLE; i++) {
      const dist = (i / PARTICLES_PER_RIPPLE) * perimeter
      let localX: number, localZ: number

      if (dist < shipWidth) {
        localX = dist - SHIP_HALF_WIDTH
        localZ = -SHIP_HALF_DEPTH
      } else if (dist < shipWidth + shipHeight) {
        localX = SHIP_HALF_WIDTH
        localZ = dist - shipWidth - SHIP_HALF_DEPTH
      } else if (dist < 2 * shipWidth + shipHeight) {
        localX = SHIP_HALF_WIDTH - (dist - shipWidth - shipHeight)
        localZ = SHIP_HALF_DEPTH
      } else {
        localX = -SHIP_HALF_WIDTH
        localZ = SHIP_HALF_DEPTH - (dist - 2 * shipWidth - shipHeight)
      }

      localX += (Math.random() - 0.5) * 2.0
      localZ += (Math.random() - 0.5) * 2.0

      const worldX = mesh.position.x + cos * localX + sin * localZ
      const worldZ = mesh.position.z - sin * localX + cos * localZ

      const outwardX = worldX - mesh.position.x
      const outwardZ = worldZ - mesh.position.z
      const outwardDist = Math.sqrt(outwardX * outwardX + outwardZ * outwardZ) || 1

      const particle = particles.current[slotBase + i]
      particle.alive = true
      particle.spawnTime = time
      particle.x = worldX
      particle.z = worldZ
      particle.velocityX = outwardX / outwardDist + (Math.random() - 0.5) * 0.25
      particle.velocityZ = outwardZ / outwardDist + (Math.random() - 0.5) * 0.25
      particle.size = 0.6 + Math.random() * 1.0
    }

    rippleGroupIndex.current++
  }

  useFrame(({ clock }, delta) => {
    const mesh = shipMeshRef.current
    if (!mesh) return

    const dt = isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0.016
    const time = clock.getElapsedTime()

    if (pressedKeys.current.left) headingAngle.current += turnSpeed * dt
    if (pressedKeys.current.right) headingAngle.current -= turnSpeed * dt

    if (pressedKeys.current.forward || pressedKeys.current.backward) {
      const angle = headingAngle.current + DIR_OFFSET
      const direction = pressedKeys.current.forward ? 1 : -1
      mesh.position.x -= Math.sin(angle) * moveSpeed * direction * dt
      mesh.position.z -= Math.cos(angle) * moveSpeed * direction * dt
    }

    const tiltTarget = pressedKeys.current.left ? tiltMax : pressedKeys.current.right ? -tiltMax : 0
    tiltAngle.current += (tiltTarget - tiltAngle.current) * Math.min(1, tiltSpeed * dt)

    mesh.rotation.y = headingAngle.current
    mesh.rotation.z = tiltAngle.current
    mesh.position.y = baseY + Math.sin(time * bobSpeed) * bobAmp

    const foamMesh = foamMeshRef.current
    if (foamMesh) {
      foamMesh.position.x = mesh.position.x
      foamMesh.position.z = mesh.position.z
      foamMesh.rotation.set(-Math.PI / 2, headingAngle.current, 0, 'YXZ')
      foamMaterial.uniforms.uTime.value = time
      foamMaterial.uniforms.uFoamBound.value = 0.275 - Math.sin(time * bobSpeed) * 0.015
    }

    const bobSign = Math.sin(time * bobSpeed) >= 0 ? 1 : -1
    if (prevBobSign.current > 0 && bobSign < 0) spawnHullRipple(time, mesh)
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
  })

  return (
    <>
      <mesh
        ref={(el) => {
          shipMeshRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        position={[0, baseY, 0]}
        scale={8}
      >
        <boxGeometry />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      <mesh
        ref={foamMeshRef}
        position={[0, 0.5, 0]}
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
