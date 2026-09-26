import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'
import { useShipStore } from '../../../store/shipStore'
import { isRaining } from '../../../store/weatherStore'
import { wrapAngle } from '../../../utils/math'
import { ParticlePool, updateDrops, updateFoam } from '../Effects/particlePool'
import { depthFade } from '../Effects/wildlifeMaterial'
import { isOpenWater } from '../Islands/islandZones'
import { buildDolphinGeometry, createDolphinMaterial } from './dolphinModel'
import { emitFinWake, emitSplash } from './spray'
import {
  BANK_FACTOR,
  DOLPHIN_LENGTH,
  DROP_GRAVITY,
  DROP_POOL,
  FADE_START_DEPTH,
  FIN_HEIGHT,
  FIN_WAKE_SPACING,
  FIRST_CHECK_DELAY,
  FLUKE_FREQ,
  FOAM_POOL,
  HIDDEN_DEPTH,
  IDLE_SHIP_SPEED,
  LEAP_PITCH_BOOST,
  LEAP_PITCH_MAX,
  OPEN_WATER_GAP,
  ORBIT_RATE,
  ORBIT_SETTLE,
  PITCH_SMOOTH,
  POD_MAX,
  SPLASH_ENTRY_DROPS,
  SPLASH_EXIT_DROPS,
} from './constants'
import {
  createPod,
  pose,
  swim,
  timeOfDayChance,
  updateAction,
  updateRoaming,
  type Pod,
} from './pod'
import { updateDolphinCalls } from '../../../audio/wildlifeSounds'

const _dummy = new THREE.Object3D()
const { clamp } = THREE.MathUtils

