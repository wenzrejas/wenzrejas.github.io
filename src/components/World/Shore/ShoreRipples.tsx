import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import VERT from './shaders/shore.vert.glsl'
import FRAG from './shaders/shore.frag.glsl'
import { SHORE_DEFAULTS, SHORE_MARGIN, SHORE_Y } from './constants'
import type { IslandKey } from '../Islands/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../Islands/islandSpecs'
import type { ShoreRing } from '../Islands/islandSpec'
import {
  createIslandTransform,
  islandTransform,
  toWorld,
  type IslandTransform,
} from '../Islands/islandTransform'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'

const FLAT_PROFILE = new Float32Array(8).fill(1)

const _transforms = Object.fromEntries(
  ISLAND_KEYS.map((key) => [key, createIslandTransform()])
) as Record<IslandKey, IslandTransform>
const _position = new THREE.Vector2()

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
  id: string
  key: IslandKey
  ring: ShoreRing
  peak: number
  span: number
  tex: THREE.DataTexture
  material: THREE.ShaderMaterial
}

function buildShores(): ShoreEntry[] {
  const entries: ShoreEntry[] = []
  const shipped = createIslandTransform()

  for (const key of ISLAND_KEYS) {
    const spec = ISLAND_SPECS[key]
    const baseScale = islandTransform(key, spec.tuning, shipped).scale

    spec.shore.forEach((ring, i) => {
      const opts = { ...SHORE_DEFAULTS, ...spec.shoreOptions, ...ring.options }
      const { tex, peak } = profileTexture(ring.profile ?? FLAT_PROFILE)
      const peakModel = ring.profile ? peak : ring.radius

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uProfile: { value: tex },
          uScale: { value: peakModel * baseScale },
          uRotation: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(1, 1, 1) },
          uWidth: { value: opts.width },
          uRim: { value: opts.rim },
          uReach: { value: opts.reach },
          uInset: { value: opts.inset },
          uSpeed: { value: opts.speed },
          uSegments: { value: opts.segments },
          uDashMin: { value: opts.dashMin },
          uDashMax: { value: opts.dashMax },
          uDashBias: { value: opts.dashBias },
          uStrength: { value: opts.strength },
          uWobble: { value: opts.wobble },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      })

      const outer = peakModel * baseScale
      const span = (outer + opts.reach + opts.wobble + SHORE_MARGIN) * 2

      entries.push({ id: `${key}-${i}`, key, ring, peak: peakModel, span, tex, material })
    })
  }

  return entries
}

export default function ShoreRipples() {
  const shores = useMemo(() => buildShores(), [])
  const meshes = useRef<(THREE.Mesh | null)[]>([])

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
    const tuning = useDebugStore.getState().islands
    for (const key of ISLAND_KEYS) islandTransform(key, tuning[key], _transforms[key])

    shores.forEach(({ key, ring, peak, material }, i) => {
      const transform = _transforms[key]

      const u = material.uniforms
      u.uTime.value = time
      u.uColor.value.copy(foam)
      u.uScale.value = peak * transform.scale
      u.uRotation.value = transform.facing

      const mesh = meshes.current[i]
      if (!mesh) return
      toWorld(transform, ring.x, ring.z, _position)
      mesh.position.set(_position.x, SHORE_Y, _position.y)
    })
  })

  return (
    <>
      {shores.map(({ id, span, material }, i) => (
        <mesh
          key={id}
          ref={(el) => {
            meshes.current[i] = el
          }}
          material={material}
          rotation-x={-Math.PI / 2}
          renderOrder={3}
        >
          <planeGeometry args={[span, span]} />
        </mesh>
      ))}
    </>
  )
}
