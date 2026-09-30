import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../../store/cycleStore'
import { useWhirlpoolStore } from '../../../../store/whirlpoolStore'
import { mix } from '../../../../utils/math'
import { syncWhirlpoolFunnel } from '../../../../utils/whirlpoolFunnel'
import { SHORE_Y } from '../../Shore/constants'
import type { ShoreField } from '../../Shore/shoreField'
import { createFieldTexture } from '../../Shore/shorelineModel'
import { nightGlow } from '../nightGlow'
import {
  WHIRLPOOL_FLOW_DENSITY,
  WHIRLPOOL_FLOW_SPEED,
  WHIRLPOOL_FUNNEL_CURVE,
  WHIRLPOOL_FUNNEL_DEPTH,
  WHIRLPOOL_MAGIC_DAY_SHARE,
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

export default function Whirlpool({ shoreline, center, islandScale, offsetY }: WhirlpoolProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildWhirlpoolGeometry(), [])
  const material = useMemo(() => createWhirlpoolMaterial(), [])
  const shoreTexture = useMemo(() => createFieldTexture(shoreline), [shoreline])

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
    </mesh>
  )
}
