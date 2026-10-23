import * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import {
  TORCH_CLUSTER_REACH,
  TORCH_FLAME_MATERIAL,
  TORCH_FLICKER_SPREAD_SECONDS,
  TORCH_HEART_MATERIAL,
} from './constants'

export interface TorchSite {
  ruin: THREE.Object3D
  base: THREE.Vector3
  height: number
  phase: number
}

interface FlamePiece {
  bounds: THREE.Box3
  materials: Set<string>
}

const TORCH_MATERIALS = [TORCH_FLAME_MATERIAL, TORCH_HEART_MATERIAL]

const _toRuin = new THREE.Matrix4()
const _vertex = new THREE.Vector3()
const _reach = new THREE.Box3()

const torchMaterialOf = (mesh: THREE.Mesh) => {
  const { name } = mesh.material as THREE.Material
  return TORCH_MATERIALS.find((prefix) => name.startsWith(prefix))
}

function gatherFlamePieces(ruin: THREE.Object3D): FlamePiece[] {
  const pieces: FlamePiece[] = []
  ruin.updateWorldMatrix(true, true)
  const fromWorld = ruin.matrixWorld.clone().invert()
  for (const mesh of meshesOf(ruin)) {
    const material = torchMaterialOf(mesh)
    if (!material) continue
    _toRuin.multiplyMatrices(fromWorld, mesh.matrixWorld)
    const positions = mesh.geometry.attributes.position
    for (let index = 0; index < positions.count; index++) {
      _vertex.fromBufferAttribute(positions, index).applyMatrix4(_toRuin)
      const piece = pieces.find(({ bounds }) =>
        _reach.copy(bounds).expandByScalar(TORCH_CLUSTER_REACH).containsPoint(_vertex)
      )
      if (piece) {
        piece.bounds.expandByPoint(_vertex)
        piece.materials.add(material)
      } else {
        pieces.push({
          bounds: new THREE.Box3(_vertex.clone(), _vertex.clone()),
          materials: new Set([material]),
        })
      }
    }
  }
  return pieces
}

const isTorch = ({ materials }: FlamePiece) => TORCH_MATERIALS.every((name) => materials.has(name))

export const findTorchSites = (ruins: THREE.Object3D[]): TorchSite[] =>
  ruins.flatMap((ruin) =>
    gatherFlamePieces(ruin)
      .filter(isTorch)
      .map(({ bounds }) => {
        const center = bounds.getCenter(new THREE.Vector3())
        return {
          ruin,
          base: new THREE.Vector3(center.x, bounds.min.y, center.z),
          height: bounds.max.y - bounds.min.y,
          phase: Math.random() * TORCH_FLICKER_SPREAD_SECONDS,
        }
      })
  )
