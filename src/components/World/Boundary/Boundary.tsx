import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { IS_DEBUG } from '../../Experience/constants'
import { useDebug } from '../../Debug/DebugControls'

const VERT = /* glsl */ `
varying vec2 vWorldXZ;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldXZ = worldPos.xz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uFalloff;
uniform vec3 uColor;
varying vec2 vWorldXZ;

// sin-free hash — avoids GPU precision banding artifacts
float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  float dist = length(vWorldXZ - uCenter);

  float scale = 0.004;
  float n1 = fbm(vWorldXZ * scale + vec2(uTime * 0.012, uTime * 0.008));
  float n2 = fbm(vWorldXZ * scale * 1.6 + vec2(-uTime * 0.007, uTime * 0.014) + vec2(3.2, 1.7));
  float noiseVal = mix(n1, n2, 0.5);

  float edgeWarp = (noiseVal - 0.5) * uFalloff * 0.9;
  float warpedDist = dist + edgeWarp;

  float alpha = smoothstep(uRadius - uFalloff, uRadius, warpedDist);

  float wispMask = smoothstep(uRadius - uFalloff * 2.2, uRadius - uFalloff * 0.6, dist);
  float wisps = noiseVal * wispMask * 0.35;

  gl_FragColor = vec4(uColor, clamp(alpha + wisps, 0.0, 1.0));
}
`

function BoundaryFog() {
  const { boundary } = useDebug()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uCenter: { value: new THREE.Vector2(0, 0) },
          uRadius: { value: 0 },
          uFalloff: { value: 0 },
          uColor: { value: new THREE.Color() },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uRadius.value = boundary.radius
    material.uniforms.uFalloff.value = boundary.falloff
    material.uniforms.uColor.value.set(boundary.fogColor)
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={2} frustumCulled={false} renderOrder={10}>
      <circleGeometry args={[1500, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function BoundaryRing() {
  const { boundary } = useDebug()
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={3} renderOrder={1}>
      <ringGeometry args={[boundary.radius - 1, boundary.radius + 1, 128]} />
      <meshBasicMaterial
        color="#ff4444"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Boundary() {
  return (
    <>
      <BoundaryFog />
      {IS_DEBUG && <BoundaryRing />}
    </>
  )
}
