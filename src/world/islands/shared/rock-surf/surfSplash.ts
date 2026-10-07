import * as THREE from 'three'
import { rand } from '@/utils/math'
import { meshesOf } from '@/utils/meshes'
import type { ParticlePool } from '@/world/effects/particlePool'
import { outwardAt, type ShoreField } from '@/world/shore/shoreField'
import { placeOnIsland, scanShore, turnToIsland, type SiteFrame } from '../shoreSites'
import {
  SAND_WARMTH,
  SURF_DROP_LIFE,
  SURF_FOAM_LEAD,
  SURF_FOAM_LIFE,
  SURF_FOAM_Y,
  SURF_SCATTER,
  SURF_SITE_BAND,
  SURF_TERRAIN_REACH,
  SURF_WATERLINE_BAND,
  SURF_Y,
} from './constants'

export interface SurfTuning {
  intervalMin: number
  intervalMax: number
  drops: number
  dropSize: number
  rise: number
  recoil: number
  foamBlobs: number
  foamSize: number
}

export interface SurfSite {
  x: number
  z: number
  awayX: number
  awayZ: number
}

interface WaterlineTerrain {
  reach: number
  buckets: Map<string, { x: number; z: number; isSand: boolean }[]>
}

const _toShoreFrame = new THREE.Matrix4()
const _meshToShoreFrame = new THREE.Matrix4()
const _vertex = new THREE.Vector3()
const _color = new THREE.Color()
const _away = new THREE.Vector2()

const bucketKey = (column: number, row: number) => `${column},${row}`

// ── Terrain ───────────────────────────────────────────────────────────────────

function sampleWaterline(
  model: THREE.Object3D,
  terrainNodes: readonly string[],
  waterY: number,
  band: number,
  reach: number
): WaterlineTerrain {
  model.updateWorldMatrix(false, true)
  _toShoreFrame.identity()
  if (model.parent) _toShoreFrame.copy(model.parent.matrixWorld).invert()

  const buckets: WaterlineTerrain['buckets'] = new Map()
  for (const name of terrainNodes) {
    const node = model.getObjectByName(name)
    if (!node) continue
    for (const mesh of meshesOf(node)) {
      const positions = mesh.geometry.getAttribute('position')
      const colors = mesh.geometry.getAttribute('color')
      if (!colors) continue
      _meshToShoreFrame.multiplyMatrices(_toShoreFrame, mesh.matrixWorld)
      for (let i = 0; i < positions.count; i++) {
        _vertex.fromBufferAttribute(positions, i).applyMatrix4(_meshToShoreFrame)
        if (Math.abs(_vertex.y - waterY) > band) continue
        _color.fromBufferAttribute(colors, i)
        const key = bucketKey(Math.floor(_vertex.x / reach), Math.floor(_vertex.z / reach))
        const bucket = buckets.get(key) ?? []
        bucket.push({ x: _vertex.x, z: _vertex.z, isSand: _color.r - _color.b > SAND_WARMTH })
        buckets.set(key, bucket)
      }
    }
  }
  return { reach, buckets }
}

function isRockyAt({ reach, buckets }: WaterlineTerrain, x: number, z: number): boolean {
  const column = Math.floor(x / reach)
  const row = Math.floor(z / reach)
  let rock = 0
  let sand = 0
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
      for (const spot of buckets.get(bucketKey(column + columnOffset, row + rowOffset)) ?? []) {
        if (Math.hypot(spot.x - x, spot.z - z) > reach) continue
        if (spot.isSand) sand++
        else rock++
      }
    }
  }
  return rock > sand
}

// ── Sites ─────────────────────────────────────────────────────────────────────

export function findSurfSites(
  shoreline: ShoreField,
  model: THREE.Object3D,
  terrainNodes: readonly string[],
  waterY: number,
  frame: SiteFrame
): SurfSite[] {
  const terrain = sampleWaterline(
    model,
    terrainNodes,
    waterY,
    SURF_WATERLINE_BAND / frame.scale,
    SURF_TERRAIN_REACH / frame.scale
  )
  const { distances } = shoreline
  const band = SURF_SITE_BAND / frame.scale
  const sites: SurfSite[] = []

  scanShore(shoreline, 1, (x, z, cell) => {
    if (distances[cell] < 0 || distances[cell] > band) return
    if (!isRockyAt(terrain, x, z)) return

    const away = outwardAt(shoreline, cell, _away)
    if (away.lengthSq() === 0) return

    const [siteX, siteZ] = placeOnIsland(frame, x, z)
    const [awayX, awayZ] = turnToIsland(frame, away.x, away.y)
    sites.push({ x: siteX, z: siteZ, awayX, awayZ })
  })
  return sites
}

// ── Bursts ────────────────────────────────────────────────────────────────────

export function emitSurfSplash(
  foam: ParticlePool,
  drops: ParticlePool,
  site: SurfSite,
  tuning: SurfTuning
): void {
  const strength = rand(0.7, 1.2)

  for (let i = 0; i < tuning.drops; i++) {
    const recoil = tuning.recoil * rand(0.3, 1.2) * strength
    const sweep = tuning.recoil * rand(-0.5, 0.5)
    drops.spawn(
      site.x + rand(-1, 1) * SURF_SCATTER,
      SURF_Y,
      site.z + rand(-1, 1) * SURF_SCATTER,
      site.awayX * recoil - site.awayZ * sweep,
      tuning.rise * rand(0.6, 1.2) * strength,
      site.awayZ * recoil + site.awayX * sweep,
      tuning.dropSize * rand(0.6, 1.3),
      SURF_DROP_LIFE
    )
  }

  for (let i = 0; i < tuning.foamBlobs; i++) {
    const sweep = rand(-0.7, 0.7)
    const speed = tuning.recoil * rand(0.5, 1.1) * strength
    foam.spawn(
      site.x + site.awayX * SURF_FOAM_LEAD,
      SURF_FOAM_Y,
      site.z + site.awayZ * SURF_FOAM_LEAD,
      (site.awayX - site.awayZ * sweep) * speed,
      0,
      (site.awayZ + site.awayX * sweep) * speed,
      tuning.foamSize * rand(0.8, 1.4),
      SURF_FOAM_LIFE * rand(0.8, 1.2)
    )
  }
}
