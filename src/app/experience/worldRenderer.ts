import * as THREE from 'three'
import { reportWebglFailure } from '@/store/webglStore'

export function createWorldRenderer(defaults: THREE.WebGLRendererParameters) {
  try {
    const renderer = new THREE.WebGLRenderer({ ...defaults, antialias: true, stencil: true })
    const loseContext = renderer.forceContextLoss
    renderer.forceContextLoss = () => {
      if (!renderer.getContext().isContextLost()) loseContext()
    }
    return renderer
  } catch (error) {
    reportWebglFailure()
    throw error
  }
}
