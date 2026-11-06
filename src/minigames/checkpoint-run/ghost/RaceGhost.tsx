import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type * as THREE from 'three'
import { DRACO_DECODER_PATH } from '@/app/experience/constants'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { flatFootprint } from '@/utils/meshes'
import { SHIP_MODEL_URL } from '@/world/ship/constants'
import { disposeAll } from '@/utils/dispose'
import {
  buildGhostGeometry,
  buildGhostOutline,
  createGhostDepthMaterial,
  createGhostMaterial,
} from './ghostModel'
import { createGhostMotion, stepGhost } from './ghostMotion'

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
  const { scene } = useGLTF(SHIP_MODEL_URL, DRACO_DECODER_PATH)
  const groupRef = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildGhostGeometry(scene), [scene])
  const outline = useMemo(() => buildGhostOutline(geometry), [geometry])
  const footprint = useMemo(() => flatFootprint(scene), [scene])
  const material = useMemo(() => createGhostMaterial(), [])
  const depthMaterial = useMemo(() => createGhostDepthMaterial(), [])
  const motion = useRef(createGhostMotion())

  useEffect(
    () => () => disposeAll(geometry, outline, material, depthMaterial),
    [geometry, outline, material, depthMaterial]
  )

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return
    const opacity = stepGhost(motion.current, group, footprint, clock.getElapsedTime(), delta)
    paintGhost(material, depthMaterial, opacity)
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
