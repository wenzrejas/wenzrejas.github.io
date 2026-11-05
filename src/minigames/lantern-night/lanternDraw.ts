import * as THREE from 'three'
import { flashStrength, isMotionReduced } from '@/store/settingsStore'
import { isOnScreen } from '@/utils/screen'
import {
  LANTERN_APPEAR_SECONDS,
  LANTERN_CLEAR_OF_WATER,
  LANTERN_FLOAT_HEIGHT,
  LANTERN_HALO_CENTRE,
  LANTERN_HALO_SIZE,
  LANTERN_HALO_STRENGTH,
  LANTERN_IGNITE_FLARE,
  LANTERN_IGNITE_FLARE_SECONDS,
  LANTERN_IGNITE_SECONDS,
  LANTERN_LEAVE_SECONDS,
  LANTERN_LEAVE_SINK,
  LANTERN_POOL_GONE_HEIGHT,
  LANTERN_POOL_SIZE,
  LANTERN_POOL_STRENGTH,
  LANTERN_POOL_Y,
  LANTERN_ROLL,
  LANTERN_SCALE,
  LANTERN_SWAY,
  LANTERN_SWAY_FULL_HEIGHT,
  LANTERN_SWAY_RATE,
  LANTERN_SWAY_Z_SHARE,
  LANTERN_UNLIT_HALO,
  LANTERN_VIEW_MARGIN,
} from './constants'
import { heightOf } from './lanternFlight'
import { flock, type Lantern } from './lanternFlock'

const { smoothstep } = THREE.MathUtils

interface LanternMeshes {
  bodies: THREE.InstancedMesh
  glows: THREE.InstancedMesh
}

const BODY_ATTRIBUTES = ['aLit', 'aSeed', 'aPresence', 'aAfloat']
const GLOW_ATTRIBUTES = ['aGlow', 'aAfloat']

const _pose = new THREE.Object3D()

const litShare = ({ litSeconds }: Lantern) =>
  litSeconds === null ? 0 : smoothstep(litSeconds, 0, LANTERN_IGNITE_SECONDS)

const presenceOf = ({ ageSeconds, leaveSeconds }: Lantern) =>
  smoothstep(ageSeconds, 0, LANTERN_APPEAR_SECONDS) *
  (leaveSeconds === null ? 1 : 1 - smoothstep(leaveSeconds, 0, LANTERN_LEAVE_SECONDS))

function poseBody(lantern: Lantern, time: number, boost: number, height: number) {
  const { x, z, driftX, driftZ, seed, leaveSeconds } = lantern
  const phase = seed * Math.PI * 2
  const swayShare = isMotionReduced() ? 0 : smoothstep(height, 0, LANTERN_SWAY_FULL_HEIGHT)
  const sway = Math.sin(time * LANTERN_SWAY_RATE + phase) * LANTERN_SWAY * swayShare
  const sink =
    leaveSeconds === null ? 0 : (leaveSeconds / LANTERN_LEAVE_SECONDS) * LANTERN_LEAVE_SINK
  _pose.position.set(
    x + driftX + sway,
    LANTERN_FLOAT_HEIGHT + height - sink,
    z + driftZ - sway * LANTERN_SWAY_Z_SHARE
  )
  _pose.rotation.set(sway * LANTERN_ROLL * 0.5, phase, -sway * LANTERN_ROLL, 'XYZ')
  _pose.scale.setScalar(boost * LANTERN_SCALE)
  _pose.updateMatrix()
}

function poseHalo(camera: THREE.Camera, boost: number) {
  _pose.position.y += _pose.scale.y * LANTERN_HALO_CENTRE
  _pose.quaternion.copy(camera.quaternion)
  _pose.scale.setScalar(boost * LANTERN_SCALE * LANTERN_HALO_SIZE)
  _pose.updateMatrix()
}

function haloGlow(lantern: Lantern) {
  const { litSeconds, isFinale } = lantern
  if (litSeconds === null) return LANTERN_UNLIT_HALO
  const flare =
    isFinale || litSeconds > LANTERN_IGNITE_FLARE_SECONDS
      ? 0
      : LANTERN_IGNITE_FLARE *
        flashStrength() *
        (1 - smoothstep(litSeconds, 0, LANTERN_IGNITE_FLARE_SECONDS))
  return LANTERN_HALO_STRENGTH * litShare(lantern) * (1 + flare)
}

function poseLightPool({ x, z }: Lantern, boost: number, height: number) {
  const shrink = 1 - smoothstep(height, 0, LANTERN_POOL_GONE_HEIGHT)
  _pose.position.set(x, LANTERN_POOL_Y, z)
  _pose.rotation.set(-Math.PI / 2, 0, 0, 'XYZ')
  _pose.scale.setScalar(boost * LANTERN_SCALE * LANTERN_POOL_SIZE * shrink)
  _pose.updateMatrix()
}

function writeAttribute(mesh: THREE.InstancedMesh, name: string, index: number, value: number) {
  ;(mesh.geometry.getAttribute(name) as THREE.InstancedBufferAttribute).setX(index, value)
}

function markWritten(mesh: THREE.InstancedMesh, names: string[], count: number) {
  mesh.count = count
  mesh.visible = count > 0
  if (count === 0) return
  mesh.instanceMatrix.needsUpdate = true
  for (const name of names) mesh.geometry.getAttribute(name).needsUpdate = true
}

export function drawFlock(
  { bodies, glows }: LanternMeshes,
  camera: THREE.Camera,
  time: number,
  boost: number
) {
  let drawnBodies = 0
  let drawnGlows = 0

  const writeGlow = (glow: number, afloat: number) => {
    glows.setMatrixAt(drawnGlows, _pose.matrix)
    writeAttribute(glows, 'aGlow', drawnGlows, glow)
    writeAttribute(glows, 'aAfloat', drawnGlows, afloat)
    drawnGlows++
  }

  for (const lantern of flock) {
    const height = heightOf(lantern)
    const lit = litShare(lantern)
    const presence = presenceOf(lantern)
    const afloat = 1 - smoothstep(height, 0, LANTERN_CLEAR_OF_WATER)

    poseBody(lantern, time, boost, height)
    if (isOnScreen(_pose.position, camera, LANTERN_VIEW_MARGIN)) {
      bodies.setMatrixAt(drawnBodies, _pose.matrix)
      writeAttribute(bodies, 'aLit', drawnBodies, lit)
      writeAttribute(bodies, 'aSeed', drawnBodies, lantern.seed)
      writeAttribute(bodies, 'aPresence', drawnBodies, presence)
      writeAttribute(bodies, 'aAfloat', drawnBodies, afloat)
      drawnBodies++

      poseHalo(camera, boost)
      writeGlow(haloGlow(lantern) * presence, afloat)
    }

    if (lit > 0 && height < LANTERN_POOL_GONE_HEIGHT) {
      poseLightPool(lantern, boost, height)
      if (isOnScreen(_pose.position, camera, LANTERN_VIEW_MARGIN)) {
        writeGlow(LANTERN_POOL_STRENGTH * lit, 0)
      }
    }
  }

  markWritten(bodies, BODY_ATTRIBUTES, drawnBodies)
  markWritten(glows, GLOW_ATTRIBUTES, drawnGlows)
}
