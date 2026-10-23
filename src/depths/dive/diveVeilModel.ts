import * as THREE from 'three'
import { buildAscentBubbles } from './ascent-bubbles/ascentBubblesModel'
import { buildAscentLight } from './ascent-light/ascentLightModel'
import { buildRewindSigil, disposeRewindSigil } from './rewind-sigil/rewindSigilModel'
import { buildSwirl } from './swirl/swirlModel'
import type { VeilQuad } from './veilQuad'

export interface DiveVeil {
  scene: THREE.Scene
  geometry: THREE.BufferGeometry
  swirl: VeilQuad
  ascent: VeilQuad
  sigil: VeilQuad
  bubbles: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
}

export function createDiveVeil(): DiveVeil {
  const geometry = new THREE.PlaneGeometry(2, 2)
  const swirl = buildSwirl(geometry)
  const ascent = buildAscentLight(geometry)
  const sigil = buildRewindSigil(geometry)
  const bubbles = buildAscentBubbles()
  const scene = new THREE.Scene()
  scene.add(swirl, ascent, sigil, bubbles)
  return { scene, geometry, swirl, ascent, sigil, bubbles }
}

export function disposeDiveVeil({ geometry, swirl, ascent, sigil, bubbles }: DiveVeil) {
  geometry.dispose()
  swirl.material.dispose()
  ascent.material.dispose()
  disposeRewindSigil(sigil)
  bubbles.geometry.dispose()
  bubbles.material.dispose()
}
