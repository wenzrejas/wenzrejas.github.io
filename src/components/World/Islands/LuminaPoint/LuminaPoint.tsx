import { useMemo } from 'react'
import { createPortal, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import { boundsIn, meshesOf } from '../../../../utils/meshes'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import { useNightGlow } from '../nightGlow'
import IslandShadow from '../IslandShadow'
import Coast from '../../Shore/Coast'
import { useCoastFields } from '../../Shore/useCoastFields'
import {
  LUMINA_BLOB,
  LUMINA_MODEL_URL,
  BEAM_ANCHOR_FORWARD,
  BEAM_ANCHOR_NODE,
  BEAM_HEAD_NODE,
  BEAM_LENS_NODE,
  BODY_NODE,
} from './constants'
import Holograms from './Holograms'
import LuminaBeam from './LuminaBeam'
import { tintLights } from './lights'
import { findMonoliths } from './monoliths'
import { useLogoFloat } from './useLogoFloat'

function rigBeam(model: THREE.Object3D) {
  const anchor = model.getObjectByName(BEAM_ANCHOR_NODE)
  const head = model.getObjectByName(BEAM_HEAD_NODE)
  const lens = model.getObjectByName(BEAM_LENS_NODE)
  if (!anchor || !head || !lens) return null

  model.updateMatrixWorld(true)
  const origin = model.worldToLocal(anchor.getWorldPosition(new THREE.Vector3()))
  const facing = model
    .worldToLocal(anchor.localToWorld(new THREE.Vector3(...BEAM_ANCHOR_FORWARD)))
    .sub(origin)
  const pivot = model.worldToLocal(head.getWorldPosition(new THREE.Vector3())).setY(origin.y)
  const lensSize = boundsIn(lens, meshesOf(lens)).getSize(new THREE.Vector3())

  return {
    pivot,
    lensOffset: origin.sub(pivot),
    lensRadius: Math.max(lensSize.x, lensSize.y, lensSize.z) / 2,
    restYaw: Math.atan2(-facing.z, facing.x),
    head,
    headRest: head.rotation.y,
  }
}

export default function LuminaPoint({ islandKey, config, hovered }: IslandBodyProps) {
  const root = useThree((s) => s.scene)
  const tuning = useDebugStore((s) => s.islands.lumina)
  const island = useIslandModel(LUMINA_MODEL_URL, BODY_NODE, tuning.brightness)
  const { beam, monoliths } = useMemo(() => {
    tintLights(island)
    return { beam: rigBeam(island.model), monoliths: findMonoliths(island.model) }
  }, [island])

  useNightGlow(island.glows)
  useLogoFloat(monoliths.logos)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={LUMINA_BLOB} />
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
        {coast && (
          <Coast
            islandKey={islandKey}
            fields={coast}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
        <Holograms monoliths={monoliths} islandScale={placement.scale} />
      </group>
      {beam &&
        createPortal(
          <group position={[config.position[0], 0, config.position[2]]}>
            <group {...placement}>
              <LuminaBeam {...beam} />
            </group>
          </group>,
          root
        )}
    </>
  )
}
