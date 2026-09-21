import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useShipStore } from '../../../store/shipStore'
import { isRaining, useWeatherStore } from '../../../store/weatherStore'
import { retain } from '../../../utils/array'
import { ParticlePool, updateDrops, updateSparks } from '../Effects/particlePool'
import { algaeAt, algaeUniforms } from './algaeField'
import { createAlgaeMaterial, createSparkMaterial } from './algaeMaterial'
import { emitBowSplash, emitHullSpark, emitRainFlashes } from './algaeSpray'
import {
  AMBIENT_RATE,
  CHECK_INTERVAL,
  DESPAWN_DISTANCE,
  FADE_IN,
  FIRST_CHECK_DELAY,
  INTENSITY_RATE,
  MAX_PATCHES,
  MOONLIT_BOOST,
  PLANE_MARGIN,
  PLANE_SEGMENTS,
  PLANE_SIZE,
  PLANE_Y,
  SPARK_IDLE_RATE,
  SPARK_POOL,
  SPARK_RATE,
  SPAWN_CHANCE,
  SPLASH_GRAVITY,
  SPLASH_POOL,
  SPLASH_RATE,
  TRAIL_SPACING,
} from './constants'
import { createPatch, isNightWindow, patchReach, viewReach, type Patch } from './patches'
import { recordTrail } from './scatterTrail'

export default function Algae() {
  const planeRef = useRef<THREE.Mesh>(null)
  const sparksRef = useRef<THREE.InstancedMesh>(null)
  const splashRef = useRef<THREE.InstancedMesh>(null)

  const planeMaterial = useMemo(() => createAlgaeMaterial(), [])
  const sparkMaterial = useMemo(() => createSparkMaterial(), [])
  const sparkGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
  const splashGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  useEffect(
    () => () => {
      planeMaterial.dispose()
      sparkMaterial.dispose()
      sparkGeometry.dispose()
      splashGeometry.dispose()
    },
    [planeMaterial, sparkMaterial, sparkGeometry, splashGeometry]
  )

  const patches = useRef<Patch[]>([])
  const sparks = useMemo(() => new ParticlePool(SPARK_POOL), [])
  const splash = useMemo(() => new ParticlePool(SPLASH_POOL), [])
  const checkTimer = useRef(FIRST_CHECK_DELAY)
  const sparkBudget = useRef(0)
  const splashBudget = useRef(0)
  const lastTrail = useRef(new THREE.Vector2(Infinity, Infinity))

  useFrame(({ clock, camera }, delta) => {
    const plane = planeRef.current
    const sparkMesh = sparksRef.current
    const splashMesh = splashRef.current
    if (!plane || !sparkMesh || !splashMesh) return

    const dt = Math.min(delta, 0.05)
    const ship = useShipStore.getState()
    const night = isNightWindow(useCycleStore.getState().timeOfDay)

    const intensity = algaeUniforms.uAlgaeIntensity
    intensity.value += ((night ? 1 : 0) - intensity.value) * Math.min(1, INTENSITY_RATE * dt)
    const ambient = algaeUniforms.uAlgaeAmbient
    ambient.value += ((isRaining() ? 0 : 1) - ambient.value) * Math.min(1, AMBIENT_RATE * dt)
    const reach = viewReach(camera, ship.x, ship.z)

    checkTimer.current -= dt
    if (checkTimer.current <= 0) {
      checkTimer.current = CHECK_INTERVAL
      const moonlit = useWeatherStore.getState().type === 'moonlit'
      const chance = SPAWN_CHANCE * (moonlit ? MOONLIT_BOOST : 1)
      if (patches.current.length < MAX_PATCHES && night && Math.random() < chance) {
        const patch = createPatch(ship.x, ship.z, reach)
        if (patch) patches.current.push(patch)
      }
    }

    if (!night && intensity.value < 0.01) patches.current.length = 0
    let patchInView = false
    retain(patches.current, (patch) => {
      patch.age += dt
      const distance = Math.hypot(patch.x - ship.x, patch.z - ship.z)
      patchInView ||= distance < reach + patchReach(patch)
      return distance <= DESPAWN_DISTANCE
    })
    algaeUniforms.uAlgaePatches.value.forEach((zone, i) => {
      const patch = patches.current[i]
      if (patch) zone.set(patch.x, patch.z, patch.radius, Math.min(1, patch.age / FADE_IN))
      else zone.set(0, 0, 0, 0)
    })

    plane.visible = patchInView && intensity.value > 0.001
    if (plane.visible) {
      plane.position.set(Math.round(ship.x), PLANE_Y, Math.round(ship.z))
      plane.scale.setScalar(Math.max(1, ((reach + PLANE_MARGIN) * 2) / PLANE_SIZE))
    }

    if (Math.hypot(ship.x - lastTrail.current.x, ship.z - lastTrail.current.y) >= TRAIL_SPACING) {
      recordTrail(ship.x, ship.z, clock.getElapsedTime())
      lastTrail.current.set(ship.x, ship.z)
    }

    const glow = algaeAt(ship.x, ship.z)
    const cruise = Math.min(ship.speed / 30, 1)

    sparkBudget.current += glow * (SPARK_IDLE_RATE + SPARK_RATE * cruise) * dt
    while (sparkBudget.current >= 1) {
      sparkBudget.current -= 1
      emitHullSpark(sparks, ship)
    }

    splashBudget.current += glow * SPLASH_RATE * cruise * dt
    while (splashBudget.current >= 1) {
      splashBudget.current -= 1
      emitBowSplash(splash, ship)
    }

    emitRainFlashes(sparks, splash)

    updateSparks(sparks, sparkMesh, dt)
    updateDrops(splash, splashMesh, dt, SPLASH_GRAVITY)
  })

  return (
    <>
      <mesh
        ref={planeRef}
        rotation-x={-Math.PI / 2}
        material={planeMaterial}
        frustumCulled={false}
        visible={false}
        renderOrder={3.5}
      >
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, PLANE_SEGMENTS, PLANE_SEGMENTS]} />
      </mesh>
      <instancedMesh
        ref={sparksRef}
        args={[sparkGeometry, sparkMaterial, SPARK_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4.5}
      />
      <instancedMesh
        ref={splashRef}
        args={[splashGeometry, sparkMaterial, SPLASH_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4.5}
      />
    </>
  )
}
