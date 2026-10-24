import type * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { haloAt } from '../shared/haloGlow'
import { wakeGlow, wakeStrength } from '../shared/ruinWake'
import {
  BEACON_ANCHOR_ROLE,
  BEACON_HALO_COLOR,
  BEACON_HALO_RADIUS,
  BEACON_PULSE,
  BEACON_PULSE_RATE,
  ORB_PULSE,
  ORB_PULSE_RATE,
} from './constants'

export function findArmillaryOrb(ruin: THREE.Object3D): GlowLevel[] {
  const pivot = ruin.children.find((child) => child.userData.role === 'gem_pivot') ?? ruin
  return glowLevelsOf(meshesOf(pivot))
}

export const findBeaconHalos = (ruin: THREE.Object3D): HaloGem[] =>
  ruin.children
    .filter((child) => child.userData.role === BEACON_ANCHOR_ROLE)
    .map((anchor) => haloAt(anchor.position.clone(), BEACON_HALO_RADIUS, BEACON_HALO_COLOR))

export const pulseOrb = (orb: GlowLevel[], time: number, wake: number) =>
  shineGlow(orb, wakeGlow(wake) * (1 + ORB_PULSE * Math.sin(time * ORB_PULSE_RATE)))

export const beaconGlow = (time: number, wake: number) =>
  wakeStrength(wake) * (1 + BEACON_PULSE * Math.sin(time * BEACON_PULSE_RATE))
