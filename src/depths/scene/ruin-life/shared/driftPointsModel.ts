import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { mix } from '@/utils/math'
import GLOW_POINT_FRAG from '@/shaders/glowPoint.frag.glsl'
import type { DriftTuning } from './particleDrift'
import DRIFT_POINTS_VERT from './shaders/driftPoints.vert.glsl'

export function buildDriftGeometry({ count, radiusMin, radiusMax }: DriftTuning) {
  const drifts = new Float32Array(count * 4)
  for (let particle = 0; particle < count; particle++) {
    drifts.set(
      [
        Math.random() * Math.PI * 2,
        mix(radiusMin, radiusMax, Math.sqrt(Math.random())),
        Math.random(),
        Math.random() * Math.PI * 2,
      ],
      particle * 4
    )
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('drift', new THREE.BufferAttribute(drifts, 4))
  return geometry
}

export const createDriftMaterial = ({
  height,
  rise,
  orbit,
  sway,
  size,
  strength,
  color,
}: DriftTuning) =>
  new THREE.ShaderMaterial({
    vertexShader: DRIFT_POINTS_VERT,
    fragmentShader: GLOW_POINT_FRAG,
    defines: floatDefines({
      HEIGHT: height,
      RISE: rise,
      ORBIT: orbit,
      SWAY: sway,
      SIZE: size,
      STRENGTH: strength,
    }),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uGlow: { value: 1 },
      uPixelScale: { value: 1 },
      uColor: { value: displayColorOf(color) },
    },
  })