export default function Dolphins() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const dropsRef = useRef<THREE.InstancedMesh>(null)

  const bodyGeometry = useMemo(() => buildDolphinGeometry(), [])
  const foamGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
  const dropGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const bodyMaterial = useMemo(() => createDolphinMaterial(), [])
  const sprayMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthWrite: false }),
    []
  )

  useEffect(
    () => () => {
      for (const resource of [
        bodyGeometry,
        foamGeometry,
        dropGeometry,
        bodyMaterial,
        sprayMaterial,
      ]) {
        resource.dispose()
      }
    },
    [bodyGeometry, foamGeometry, dropGeometry, bodyMaterial, sprayMaterial]
  )

  const pod = useRef<Pod | null>(null)
  const checkTimer = useRef(FIRST_CHECK_DELAY)
  const foam = useMemo(() => new ParticlePool(FOAM_POOL), [])
  const drops = useMemo(() => new ParticlePool(DROP_POOL), [])

  useFrame((_, delta) => {
    const body = bodyRef.current
    const foamMesh = foamRef.current
    const dropsMesh = dropsRef.current
    if (!body || !foamMesh || !dropsMesh) return

    const dt = Math.min(delta, 0.05)
    const cycle = useCycleStore.getState()
    const raining = isRaining()
    const phaseAttr = bodyGeometry.getAttribute('aPhase') as THREE.InstancedBufferAttribute
    const archAttr = bodyGeometry.getAttribute('aArch') as THREE.InstancedBufferAttribute
    const fadeAttr = bodyGeometry.getAttribute('aFade') as THREE.InstancedBufferAttribute

    const motion = useShipStore.getState()

    sprayMaterial.color.copy(cycle.foamColor)

    const { dolphinChance, dolphinInterval } = useDebugStore.getState().wildlife
    checkTimer.current = Math.min(checkTimer.current, dolphinInterval) - dt
    if (checkTimer.current <= 0) {
      checkTimer.current = dolphinInterval
      if (
        !pod.current &&
        !raining &&
        isOpenWater(motion.x, motion.z, OPEN_WATER_GAP) &&
        Math.random() < dolphinChance * timeOfDayChance(cycle.timeOfDay)
      ) {
        pod.current = createPod(motion)
      }
    }

    const current = pod.current
    let count = 0

    if (current) {
      current.age += dt
      if (!current.leaving && (raining || current.age > current.followTime)) {
        current.leaving = true
        for (const dolphin of current.dolphins) dolphin.targetDepth = HIDDEN_DEPTH
      }

      const idle = 1 - clamp(motion.speed / IDLE_SHIP_SPEED, 0, 1)
      current.orbit = wrapAngle(current.orbit) + ORBIT_RATE * idle * dt
      current.orbit *= Math.exp(-ORBIT_SETTLE * (1 - idle) * dt)
      updateRoaming(current, motion, dt)

      let submerged = true
      for (const dolphin of current.dolphins) {
        swim(dolphin, current, motion, dt)
        updateAction(dolphin, current.leaving, dt)
        submerged &&= dolphin.depth >= HIDDEN_DEPTH

        const { y, climb, arch, roll } = pose(dolphin)
        const pitchBoost = dolphin.action === 'leap' ? LEAP_PITCH_BOOST : 1
        const targetPitch = clamp(
          Math.atan2(climb, Math.max(dolphin.speed, 1)) * pitchBoost,
          -LEAP_PITCH_MAX,
          LEAP_PITCH_MAX
        )
        dolphin.pitch += (targetPitch - dolphin.pitch) * Math.min(1, PITCH_SMOOTH * dt)
        dolphin.phase += dt * Math.PI * 2 * FLUKE_FREQ * (y > 0 ? 0.15 : 1)

        const breaching = dolphin.action === 'leap' && dolphin.prevY < 0 && y >= 0
        const entering = dolphin.prevY > 0 && y <= 0
        if (breaching || entering) {
          emitSplash(
            foam,
            drops,
            dolphin.x,
            dolphin.z,
            dolphin.heading,
            dolphin.speed,
            entering ? SPLASH_ENTRY_DROPS : SPLASH_EXIT_DROPS,
            entering ? 1.1 : 0.8
          )
        }
        dolphin.prevY = y

        const finX = dolphin.x - Math.sin(dolphin.heading) * DOLPHIN_LENGTH * 0.05
        const finZ = dolphin.z - Math.cos(dolphin.heading) * DOLPHIN_LENGTH * 0.05
        const finBreaching = y < 0 && y + FIN_HEIGHT * DOLPHIN_LENGTH > 0 && dolphin.speed > 2
        if (!finBreaching) {
          dolphin.wakeX = finX
          dolphin.wakeZ = finZ
        } else if (Math.hypot(finX - dolphin.wakeX, finZ - dolphin.wakeZ) >= FIN_WAKE_SPACING) {
          emitFinWake(foam, finX, finZ, dolphin.heading)
          dolphin.wakeX = finX
          dolphin.wakeZ = finZ
        }

        const bank = clamp(-dolphin.yawRate * BANK_FACTOR, -0.5, 0.5)
        _dummy.position.set(dolphin.x, y, dolphin.z)
        _dummy.rotation.set(-dolphin.pitch, dolphin.heading, bank + roll, 'YXZ')
        _dummy.scale.setScalar(DOLPHIN_LENGTH)
        _dummy.updateMatrix()
        body.setMatrixAt(count, _dummy.matrix)
        phaseAttr.setX(count, dolphin.phase)
        archAttr.setX(count, arch)
        fadeAttr.setX(count, depthFade(dolphin.depth, FADE_START_DEPTH, HIDDEN_DEPTH))
        count++
      }

      if (current.leaving && submerged) pod.current = null
    }

    const present =
      !!pod.current &&
      !pod.current.leaving &&
      pod.current.dolphins.some((dolphin) => dolphin.depth < FADE_START_DEPTH)
    updateDolphinCalls(present, dt)

    body.count = count
    body.visible = count > 0
    body.instanceMatrix.needsUpdate = true
    phaseAttr.needsUpdate = true
    archAttr.needsUpdate = true
    fadeAttr.needsUpdate = true

    updateFoam(foam, foamMesh, dt)
    updateDrops(drops, dropsMesh, dt, DROP_GRAVITY)
  })

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, POD_MAX]}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, sprayMaterial, FOAM_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
      <instancedMesh
        ref={dropsRef}
        args={[dropGeometry, sprayMaterial, DROP_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
    </>
  )
}
