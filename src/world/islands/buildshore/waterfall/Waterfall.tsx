import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { quietLoop } from '@/audio/proximityLoop'
import { useCycleStore } from '@/store/cycleStore'
import { useShipStore } from '@/store/shipStore'
import { isBelowSurface, useViewStore } from '@/store/viewStore'
import { mix } from '@/utils/math'
import { pixelsPerUnit } from '@/utils/screen'
import type { IslandPlacement } from '@/world/islands/shared/islandTransform'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { useSiteFrame } from '@/world/islands/shared/shoreSites'
import type { Cascades } from './cascades'
import { FOAM_NIGHT_SHARE } from './constants'
import {
  buildFoamPadGeometry,
  buildSplashGeometry,
  createCascadeMaterials,
  createFoamPadMaterial,
  createSplashMaterial,
  dressCascades,
  flowUniforms,
} from './waterfallModel'
import { createWaterfallSound, followWaterfallSound } from './waterfallSound'
import { placeSplashSites } from './waterfallSplash'

interface WaterfallProps {
  cascades: Cascades
  placement: IslandPlacement
  offsetY: number
}

export default function Waterfall({ cascades, placement, offsetY }: WaterfallProps) {
  const frame = useSiteFrame(placement)
  const sites = useMemo(
    () => placeSplashSites(cascades.bases, frame, offsetY),
    [cascades, frame, offsetY]
  )
  const cascadeMaterials = useMemo(() => createCascadeMaterials(), [])
  const padGeometry = useMemo(() => buildFoamPadGeometry(sites), [sites])
  const splashGeometry = useMemo(() => buildSplashGeometry(sites), [sites])
  const padMaterial = useMemo(() => createFoamPadMaterial(), [])
  const splashMaterial = useMemo(() => createSplashMaterial(), [])
  const sound = useMemo(() => createWaterfallSound(), [])
  const padsRef = useRef<THREE.Mesh>(null)

  useEffect(() => () => quietLoop(sound), [sound])

  useEffect(
    () => () => {
      for (const material of Object.values(cascadeMaterials)) material.dispose()
      padMaterial.dispose()
      splashMaterial.dispose()
    },
    [cascadeMaterials, padMaterial, splashMaterial]
  )
  useEffect(
    () => () => {
      padGeometry.dispose()
      splashGeometry.dispose()
    },
    [padGeometry, splashGeometry]
  )
  useLayoutEffect(() => dressCascades(cascades, cascadeMaterials), [cascades, cascadeMaterials])

  useFrame(({ camera, gl, clock }) => {
    flowUniforms.uFlowTime.value = clock.getElapsedTime()
    flowUniforms.uFoamColor.value
      .copyLinearToSRGB(useCycleStore.getState().foamColor)
      .multiplyScalar(mix(1, FOAM_NIGHT_SHARE, nightGlow()))
    flowUniforms.uPixelsPerUnit.value = pixelsPerUnit(camera, gl)
    const pads = padsRef.current
    if (!pads) return
    const ship = useShipStore.getState()
    const isAudible = !isBelowSurface(useViewStore.getState())
    followWaterfallSound(sound, sites, pads.matrixWorld, ship.x, ship.z, isAudible)
  })

  return (
    <>
      <mesh
        ref={padsRef}
        geometry={padGeometry}
        material={padMaterial}
        renderOrder={RENDER_LAYER.waterSurface}
      />
      <points
        geometry={splashGeometry}
        material={splashMaterial}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
