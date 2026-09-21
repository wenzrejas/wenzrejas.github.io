import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { floatDefines } from '../../../../utils/glsl'
import { fireGlow } from './fireGlow'
import EMBERS_VERT from './shaders/campfireEmbers.vert.glsl'
import EMBERS_FRAG from './shaders/campfireEmbers.frag.glsl'

const EMBER_COUNT = 24
const EMBER_SIZE = 0.075
const LIFETIME = 2.6

const RISE = 1.2
const SPREAD = 0.35
const DRIFT = 0.45
const SWAY = 0.25

interface CampfireEmbersProps {
  origin: THREE.Vector3
  width: number
  height: number
  islandScale: number
}

export default function CampfireEmbers({
  origin,
  width,
  height,
  islandScale,
}: CampfireEmbersProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(EMBER_COUNT * 3)
    const seeds = new Float32Array(EMBER_COUNT * 3)

    for (let i = 0; i < EMBER_COUNT; i++) {
      seeds[i * 3] = i / EMBER_COUNT
      seeds[i * 3 + 1] = Math.random() * Math.PI * 2
      seeds[i * 3 + 2] = 0.6 + Math.random() * 0.8
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        defines: floatDefines({ LIFETIME }),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 4 },
          uRise: { value: 1 },
          uSpread: { value: 0 },
          uDrift: { value: 0 },
          uSway: { value: 0 },
          uIntensity: { value: 0 },
        },
        vertexShader: EMBERS_VERT,
        fragmentShader: EMBERS_FRAG,
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

  useFrame(({ clock, camera, gl }) => {
    const points = pointsRef.current
    if (!points) return

    const intensity = fireGlow()
    points.visible = intensity > 0.001
    if (!points.visible) return

    const zoom = (camera as THREE.OrthographicCamera).zoom
    const uniforms = material.uniforms

    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uIntensity.value = intensity
    uniforms.uSize.value = EMBER_SIZE * islandScale * zoom * gl.getPixelRatio()
    uniforms.uRise.value = height * RISE
    uniforms.uSpread.value = width * SPREAD
    uniforms.uDrift.value = width * DRIFT
    uniforms.uSway.value = width * SWAY
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={origin}
      frustumCulled={false}
      renderOrder={5}
    />
  )
}
