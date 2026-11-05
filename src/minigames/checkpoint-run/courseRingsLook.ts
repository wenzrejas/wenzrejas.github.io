import * as THREE from 'three'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useCycleStore } from '@/store/cycleStore'
import { flashStrength, isMotionReduced } from '@/store/settingsStore'
import { uniformsOf } from '@/utils/meshes'
import {
  acrossGateX,
  acrossGateZ,
  COURSE_GATES,
  GATE_SIDES,
  MOST_GATES,
  type Gate,
} from './checkpointRun'
import {
  ARCH_DRAWN_GLOW,
  ARCH_GLOW_RATE,
  COURSE_FADE_SECONDS,
  NEXT_ARCH_GLOW,
  PASSED_ARCH_GLOW,
  RING_END_REACH,
  RING_FOAM_QUAD,
  RING_FOAM_SHOWS_FROM,
  RING_FOAM_Y,
  RING_PULSE_ATTACK,
  RING_PULSE_GROW,
  RING_PULSE_SECONDS,
  RING_PULSES,
  RINGS_SHOWN_AHEAD,
  SOLID_ARCH_GLOW,
  UPCOMING_ARCH_GLOW,
} from './constants'
import { gateYaw } from './courseModel'
import type { CourseKey } from './courses'
import type { RingPass } from './ringFeedback'

interface CourseRingsState {
  shownCourse: CourseKey | null
  presence: number
  pulses: Float32Array
  strengths: Float32Array
  wasPulsing: boolean
}

interface CourseRingMeshes {
  rings: THREE.InstancedMesh
  foam: THREE.InstancedMesh
}

const { clamp, damp, smoothstep } = THREE.MathUtils

export const FOAM_PER_RING = GATE_SIDES.length

const _pose = new THREE.Object3D()

const instanced = (mesh: THREE.InstancedMesh, name: string) =>
  mesh.geometry.getAttribute(name) as THREE.InstancedBufferAttribute

export const createCourseRingsState = (): CourseRingsState => ({
  shownCourse: null,
  presence: 0,
  pulses: new Float32Array(MOST_GATES),
  strengths: new Float32Array(MOST_GATES),
  wasPulsing: false,
})

export function startRingPulse(state: CourseRingsState, { ring, kind }: RingPass) {
  state.pulses[ring] = 1
  state.strengths[ring] = RING_PULSES[kind]
}

function ringGlowTarget(ring: number, passed: number) {
  if (ring === passed) return NEXT_ARCH_GLOW
  if (ring < passed) return PASSED_ARCH_GLOW
  return ring <= passed + RINGS_SHOWN_AHEAD ? UPCOMING_ARCH_GLOW : 0
}

function poseRing(rings: THREE.InstancedMesh, index: number, gate: Gate, scale: number) {
  _pose.position.set(gate.x, 0, gate.z)
  _pose.rotation.set(0, gateYaw(gate), 0)
  _pose.scale.setScalar(scale)
  _pose.updateMatrix()
  rings.setMatrixAt(index, _pose.matrix)
}

function poseFoam(foam: THREE.InstancedMesh, gates: Gate[]) {
  _pose.rotation.set(0, 0, 0)
  _pose.scale.setScalar(RING_FOAM_QUAD)
  gates.forEach((gate, ring) => {
    GATE_SIDES.forEach((side, end) => {
      const reach = RING_END_REACH * side
      _pose.position.set(acrossGateX(gate, reach), RING_FOAM_Y, acrossGateZ(gate, reach))
      _pose.updateMatrix()
      foam.setMatrixAt(ring * FOAM_PER_RING + end, _pose.matrix)
    })
  })
  foam.instanceMatrix.needsUpdate = true
}

function placeCourse({ rings, foam }: CourseRingMeshes, course: CourseKey) {
  const gates = COURSE_GATES[course]
  const glows = instanced(rings, 'aGlow')
  gates.forEach((gate, index) => {
    poseRing(rings, index, gate, 1)
    glows.setX(index, ringGlowTarget(index, 0))
  })
  rings.instanceMatrix.needsUpdate = true
  poseFoam(foam, gates)
}

function fadeCourse(
  state: CourseRingsState,
  meshes: CourseRingMeshes,
  wantedCourse: CourseKey | null,
  dt: number
) {
  if (wantedCourse && wantedCourse !== state.shownCourse) {
    placeCourse(meshes, wantedCourse)
    state.shownCourse = wantedCourse
    state.presence = 0
    state.pulses.fill(0)
  }
  const fadeStep = dt / COURSE_FADE_SECONDS
  state.presence = clamp(state.presence + (wantedCourse ? fadeStep : -fadeStep), 0, 1)
  if (!wantedCourse && state.presence === 0) state.shownCourse = null
  meshes.rings.visible = state.shownCourse !== null
  meshes.foam.visible = meshes.rings.visible
}

function paintRings(
  state: CourseRingsState,
  { rings, foam }: CourseRingMeshes,
  gates: Gate[],
  passed: number | null,
  dt: number
) {
  const glows = instanced(rings, 'aGlow')
  const pulseLevels = instanced(rings, 'aPulse')
  const foamShares = instanced(foam, 'aFoam')
  const flash = flashStrength()
  const growth = isMotionReduced() ? 0 : RING_PULSE_GROW
  let hasPosed = false
  let isPulsing = false
  let lastDrawn = -1

  for (let ring = 0; ring < gates.length; ring++) {
    if (passed !== null) {
      glows.setX(ring, damp(glows.getX(ring), ringGlowTarget(ring, passed), ARCH_GLOW_RATE, dt))
    }
    const glow = glows.getX(ring)

    const pulse = state.pulses[ring]
    let pulseLevel = 0
    if (pulse > 0) {
      const left = Math.max(0, pulse - dt / RING_PULSE_SECONDS)
      const strength = state.strengths[ring]
      state.pulses[ring] = left
      const bump = Math.sin(Math.PI * (1 - left) ** RING_PULSE_ATTACK)
      poseRing(rings, ring, gates[ring], 1 + growth * strength * bump)
      hasPosed = true
      isPulsing = true
      pulseLevel = bump * strength * flash
    }
    pulseLevels.setX(ring, pulseLevel)
    if (glow > ARCH_DRAWN_GLOW || pulseLevel > 0) lastDrawn = ring

    const solid = Math.max(Math.min(1, glow / SOLID_ARCH_GLOW), Math.min(1, pulseLevel))
    const foamShown = smoothstep(solid * state.presence, RING_FOAM_SHOWS_FROM, 1)
    const foamSlot = ring * FOAM_PER_RING
    foamShares.setX(foamSlot, foamShown)
    foamShares.setX(foamSlot + 1, foamShown)
  }

  rings.count = lastDrawn + 1
  foam.count = rings.count * FOAM_PER_RING
  glows.needsUpdate = true
  foamShares.needsUpdate = true
  if (isPulsing || state.wasPulsing) pulseLevels.needsUpdate = true
  state.wasPulsing = isPulsing
  if (hasPosed) rings.instanceMatrix.needsUpdate = true
}

export function stepCourseRings(state: CourseRingsState, meshes: CourseRingMeshes, dt: number) {
  const { run } = useCheckpointStore.getState()
  fadeCourse(state, meshes, run?.course ?? null, dt)
  if (!state.shownCourse) return

  uniformsOf(meshes.rings).uPresence.value = state.presence
  ;(uniformsOf(meshes.foam).uColor.value as THREE.Color).copy(useCycleStore.getState().foamColor)
  paintRings(state, meshes, COURSE_GATES[state.shownCourse], run ? run.passed : null, dt)
}
