import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useDebugStore } from '@/store/debugStore'
import { mix, wrapAngle } from '@/utils/math'
import { flatFootprint } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { shipBobHeight } from '@/world/ship/shipBob'
import { SHIP_MODEL_URL } from '@/world/ship/constants'
import { disposeAll } from '@/utils/dispose'
import {
  GHOST_END_FADE_SECONDS,
  GHOST_NIGHT_STRENGTH,
  GHOST_SHOW_SECONDS,
  GHOST_TURN_RATE,
} from '../constants'
import { startHeadingOf } from '../checkpointRun'
import { isArriving } from '../raceArrival'
import {
  buildGhostGeometry,
  buildGhostOutline,
  createGhostDepthMaterial,
  createGhostMaterial,
} from './ghostModel'
import { poseTrack, type GhostPose } from './ghostTrack'

const { clamp, damp } = THREE.MathUtils

const _pose: GhostPose = { x: 0, z: 0, heading: 0 }

function paintGhost(
  material: THREE.ShaderMaterial,
  depthMaterial: THREE.Material,
  opacity: number
) {
  material.uniforms.uOpacity.value = opacity
  material.visible = opacity > 0
  depthMaterial.visible = opacity > 0
}

export default function RaceGhost() {
  const { scene } = useGLTF(SHIP_MODEL_URL)
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildGhostGeometry(scene), [scene])
  const outline = useMemo(() => buildGhostOutline(geometry), [geometry])
  const footprint = useMemo(() => flatFootprint(scene), [scene])
  const material = useMemo(() => createGhostMaterial(), [])
  const depthMaterial = useMemo(() => createGhostDepthMaterial(), [])
  const presence = useRef(0)
  const heading = useRef(0)

  useEffect(
    () => () => disposeAll(geometry, outline, material, depthMaterial),
    [geometry, outline, material, depthMaterial]
  )

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const { run, ghostSpot } = useCheckpointStore.getState()
    if (!run?.rival || isArriving(run)) {
      presence.current = 0
      ghostSpot.isShown = false
      paintGhost(material, depthMaterial, 0)
      return
    }

    const { rival, seconds } = run
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    _pose.heading = presence.current === 0 ? startHeadingOf(run.course) : heading.current
    poseTrack(rival.track, seconds, _pose)
    heading.current =
      presence.current === 0
        ? _pose.heading
        : heading.current + damp(0, wrapAngle(_pose.heading - heading.current), GHOST_TURN_RATE, dt)
    presence.current = clamp(presence.current + dt / GHOST_SHOW_SECONDS, 0, 1)

    const overtime = seconds - rival.splits[rival.splits.length - 1]
    const ending = clamp(1 - overtime / GHOST_END_FADE_SECONDS, 0, 1)
    const opacity = presence.current * ending * mix(1, GHOST_NIGHT_STRENGTH, nightGlow())

    const shipTuning = useDebugStore.getState().ship
    group.position.set(
      _pose.x,
      shipBobHeight(shipTuning, clock.getElapsedTime(), _pose.x, _pose.z),
      _pose.z
    )
    group.rotation.y = heading.current
    group.scale.setScalar(shipTuning.modelSize / footprint)

    paintGhost(material, depthMaterial, opacity)

    ghostSpot.x = _pose.x
    ghostSpot.z = _pose.z
    ghostSpot.isShown = ending > 0
  })

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        material={depthMaterial}
        renderOrder={RENDER_LAYER.raceGhostDepth}
      />
      <lineSegments geometry={outline} material={material} renderOrder={RENDER_LAYER.raceGhost} />
    </group>
  )
}
