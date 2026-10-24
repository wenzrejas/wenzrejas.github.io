import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { nodeNamed } from '@/utils/meshes'
import { patchShader } from '@/world/islands/shared/materialPatch'
import {
  FOREGROUND_SHADE,
  KIT_BRIGHTNESS,
  KIT_HAZE_DENSITY,
  KIT_HAZE_START,
  KIT_PIECES,
  type KitPiece,
} from './constants'
import type { KitDrift, KitPlacement } from './sceneryLayout'
import SCENERY_HAZE from './shaders/sceneryHaze.frag.glsl'

export interface DriftingStone extends KitPlacement {
  drift: KitDrift
  mesh: THREE.InstancedMesh
  index: number
}

export interface SceneryKit {
  group: THREE.Group
  meshes: THREE.InstancedMesh[]
  drifting: DriftingStone[]
  driftingMeshes: THREE.InstancedMesh[]
  materials: THREE.Material[]
}

const _scale = new THREE.Vector3()
const _matrix = new THREE.Matrix4()

const meshOfPiece = (kit: THREE.Object3D, piece: KitPiece) =>
  nodeNamed(kit, KIT_PIECES[piece]) as THREE.Mesh

function hazedStone(source: THREE.Material, shade: number) {
  const material = source.clone() as THREE.MeshStandardMaterial
  material.color.multiplyScalar(shade)
  return patchShader(material, {
    uniforms: {},
    defines: floatDefines({ KIT_HAZE_START, KIT_HAZE_DENSITY }),
    fragment: { fog_fragment: SCENERY_HAZE },
  })
}

function groupByPiece(placements: KitPlacement[]) {
  const groups = new Map<KitPiece, KitPlacement[]>()
  for (const placement of placements) {
    const group = groups.get(placement.piece) ?? []
    group.push(placement)
    groups.set(placement.piece, group)
  }
  return groups
}

export const stoneMatrix = (
  position: THREE.Vector3,
  turn: THREE.Quaternion,
  size: number,
  out: THREE.Matrix4
) => out.compose(position, turn, _scale.setScalar(size))

export function buildSceneryKit(kit: THREE.Object3D, placements: KitPlacement[]): SceneryKit {
  const source = meshOfPiece(kit, 'towerTall').material as THREE.Material
  const stone = hazedStone(source, KIT_BRIGHTNESS)
  const shadowed = hazedStone(source, FOREGROUND_SHADE)
  const scenery: SceneryKit = {
    group: new THREE.Group(),
    meshes: [],
    drifting: [],
    driftingMeshes: [],
    materials: [stone, shadowed],
  }
  for (const [piece, pieces] of groupByPiece(placements)) {
    const material = piece === 'foregroundPillar' ? shadowed : stone
    const mesh = new THREE.InstancedMesh(meshOfPiece(kit, piece).geometry, material, pieces.length)
    mesh.frustumCulled = false
    pieces.forEach((placement, index) => {
      const { position, turn, size, drift } = placement
      mesh.setMatrixAt(index, stoneMatrix(position, turn, size, _matrix))
      if (drift) scenery.drifting.push({ ...placement, drift, mesh, index })
    })
    if (pieces.some(({ drift }) => drift)) scenery.driftingMeshes.push(mesh)
    scenery.meshes.push(mesh)
    scenery.group.add(mesh)
  }
  return scenery
}

export function disposeSceneryKit({ meshes, materials }: SceneryKit) {
  for (const mesh of meshes) mesh.dispose()
  for (const material of materials) material.dispose()
}
