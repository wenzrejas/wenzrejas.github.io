import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { haloAt } from '../shared/haloGlow'
import { materialNameOf, ruinPoints } from '../shared/ruinPoints'
import { wakeGlow, wakeStrength } from '../shared/ruinWake'
import {
  BEACON_HALO_COLOR,
  BEACON_HALO_RADIUS,
  BEACON_LOWEST_Y,
  BEACON_MATERIAL,
  BEACON_PULSE,
  BEACON_PULSE_RATE,
  ORB_PULSE,
  ORB_PULSE_RATE,
} from './constants'

export function findArmillaryOrb(ruin: THREE.Object3D): GlowLevel[] {
  const pivot = ruin.children.find((child) => child.userData.role === 'gem_pivot') ?? ruin
  return glowLevelsOf(meshesOf(pivot))
}

export function findBeaconHalos(ruin: THREE.Object3D): HaloGem[] {
  const beacon = ruinPoints(
    ruin,
    (mesh) => materialNameOf(mesh).startsWith(BEACON_MATERIAL),
    (point) => point.y > BEACON_LOWEST_Y
  )
  if (beacon.length === 0) return []
  const center = new THREE.Box3().setFromPoints(beacon).getCenter(new THREE.Vector3())
  return [haloAt(center, BEACON_HALO_RADIUS, BEACON_HALO_COLOR)]
}

export const pulseOrb = (orb: GlowLevel[], time: number, wake: number) =>
  shineGlow(orb, wakeGlow(wake) * (1 + ORB_PULSE * Math.sin(time * ORB_PULSE_RATE)))

export const beaconGlow = (time: number, wake: number) =>
  wakeStrength(wake) * (1 + BEACON_PULSE * Math.sin(time * BEACON_PULSE_RATE))
