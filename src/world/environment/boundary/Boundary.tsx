import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  FORWARD_RISE,
  GROUND_FORWARD,
  HEIGHT_RISE,
  SCREEN_RIGHT,
} from '@/app/experience/cameraFraming'
import { IS_DEBUG } from '@/app/experience/constants'
import { useDebugStore } from '@/store/debugStore'
import { useCycleStore } from '@/store/cycleStore'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { floatDefines, glslVec2 } from '@/utils/glsl'
import { mix } from '@/utils/math'
import { cloudShadowUniforms } from '../weather/cloudShadow'
import {
  FOG_BROAD_TILE,
  FOG_DETAIL_BLUR,
  FOG_FINE_SHARE,
  FOG_FINE_TILE,
  FOG_FLOOR_Y,
  FOG_HAZE,
  FOG_HAZE_REACH,
  FOG_LEAN_SHARE,
  FOG_LIGHT_GAIN,
  FOG_LIGHT_STEP,
  FOG_LIT_MIX,
  FOG_LIT_MIX_NIGHT,
  FOG_OUTER_MARGIN,
  FOG_RISE_END,
  FOG_RISE_START,
  FOG_RISE_WARP,
  FOG_SEGMENTS,
  FOG_SHADE_MIX,
  FOG_SHEET_LEVEL,
  FOG_SHEET_REACH,
  FOG_SHEET_SWELL,
  FOG_SHEET_SWELL_BASE,
  FOG_SHEET_WARP,
  FOG_SHELLS,
  FOG_SOFT,
  FOG_SUN_FULL_HEIGHT,
  FOG_VALLEY,
} from './constants'
import VERT from './shaders/boundary.vert.glsl'
import FRAG from './shaders/boundary.frag.glsl'

const AWAY_X = -GROUND_FORWARD.x
const AWAY_Z = -GROUND_FORWARD.y
const LEAN = (FOG_LEAN_SHARE * HEIGHT_RISE) / FORWARD_RISE

const _moonLight = new THREE.Vector2()

function buildFogShells() {
  const ring = new THREE.RingGeometry(1, 2, FOG_SEGMENTS, 1)
  const lifts = Float32Array.from({ length: FOG_SHELLS }, (_, shell) => shell / FOG_SHELLS)

  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setAttribute('position', ring.getAttribute('position'))
  geometry.setIndex(ring.getIndex())
  geometry.setAttribute('aLift', new THREE.InstancedBufferAttribute(lifts, 1))
  geometry.instanceCount = FOG_SHELLS
  return geometry
}

function BoundaryFog() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { geometry, material } = useMemo(
    () => ({
      geometry: buildFogShells(),
      material: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        defines: {
          FOG_SEEN_ACROSS: glslVec2(SCREEN_RIGHT.x, SCREEN_RIGHT.z),
          FOG_SEEN_RISE: glslVec2(AWAY_X * FORWARD_RISE, AWAY_Z * FORWARD_RISE),
          FOG_LEAN: glslVec2(GROUND_FORWARD.x * LEAN, GROUND_FORWARD.y * LEAN),
          ...floatDefines({
            FOG_BROAD_TILE,
            FOG_DETAIL_BLUR,
            FOG_FINE_SHARE,
            FOG_FINE_TILE,
            FOG_FLOOR_Y,
            FOG_HAZE,
            FOG_HAZE_REACH,
            FOG_LIGHT_GAIN,
            FOG_LIGHT_STEP,
            FOG_OUTER_MARGIN,
            FOG_RISE_END,
            FOG_RISE_START,
            FOG_RISE_WARP,
            FOG_SHEET_LEVEL,
            FOG_SHEET_REACH,
            FOG_SHEET_SWELL,
            FOG_SHEET_SWELL_BASE,
            FOG_SHEET_WARP,
            FOG_SHELLS,
            FOG_SOFT,
            FOG_VALLEY,
          }),
        },
        uniforms: {
          uTime: { value: 0 },
          uRadius: { value: 0 },
          uFalloff: { value: 0 },
          uHeight: { value: 0 },
          uColor: { value: useCycleStore.getState().fogColor },
          uShade: { value: new THREE.Color() },
          uLit: { value: new THREE.Color() },
          uLight: { value: new THREE.Vector2() },
          uCloudMap: cloudShadowUniforms.uCloudMap,
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    }),
    []
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const boundary = useDebugStore.getState().boundary
    const cycle = useCycleStore.getState()
    const { oceanSunDir: sun, oceanMoonDir: moon, nightFactor } = cycle
    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uRadius.value = boundary.radius
    uniforms.uFalloff.value = boundary.falloff
    uniforms.uHeight.value = boundary.bankHeight
    uniforms.uShade.value.lerpColors(cycle.fogColor, cycle.oceanDeep, FOG_SHADE_MIX)
    uniforms.uLit.value.lerpColors(
      cycle.fogColor,
      cycle.foamColor,
      mix(FOG_LIT_MIX, FOG_LIT_MIX_NIGHT, nightFactor)
    )
    uniforms.uLight.value
      .set(sun.x, sun.z)
      .normalize()
      .multiplyScalar(THREE.MathUtils.smoothstep(sun.y, 0, FOG_SUN_FULL_HEIGHT))
      .addScaledVector(_moonLight.set(moon.x, moon.z).normalize(), nightFactor)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.fog}
    />
  )
}

function BoundaryRing() {
  const { radius } = useDebugStore((s) => s.boundary)
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={3} renderOrder={RENDER_LAYER.guide}>
      <ringGeometry args={[radius - 1, radius + 1, 128]} />
      <meshBasicMaterial
        color="#ff4444"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Boundary() {
  return (
    <>
      <BoundaryFog />
      {IS_DEBUG && <BoundaryRing />}
    </>
  )
}
