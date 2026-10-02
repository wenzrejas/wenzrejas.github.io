import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { endSkyBeam, useSkyBeamStore } from '@/store/skyBeamStore'
import { uniformsOf } from '@/utils/meshes'
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
  createArcMaterial,
  createBeamMaterial,
  createChargeMoteMaterial,
  createOrbMaterial,
  createRisingMoteMaterial,
} from './skyBeamModel'
import { strikeArcs } from './sparkArcs'

interface SkyBeamProps extends SkyBeamAnchor {
  islandScale: number
}

export default function SkyBeam(props: SkyBeamProps) {
  const isActive = useSkyBeamStore((s) => s.isActive)
  return isActive ? <ActiveSkyBeam {...props} /> : null
}

function ActiveSkyBeam({ anchor, origin, islandScale }: SkyBeamProps) {
  const run = useRef(createSkyBeamRun())
  const arcsRef = useRef<THREE.Mesh>(null)
  const chargeMotesRef = useRef<THREE.Points>(null)
  const risingMotesRef = useRef<THREE.Points>(null)
  const orbRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)

  const arcGeometry = useMemo(() => buildArcGeometry(), [])
  const chargeMoteGeometry = useMemo(() => buildChargeMoteGeometry(), [])
  const risingMoteGeometry = useMemo(() => buildRisingMoteGeometry(islandScale), [islandScale])
  const orbGeometry = useMemo(() => buildOrbGeometry(), [])
  const beamGeometry = useMemo(() => buildBeamGeometry(), [])
  const arcMaterial = useMemo(() => createArcMaterial(), [])
  const chargeMoteMaterial = useMemo(() => createChargeMoteMaterial(), [])
  const risingMoteMaterial = useMemo(() => createRisingMoteMaterial(), [])
  const orbMaterial = useMemo(() => createOrbMaterial(), [])
  const beamMaterial = useMemo(() => createBeamMaterial(), [])

  useEffect(() => {
    const current = run.current
    beginSkyBeam(current, anchor)
    return () => releaseWorld(current)
  }, [anchor])

  useEffect(
    () => () => {
      for (const resource of [
        arcGeometry,
        chargeMoteGeometry,
        risingMoteGeometry,
        orbGeometry,
        beamGeometry,
        arcMaterial,
        chargeMoteMaterial,
        risingMoteMaterial,
        orbMaterial,
        beamMaterial,
      ]) {
        resource.dispose()
      }
    },
    [
      arcGeometry,
      chargeMoteGeometry,
      risingMoteGeometry,
      orbGeometry,
      beamGeometry,
      arcMaterial,
      chargeMoteMaterial,
      risingMoteMaterial,
      orbMaterial,
      beamMaterial,
    ]
  )

  useFrame(({ camera, gl }, delta) => {
    const arcs = arcsRef.current
    const chargeMotes = chargeMotesRef.current
    const risingMotes = risingMotesRef.current
    const orb = orbRef.current
    const beam = beamRef.current
    if (!arcs || !chargeMotes || !risingMotes || !orb || !beam) return

    const isStrikeDue = advanceSkyBeam(run.current, delta)
    const { elapsed, stage } = run.current
    applyStage(stage)
    if (stage.isOver) {
      endSkyBeam()
      return
    }
    if (isStrikeDue) strikeArcs(arcs.geometry, stage.charge)
    const pixelsPerUnit = (camera as THREE.OrthographicCamera).zoom * gl.getPixelRatio()

    arcs.visible = stage.sparks > 0
    uniformsOf(arcs).uGlow.value = stage.sparks

    chargeMotes.visible = stage.motes > 0
    const chargeUniforms = uniformsOf(chargeMotes)
    chargeUniforms.uGlow.value = stage.motes
    chargeUniforms.uTime.value = elapsed
    chargeUniforms.uSize.value = CHARGE_MOTE_SIZE * pixelsPerUnit

    risingMotes.visible = stage.risingMotes > 0
    const risingUniforms = uniformsOf(risingMotes)
    risingUniforms.uGlow.value[0] = stage.risingMotes
    risingUniforms.uTime.value = elapsed
    risingUniforms.uSize.value = RISING_MOTES.moteSize * pixelsPerUnit
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
  })

  return (
    <group position={origin}>
      <mesh
        ref={beamRef}
        geometry={beamGeometry}
        material={beamMaterial}
        visible={false}
        renderOrder={5}
      />
      <mesh
        ref={arcsRef}
        geometry={arcGeometry}
        material={arcMaterial}
        visible={false}
        renderOrder={5}
      />
      <points
        ref={chargeMotesRef}
        geometry={chargeMoteGeometry}
        material={chargeMoteMaterial}
        visible={false}
        renderOrder={5}
      />
      <points
        ref={risingMotesRef}
        geometry={risingMoteGeometry}
        material={risingMoteMaterial}
        visible={false}
        renderOrder={5}
      />
      <mesh
        ref={orbRef}
        geometry={orbGeometry}
        material={orbMaterial}
        visible={false}
        renderOrder={6}
      />
    </group>
  )
}
