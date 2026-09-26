import * as THREE from 'three'
import { meshesOf } from '../../../../utils/meshes'
import {
  BASE_RIM_NODES,
  GEM_NODES,
  SPARKLE_EDGE_ANGLE,
  SPINNING_GEM_NODES,
  TUMBLING_GEM_NODES,
} from './constants'

export interface ShrineBase {
  center: THREE.Vector3
  radius: number
  color: THREE.Color
}

export interface ShrineGem {
  node: THREE.Object3D
  center: THREE.Vector3
  radius: number
  color: THREE.Color
  edges: Float32Array
  spins: boolean
  tumbles: boolean
}

export interface Shrines {
  bases: ShrineBase[]
  gems: ShrineGem[]
}

const _toFrame = new THREE.Matrix4()
const _meshToFrame = new THREE.Matrix4()
const _meshBounds = new THREE.Box3()
const _point = new THREE.Vector3()

function boundsIn(frame: THREE.Object3D, meshes: THREE.Mesh[]): THREE.Box3 {
  _toFrame.copy(frame.matrixWorld).invert()
  const bounds = new THREE.Box3()
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox()
    _meshToFrame.multiplyMatrices(_toFrame, mesh.matrixWorld)
    bounds.union(_meshBounds.copy(mesh.geometry.boundingBox!).applyMatrix4(_meshToFrame))
  }
  return bounds
}

function displayColor(mesh: THREE.Mesh): THREE.Color {
  const material = (
    Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  ) as THREE.MeshStandardMaterial
  return material.color.clone().convertLinearToSRGB()
}

function hardEdgesIn(gem: THREE.Object3D, meshes: THREE.Mesh[]): Float32Array {
  _toFrame.copy(gem.matrixWorld).invert()
  const segments: number[] = []
  for (const mesh of meshes) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, SPARKLE_EDGE_ANGLE)
    const positions = edges.getAttribute('position')
    _meshToFrame.multiplyMatrices(_toFrame, mesh.matrixWorld)
    for (let i = 0; i < positions.count; i++) {
      _point.fromBufferAttribute(positions, i).applyMatrix4(_meshToFrame)
      segments.push(_point.x, _point.y, _point.z)
    }
    edges.dispose()
  }
  return new Float32Array(segments)
}

function findBase(model: THREE.Object3D, rimNode: string): ShrineBase | null {
  const rim = model.getObjectByName(rimNode)
  if (!rim) return null
  const meshes = meshesOf(rim)
  const bounds = boundsIn(model, meshes)
  const size = bounds.getSize(new THREE.Vector3())
  return {
    center: bounds.getCenter(new THREE.Vector3()),
    radius: Math.max(size.x, size.z) / 2,
    color: displayColor(meshes[0]),
  }
}

function findGem(model: THREE.Object3D, gemNode: string): ShrineGem | null {
  const gem = model.getObjectByName(gemNode)
  if (!gem) return null
  const core = gem.getObjectByName(`${gemNode}_Core`) ?? gem
  const meshes = meshesOf(core)
  return {
    node: gem,
    center: model.worldToLocal(gem.getWorldPosition(new THREE.Vector3())),
    radius: boundsIn(gem, meshes).getSize(new THREE.Vector3()).length() / 2,
    color: displayColor(meshes[0]),
    edges: hardEdgesIn(gem, meshes),
    spins: SPINNING_GEM_NODES.includes(gemNode),
    tumbles: TUMBLING_GEM_NODES.includes(gemNode),
  }
}

export function findShrines(model: THREE.Object3D): Shrines {
  model.updateMatrixWorld(true)
  return {
    bases: BASE_RIM_NODES.map((node) => findBase(model, node)).filter((base) => base !== null),
    gems: GEM_NODES.map((node) => findGem(model, node)).filter((gem) => gem !== null),
  }
}
