import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { endSkyBeam, useSkyBeamStore } from '@/store/skyBeamStore'
import { buildFlatQuad } from '@/utils/geometry'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import {
  CHARGE_MOTE_SIZE,
  ORB_HALO,
  ORB_RADIUS,
  RISING_MOTES,
  SKY_BEAM_HEIGHT,
  SKY_BEAM_RADIUS,
} from './constants'
import {
  advanceSkyBeam,
  applyStage,
  beginSkyBeam,
  createSkyBeamRun,
  releaseWorld,
  type SkyBeamAnchor,
} from './skyBeamSequence'
import {
  buildArcGeometry,
  buildBeamGeometry,
  buildChargeMoteGeometry,
  buildOrbGeometry,
  buildRisingMoteGeometry,
  createSkyBeamMaterials,
  type SkyBeamMaterials,
} from './skyBeamModel'
import { strikeArcs } from './sparkArcs'

interface SkyBeamProps extends SkyBeamAnchor {
  islandScale: number
}

interface SkyBeamPartsProps extends SkyBeamProps {
  materials: SkyBeamMaterials
  isActive: boolean
}

export default function SkyBeam(props: SkyBeamProps) {
  const isActive = useSkyBeamStore((s) => s.isActive)
  const materials = useMemo(() => createSkyBeamMaterials(), [])

  useEffect(
    () => () => {
      for (const material of Object.values(materials)) material.dispose()
    },
    [materials]
  )

  return (
    <SkyBeamParts
      key={isActive ? 'active' : 'idle'}
      {...props}
      materials={materials}
      isActive={isActive}
    />
  )
}

function SkyBeamParts({ anchor, origin, islandScale, materials, isActive }: SkyBeamPartsProps) {
  const run = useRef(createSkyBeamRun())
  const arcsRef = useRef<THREE.Mesh>(null)
  const chargeMotesRef = useRef<THREE.Points>(null)
  const risingMotesRef = useRef<THREE.Points>(null)
  const orbRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const shockRingRef = useRef<THREE.Mesh>(null)

  const arcGeometry = useMemo(() => buildArcGeometry(), [])
  const chargeMoteGeometry = useMemo(() => buildChargeMoteGeometry(), [])
  const risingMoteGeometry = useMemo(() => buildRisingMoteGeometry(islandScale), [islandScale])
  const orbGeometry = useMemo(() => buildOrbGeometry(), [])
  const beamGeometry = useMemo(() => buildBeamGeometry(), [])
  const shockRingGeometry = useMemo(() => buildFlatQuad(), [])

  useEffect(() => {
    if (!isActive) return
    const current = run.current
    beginSkyBeam(current, anchor)
    return () => releaseWorld(current)
  }, [isActive, anchor])

  useEffect(
    () => () => {
      for (const geometry of [
        arcGeometry,
        chargeMoteGeometry,
        risingMoteGeometry,
        orbGeometry,
        beamGeometry,
        shockRingGeometry,
      ]) {
        geometry.dispose()
      }
    },
    [
      arcGeometry,
      chargeMoteGeometry,
      risingMoteGeometry,
      orbGeometry,
      beamGeometry,
      shockRingGeometry,
    ]
  )

  useFrame(({ camera, gl }, delta) => {
    const arcs = arcsRef.current
    const chargeMotes = chargeMotesRef.current
    const risingMotes = risingMotesRef.current
    const orb = orbRef.current
    const beam = beamRef.current
    const shockRing = shockRingRef.current
    if (!isActive || !arcs || !chargeMotes || !risingMotes || !orb || !beam || !shockRing) return

    const isStrikeDue = advanceSkyBeam(run.current, delta)
    const { elapsed, stage } = run.current
    applyStage(stage)
    if (stage.isOver) {
      endSkyBeam()
      return
    }
    if (isStrikeDue) strikeArcs(arcs.geometry, stage.charge)
    const unitPixels = pixelsPerUnit(camera, gl)

    arcs.visible = stage.sparks > 0
    uniformsOf(arcs).uGlow.value = stage.sparks

    chargeMotes.visible = stage.motes > 0
    const chargeUniforms = uniformsOf(chargeMotes)
    chargeUniforms.uGlow.value = stage.motes
    chargeUniforms.uTime.value = elapsed
    chargeUniforms.uSize.value = CHARGE_MOTE_SIZE * unitPixels

    risingMotes.visible = stage.risingMotes > 0
    const risingUniforms = uniformsOf(risingMotes)
    risingUniforms.uGlow.value[0] = stage.risingMotes
    risingUniforms.uTime.value = elapsed
    risingUniforms.uSize.value = RISING_MOTES.moteSize * unitPixels
    risingUniforms.uRise.value = RISING_MOTES.moteRise / islandScale

    orb.visible = stage.orbSize > 0
    const orbUniforms = uniformsOf(orb)
    orbUniforms.uGlow.value = stage.orbGlow
    orbUniforms.uSize.value = ORB_RADIUS * ORB_HALO * stage.orbSize
    orbUniforms.uTime.value = elapsed

    beam.visible = stage.reach > 0
    const beamRadius = SKY_BEAM_RADIUS * stage.beamWidth
    beam.scale.set(beamRadius, SKY_BEAM_HEIGHT * stage.reach, beamRadius)
    const beamUniforms = uniformsOf(beam)
    beamUniforms.uGlow.value = stage.beamGlow
    beamUniforms.uLength.value = SKY_BEAM_HEIGHT * stage.reach
    beamUniforms.uTime.value = elapsed

    shockRing.visible = stage.ringGlow > 0
    shockRing.scale.setScalar(stage.ringRadius * 2)
    uniformsOf(shockRing).uGlow.value = stage.ringGlow
  })

  return (
    <group position={origin}>
      <mesh
        ref={beamRef}
        geometry={beamGeometry}
        material={materials.beam}
        visible={false}
        renderOrder={RENDER_LAYER.glow}
      />
      <mesh
        ref={arcsRef}
        geometry={arcGeometry}
        material={materials.arcs}
        visible={false}
        renderOrder={RENDER_LAYER.glow}
      />
      <points
        ref={chargeMotesRef}
        geometry={chargeMoteGeometry}
        material={materials.chargeMotes}
        visible={false}
        renderOrder={RENDER_LAYER.glow}
      />
      <points
        ref={risingMotesRef}
        geometry={risingMoteGeometry}
        material={materials.risingMotes}
        visible={false}
        renderOrder={RENDER_LAYER.glow}
      />
      <mesh
        ref={orbRef}
        geometry={orbGeometry}
        material={materials.orb}
        visible={false}
        renderOrder={RENDER_LAYER.overGlow}
      />
      <mesh
        ref={shockRingRef}
        geometry={shockRingGeometry}
        material={materials.shockRing}
        visible={false}
        renderOrder={RENDER_LAYER.overGlow}
      />
    </group>
  )
}
