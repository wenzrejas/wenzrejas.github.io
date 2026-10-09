import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { OCEAN_Y } from '@/world/environment/ocean/constants'
import { SHORE_Y } from '@/world/shore/constants'
import type { ShoreField } from '@/world/shore/shoreField'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { islandLocalY } from '../shared/islandSpec'
import { createCircuitPower, powerCircuit } from './circuitPower'
import { MAIN_ISLAND_NODE } from './constants'
import { isMainIslandEngaged, type MainIsland } from './mainIsland'
import { activateMonoliths, type Monolith } from './monoliths'
import { buildConduitGeometry, createConduitMaterial } from './seabedCircuitModel'
import SeabedGlow from './SeabedGlow'

interface SeabedCircuitProps {
  model: THREE.Object3D
  shoreline: ShoreField
  mainIsland: MainIsland
  monoliths: Monolith[]
  islandScale: number
  offsetY: number
}

export default function SeabedCircuit({
  model,
  shoreline,
  mainIsland,
  monoliths,
  islandScale,
  offsetY,
}: SeabedCircuitProps) {
  const power = useRef(createCircuitPower())
  const conduitsRef = useRef<THREE.Mesh>(null)
  const ringYellow = mainIsland.summit.color

  const mainIslandLand = useMemo(() => model.getObjectByName(MAIN_ISLAND_NODE) ?? null, [model])
  const conduitGeometry = useMemo(
    () => buildConduitGeometry(shoreline, mainIsland, monoliths),
    [shoreline, mainIsland, monoliths]
  )
  const conduitMaterial = useMemo(() => createConduitMaterial(ringYellow), [ringYellow])

  useEffect(
    () => () => {
      conduitGeometry.dispose()
      conduitMaterial.dispose()
    },
    [conduitGeometry, conduitMaterial]
  )

  useFrame(({ clock }, delta) => {
    const circuit = power.current
    powerCircuit(circuit, isMainIslandEngaged(mainIsland), Math.min(delta, MAX_FRAME_SECONDS))
    activateMonoliths(monoliths, circuit.arrival > 0)

    const conduits = conduitsRef.current
    if (!conduits) return
    conduits.visible = circuit.front > 0
    const uniforms = uniformsOf(conduits)
    uniforms.uGlow.value = circuit.glow
    uniforms.uFront.value = circuit.front
    uniforms.uTime.value = clock.getElapsedTime()
  })

  const waterY = islandLocalY(OCEAN_Y, islandScale, offsetY)
  const seaLevel = islandLocalY(SHORE_Y, islandScale, offsetY)

  return (
    <>
      {mainIslandLand && (
        <SeabedGlow
          land={mainIslandLand}
          color={ringYellow}
          waterY={waterY}
          seaLevel={seaLevel}
          level={() => power.current.glow}
        />
      )}
      {monoliths.map((monolith) => (
        <SeabedGlow
          key={monolith.label}
          land={monolith.station}
          color={ringYellow}
          waterY={waterY}
          seaLevel={seaLevel}
          level={() => power.current.arrival}
        />
      ))}
      <mesh
        ref={conduitsRef}
        geometry={conduitGeometry}
        material={conduitMaterial}
        position={[0, seaLevel, 0]}
        visible={false}
        renderOrder={RENDER_LAYER.waterSurface}
      />
    </>
  )
}
