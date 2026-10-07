import * as THREE from 'three'
import { boundsIn, displayColor, meshesOf, positionIn } from '@/utils/meshes'
import { mix, rand } from '@/utils/math'
import { easeHover } from '@/interaction/hover'
import { MONOLITH_COPY } from '@/data/islandCopy'
import type { GlowSite } from '../shared/ground-glow/glowSites'
import {
  LOGO_BOB_RATE_MAX,
  LOGO_BOB_RATE_MIN,
  LOGO_BODY_OPACITY,
  LOGO_EDGE_OPACITY,
  LOGO_SPIN_RATE_MAX,
  LOGO_SPIN_RATE_MIN,
  MONOLITH_LINKS,
  MONOLITH_MARKER_HEIGHT,
  MONOLITH_NAMES,
  type MonolithName,
} from './constants'

const EDGE_SUFFIX = '_Edge'

export interface Projection {
  base: THREE.Vector3
  baseRadius: number
  topRadius: number
  height: number
  color: THREE.Color
}

export interface LogoSurface {
  mesh: THREE.Mesh
  color: THREE.Color
  opacity: number
}

export interface FloatingLogo {
  node: THREE.Object3D
  restY: number
  startYaw: number
  spinRate: number
  bobRate: number
  phase: number
  surfaces: LogoSurface[]
}

export interface Monolith {
  link: string
  label: string
  station: THREE.Object3D
  marker: THREE.Vector3
  isHovered: boolean
  isActivated: boolean
  hoverBlend: number
  inlet: GlowSite
  projection: Projection
  logo: FloatingLogo
}

function findLogo(logo: THREE.Object3D): FloatingLogo {
  return {
    node: logo,
    restY: logo.position.y,
    startYaw: rand(0, Math.PI * 2),
    spinRate: rand(LOGO_SPIN_RATE_MIN, LOGO_SPIN_RATE_MAX) * (Math.random() < 0.5 ? -1 : 1),
    bobRate: rand(LOGO_BOB_RATE_MIN, LOGO_BOB_RATE_MAX),
    phase: rand(0, Math.PI * 2),
    surfaces: meshesOf(logo).map((mesh) => ({
      mesh,
      color: displayColor(mesh),
      opacity: mesh.name.endsWith(EDGE_SUFFIX) ? LOGO_EDGE_OPACITY : LOGO_BODY_OPACITY,
    })),
  }
}

function findMonolith(model: THREE.Object3D, name: MonolithName): Monolith | null {
  const station = model.getObjectByName(`Monolith_${name}`)
  const inlet = model.getObjectByName(`Glow_Monolith_${name}${EDGE_SUFFIX}`)
  const logo = model.getObjectByName(`Logo_${name}`)
  if (!station || !inlet || !logo) return null

  const inletMeshes = meshesOf(inlet)
  const inletBounds = boundsIn(model, inletMeshes)
  const inletSize = inletBounds.getSize(new THREE.Vector3())
  const logoBounds = boundsIn(model, meshesOf(logo))
  const logoSize = logoBounds.getSize(new THREE.Vector3())

  const base = inletBounds.getCenter(new THREE.Vector3()).setY(inletBounds.max.y)
  const radius = Math.max(inletSize.x, inletSize.z) / 2
  const color = displayColor(inletMeshes[0])
  const marker = positionIn(model, station)
  marker.y = mix(marker.y, inletBounds.max.y, MONOLITH_MARKER_HEIGHT)

  return {
    link: MONOLITH_LINKS[name],
    label: MONOLITH_COPY[name],
    station,
    marker,
    isHovered: false,
    isActivated: false,
    hoverBlend: 0,
    inlet: { center: base, radius, color },
    projection: {
      base,
      baseRadius: radius,
      topRadius: Math.max(logoSize.x, logoSize.z) / 2,
      height: logoBounds.getCenter(new THREE.Vector3()).y - base.y,
      color,
    },
    logo: findLogo(logo),
  }
}

export function findMonoliths(model: THREE.Object3D): Monolith[] {
  model.updateMatrixWorld(true)
  return MONOLITH_NAMES.map((name) => findMonolith(model, name)).filter(
    (monolith) => monolith !== null
  )
}

export function easeHovers(monoliths: Monolith[], delta: number) {
  for (const monolith of monoliths) {
    easeHover(monolith, monolith.isHovered || monolith.isActivated, delta)
  }
}

export function activateMonoliths(monoliths: Monolith[], isActivated: boolean) {
  for (const monolith of monoliths) monolith.isActivated = isActivated
}
