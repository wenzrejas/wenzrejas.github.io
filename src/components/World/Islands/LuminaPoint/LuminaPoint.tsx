import { useMemo } from 'react'
import { createPortal, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import type { IslandBodyProps } from '../types'
import { useIslandModel } from '../islandModel'
import { placeIsland } from '../islandTransform'
import { useNightGlow } from '../nightGlow'
import IslandShadow from '../IslandShadow'
import {
  LUMINA_BLOB,
  LUMINA_MODEL_URL,
  BEAM_ANCHOR_NODE,
  BEAM_HALO_NODE,
  BEAM_HEAD_NODE,
  BODY_NODE,
} from './constants'
import LuminaBeam from './LuminaBeam'

function rigBeam(model: THREE.Object3D) {
  model.updateMatrixWorld(true)

  const halo = model.getObjectByName(BEAM_HALO_NODE)
  if (halo) model.attach(halo)

  const anchor = model.getObjectByName(BEAM_ANCHOR_NODE)
  if (!anchor) return null

  const head = model.getObjectByName(BEAM_HEAD_NODE) ?? null
  return {
    origin: model.worldToLocal(anchor.getWorldPosition(new THREE.Vector3())),
    head,
    headRest: head?.rotation.y ?? 0,
  }
}

export default function LuminaPoint({ config, hovered }: IslandBodyProps) {
  const root = useThree((s) => s.scene)
  const tuning = useDebugStore((s) => s.islands.lumina)
  const island = useIslandModel(LUMINA_MODEL_URL, BODY_NODE, tuning.brightness)
  const beam = useMemo(() => rigBeam(island.model), [island])

  useNightGlow(island.glows)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={LUMINA_BLOB} />
      <group {...placement}>
        {hovered && island.outline && <primitive object={island.outline} />}
        <primitive object={island.model} />
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
