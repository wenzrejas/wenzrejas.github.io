import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { uniformsOf } from '@/utils/meshes'
import { pixelsPerUnit } from '@/utils/screen'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { isHoverHeld, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { createSwarmState, flySwarm, hasBeesOut, stepSwarm, type BeeFlight } from './beeFlight'
import {
  buildSwarmGeometries,
  createBeeMaterial,
  createBeeTrailMaterial,
  markSwarmChanged,
} from './beeSwarmModel'
import { BEE_SIZE, BEE_TRAIL_SIZE } from './constants'

interface BeeSwarmProps {
  flight: BeeFlight
  hover: HoverTimeline
  islandScale: number
}

export default function BeeSwarm({ flight, hover, islandScale }: BeeSwarmProps) {
  const beesRef = useRef<THREE.Points>(null)
  const trailRef = useRef<THREE.Points>(null)
  const swarm = useMemo(() => createSwarmState(), [])
  const { bees, trail, buffers } = useMemo(() => buildSwarmGeometries(), [])
  const beeMaterial = useMemo(() => createBeeMaterial(), [])
  const trailMaterial = useMemo(() => createBeeTrailMaterial(), [])

  useEffect(
    () => () => {
      for (const resource of [bees, trail, beeMaterial, trailMaterial]) resource.dispose()
    },
    [bees, trail, beeMaterial, trailMaterial]
  )

  useFrame(({ clock, camera, gl }, delta) => {
    const beePoints = beesRef.current
    const trailPoints = trailRef.current
    if (!beePoints || !trailPoints) return

    stepSwarm(swarm, isHoverHeld(hover), Math.min(delta, MAX_FRAME_SECONDS))
    const isFlying = hasBeesOut(swarm)
    beePoints.visible = isFlying
    trailPoints.visible = isFlying
    if (!isFlying) return

    flySwarm(flight, swarm, buffers)
    markSwarmChanged(bees, trail)
    const pixels = islandScale * pixelsPerUnit(camera, gl)
    const beeUniforms = uniformsOf(beePoints)
    beeUniforms.uTime.value = clock.getElapsedTime()
    beeUniforms.uSize.value = BEE_SIZE * pixels
    const trailUniforms = uniformsOf(trailPoints)
    trailUniforms.uGlow.value = 1
    trailUniforms.uSize.value = BEE_TRAIL_SIZE * pixels
  })

  return (
    <>
      <points
        ref={trailRef}
        geometry={trail}
        material={trailMaterial}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.effectSparks}
      />
      <points
        ref={beesRef}
        geometry={bees}
        material={beeMaterial}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.glow}
      />
    </>
  )
}
