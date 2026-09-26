import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../../store/cycleStore'
import { MAX_DT } from '../../../../utils/time'
import {
  BEAM_COLOR,
  BEAM_LENGTH,
  BEAM_SPEED,
  BEAM_SPREAD_DEG,
  BEAM_STRENGTH,
  BEAM_SUN_FULL,
  BEAM_SUN_ON,
  BEAM_TILT_DEG,
  BEAM_YAW_DEG,
} from './constants'
import BEAM_VERT from './shaders/luminaBeam.vert.glsl'
import BEAM_FRAG from './shaders/luminaBeam.frag.glsl'

const HALF_SPREAD = THREE.MathUtils.degToRad(BEAM_SPREAD_DEG) / 2
const TILT = THREE.MathUtils.degToRad(BEAM_TILT_DEG)
const YAW = THREE.MathUtils.degToRad(BEAM_YAW_DEG)

interface LuminaBeamProps {
  origin: THREE.Vector3
  head: THREE.Object3D | null
  headRest: number
}

function aimHead(head: THREE.Object3D | null, yaw: number) {
  if (head) head.rotation.y = yaw
}

export default function LuminaBeam({ origin, head, headRest }: LuminaBeamProps) {
  const groupRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const sweep = useRef(0)

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.ConeGeometry(Math.tan(HALF_SPREAD), 1, 32, 1, true)
    geometry.rotateZ(Math.PI / 2)
    geometry.translate(0.5, 0, 0)

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: BEAM_VERT,
      fragmentShader: BEAM_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(BEAM_COLOR) },
        uIntensity: { value: 0 },
      },
    })

    return { geometry, material }
  }, [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    const beam = beamRef.current
    if (!group || !beam) return

    const sun = useCycleStore.getState().oceanSunDir.y
    const level = (1 - THREE.MathUtils.smoothstep(sun, BEAM_SUN_FULL, BEAM_SUN_ON)) * BEAM_STRENGTH
    group.visible = level > 0.002
    if (!group.visible) return

    sweep.current += Math.min(delta, MAX_DT) * BEAM_SPEED
    group.rotation.y = sweep.current
    aimHead(head, headRest + sweep.current)

    const { uniforms } = beam.material as THREE.ShaderMaterial
    uniforms.uIntensity.value = level
  })

  return (
    <group ref={groupRef} position={origin}>
      <mesh
        ref={beamRef}
        geometry={geometry}
        material={material}
        scale={BEAM_LENGTH}
        rotation={[0, YAW, -TILT]}
        renderOrder={4}
      />
    </group>
  )
}
