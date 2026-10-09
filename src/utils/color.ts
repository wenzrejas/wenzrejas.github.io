import * as THREE from 'three'

export const displayColorOf = (color: THREE.ColorRepresentation) =>
  new THREE.Color(color).convertLinearToSRGB()
