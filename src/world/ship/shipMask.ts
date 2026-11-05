import * as THREE from 'three'

const SHIP_MASK = 1

export const BEHIND_SHIP_MASK = {
  stencilWrite: true,
  stencilRef: SHIP_MASK,
  stencilFunc: THREE.NotEqualStencilFunc,
}

export function writeShipMask(material: THREE.Material) {
  material.stencilWrite = true
  material.stencilRef = SHIP_MASK
  material.stencilZPass = THREE.ReplaceStencilOp
}
