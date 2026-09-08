import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import VERT from './shaders/shore.vert.glsl'
import FRAG from './shaders/shore.frag.glsl'
import { SHORE_DEFAULTS, SHORE_MARGIN, SHORE_Y } from './constants'
import { COZY_FOOTPRINT, COZY_SHORE_PROFILE } from './cozyShoreProfile'
import { WORLD_LOCATIONS, type IslandConfig, type IslandKey } from '../Islands/constants'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'

const FLAT_PROFILE = new Float32Array(8).fill(1)

function profileTexture(data: Float32Array) {
  const peak = Math.max(...data)
  const bytes = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) bytes[i] = Math.round((data[i] / peak) * 255)

  const tex = new THREE.DataTexture(bytes, data.length, 1, THREE.RedFormat, THREE.UnsignedByteType)
  tex.wrapS = THREE.RepeatWrapping
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return { tex, peak }
}

interface ShoreEntry {
  key: IslandKey
  config: IslandConfig
  cozy: boolean
  peak: number
  span: number
  tex: THREE.DataTexture
  material: THREE.ShaderMaterial
}

function buildShores(): ShoreEntry[] {
  return (Object.entries(WORLD_LOCATIONS) as [IslandKey, IslandConfig][]).map(([key, config]) => {
    const cozy = key === 'cozy'
    const { tex, peak } = profileTexture(cozy ? COZY_SHORE_PROFILE : FLAT_PROFILE)

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uProfile: { value: tex },
        uScale: { value: config.radius },
        uRotation: { value: 0 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(1, 1, 1) },
        uWidth: { value: SHORE_DEFAULTS.width },
        uRim: { value: SHORE_DEFAULTS.rim },
        uReach: { value: SHORE_DEFAULTS.reach },
        uInset: { value: SHORE_DEFAULTS.inset },
        uSpeed: { value: SHORE_DEFAULTS.speed },
        uSegments: { value: SHORE_DEFAULTS.segments },
        uDashMin: { value: SHORE_DEFAULTS.dashMin },
        uDashMax: { value: SHORE_DEFAULTS.dashMax },
        uStrength: { value: SHORE_DEFAULTS.strength },
        uWobble: { value: SHORE_DEFAULTS.wobble },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    })

    const maxRadius = cozy ? (peak * config.radius * 2) / COZY_FOOTPRINT : config.radius
    const span = (maxRadius + SHORE_DEFAULTS.reach + SHORE_DEFAULTS.wobble + SHORE_MARGIN) * 2

    return { key, config, cozy, peak, span, tex, material }
  })
}

export default function ShoreRipples() {
  const shores = useMemo(() => buildShores(), [])

  useEffect(
    () => () => {
      for (const { material, tex } of shores) {
        material.dispose()
        tex.dispose()
      }
    },
    [shores]
  )

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const foam = useCycleStore.getState().foamColor
    const island = useDebugStore.getState().island

    for (const { cozy, config, peak, material } of shores) {
      const u = material.uniforms
      u.uTime.value = time
      u.uColor.value.copy(foam)

      if (cozy) {
        u.uScale.value = (peak * config.radius * 2 * island.scale) / COZY_FOOTPRINT
        u.uRotation.value = THREE.MathUtils.degToRad(island.rotation)
      }
    }
  })

  return (
    <>
      {shores.map(({ key, config, span, material }) => (
        <mesh
          key={key}
          material={material}
          position={[config.position[0], SHORE_Y, config.position[2]]}
          rotation-x={-Math.PI / 2}
          renderOrder={3}
        >
          <planeGeometry args={[span, span]} />
        </mesh>
      ))}
    </>
  )
}
