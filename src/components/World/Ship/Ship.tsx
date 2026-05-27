import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import FOAM_VERT from './shaders/foam.vert.glsl'
import FOAM_FRAG from './shaders/foam.frag.glsl'
import { useKeyboardInput } from '../../../hooks/useKeyboardInput'
import { MODEL_BOW_OFFSET, MODEL_TARGET_SIZE, INITIAL_HEADING, FOAM_PLANE_SIZE } from './constants'
import { BOUNDARY_RADIUS } from '../Boundary/constants'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'

const Ship = forwardRef<THREE.Group>((_props, ref) => {
  const { baseY, bobAmp, bobSpeed, moveSpeed, turnSpeed, tiltMax, tiltSpeed, foamBound, foamY } =
    useDebugStore((s) => s.ship)

  const { scene: shipScene } = useGLTF('/models/ship/ship-medium.glb')
  const clonedScene = useMemo(() => {
    const clone = shipScene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const scale = MODEL_TARGET_SIZE / Math.max(size.x, size.z)
    clone.scale.setScalar(scale)
    clone.rotation.y = MODEL_BOW_OFFSET
    return clone
  }, [shipScene])

  const shipGroupRef = useRef<THREE.Group>(null)
  const foamMeshRef = useRef<THREE.Mesh>(null)
  const pressedKeys = useKeyboardInput()

  const headingAngle = useRef(INITIAL_HEADING)
  const tiltAngle = useRef(0)
  const shipVelocity = useRef({ x: 0, z: 0 })

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

  useEffect(
    () => () => {
      foamMaterial.dispose()
    },
    [foamMaterial]
  )

  useFrame(({ clock }, delta) => {
    const group = shipGroupRef.current
    if (!group) return

    const dt = isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0.016
    const time = clock.getElapsedTime()
    const wind = useWindStore.getState()
    const weather = useWeatherStore.getState()
    const cycle = useCycleStore.getState()

    // ── Turning ───────────────────────────────────────────────────────────
    if (pressedKeys.current.left) headingAngle.current += turnSpeed * dt
    if (pressedKeys.current.right) headingAngle.current -= turnSpeed * dt

    // ── Velocity with wind assist ─────────────────────────────────────────
    const fwdX = -Math.sin(headingAngle.current)
    const fwdZ = -Math.cos(headingAngle.current)

    let targetVelX = 0
    let targetVelZ = 0
    if (pressedKeys.current.forward || pressedKeys.current.backward) {
      const direction = pressedKeys.current.forward ? 1 : -1
      const windAlignment = fwdX * wind.dir.x + fwdZ * wind.dir.y
      const windMult = 1 + Math.max(0, windAlignment) * 0.3 * Math.min(weather.windMult, 2.5)
      targetVelX = fwdX * moveSpeed * windMult * direction
      targetVelZ = fwdZ * moveSpeed * windMult * direction
    }

    const velLerp = Math.min(1, 6 * dt)
    shipVelocity.current.x += (targetVelX - shipVelocity.current.x) * velLerp
    shipVelocity.current.z += (targetVelZ - shipVelocity.current.z) * velLerp
    group.position.x += shipVelocity.current.x * dt
    group.position.z += shipVelocity.current.z * dt

    // ── Boundary clamp ────────────────────────────────────────────────────
    const dist = Math.sqrt(group.position.x ** 2 + group.position.z ** 2)
    if (dist > BOUNDARY_RADIUS) {
      const scale = BOUNDARY_RADIUS / dist
      group.position.x *= scale
      group.position.z *= scale
    }

    // ── Tilt and bob ──────────────────────────────────────────────────────
    const tiltTarget = pressedKeys.current.left ? tiltMax : pressedKeys.current.right ? -tiltMax : 0
    tiltAngle.current += (tiltTarget - tiltAngle.current) * Math.min(1, tiltSpeed * dt)

    group.rotation.y = headingAngle.current
    group.rotation.z = tiltAngle.current
    group.position.y = baseY + Math.sin(time * bobSpeed) * bobAmp * weather.waveAmpMult

    // ── Foam plane ────────────────────────────────────────────────────────
    const foamMesh = foamMeshRef.current
    if (foamMesh) {
      foamMesh.position.set(group.position.x, foamY, group.position.z)
      foamMesh.rotation.set(-Math.PI / 2, headingAngle.current, 0, 'YXZ')
      foamMaterial.uniforms.uTime.value = time
      foamMaterial.uniforms.uFoamBound.value = foamBound - Math.sin(time * bobSpeed) * 0.008
      foamMaterial.uniforms.uHullAspect.value =
        MODEL_TARGET_SIZE / (2 * foamBound * FOAM_PLANE_SIZE)
      foamMaterial.uniforms.uColor.value.copy(cycle.foamColor)
    }
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
    </>
  )
})

Ship.displayName = 'Ship'
export default Ship
