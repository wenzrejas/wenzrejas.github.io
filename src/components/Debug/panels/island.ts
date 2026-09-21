import { useControls, folder } from 'leva'
import { WORLD_LOCATIONS, type IslandKey } from '../../World/Islands/constants'
import { ISLAND_MODEL_DEFAULTS } from '../../World/Islands/islandSpecs'
import type { IslandControls } from '../types'

const schema = (key: IslandKey) => {
  const d = ISLAND_MODEL_DEFAULTS[key]
  return {
    scale: { value: d.scale, min: 0.1, max: 4, step: 0.05 },
    rotation: { value: d.rotation, min: -180, max: 180, step: 1, label: 'rotation (deg)' },
    Position: folder({
      offsetX: { value: d.offsetX, min: -150, max: 150, step: 0.5, label: 'X' },
      offsetY: { value: d.offsetY, min: -60, max: 60, step: 0.1, label: 'Y' },
      offsetZ: { value: d.offsetZ, min: -150, max: 150, step: 0.5, label: 'Z' },
    }),
    brightness: { value: d.brightness, min: 0.2, max: 1.5, step: 0.01 },
  }
}

const panel = (key: IslandKey) => `Islands / ${WORLD_LOCATIONS[key].label}`
const opts = { collapsed: true }

export function useIslandControls(): Record<IslandKey, IslandControls> {
  const timewell = useControls(panel('timewell'), schema('timewell'), opts)
  const cozy = useControls(panel('cozy'), schema('cozy'), opts)
  const lumina = useControls(panel('lumina'), schema('lumina'), opts)
  const buildshore = useControls(panel('buildshore'), schema('buildshore'), opts)
  const tech = useControls(panel('tech'), schema('tech'), opts)

  return {
    timewell,
    cozy,
    lumina,
    buildshore,
    tech,
  } as Record<IslandKey, IslandControls>
}
