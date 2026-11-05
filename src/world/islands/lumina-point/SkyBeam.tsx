import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { endSkyBeam, useSkyBeamStore } from '@/store/skyBeamStore'
import { disposeAll } from '@/utils/dispose'
import { buildFlatQuad } from '@/utils/geometry'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { paintSkyBeam } from './skyBeamLook'
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

interface SkyBeamMeshesProps extends SkyBeamProps {
  materials: SkyBeamMaterials
  isActive: boolean
}

export default function SkyBeam(props: SkyBeamProps) {
  const isActive = useSkyBeamStore((state) => state.isActive)
  const materials = useMemo(() => createSkyBeamMaterials(), [])

  useEffect(() => () => disposeAll(...Object.values(materials)), [materials])

  return (
    <SkyBeamMeshes
      key={isActive ? 'active' : 'idle'}
      {...props}
      materials={materials}
      isActive={isActive}
    />
  )
}

function SkyBeamMeshes({ anchor, origin, islandScale, materials, isActive }: SkyBeamMeshesProps) {
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
    () => () =>
      disposeAll(
        arcGeometry,
        chargeMoteGeometry,
        risingMoteGeometry,
        orbGeometry,
        beamGeometry,
        shockRingGeometry
      ),
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
    paintSkyBeam(
      { arcs, chargeMotes, risingMotes, orb, beam, shockRing },
      stage,
      elapsed,
      pixelsPerUnit(camera, gl),
      islandScale
    )
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
