import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import {
  BASE_EDGE_BAND,
  CHANNEL_FLOW_SPEED,
  FLOW_HIGHLIGHT_ROLE,
  HIGHLIGHT_FLOW_SPEED,
  SEA_DISCHARGE_HEIGHT,
  SHEET_FLOW_SPEED,
  WATER_CHANNEL_ROLE,
  WATERFALL_SHEET_ROLE,
} from './constants'

export type FlowKind = 'sheet' | 'channel' | 'highlight'

export interface FlowMesh {
  mesh: THREE.Mesh
  kind: FlowKind
  phase: number
}

export interface WaterfallBase {
  x: number
  y: number
  z: number
  alongX: number
  alongZ: number
  halfWidth: number
  awayX: number
  awayZ: number
  intoSea: boolean
}

export interface Cascades {
  flows: FlowMesh[]
  bases: WaterfallBase[]
}

const FLOW_KINDS: Record<string, FlowKind> = {
  [WATERFALL_SHEET_ROLE]: 'sheet',
  [WATER_CHANNEL_ROLE]: 'channel',
  [FLOW_HIGHLIGHT_ROLE]: 'highlight',
}

export const FLOW_SPEEDS: Record<FlowKind, number> = {
  sheet: SHEET_FLOW_SPEED,
  channel: CHANNEL_FLOW_SPEED,
  highlight: HIGHLIGHT_FLOW_SPEED,
}

const _toModel = new THREE.Matrix4()
const _point = new THREE.Vector3()

function pointsIn(model: THREE.Object3D, node: THREE.Object3D): THREE.Vector3[] {
  _toModel.copy(model.matrixWorld).invert()
  return meshesOf(node).flatMap((mesh) => {
    const meshToModel = new THREE.Matrix4().multiplyMatrices(_toModel, mesh.matrixWorld)
    const position = mesh.geometry.getAttribute('position')
    return Array.from({ length: position.count }, (_, i) =>
      _point.fromBufferAttribute(position, i).applyMatrix4(meshToModel).clone()
    )
  })
}

const centreOf = (points: THREE.Vector3[]) =>
  points.reduce((sum, point) => sum.add(point), new THREE.Vector3()).divideScalar(points.length)

function widestPair(points: THREE.Vector3[]): [THREE.Vector3, THREE.Vector3] {
  let pair: [THREE.Vector3, THREE.Vector3] = [points[0], points[0]]
  let widest = -1
  for (const from of points) {
    for (const to of points) {
      const span = Math.hypot(to.x - from.x, to.z - from.z)
      if (span > widest) {
        widest = span
        pair = [from, to]
      }
    }
  }
  return pair
}

function findBase(model: THREE.Object3D, sheet: THREE.Object3D): WaterfallBase | null {
  const points = pointsIn(model, sheet)
  if (points.length === 0) return null

  const lowest = Math.min(...points.map(({ y }) => y))
  const highest = Math.max(...points.map(({ y }) => y))
  const top = centreOf(points.filter(({ y }) => y > highest - BASE_EDGE_BAND))
  const [from, to] = widestPair(points.filter(({ y }) => y < lowest + BASE_EDGE_BAND))
  const centre = from.clone().add(to).multiplyScalar(0.5)
  const along = new THREE.Vector2(to.x - from.x, to.z - from.z)
  const halfWidth = along.length() / 2
  along.normalize()

  const away = new THREE.Vector2(-along.y, along.x)
  if (away.dot(new THREE.Vector2(centre.x - top.x, centre.z - top.z)) < 0) away.negate()

  return {
    x: centre.x,
    y: lowest,
    z: centre.z,
    alongX: along.x,
    alongZ: along.y,
    halfWidth,
    awayX: away.x,
    awayZ: away.y,
    intoSea: sheet.userData.discharge_z < SEA_DISCHARGE_HEIGHT,
  }
}

export function findCascades(model: THREE.Object3D): Cascades {
  model.updateMatrixWorld(true)
  const flows: FlowMesh[] = []
  const bases: WaterfallBase[] = []
  model.traverse((node) => {
    const kind = FLOW_KINDS[node.userData.role]
    if (kind === undefined) return

    const phase = Math.random()
    for (const mesh of meshesOf(node)) flows.push({ mesh, kind, phase })
    if (kind !== 'sheet') return

    const base = findBase(model, node)
    if (base) bases.push(base)
  })
  return { flows, bases }
}
