import type * as THREE from 'three'

export interface GlowSite {
  center: THREE.Vector3
  radius: number
  color: THREE.Color
}

export interface GroundGlowTuning {
  haloSpread: number
  haloFill: number
  haloStrength: number
  haloLift: number
  motesPerSite: number
  moteSize: number
  moteRise: number
  moteLifetime: number
  moteSwirl: number
  moteSpread: number
  moteInnerShare: number
  moteStrength: number
}
