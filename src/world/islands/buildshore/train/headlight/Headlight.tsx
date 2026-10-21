import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { buildFlatQuad } from '@/utils/geometry'
import { uniformsOf } from '@/utils/meshes'
import { pixelsPerUnit } from '@/utils/screen'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import {
  BEAM_LENGTH,
  BEAM_STRENGTH,
  BEAM_TILT_DEG,
  HALO_SIZE,
  HEADLIGHT_VISIBLE_LEVEL,
  POOL_HEIGHT,
  POOL_LENGTH,
  POOL_START,
  POOL_STRENGTH,
  POOL_WIDTH,
} from './constants'
import type { Lamps } from './lamps'
import {
  buildBeamGeometry,
  buildHaloGeometry,
  createBeamMaterial,
  createHaloMaterial,
  createPoolMaterial,
} from './headlightModel'

const BEAM_TILT = THREE.MathUtils.degToRad(BEAM_TILT_DEG)

interface HeadlightProps {
  lamps: Lamps
  islandScale: number
}

export default function Headlight({ lamps, islandScale }: HeadlightProps) {
  const groupRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const poolRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Points>(null)
  const beamGeometry = useMemo(() => buildBeamGeometry(lamps.lensRadius), [lamps])
  const poolGeometry = useMemo(() => buildFlatQuad(), [])
  const haloGeometry = useMemo(() => buildHaloGeometry(lamps), [lamps])
  const beamMaterial = useMemo(() => createBeamMaterial(), [])
  const poolMaterial = useMemo(() => createPoolMaterial(), [])
  const haloMaterial = useMemo(() => createHaloMaterial(), [])

  useEffect(
    () => () => {
      for (const resource of [
        beamGeometry,
        poolGeometry,
        haloGeometry,
        beamMaterial,
        poolMaterial,
        haloMaterial,
      ])
        resource.dispose()
    },
    [beamGeometry, poolGeometry, haloGeometry, beamMaterial, poolMaterial, haloMaterial]
  )

  useFrame(({ camera, gl }) => {
    const group = groupRef.current
    const beam = beamRef.current
    const pool = poolRef.current
    const halo = haloRef.current
    if (!group || !beam || !pool || !halo) return

    const level = nightGlow()
    group.visible = level > HEADLIGHT_VISIBLE_LEVEL
    if (!group.visible) return

    uniformsOf(beam).uIntensity.value = level * BEAM_STRENGTH
    uniformsOf(pool).uIntensity.value = level * POOL_STRENGTH
    const haloUniforms = uniformsOf(halo)
    haloUniforms.uGlow.value = level
    haloUniforms.uSize.value = HALO_SIZE * islandScale * pixelsPerUnit(camera, gl)
  })

  const { headlight } = lamps
  return (
    <group ref={groupRef} visible={false}>
      <mesh
        ref={beamRef}
        geometry={beamGeometry}
        material={beamMaterial}
        position={headlight}
        scale={BEAM_LENGTH}
        rotation={[0, 0, -BEAM_TILT]}
        renderOrder={RENDER_LAYER.effects}
      />
      <mesh
        ref={poolRef}
        geometry={poolGeometry}
        material={poolMaterial}
        position={[headlight.x + POOL_START + POOL_LENGTH / 2, POOL_HEIGHT, headlight.z]}
        scale={[POOL_LENGTH, 1, POOL_WIDTH]}
        renderOrder={RENDER_LAYER.effects}
      />
      <points
        ref={haloRef}
        geometry={haloGeometry}
        material={haloMaterial}
        renderOrder={RENDER_LAYER.glow}
      />
    </group>
  )
}
