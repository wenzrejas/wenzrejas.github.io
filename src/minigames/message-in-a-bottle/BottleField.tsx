import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useBottleStore } from '@/store/bottleStore'
import { isRaceUnderway } from '@/store/checkpointStore'
import GemSparkles from '@/world/islands/shared/gem-sparkles/GemSparkles'
import { disposeAll } from '@/utils/dispose'
import { drawBottles } from './bottleDraw'
import { collectReachedBottle } from './bottlePickup'
import { bottleScaleFor } from './bottleDrift'
import {
  bottleGlintGem,
  buildBottleContents,
  buildBottleGlass,
  createBottleContentsMaterial,
  createBottleGlassMaterial,
} from './bottleModel'
import { ALL_BOTTLES, bottlesAfloat } from './bottleSpots'
import { BOTTLE_GLINT_SIZE, BOTTLE_GLINT_TUNING, BOTTLE_SCALE } from './constants'

export default function BottleField() {
  const fieldRef = useRef<THREE.Group>(null)
  const contentsRef = useRef<THREE.InstancedMesh>(null)
  const glassRef = useRef<THREE.InstancedMesh>(null)
  const found = useBottleStore((state) => state.found)
  const afloat = useMemo(() => bottlesAfloat(found), [found])
  const contentsGeometry = useMemo(() => buildBottleContents(), [])
  const contentsMaterial = useMemo(() => createBottleContentsMaterial(), [])
  const glassGeometry = useMemo(() => buildBottleGlass(), [])
  const glassMaterial = useMemo(() => createBottleGlassMaterial(), [])
  const size = useThree((state) => state.size)
  const scale = useMemo(() => bottleScaleFor(size.width, size.height), [size])
  const glintNode = useMemo(() => new THREE.Group(), [])
  const glintGem = useMemo(
    () => bottleGlintGem(glintNode, afloat, scale),
    [glintNode, afloat, scale]
  )

  useEffect(
    () => () => disposeAll(contentsGeometry, contentsMaterial, glassGeometry, glassMaterial),
    [contentsGeometry, contentsMaterial, glassGeometry, glassMaterial]
  )

  useFrame(({ clock, camera }) => {
    const field = fieldRef.current
    const contents = contentsRef.current
    const glass = glassRef.current
    if (!field || !contents || !glass) return

    if (isRaceUnderway()) {
      field.visible = false
      return
    }

    field.visible = drawBottles(contents, glass, afloat, scale, clock.getElapsedTime(), camera) > 0
    collectReachedBottle(afloat)
  })

  return (
    <group ref={fieldRef}>
      <instancedMesh
        ref={contentsRef}
        args={[contentsGeometry, contentsMaterial, ALL_BOTTLES.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={glassRef}
        args={[glassGeometry, glassMaterial, ALL_BOTTLES.length]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.effects}
      />
      <primitive object={glintNode} />
      {afloat.length > 0 && (
        <GemSparkles
          gem={glintGem}
          tuning={BOTTLE_GLINT_TUNING}
          size={(BOTTLE_GLINT_SIZE * scale) / BOTTLE_SCALE}
        />
      )}
    </group>
  )
}
