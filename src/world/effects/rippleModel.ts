import * as THREE from 'three'
import { RIPPLE_OPACITY } from './constants'

export const createRippleMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: RIPPLE_OPACITY,
    depthWrite: false,
  })
