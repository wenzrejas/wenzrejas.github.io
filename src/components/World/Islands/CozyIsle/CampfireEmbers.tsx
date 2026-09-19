import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fireGlow } from './fireGlow'

const EMBER_COUNT = 24
const EMBER_SIZE = 0.075
const LIFETIME = 2.6

const RISE = 1.2
const SPREAD = 0.35
const DRIFT = 0.45
const SWAY = 0.25

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uRise;
uniform float uSpread;
uniform float uDrift;
uniform float uSway;

attribute vec3 aSeed;

varying float vLife;

void main() {
  float life  = fract(uTime / ${LIFETIME.toFixed(1)} + aSeed.x);
  float climb = pow(life, 0.75);
  float angle = aSeed.y;

  vec3 pos = position;
  pos.y += climb * uRise;

  float radius = uSpread + climb * uDrift;
  pos.x += cos(angle) * radius + sin(life * 7.0 + aSeed.x * 30.0) * uSway * life;
  pos.z += sin(angle) * radius + cos(life * 6.0 + aSeed.x * 21.0) * uSway * life;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aSeed.z * (1.0 - life * 0.75);
  vLife = life;
}
`

const FRAG = /* glsl */ `
uniform float uIntensity;

varying float vLife;

void main() {
  float mask = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
  if (mask <= 0.0) discard;

  vec3 color = mix(vec3(1.0, 0.86, 0.55), vec3(0.95, 0.32, 0.08), smoothstep(0.0, 0.7, vLife));
  float fade = smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.45, 1.0, vLife));

  gl_FragColor = vec4(color, mask * fade * uIntensity);
}
`

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
        vertexShader: VERT,
        fragmentShader: FRAG,
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
