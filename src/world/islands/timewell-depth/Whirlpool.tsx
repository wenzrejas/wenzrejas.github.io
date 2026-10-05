import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useCycleStore } from '@/store/cycleStore'
import { enterDepths } from '@/store/viewStore'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { mix } from '@/utils/math'
import { syncWhirlpoolFunnel } from './whirlpoolFunnel'
import InteractionMarker from '@/interaction/InteractionMarker'
import { SHORE_Y } from '@/world/shore/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import { createFieldTexture } from '@/world/shore/shorelineModel'
import { nightGlow } from '../shared/nightGlow'
import {
  WHIRLPOOL_EYE_X,
  WHIRLPOOL_EYE_Z,
  WHIRLPOOL_FLOW_DENSITY,
  WHIRLPOOL_FLOW_SPEED,
  WHIRLPOOL_FUNNEL_CURVE,
  WHIRLPOOL_FUNNEL_DEPTH,
  WHIRLPOOL_MAGIC_DAY_SHARE,
  WHIRLPOOL_MARKER_LIFT,
  WHIRLPOOL_RADIUS,
  WHIRLPOOL_TWIST,
} from './constants'
import { TIMEWELL_BASIN } from './shoreProfile'
import { alignToShore, buildWhirlpoolGeometry, createWhirlpoolMaterial } from './whirlpoolModel'
import WhirlpoolMotes from './WhirlpoolMotes'

interface WhirlpoolProps {
  shoreline: ShoreField
  center: THREE.Vector3
  islandScale: number
  offsetY: number
}

const _eye = new THREE.Vector3()
const _visibleEye = new THREE.Vector3()

export default function Whirlpool({ shoreline, center, islandScale, offsetY }: WhirlpoolProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildWhirlpoolGeometry(), [])
  const material = useMemo(() => createWhirlpoolMaterial(), [])
  const shoreTexture = useMemo(() => createFieldTexture(shoreline), [shoreline])
  const eyeGap = useCallback((x: number, z: number) => {
    const mesh = meshRef.current
    if (!mesh) return Infinity
    mesh.localToWorld(_visibleEye.set(WHIRLPOOL_EYE_X, 0, WHIRLPOOL_EYE_Z))
    return Math.hypot(x - _visibleEye.x, z - _visibleEye.z)
  }, [])

  useEffect(() => () => shoreTexture.dispose(), [shoreTexture])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )
  useLayoutEffect(
    () => alignToShore(material, shoreline, shoreTexture, center, islandScale),
    [material, shoreline, shoreTexture, center, islandScale]
  )
  useEffect(
    () => () => {
      useWhirlpoolStore.getState().active = false
      syncWhirlpoolFunnel()
    },
    []
  )

  useFrame(({ clock, scene }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const presence = useWhirlpoolStore.getState()
    mesh.getWorldPosition(_eye)
    presence.active = true
    presence.x = _eye.x
    presence.z = _eye.z
    presence.radius = WHIRLPOOL_RADIUS * islandScale
    presence.depth = WHIRLPOOL_FUNNEL_DEPTH * presence.radius
    presence.curve = WHIRLPOOL_FUNNEL_CURVE
    presence.twist = WHIRLPOOL_TWIST
    presence.drainRate = WHIRLPOOL_FLOW_SPEED / WHIRLPOOL_FLOW_DENSITY
    syncWhirlpoolFunnel()

    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uNight.value = nightGlow()
    uniforms.uMagic.value = mix(WHIRLPOOL_MAGIC_DAY_SHARE, 1, uniforms.uNight.value)
    uniforms.uFoamColor.value.copy(useCycleStore.getState().foamColor)
    if (scene.background instanceof THREE.Color) {
      uniforms.uBackground.value.copyLinearToSRGB(scene.background)
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[
        center.x + TIMEWELL_BASIN.x,
        (SHORE_Y - offsetY) / islandScale,
        center.z + TIMEWELL_BASIN.z,
      ]}
      scale={WHIRLPOOL_RADIUS}
      renderOrder={2.5}
    >
      <WhirlpoolMotes islandScale={islandScale} />
      <InteractionMarker
        position={[WHIRLPOOL_EYE_X, WHIRLPOOL_MARKER_LIFT, WHIRLPOOL_EYE_Z]}
        label={ISLAND_COPY.timewell.marker}
        onActivate={enterDepths}
        baseGap={eyeGap}
      />
    </mesh>
  )
}
