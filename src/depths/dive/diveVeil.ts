import type * as THREE from 'three'
import { bubblePresence, paintBubbles } from './ascent-bubbles/ascentBubbles'
import { paintAscentLight } from './ascent-light/ascentLight'
import { isAscentStage, type DiveRun } from './dive'
import type { DiveVeil } from './diveVeilModel'
import { isSigilShown, paintSigil } from './rewind-sigil/rewindSigil'
import { dialOf } from './rewind-sigil/rewindSigilModel'
import { paintSwirl } from './swirl/swirl'

export const isVeilShown = (run: DiveRun) =>
  run.cover > 0 ||
  (run.isAscending && isAscentStage(run) && (isSigilShown(run) || bubblePresence(run) > 0))

export function paintDiveVeil(
  { swirl, ascent, sigil, bubbles }: DiveVeil,
  run: DiveRun,
  camera: THREE.Camera,
  time: number,
  aspect: number,
  pixelRatio: number
) {
  swirl.visible = !run.isAscending
  ascent.visible = run.isAscending
  bubbles.visible = run.isAscending
  sigil.visible = isSigilShown(run)
  if (!run.isAscending) return paintSwirl(swirl.material, run, camera, time, aspect)
  paintAscentLight(ascent.material, run, time, aspect)
  paintBubbles(bubbles.material, run, pixelRatio)
  if (sigil.visible) paintSigil(sigil.material, run, time, aspect)
}

export function warmDiveVeil(
  { scene, sigil }: DiveVeil,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera
) {
  gl.compile(scene, camera)
  gl.initTexture(dialOf(sigil))
}

export function drawDiveVeil({ scene }: DiveVeil, gl: THREE.WebGLRenderer, camera: THREE.Camera) {
  gl.autoClear = false
  gl.render(scene, camera)
  gl.autoClear = true
}
