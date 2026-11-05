import * as THREE from 'three'
import { reportWebglFailure } from '@/store/webglStore'

export function createWorldRenderer(defaults: THREE.WebGLRendererParameters) {
  try {
    return new THREE.WebGLRenderer({ ...defaults, antialias: true, stencil: true })
  } catch (error) {
    reportWebglFailure()
    throw error
  }
}
