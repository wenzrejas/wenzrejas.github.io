import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fireGlow } from './fireGlow'
import FLAMES_VERT from './shaders/campfireFlames.vert.glsl'
import FLAMES_FRAG from './shaders/campfireFlames.frag.glsl'

const TONGUES = 5
const FLAME_SCALE = 2.4
const FLAME_GLOW = 0.34

interface CampfireFlamesProps {
  base: THREE.Vector3
  height: number
  islandScale: number
}

export default function CampfireFlames({ base, height, islandScale }: CampfireFlamesProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        defines: { TONGUES },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1 },
          uIntensity: { value: 0 },
          uGlow: { value: FLAME_GLOW },
        },
        vertexShader: FLAMES_VERT,
        fragmentShader: FLAMES_FRAG,
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const intensity = fireGlow()
    mesh.visible = intensity > 0.001
    if (!mesh.visible) return

    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uIntensity.value = intensity
    material.uniforms.uSize.value = height * islandScale * FLAME_SCALE
  })

  return (
    <mesh ref={meshRef} material={material} position={base} renderOrder={4} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}
