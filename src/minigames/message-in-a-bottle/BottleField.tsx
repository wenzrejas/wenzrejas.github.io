import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { audio } from '@/audio/audioManager'
import { isSailingHeld } from '@/controls/sailingInput'
import { findBottle, useBottleStore } from '@/store/bottleStore'
import { isRaceUnderway } from '@/store/checkpointStore'
import { isRevealPlaying } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { useWeatherStore } from '@/store/weatherStore'
import { isOnScreen } from '@/utils/screen'
import GemSparkles from '@/world/islands/shared/gem-sparkles/GemSparkles'
import { bottleScaleFor, poseBottle } from './bottleDrift'
import {
  bottleGlintGem,
  buildBottleContents,
  buildBottleGlass,
  createBottleContentsMaterial,
  createBottleGlassMaterial,
} from './bottleModel'
import { ALL_BOTTLES, BOTTLE_SPOTS, bottlesAfloat, bottleWithin } from './bottleSpots'
import {
  BOTTLE_GLINT_SIZE,
  BOTTLE_GLINT_TUNING,
  BOTTLE_REACH,
  BOTTLE_SCALE,
  BOTTLE_VIEW_MARGIN,
} from './constants'

const _pose = new THREE.Object3D()

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
    () => () => {
      contentsGeometry.dispose()
      contentsMaterial.dispose()
      glassGeometry.dispose()
      glassMaterial.dispose()
    },
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

    const time = clock.getElapsedTime()
    const swell = useWeatherStore.getState().waveAmpMult
    let drawn = 0
    for (const bottle of afloat) {
      poseBottle(_pose, BOTTLE_SPOTS[bottle], scale, time, swell)
      if (!isOnScreen(_pose.position, camera, BOTTLE_VIEW_MARGIN)) continue
      contents.setMatrixAt(drawn, _pose.matrix)
      glass.setMatrixAt(drawn, _pose.matrix)
      drawn++
    }
    contents.count = drawn
    glass.count = drawn
    field.visible = drawn > 0
    if (field.visible) {
      contents.instanceMatrix.needsUpdate = true
      glass.instanceMatrix.needsUpdate = true
    }

    if (isSailingHeld() || isRevealPlaying()) return
    const { x, z } = useShipStore.getState()
    const reached = bottleWithin(afloat, x, z, BOTTLE_REACH)
    if (!reached) return
    audio.play('bottleClink')
    findBottle(reached)
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
