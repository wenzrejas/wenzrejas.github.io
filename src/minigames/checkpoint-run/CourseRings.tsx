import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useCycleStore } from '@/store/cycleStore'
import { flashStrength, isMotionReduced } from '@/store/settingsStore'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
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
import {
  buildArchGeometry,
  buildRingFoamGeometry,
  createArchMaterial,
  createRingFoamMaterial,
  gateYaw,
} from './courseModel'
import type { CourseKey } from './courses'
import { onRingPass } from './ringFeedback'

const { clamp, damp, smoothstep } = THREE.MathUtils

const FOAM_PER_RING = GATE_SIDES.length

const _pose = new THREE.Object3D()

const instanced = (mesh: THREE.InstancedMesh, name: string) =>
  mesh.geometry.getAttribute(name) as THREE.InstancedBufferAttribute

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

function placeRings(rings: THREE.InstancedMesh, foam: THREE.InstancedMesh, course: CourseKey) {
  const gates = COURSE_GATES[course]
  const glows = instanced(rings, 'aGlow')
  gates.forEach((gate, i) => {
    poseRing(rings, i, gate, 1)
    glows.setX(i, ringGlowTarget(i, 0))
  })
  rings.instanceMatrix.needsUpdate = true
  poseFoam(foam, gates)
}

export default function CourseRings() {
  const ringsRef = useRef<THREE.InstancedMesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildArchGeometry(MOST_GATES), [])
  const material = useMemo(() => createArchMaterial(), [])
  const foamGeometry = useMemo(() => buildRingFoamGeometry(MOST_GATES * FOAM_PER_RING), [])
  const foamMaterial = useMemo(() => createRingFoamMaterial(), [])
  const shown = useRef<CourseKey | null>(null)
  const presence = useRef(0)
  const pulses = useRef(new Float32Array(MOST_GATES))
  const strengths = useRef(new Float32Array(MOST_GATES))
  const wasPulsing = useRef(false)

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      foamGeometry.dispose()
      foamMaterial.dispose()
    },
    [geometry, material, foamGeometry, foamMaterial]
  )

  useEffect(
    () =>
      onRingPass(({ ring, kind }) => {
        pulses.current[ring] = 1
        strengths.current[ring] = RING_PULSES[kind]
      }),
    []
  )

  useFrame((_, delta) => {
    const rings = ringsRef.current
    const foam = foamRef.current
    if (!rings || !foam) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const { run } = useCheckpointStore.getState()
    const wanted = run?.course ?? null

    if (wanted && wanted !== shown.current) {
      placeRings(rings, foam, wanted)
      shown.current = wanted
      presence.current = 0
      pulses.current.fill(0)
    }
    const fadeStep = dt / COURSE_FADE_SECONDS
    presence.current = clamp(presence.current + (wanted ? fadeStep : -fadeStep), 0, 1)
    if (!wanted && presence.current === 0) shown.current = null
    rings.visible = shown.current !== null
    foam.visible = rings.visible
    if (!shown.current) return

    uniformsOf(rings).uPresence.value = presence.current
    uniformsOf(foam).uColor.value.copy(useCycleStore.getState().foamColor)

    const gates = COURSE_GATES[shown.current]
    const glows = instanced(rings, 'aGlow')
    const pulseOut = instanced(rings, 'aPulse')
    const foamShare = instanced(foam, 'aFoam')
    const flash = flashStrength()
    const growth = isMotionReduced() ? 0 : RING_PULSE_GROW
    let didPose = false
    let isPulsing = false
    let lastDrawn = -1

    for (let ring = 0; ring < gates.length; ring++) {
      if (run)
        glows.setX(
          ring,
          damp(glows.getX(ring), ringGlowTarget(ring, run.passed), ARCH_GLOW_RATE, dt)
        )
      const glow = glows.getX(ring)

      const pulse = pulses.current[ring]
      let pulseLevel = 0
      if (pulse > 0) {
        const left = Math.max(0, pulse - dt / RING_PULSE_SECONDS)
        const strength = strengths.current[ring]
        pulses.current[ring] = left
        const bump = Math.sin(Math.PI * (1 - left) ** RING_PULSE_ATTACK)
        poseRing(rings, ring, gates[ring], 1 + growth * strength * bump)
        didPose = true
        isPulsing = true
        pulseLevel = bump * strength * flash
      }
      pulseOut.setX(ring, pulseLevel)
      if (glow > ARCH_DRAWN_GLOW || pulseLevel > 0) lastDrawn = ring

      const solid = Math.max(Math.min(1, glow / SOLID_ARCH_GLOW), Math.min(1, pulseLevel))
      const foamShown = smoothstep(solid * presence.current, RING_FOAM_SHOWS_FROM, 1)
      const foamSlot = ring * FOAM_PER_RING
      foamShare.setX(foamSlot, foamShown)
      foamShare.setX(foamSlot + 1, foamShown)
    }
    rings.count = lastDrawn + 1
    foam.count = rings.count * FOAM_PER_RING
    glows.needsUpdate = true
    foamShare.needsUpdate = true
    if (isPulsing || wasPulsing.current) pulseOut.needsUpdate = true
    wasPulsing.current = isPulsing
    if (didPose) rings.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, foamMaterial, MOST_GATES * FOAM_PER_RING]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.waterSurface}
      />
      <instancedMesh
        ref={ringsRef}
        args={[geometry, material, MOST_GATES]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.effects}
      />
    </>
  )
}
