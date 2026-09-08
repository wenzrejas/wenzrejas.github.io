import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fireGlow } from './useNightGlow'

const TONGUES = 5
const FLAME_SCALE = 2.4
const FLAME_GLOW = 0.34

const VERT = /* glsl */ `
uniform float uSize;

varying vec2 vUv;

void main() {
  vec3 origin   = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 camRight = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));

  vUv = position.xy + 0.5;

  vec3 world = origin
             + camRight * position.x * uSize
             + vec3(0.0, 1.0, 0.0) * vUv.y * uSize;

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uGlow;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float flicker(float seed, float t) {
  return vnoise(vec2(seed,         t *  2.4)) * 0.50
       + vnoise(vec2(seed *  3.7,  t *  7.9)) * 0.32
       + vnoise(vec2(seed * 11.3,  t * 18.5)) * 0.18;
}

float tongue(vec2 uv, float seed, float t) {
  float top = mix(0.6, 1.0, hash(vec2(seed, 7.0)))
            * (0.58 + 0.42 * flicker(seed * 9.0, t));
  if (uv.y > top) return 0.0;

  float rel  = uv.y / max(top, 1e-3);
  float sway = (flicker(seed * 17.0, t + rel * 0.35) - 0.5) * 0.46 * rel;
  float x    = uv.x - 0.5 - sway - (hash(vec2(seed, 3.0)) - 0.5) * 0.26;
  float w    = 0.25 * pow(1.0 - rel, 0.6);

  return (1.0 - smoothstep(0.0, w, abs(x))) * (1.0 - smoothstep(0.7, 1.0, rel));
}

void main() {
  float f = 0.0;
  for (int i = 0; i < ${TONGUES}; i++) {
    f = max(f, tongue(vUv, float(i) + 1.0, uTime));
  }

  vec2  c    = (vUv - vec2(0.5, 0.10)) * vec2(1.0, 1.5);
  float core = 1.0 - smoothstep(0.10, 0.30, length(c));

  vec2  g    = (vUv - vec2(0.5, 0.22)) * vec2(1.0, 0.85);
  float glow = exp(-dot(g, g) * 11.0) * uGlow;

  float body = max(f, core);
  if (body + glow <= 0.003) discard;

  vec3 color = mix(vec3(1.0, 0.95, 0.72), vec3(1.0, 0.62, 0.18), smoothstep(0.0, 0.4, vUv.y));
  color = mix(color, vec3(0.94, 0.26, 0.05), smoothstep(0.38, 0.9, vUv.y));
  color = mix(color, vec3(1.0, 0.99, 0.90), core * 0.75);

  gl_FragColor = vec4(color, (body + glow) * uIntensity);
}
`

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
        vertexShader: VERT,
        fragmentShader: FRAG,
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
