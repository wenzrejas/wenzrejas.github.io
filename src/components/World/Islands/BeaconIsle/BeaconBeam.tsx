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

const VERT = /* glsl */ `
varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  vLocal  = position;
  vFacing = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */ `
uniform vec3  uColor;
uniform float uIntensity;

varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  float t = clamp(vLocal.x, 0.0, 1.0);

  float along = smoothstep(0.0, 0.02, t) * pow(1.0 - t, 1.3);
  float face  = pow(abs(normalize(vFacing).z), 1.4);

  float a = along * mix(0.12, 1.0, face) * uIntensity;
  if (a <= 0.002) discard;

  gl_FragColor = vec4(uColor, a);
}
`

const HALF_SPREAD = THREE.MathUtils.degToRad(BEAM_SPREAD_DEG) / 2
const TILT = THREE.MathUtils.degToRad(BEAM_TILT_DEG)
const YAW = THREE.MathUtils.degToRad(BEAM_YAW_DEG)

interface BeaconBeamProps {
  origin: THREE.Vector3
  head: THREE.Object3D | null
  headRest: number
}

export default function BeaconBeam({ origin, head, headRest }: BeaconBeamProps) {
  const groupRef = useRef<THREE.Group>(null)
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
      vertexShader: VERT,
      fragmentShader: FRAG,
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
    if (!group) return

    const sun = useCycleStore.getState().oceanSunDir.y
    const level = (1 - THREE.MathUtils.smoothstep(sun, BEAM_SUN_FULL, BEAM_SUN_ON)) * BEAM_STRENGTH
    group.visible = level > 0.002
    if (!group.visible) return

    sweep.current += Math.min(delta, MAX_DT) * BEAM_SPEED
    group.rotation.y = sweep.current
    if (head) head.rotation.y = headRest + sweep.current

    material.uniforms.uIntensity.value = level
  })

  return (
    <group ref={groupRef} position={origin}>
      <mesh
        geometry={geometry}
        material={material}
        scale={BEAM_LENGTH}
        rotation={[0, YAW, -TILT]}
        renderOrder={4}
      />
    </group>
  )
}
