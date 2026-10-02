import * as THREE from 'three'

export const buildFlatQuad = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
