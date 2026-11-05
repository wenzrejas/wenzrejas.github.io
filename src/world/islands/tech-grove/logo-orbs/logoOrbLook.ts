import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { floatOrb, orbitReveal, type LogoOrb, type Orbit } from './orbits'

export function paintOrbs(
  meshes: (THREE.Mesh | null)[],
  orbs: LogoOrb[],
  time: number,
  glow: number
) {
  orbs.forEach((orb, i) => {
    const mesh = meshes[i]
    if (!mesh) return
    if (orb.orbit.presence === 0) {
      mesh.visible = false
      return
    }
    floatOrb(orb, time)
    mesh.visible = orb.opacity > 0
    mesh.position.copy(orb.position)
    mesh.scale.setScalar(orb.size)
    const uniforms = uniformsOf(mesh)
    uniforms.uOpacity.value = orb.opacity
    uniforms.uGlow.value = glow
    uniforms.uTime.value = time
  })
}

export function paintStardust(
  stardust: THREE.Points,
  orbits: Orbit[],
  time: number,
  glow: number,
  pixelRatio: number
) {
  const uniforms = uniformsOf(stardust)
  const reveals: number[] = uniforms.uReveal.value
  orbits.forEach((orbit, i) => {
    reveals[i] = orbitReveal(orbit)
  })
  stardust.visible = reveals.some((reveal) => reveal > 0)
  if (!stardust.visible) return
  uniforms.uGlow.value = glow
  uniforms.uTime.value = time
  uniforms.uPixelRatio.value = pixelRatio
}
