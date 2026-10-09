import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useCycleStore } from '@/store/cycleStore'
import { enterDepths } from '@/store/viewStore'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { mix } from '@/utils/math'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { syncWhirlpoolFunnel } from './whirlpoolFunnel'
import { setHovered } from '@/interaction/hover'
import InteractionMarker from '@/interaction/InteractionMarker'
import { SHORE_Y } from '@/world/shore/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import { createFieldTexture } from '@/world/shore/shorelineModel'
import { dayNightGlow, nightGlow } from '../shared/nightGlow'
import { islandLocalY } from '../shared/islandSpec'
import { createHoverTimeline } from '../shared/hoverTimeline'
import { glowLevel, ripplePhase, spiralLevel, stepAwakening } from './awakening'
import {
  AWAKEN_DAY_SHARE,
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
import MemoryEchoes from './memory-echoes/MemoryEchoes'
import VortexBeam from './vortex-beam/VortexBeam'
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
  const awakening = useMemo(() => createHoverTimeline(), [])
  const eyeGap = useCallback((x: number, z: number) => {
    const mesh = meshRef.current
    if (!mesh) return Infinity
    _visibleEye.set(WHIRLPOOL_EYE_X, 0, WHIRLPOOL_EYE_Z).applyMatrix4(mesh.matrixWorld)
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

  useFrame(({ clock, scene }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    stepAwakening(awakening, Math.min(delta, MAX_FRAME_SECONDS))

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
    const awakenLight = dayNightGlow(AWAKEN_DAY_SHARE)
    uniforms.uWaterGlow.value = glowLevel(awakening) * awakenLight
    uniforms.uSpiralGlow.value = spiralLevel(awakening) * awakenLight
    uniforms.uRipple.value = ripplePhase(awakening)
    uniforms.uRippleGlow.value = awakening.presence * awakenLight
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[
        center.x + TIMEWELL_BASIN.x,
        islandLocalY(SHORE_Y, islandScale, offsetY),
        center.z + TIMEWELL_BASIN.z,
      ]}
      scale={WHIRLPOOL_RADIUS}
      renderOrder={RENDER_LAYER.inWater}
    >
      <WhirlpoolMotes islandScale={islandScale} awakening={awakening} />
      <VortexBeam awakening={awakening} />
      <MemoryEchoes awakening={awakening} islandScale={islandScale} />
      <InteractionMarker
        position={[WHIRLPOOL_EYE_X, WHIRLPOOL_MARKER_LIFT, WHIRLPOOL_EYE_Z]}
        label={ISLAND_COPY.timewell.marker}
        onHover={(isHovered) => setHovered(awakening, isHovered)}
        onActivate={enterDepths}
        baseGap={eyeGap}
      />
    </mesh>
  )
}
