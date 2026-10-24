import * as THREE from 'three'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { cornerSparkleGem, type SparkleGem } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { haloAround, haloAt } from '../shared/haloGlow'
import { turnFromRest } from '../shared/restingTurn'
import { materialNameOf, ruinPoints } from '../shared/ruinPoints'
import { wakeGlow, wakeStrength } from '../shared/ruinWake'
import {
  CIRCLE_TURN_RATE,
  DIAMOND_BREATH,
  DIAMOND_BREATH_RATE,
  DIAMOND_GLINTS,
  DIAMOND_HALO_COLOR,
  KEYSTONE_HALO_COLOR,
  KEYSTONE_HALO_RADIUS,
  PORTAL_CIRCLE_NODE,
  PORTAL_GLOW_MATERIAL,
  PORTAL_GLOW_PULSE,
  PORTAL_GLOW_PULSE_RATE,
  PORTAL_KEYSTONE_NODE,
  RING_GLOW_LIFT,
  RING_GLOW_STRENGTH,
} from './constants'

export interface PortalArch {
  diamond: GlowLevel[]
  portal: GlowLevel[]
  circle: THREE.Object3D | undefined
  glintGem: SparkleGem
  ringRadius: number
  ringGlowSpot: THREE.Vector3
  halos: HaloGem[]
}

const UPRIGHT = new THREE.Vector3(0, 1, 0)

const vertexCountOf = (mesh: THREE.Mesh) => mesh.geometry.attributes.position.count

const isPortalGlow = (mesh: THREE.Mesh) => materialNameOf(mesh).startsWith(PORTAL_GLOW_MATERIAL)

function boundsOfPart(ruin: THREE.Object3D, part: THREE.Object3D | undefined) {
  const meshes = new Set(part ? meshesOf(part) : [])
  return new THREE.Box3().setFromPoints(
    ruinPoints(
      ruin,
      (mesh) => meshes.has(mesh),
      () => true
    )
  )
}

const portalPulse = (time: number) =>
  1 + PORTAL_GLOW_PULSE * Math.sin(time * PORTAL_GLOW_PULSE_RATE)

export function findPortalArch(ruin: THREE.Object3D): PortalArch {
  const diamond = ruin.children.find((child) => child.userData.role === 'gem') ?? ruin
  const facets = meshesOf(diamond)
  const largestFacets = facets.reduce((largest, mesh) =>
    vertexCountOf(mesh) > vertexCountOf(largest) ? mesh : largest
  )
  const circle = nodeNamed(ruin, PORTAL_CIRCLE_NODE)
  const ring = boundsOfPart(ruin, circle)
  const keystone = boundsOfPart(ruin, nodeNamed(ruin, PORTAL_KEYSTONE_NODE))
  const ringSize = ring.getSize(new THREE.Vector3())
  return {
    diamond: glowLevelsOf(facets),
    portal: glowLevelsOf(meshesOf(ruin).filter(isPortalGlow)),
    circle,
    glintGem: cornerSparkleGem(largestFacets, DIAMOND_GLINTS),
    ringRadius: Math.max(ringSize.x, ringSize.z) / 2,
    ringGlowSpot: ring.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, RING_GLOW_LIFT, 0)),
    halos: [
      haloAround(ruin, diamond, DIAMOND_HALO_COLOR),
      haloAt(keystone.getCenter(new THREE.Vector3()), KEYSTONE_HALO_RADIUS, KEYSTONE_HALO_COLOR),
    ],
  }
}

export function breathePortal({ diamond, portal }: PortalArch, time: number, wake: number) {
  const glow = wakeGlow(wake)
  shineGlow(diamond, glow * (1 + DIAMOND_BREATH * Math.sin(time * DIAMOND_BREATH_RATE)))
  shineGlow(portal, glow * portalPulse(time))
}

export function turnSummoningCircle({ circle }: PortalArch, time: number) {
  if (circle) turnFromRest(circle, UPRIGHT, time * CIRCLE_TURN_RATE)
}

export function glowRing(material: THREE.ShaderMaterial, time: number, wake: number) {
  material.uniforms.uStrength.value = RING_GLOW_STRENGTH * wakeStrength(wake) * portalPulse(time)
}
