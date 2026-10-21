import * as THREE from 'three'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import {
  ANGULAR_GEM_FORWARD,
  ANGULAR_GEM_LIFT,
  ANGULAR_GEM_NODE,
  ANGULAR_GEM_PAUSE_SECONDS,
  ANGULAR_GEM_RISE_SECONDS,
  ANGULAR_GEM_STEP_SECONDS,
} from './constants'

export interface AngularGem {
  mesh: THREE.Mesh
  rest: THREE.Vector3
  stepFrom: THREE.Quaternion
  stepTo: THREE.Quaternion
  lastTurn: THREE.Quaternion
  stepSeconds: number
  rise: number
}

const QUARTER_TURN = Math.PI / 2
const STEP_TURNS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
].map(([x, y, z]) =>
  new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z), QUARTER_TURN)
)
const _undo = new THREE.Quaternion()
const { smoothstep } = THREE.MathUtils

export function findAngularGem(model: THREE.Object3D): AngularGem | null {
  const node = nodeNamed(model, ANGULAR_GEM_NODE)
  if (!node) return null

  const mesh = meshesOf(node)[0]
  return {
    mesh,
    rest: mesh.position.clone(),
    stepFrom: mesh.quaternion.clone(),
    stepTo: mesh.quaternion.clone(),
    lastTurn: new THREE.Quaternion(),
    stepSeconds: ANGULAR_GEM_STEP_SECONDS + ANGULAR_GEM_PAUSE_SECONDS,
    rise: 0,
  }
}

export const angularGemLevel = (gem: AngularGem) => smoothstep(gem.rise, 0, 1)

function startStep(gem: AngularGem): void {
  _undo.copy(gem.lastTurn).invert()
  const choices = STEP_TURNS.filter((turn) => !turn.equals(_undo))
  const turn = choices[Math.floor(Math.random() * choices.length)]
  gem.lastTurn.copy(turn)
  gem.stepFrom.copy(gem.stepTo)
  gem.stepTo.premultiply(turn)
  gem.stepSeconds = 0
}

export function poseAngularGem(gem: AngularGem, isHeld: boolean, dt: number): void {
  const isTurning = gem.stepSeconds < ANGULAR_GEM_STEP_SECONDS
  const riseStep = dt / ANGULAR_GEM_RISE_SECONDS
  gem.rise =
    isHeld || isTurning ? Math.min(gem.rise + riseStep, 1) : Math.max(gem.rise - riseStep, 0)

  if (gem.rise === 1 && (isHeld || isTurning)) {
    gem.stepSeconds += dt
    if (isHeld && gem.stepSeconds >= ANGULAR_GEM_STEP_SECONDS + ANGULAR_GEM_PAUSE_SECONDS) {
      startStep(gem)
    }
  }

  const lift = angularGemLevel(gem)
  gem.mesh.position.set(
    gem.rest.x,
    gem.rest.y + lift * ANGULAR_GEM_LIFT,
    gem.rest.z + lift * ANGULAR_GEM_FORWARD
  )
  gem.mesh.quaternion.slerpQuaternions(
    gem.stepFrom,
    gem.stepTo,
    smoothstep(gem.stepSeconds, 0, ANGULAR_GEM_STEP_SECONDS)
  )
}
